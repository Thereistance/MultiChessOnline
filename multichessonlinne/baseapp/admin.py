from django.contrib import admin
from .models import Player,Room,Game,Message


# Register your models here.


admin.site.register(Player)
admin.site.register(Room)
admin.site.register(Game)
admin.site.register(Message)
