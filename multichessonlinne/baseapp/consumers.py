import json
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import async_to_sync
from .models import Message, User, Room, Game, Rating
from datetime import datetime
from django.utils.timezone import now
from django.db import transaction

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
    def disconnect(self, close_code):
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)    
    def receive(self, text_data):
        text_data_data = json.loads(text_data)
        print(text_data_data)
        if text_data_data.get('type') == 'chat_message':
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
        elif text_data_data.get('type') == 'game_started':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'game_started',
                    'game_id': text_data_data['game_id']
                }
            )
        elif text_data_data.get('type') == 'join_game':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'join_game',
                    'joined_user': text_data_data['joined_user'],
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
    def game_started(self, event):
        self.send(text_data=json.dumps({
            'type': 'game_started',
            'game_id': event['game_id']
        }))
    def join_game(self, event):
        self.send(text_data=json.dumps({
            'type': 'join_game',
            'joined_user': event['joined_user']
        }))
    def save_message(self,sender_model, message, room_model):
        room_message = Message.objects.create(
                user=sender_model, 
                room = room_model,
                text = message
            ),
                # "board": [['', '', '', 'Q', '', '', '', 'r'],
                #           ['', 'p', '', '', '', '', '', 'p'],
                #           ['', '', '', '', 'B', '', 'k', 'B'],
                #           ['p', '', 'p', 'P', '', '', 'p', ''],
                #           ['', 'n', 'P', 'P', '', '', '', ''],
                #           ['', '', '', '', '', '', 'P', ''],
                #           ['P', 'P', '', '', '', '', '', 'P'],
                #           ['R', 'N', '', '', 'K', '', 'N', 'R']
                # ],
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
                "board": 
                [
                    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
                    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
                    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
                ],
                # "board": [['', '', '', 'Q', '', '', '', 'r'],
                #           ['', 'p', '', '', '', '', '', 'p'],
                #           ['', '', '', '', 'B', '', 'k', 'B'],
                #           ['p', '', 'p', 'P', '', '', 'p', ''],
                #           ['', 'n', 'P', 'P', '', '', '', ''],
                #           ['', '', '', '', '', '', 'P', ''],
                #           ['P', 'P', '', '', '', '', '', 'P'],
                #           ['R', 'N', '', '', 'K', '', 'N', 'R']
                # ],
                "current_player": "white",
                "players": {
                    "white": game.player1.username,
                    "black": game.player2.username
                },
                "moves": [],
                "captured_pieces": {
                    "white": [],
                    "black": []
                },
                "status": "active",
                "winner": None,
                "move_count": 0,
                "last_capture_or_pawn_move": 0
            }

        self.send_game_state()
    def send_game_state(self):
        game_state = game_states[self.game_id]
        self.send(text_data=json.dumps({
            "type": "game_init",
            "board": game_state["board"],
            "current_player": game_state["current_player"],
            "player_color": self.get_player_color(),
            "moves": game_state["moves"],
            "captured_pieces": game_state["captured_pieces"],
            "status": game_state["status"],
            "winner": game_state["winner"],
            "move_count": game_state["move_count"],
            "last_capture_or_pawn_move": game_state["last_capture_or_pawn_move"]
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
        print(data)
        move_type = data.get("type")

        if move_type == "make_move":
            self.handle_move(data)
        elif move_type == "end_game":
            self.handle_game_end(data)
        elif move_type == "chat_message":
            self.handle_chat(data)
    def handle_move(self, data):
        game_state = game_states[self.game_id]
        
        if game_state["status"] != "active":
            return self.send_error("Game already finished")

        if not self.is_player_turn():
            return self.send_error("Not your turn")

        from_pos = data["from"]
        to_pos = data["to"]
        promotion = data.get("promotion")
        is_checkmate = data.get("is_checkmate", False)
        is_draw = data.get("is_draw", False)

        from_col, from_row = self.parse_position(from_pos)
        to_col, to_row = self.parse_position(to_pos)

        piece = game_state["board"][from_row][from_col]
        target_piece = game_state["board"][to_row][to_col]

        # Обновляем счетчики ходов
        game_state["move_count"] += 1
        
        # Сбрасываем счетчик при взятии или ходе пешки
        if target_piece or piece.lower() == 'p':
            game_state["last_capture_or_pawn_move"] = game_state["move_count"]

        # Обработка взятия фигуры
        if target_piece:
            if piece.isupper():
                game_state["captured_pieces"]["black"].append(target_piece.lower())
            else:
                game_state["captured_pieces"]["white"].append(target_piece.lower())


        game_state["board"][from_row][from_col] = ''
        if promotion and piece.lower() == 'p' and to_row in [0, 7]:
            game_state["board"][to_row][to_col] = promotion
        else:
            game_state["board"][to_row][to_col] = piece

        winner_user_username = ""
        loser_user_username = ""
        if is_checkmate:
            game_state["status"] = "checkmate"
            game_state["winner"] = game_state["current_player"]

            game = Game.objects.get(id=self.game_id)
            winner_color = "white" if game_state["winner"] == "white" else "black"
            
            # Получаем победителя и проигравшего
            winner_user = game.player1 if winner_color == "white" else game.player2
            loser_user = game.player2 if winner_user == game.player1 else game.player1
            winner_user_username = winner_user.username
            loser_user_username = loser_user.username
            # ✨ Обновление рейтинга в транзакции
            try:
                with transaction.atomic():
                    winner_rating, _ = Rating.objects.get_or_create(user=winner_user)
                    loser_rating, _ = Rating.objects.get_or_create(user=loser_user)
                    
                    # Обновляем счет
                    winner_rating.score += 10
                    loser_rating.score = max(loser_rating.score - 10, 0)  # Защита от отрицательного рейтинга
                    
                    winner_rating.save()
                    loser_rating.save()

                    # Обновляем игру
                    
                    game.winner = winner_user
                    game.is_active = False
                    game.save()  # Save first
                    game.end_game()  # Then call end_game
            
            except Exception as e:
                # Логирование ошибки, если что-то пошло не так
                print(f"Error during game result update: {e}")
                
        # Меняем игрока
        game_state["current_player"] = "black" if game_state["current_player"] == "white" else "white"

        # Сохраняем ход
        move_record = {
            "from": from_pos,
            "to": to_pos,
            "player": self.user.username,
            "promotion": promotion,
            "captured": target_piece,
            "is_checkmate": is_checkmate,
            "is_draw": is_draw
        }
        game_state["moves"].append(move_record)

        # Отправляем обновление
        async_to_sync(self.channel_layer.group_send)(
            self.game_group_name,
            {
                "type": "game_update",
                "board": game_state["board"],
                "current_player": game_state["current_player"],
                "move": move_record,
                "captured_pieces": game_state["captured_pieces"],
                "status": game_state["status"],
                "winner": game_state["winner"],
                "winner_user": winner_user_username,
                "move_count": game_state["move_count"],
                "last_capture_or_pawn_move": game_state["last_capture_or_pawn_move"]
            }
        )

    def is_player_turn(self):
        game_state = game_states[self.game_id]
        player_color = self.get_player_color()
        return player_color == game_state["current_player"]
    def game_end(self, event):
        self.send(text_data=json.dumps({
            "type": "game_end",
            "board": event["board"],
            "current_player": event["current_player"],
            "status": event["status"],
            "winner": event["winner"],
            "winner_user": event['winner_user'],
            "move_count": event["move_count"],
            "last_capture_or_pawn_move": event["last_capture_or_pawn_move"]
        }))
    def game_update(self, event):
        self.send(text_data=json.dumps({
            "type": "game_update",
            "board": event["board"],
            "winner": event["winner"],
            "winner_user": event["winner_user"],
            "status": event["status"],
            "current_player": event["current_player"],
            "move": event["move"],
            "captured_pieces": event["captured_pieces"]
        }))

    @staticmethod
    def parse_position(pos):
        col = ord(pos[0].lower()) - ord('a')
        row = 8 - int(pos[1])
        return col, row
    
    def send_error(self, message):
        self.send(text_data=json.dumps({
            "type": "error",
            "message": message
        }))
