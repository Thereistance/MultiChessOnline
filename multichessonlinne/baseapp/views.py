from django.shortcuts import render, redirect
from .models import Room,Rating,Message,Game
from .forms import RoomForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import logout, login, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def loginPage(request):
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'GET':
        storage = messages.get_messages(request)
        for _ in storage:
            pass  # Просто читаем сообщения, чтобы очистить
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        if username == None or password == None:
            return messages.error(request,"Username or password is empty")
        else:
            try:
                user = User.objects.get(username=username)
            except:
                messages.error(request,'User doesn not exist')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request,user)
                return redirect('home')
            else:
                messages.error(request,'Username or password are not correct')
    context={}
    return render(request, 'baseapp/login_page.html', context)

def registerPage(request):
    form = UserCreationForm()
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            login(request, user)
            Rating.objects.create(user=user)
            return redirect('home')
        else:
            messages.error(request, "Error occurred during registration")
    context = {'form': form}
    return render(request, 'baseapp/register_page.html', context)


def logoutPage(request):
    logout(request)
    return redirect('home')
    
    
def homePage(request):
    context = {}
    return render(request, 'baseapp/home_page.html', context)

def roomsPage(request):
    rooms = Room.objects.all()
    context = {'rooms': rooms}
    return render(request, 'baseapp/rooms_page.html', context)
# @login_required(login_url='login')
# def roomPage(request,pk):
#     room = Room.objects.get(id=pk)
#     room_messages = room.messages.order_by('created_at')
#     if request.method == "POST":
#         if request.user.is_authenticated:
#             room_message = Message.objects.create(
#                 user=request.user,
#                 room = room,
#                 text = request.POST.get('body')
#             )
#             return redirect('room', room.id)
#     if not room.is_active:
#         if room.game != NULL:
            
#             context = {'room': room,'room_messages': room_messages}
#     else:
#        return redirect('game',room.game.id)
#     return render(request, 'baseapp/room.html', context)
@login_required(login_url='login')
def roomPage(request, pk):
    room = Room.objects.get(id=pk)
    room_messages = room.messages.order_by('created_at')
    
    if request.method == "POST":
        if request.user.is_authenticated:
            room_message = Message.objects.create(
                user=request.user,
                room=room,
                text=request.POST.get('body')
            )
            return redirect('room', room.id)
    
    # Проверяем, есть ли игра в комнате
    if hasattr(room, 'game'):
        # Если комната неактивна, но игра существует - перенаправляем на игру
        if not room.is_active:
            return redirect('game', room.game.id)
        # Если комната активна (игра идет) - тоже перенаправляем на игру
        else:
            return redirect('game', room.game.id)
    
    # Если игры нет, просто отображаем комнату
    context = {'room': room, 'room_messages': room_messages}
    return render(request, 'baseapp/room.html', context)

# @login_required(login_url='login')
# def startGame(request,pk):
#     room = Room.objects.get(id=pk)
#     players = room.players.all()
#     if Game.objects.filter(room=room, is_active=True).exists():
#         messages.error(request, "A game is already active in this room.")
#         return redirect('game',room.game.id)
#     if room.players.count() == 2 and request.user==room.creator:
#         game = Game.objects.create(room=room,player1=room.creator,player2=players.exclude(id=room.creator.id).first(),is_active = True)
#         room.is_active = True
#         room.save()
#     return redirect('game',game.id)
 
@login_required(login_url='login')
def startGame(request,pk):
    room = Room.objects.get(id=pk)
    players = room.players.all()
    active_game = Game.objects.filter(room=room, is_active=True).first()
    if active_game:
        messages.error(request, "A game is already active in this room.")
        if request.user in players:
            return redirect('game', active_game.id)
    
    if room.players.count() == 2 and request.user == room.creator:
     
        game = Game.objects.create(
            room=room,
            player1=room.creator,
            player2=players.exclude(id=room.creator.id).first(),
            is_active=True
        )
        room.is_active = True
        room.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"room_{room.id}",
            {
                "type": "game_started",
                "game_id": game.id
            }
        )
        messages.success(request, "Game started successfully!")
        return redirect('game', game.id)
    else:
        messages.error(request, "Cannot start the game. The room must have exactly 2 players.")
        return redirect('room',pk)

@login_required(login_url='login')  
def joinGame(request,pk):
    room = Room.objects.get(id=pk)
    if request.method == "POST":
        room.players.add(request.user)    
    return redirect('room',pk)   

def gamePage(request,pk):
    game = Game.objects.get(id=pk)
    context = {'game': game}
    if not game.is_active:
        return render(request, 'baseapp/game_page_result.html', context)
    room = game.room
    room_messages = room.messages.order_by('created_at')
    player1_rating = Rating.objects.get_or_create(user=game.player1)[0]
    player2_rating = Rating.objects.get_or_create(user=game.player2)[0] if game.player2 else None
    # print(room_messages)
    context = {'game': game, 'room' : room, 'room_messages': room_messages, "player1_rating":player1_rating, 'player2_rating': player2_rating}
    return render(request, 'baseapp/game_page2.html', context)

def ratingPage(request):
    ratings = Rating.objects.all().order_by('-score')  # Предполагается, что поле 'score' содержит очки
    context = {
        'ratings': ratings,
    }
    return render(request, 'baseapp/rating.html', context)

# def profilePage(request, pk):
#     user = User.objects.get(id=pk)
#     rating = Rating.objects.get(user=user)
#     games = Game.objects.filter(player1=user) | Game.objects.filter(player2=user)
#     games = games.order_by('-started_at')

#     context = {
#         'profile_user': user,
#         'rating': rating,
#         'games': games,
#     }

#     return render(request, 'baseapp/profile.html', context)
def profilePage(request, pk):
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        # Обработка случая, когда пользователь не найден
        return render(request, 'baseapp/profile.html', {'error': 'User not found'})

    try:
        rating = Rating.objects.get(user=user)
    except Rating.DoesNotExist:
        rating = None

    games = Game.objects.filter(player1=user) | Game.objects.filter(player2=user)
    games = games.order_by('-started_at') if games.exists() else None

    context = {
        'profile_user': user,
        'rating': rating,
        'games': games,
    }

    return render(request, 'baseapp/profile.html', context)
@login_required(login_url='login')
def createRoom(request):
    form = RoomForm()
    if request.method == "POST":
        form = RoomForm(request.POST)
        if form.is_valid():
            room = form.save(commit=False)
            room.creator = request.user
            form.save()
            room.players.add(request.user)
            return redirect('rooms')
    context  = {'form': form}
    return render(request, 'baseapp/create_form.html', context)

@login_required(login_url='login')
def updateRoom(request,pk):
    room = Room.objects.get(id=pk)
    form = RoomForm(instance=room)
    if request.method == "POST":
        form = RoomForm(request.POST,instance=room)
        if form.is_valid():
            form.save()
            return redirect('rooms')
    context={'form': form}
    return render(request,'baseapp/create_form.html', context)

@login_required(login_url='login')
def deleteRoom(request,pk):
    room = Room.objects.get(id=pk)
    context = {'obj': room.name}
    if request.method == "POST":
        room.delete()
        return redirect('rooms')
    return render(request,'baseapp/delete_form.html',context) 
    