from django.db import models

# Create your models here.
class Track(models.Model):
    track_name = models.CharField(max_length=100)
    environment = models.CharField(max_length=100)