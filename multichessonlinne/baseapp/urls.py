
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    path('login/', views.loginPage, name='login'),
    path('logout/', views.logoutPage, name='logout'),
    path('register/', views.registerPage, name='register'),
    path('', views.homePage, name="home"),
    path('rooms/', views.roomsPage, name="rooms"),
    path('rooms/<str:pk>/', views.roomPage, name="room"),
    path('create-room/', views.createRoom, name="create-room"),
    path('update-room/<str:pk>/', views.updateRoom, name="update-room"),
    path('delete-room/<str:pk>/', views.deleteRoom, name="delete-room"),
    path('start-game/<str:pk>/', views.startGame, name="start-game"),
    path('join-game/<str:pk>/', views.joinGame, name="join-game"),
    path('game/<str:pk>/', views.gamePage, name="game"),
] 
# + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
