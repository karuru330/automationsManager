from django.shortcuts import render, redirect, HttpResponse
from django.contrib import messages
from django.contrib.auth.models import User, auth
from .forms import *
import subprocess
import os, sys, stat
import json

def index(request):
	if request.user.is_authenticated:
		return redirect("/home")
	return render(request,'login.html')

def login(request):
    if request.method == "GET":
        return render(request, "login.html")
    else:
        username = request.POST['username']
        password = request.POST['password']

        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request,user)
            return redirect("/home")
        else:
            messages.info(request,"Invalid credentials")
            return redirect('/')
def home(request):
	if request.user.is_authenticated:
		return render(request, "home.html")
	else:
		return redirect("/")

def logout(request):
	auth.logout(request)
	return redirect('/')