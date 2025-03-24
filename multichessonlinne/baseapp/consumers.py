import json
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import async_to_sync
from .models import Message, User, Room

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
            