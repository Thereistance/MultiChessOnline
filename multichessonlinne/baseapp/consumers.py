import json
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import async_to_sync
from .models import Message, User, Room, Game
from datetime import datetime
from django.utils.timezone import now

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"room_{self.room_id}"
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, 
            self.channel_name)
        if self.scope["user"] == AnonymousUser():
            self.close()
            return
        self.accept()
        # self.send(text_data=json.dumps({
        #     'type': 'connection_established',
        #     'message': 'You are now connected'
        # }))
    def disconnect(self, close_code):
        # Удаляем пользователя из группы
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)    
    def receive(self, text_data):
        text_data_data = json.loads(text_data)
        message = text_data_data['message']
        room_id = self.room_id
        sender = self.scope['user'].username
        sender_model = User.objects.get(username=sender)
        room_model = Room.objects.get(id=room_id)
        self.save_message(sender_model,message,room_model)
        
        
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type':'chat_message',
                'message': message,
                'user': sender
            }
        )
    def chat_message(self, event):
        message = event['message']
        user = event['user']
        
        self.send(text_data=json.dumps({
            'type':'chat',
            'message':message,
            'user':user
            
        }))
    def save_message(self,sender_model, message, room_model):
        room_message = Message.objects.create(
                user=sender_model, 
                room = room_model,
                text = message
            )
game_states = {}
class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"
        self.user = self.scope["user"]

        if self.user == AnonymousUser():
            self.close()
            return

        async_to_sync(self.channel_layer.group_add)(
            self.game_group_name,
            self.channel_name
        )
        self.accept()

        # Инициализация игры
        if self.game_id not in game_states:
            game = Game.objects.get(id=self.game_id)
            game_states[self.game_id] = {
                "board": [
                    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
                    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
                    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
                ],
                "current_player": "white",
                "players": {
                    "white": game.player1.username,
                    "black": game.player2.username
                },
                "moves": []
            }

        # Отправка текущего состояния новому игроку
        self.send(text_data=json.dumps({
            "type": "game_init",
            "board": game_states[self.game_id]["board"],
            "current_player": game_states[self.game_id]["current_player"],
            "player_color": self.get_player_color(),
            "moves": game_states[self.game_id]["moves"]
        }))

    def get_player_color(self):
        game_state = game_states[self.game_id]
        if self.user.username == game_state["players"]["white"]:
            return "white"
        return "black"

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.game_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        move_type = data.get("type")

        if move_type == "make_move":
            self.handle_move(data)
        elif move_type == "chat_message":
            self.handle_chat(data)

    def handle_move(self, data):
        from_pos = data["from"]
        to_pos = data["to"]
        promotion = data.get("promotion")
        
        # Проверка прав игрока
        if not self.is_player_turn():
            self.send_error("Not your turn")
            return

        # Обновление состояния игры
        game_state = game_states[self.game_id]
        from_col, from_row = self.parse_position(from_pos)
        to_col, to_row = self.parse_position(to_pos)

        # Выполнение хода
        piece = game_state["board"][from_row][from_col]
        game_state["board"][from_row][from_col] = ''
        print("\n",game_states[self.game_id])
        # Обработка превращения пешки
        if promotion and piece.lower() == 'p' and to_row in [0, 7]:
            game_state["board"][to_row][to_col] = promotion
        else:
            game_state["board"][to_row][to_col] = piece

        # Смена игрока и сохранение хода
        game_state["current_player"] = "black" if game_state["current_player"] == "white" else "white"
        move_record = {
            "from": from_pos,
            "to": to_pos,
            "player": self.user.username,
            "promotion": promotion,
            # "timestamp": str(datetime.now())
        }
        game_state["moves"].append(move_record)

        # Отправка обновления всем участникам
        async_to_sync(self.channel_layer.group_send)(
            self.game_group_name,
            {
                "type": "game_update",
                "board": game_state["board"],
                "current_player": game_state["current_player"],
                "move": move_record,
                "user": self.user.username
            }
        )

    def is_player_turn(self):
        game_state = game_states[self.game_id]
        player_color = self.get_player_color()
        return player_color == game_state["current_player"]

    def game_update(self, event):
        self.send(text_data=json.dumps({
            "type": "game_update",
            "board": event["board"],
            "current_player": event["current_player"],
            "move": event["move"],
            "user": event["user"]
        }))

    @staticmethod
    def parse_position(pos):
        col = ord(pos[0].lower()) - ord('a')
        row = 8 - int(pos[1])
        return col, row
