from django.contrib import admin
from .models import Rating,Room,Game,Message


# Register your models here.


admin.site.register(Rating)
admin.site.register(Room)
admin.site.register(Game)
admin.site.register(Message)
