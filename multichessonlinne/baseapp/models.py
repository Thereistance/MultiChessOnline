from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Rating(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rating')
    score = models.IntegerField(default=1000)
    class Meta:
        ordering = ['-score']
    def __str__(self):
        return f"{self.user.username}: {self.score}"
        
class Room(models.Model):
    name = models.CharField(max_length=255, unique=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    players = models.ManyToManyField(User, related_name='rooms', blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name    

class Game(models.Model):
    room = models.OneToOneField(Room, on_delete=models.SET_NULL, related_name='game', null=True)
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player2', null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=25, null=True,blank=True)
    room_name = models.CharField(max_length=255, null=True, blank=True)
    def __str__(self):
        return f"Game in {self.room.name}"

    def start_game(self):
        # Активируем комнату, когда игра начинается
        self.game.is_active = True
        self.game.save()

    def end_game(self):
        # Деактивируем комнату, когда игра заканчивается
        self.room_name = self.room.name
        self.room.is_active = False
        self.room.save()
        self.is_active = False
        self.finished_at = timezone.now()
        self.save()
        self.room.delete()  # Удаляем комнату, но игра сохранится

    def __str__(self):
        return f"Game in {self.room.name if self.room else self.room_name or 'Unknown Room'}"
     
class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.username}: {self.text}"
    