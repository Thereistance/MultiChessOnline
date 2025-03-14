from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    rating = models.IntegerField(default=0)
    def __str__(self):
        return self.user.username
        
    
class Room(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    creater = models.ForeignKey(Player, related_name='created_rooms',on_delete=models.CASCADE, null = False)
    created = models.DateTimeField(auto_now_add=True)
    # updated = models.DateTimeField(auto_now=True)
    is_active=models.BooleanField(default=False)
    class Meta:
        ordering = ['created']
    def __str__(self):
        return self.name
    
class Game(models.Model):
    game_room = models.OneToOneField(Room, on_delete=models.CASCADE) 
    player_1 = models.ForeignKey(Player, related_name='game_as_player1', null=True, on_delete=models.SET_NULL)
    player_2 = models.ForeignKey(Player, related_name='game_as_player2', null=True, blank=True, on_delete=models.SET_NULL)
    start_time = models.DateTimeField(auto_now_add=True, blank=True)
    end_time = models.DateTimeField(null=True, blank = True)
    # status = models.CharField(max_length=50, default='waiting')
    def __str__(self):
        return self.game_room.name
    
class Message(models.Model):
    room = models.ForeignKey(Room,related_name='room_messages', on_delete=models.CASCADE)
    player = models.ForeignKey(Player,related_name='player_messages', on_delete=models.CASCADE)
    body = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created']
        
    def __str__(self):
        return self.body[0:50]
    