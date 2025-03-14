from django.shortcuts import render
from .models import Room,Player,Message,Game


def homePage(request):
    context = {}
    return render(request, 'baseapp/home_page.html', context)

def roomsPage(request):
    rooms = Room.objects.all()
    context = {'rooms': rooms}
    return render(request, 'baseapp/room_pages.html', context)
