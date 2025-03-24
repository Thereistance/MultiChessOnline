from django.shortcuts import render, redirect
from .models import Room,Rating,Message,Game
from .forms import RoomForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import logout, login, authenticate
from django.contrib.auth.models import User
from django.contrib import messages

def loginPage(request):
    if request.user.is_authenticated:
        return redirect('home')
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
        user = UserCreationForm(request.POST)
        if user.is_valid():
            user = user.save(commit=False)
            user.username = user.username.lower()
            user.save()
            login(request,user)
            return redirect('home')
        else:
            messages.error(request, "Error occured during registration")
    context ={'form': form }
    return render(request,'baseapp/register_page.html', context)


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

@login_required(login_url='login')
def roomPage(request,pk):
    room = Room.objects.get(id=pk)
    room_messages = room.messages.order_by('created_at')
    if request.method == "POST":
        if request.user.is_authenticated:
            room_message = Message.objects.create(
                user=request.user,
                room = room,
                text = request.POST.get('body')
            )
            return redirect('room', room.id)
    if not room.is_active:
        context = {'room': room,'room_messages': room_messages}
    else:
       return redirect('game',room.game.id)
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
    return render(request, 'baseapp/game_page.html', context)

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
    