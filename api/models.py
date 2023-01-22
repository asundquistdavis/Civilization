from django.db import models
from django.utils.timezone import now
from game.models import User, Game

class StatusCall(models.Model):
    timestamp = models.DateTimeField(default=now)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)