# class GameConsumer(WebsocketConsumer):
#     def connect(self):
#         self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
#         self.game_group_name = f"game_{self.game_id}"

#         if self.scope["user"] == AnonymousUser():
#             self.close()
#             return

#         async_to_sync(self.channel_layer.group_add)(
#             self.game_group_name,
#             self.channel_name
#         )
#         self.accept()

#         # Если у игры еще нет состояния — создаем его
#         if self.game_id not in game_states:
#             game = Game.objects.get(id=self.game_id)
#             # player1 = game.player1
#             # player2 = game.player2
#             game_states[self.game_id] = {
#                 "board": [
#                     ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
#                     ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
#                     ['', '', '', '', '', '', '', ''],
#                     ['', '', '', '', '', '', '', ''],
#                     ['', '', '', '', '', '', '', ''],
#                     ['', '', '', '', '', '', '', ''],
#                     ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
#                     ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
#                 ],
#                 "current_player": "white",
#                 "moves": []
#             }

#         # Отправляем клиенту текущее состояние доски
#         self.send(text_data=json.dumps({
#             "type": "init",
#             "board": game_states[self.game_id]["board"],
#             "current_player": game_states[self.game_id]["current_player"],
#             "moves": game_states[self.game_id]["moves"]
#         }))

#     def disconnect(self, close_code):
#         async_to_sync(self.channel_layer.group_discard)(
#             self.game_group_name,
#             self.channel_name
#         )

#     def receive(self, text_data):
#         data = json.loads(text_data)
#         move = data.get("move")
#         from_pos = data.get("from")  # Например, "e2"
#         to_pos = data.get("to")      # Например, "e4"

#         if move and from_pos and to_pos:
#             # Обновляем состояние доски
#             from_col, from_row = self.parse_position(from_pos)
#             to_col, to_row = self.parse_position(to_pos)
            
#             # Выполняем ход
#             piece = game_states[self.game_id]["board"][from_row][from_col]
#             game_states[self.game_id]["board"][from_row][from_col] = ''
#             game_states[self.game_id]["board"][to_row][to_col] = piece
            
#             # Меняем текущего игрока
#             game_states[self.game_id]["current_player"] = "black" if game_states[self.game_id]["current_player"] == "white" else "white"
            
#             # Добавляем ход в историю
#             game_states[self.game_id]["moves"].append(move)

#             # Шлём обновление всем клиентам комнаты
#             async_to_sync(self.channel_layer.group_send)(
#                 self.game_group_name,
#                 {
#                     "type": "game_update",
#                     "board": game_states[self.game_id]["board"],
#                     "current_player": game_states[self.game_id]["current_player"],
#                     "move": move,
#                     "user": self.scope["user"].username
#                 }
#             )

#     def game_update(self, event):
#         self.send(text_data=json.dumps({
#             "type": "update",
#             "board": event["board"],
#             "current_player": event["current_player"],
#             "move": event["move"],
#             "user": event["user"]
#         }))
    
#     @staticmethod
#     def parse_position(pos):
#         """Конвертирует шахматную нотацию (например, 'e2') в индексы массива"""
#         col = ord(pos[0].lower()) - ord('a')
#         row = 8 - int(pos[1])  # Преобразуем в индексы массива (0-7)
#         return col, row