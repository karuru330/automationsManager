from django import forms
from django.forms import ModelForm, TextInput, EmailInput

from .models import User

class userForm(ModelForm):
    class Meta:
        model = User
        fields = ['username', 'password']