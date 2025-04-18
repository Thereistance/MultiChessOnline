from django.urls import path
from .consumers import ChatConsumer, GameConsumer

websocket_urlpatterns = [
    path("ws/room/<str:room_id>/", ChatConsumer.as_asgi()),
    path("ws/game/<str:game_id>/", GameConsumer.as_asgi()),
]