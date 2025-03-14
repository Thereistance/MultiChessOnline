from django.shortcuts import render


def homePage(request):
    context = {}
    return render(request, 'baseapp/home_page.html', context)
