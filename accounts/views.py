from django.shortcuts import render
from django.shortcuts import render, redirect, HttpResponse
from .forms import userForm


def login(request):
    if request.method == "GET":
        return render(request, "login.html", {"form":userForm})