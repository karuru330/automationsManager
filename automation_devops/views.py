from django.shortcuts import render, redirect, HttpResponse
from django.contrib import messages
from django.contrib.auth.models import User, auth
import subprocess
import os, sys, stat
import json
from .models import *

def automation_devops(request):
	if request.user.is_authenticated:
		return render(request, "automation_devops.html")
	else:
		return redirect("/")
	
def tracks(request, environment):
	if request.user.is_authenticated:
		tracks = Track.objects.filter(environment=environment)
		return render(request, "tracks.html", {"environment": environment,  "tracks":tracks})
	else:
		return redirect("/")

def add_track(request, environment):
	if request.user.is_authenticated:
		if request.method == "GET":
			return render(request, "add_track.html", {"environment":environment})
		else:
			track_name = request.POST["track-name"]
			track = Track(track_name=track_name, environment=environment)
			track.save()
			try:
				os.mkdir(os.environ.get(environment.upper()+"_DIR")+"/"+track_name)
			except Exception as e:
				print(e)
			return redirect("/automation_devops/"+environment)
	else:
		return redirect("/")

def pipelines(request, environment, track):
	if request.user.is_authenticated:
		#pipelines = Pipeline.objects.filter(environment=environment, track=track)
		return render(request, "pipelines.html", {"environment": environment,  "track":track})
	else:
		return redirect("/")