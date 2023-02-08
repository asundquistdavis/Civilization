from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save

class Civ(models.Model):
    game_settings = models.ForeignKey('GameSettings', related_name='civs', on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    pcolor = models.CharField(max_length=10)
    scolor = models.CharField(max_length=10)
    start_territory = models.CharField(max_length=50)
    ast_rank = models.IntegerField()

    def desc(self):
        return {
            'id': self.id,
            'name': self.name,
            'pcolor': self.pcolor,
            'scolor': self.scolor,
            'start_territory': self.start_territory,
            'ast_rank': self.ast_rank,
        }

