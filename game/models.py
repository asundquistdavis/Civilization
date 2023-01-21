from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.utils.translation import gettext_lazy as gtl

class Player(models.Model):
    game = models.ForeignKey('Game', related_name='players', on_delete=models.SET_NULL, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def report(self):
        pass

    def __str__(self):
        return f'player: {self.user.username}'

class Game(models.Model):
    start = models.DateTimeField(default=now)
    phase = models.ForeignKey('Phase', on_delete=models.SET_NULL, null=True)
    player = models.ForeignKey(Player, related_name='games_is_turn', default=None, on_delete=models.SET_NULL, null=True)

    def status(self, players=False, territories=False):
        status = {
            'clock': now() - self.start,
            'phase': self.phase,
            'game': self.__str__()
        }
        if players:
            status['players'] = [player.report() for player in self.players.all()]
        if territories:
            status['territories'] = [territory.report() for territory in self.territories.all()]
        return status

    def __str__(self):
        return f'#{self.id} on {self.start}'

class Phase(models.Model):
    start = models.DateTimeField(default=now)
    durration = models.IntegerField()
    name = models.CharField(max_length=15)

    def __str__(self):
        return f'Phase: {self.name}'

class GameSettings(models.Model):
    game = models.OneToOneField('Game', related_name='settings', on_delete=models.CASCADE)
    time = models.IntegerField(default=None, null=True)
    board_name = models.CharField(max_length=50, default=None, null=True)
    board_file = models.CharField(max_length=50, default=None, null=True)
    territories_file = models.CharField(max_length=50, default=None, null=True)

    def __str__(self):
        return f'game settings {self.id} - game: {self.game.id}'

class Board(models.Model):
    name = models.CharField(max_length=50)
    geometry = models.JSONField()
    game = models.OneToOneField(Game, on_delete=models.CASCADE)

    def __str__(self):
        return f'board: {self.name} - game: {self.game.id}'

class Territory(models.Model):
    geometry = models.JSONField()
    name = models.CharField(max_length=50)
    game = models.ForeignKey(Game, related_name='territories', on_delete=models.CASCADE)
    type = models.CharField(max_length=10)
    support = models.IntegerField()
    has_city_cite = models.BooleanField(default=False)

    def report(self):
        pass

    def __str__(self):
        return self.name

class AdjacentTerritory(models.Model):
    parent = models.ForeignKey(Territory, related_name='adjacencies', on_delete=models.CASCADE)
    child = models.ForeignKey(Territory, related_name='void', on_delete=models.CASCADE)

class PlayerTerritory(models.Model):
    player = models.ForeignKey(Player, related_name='territories', on_delete=models.CASCADE)
    territory = models.ForeignKey(Territory, related_name='players', on_delete=models.CASCADE)
    units = models.IntegerField()
    has_city = models.BooleanField()

class AdvCard(models.Model):
    game = models.ForeignKey(Game, related_name='adv_cards', on_delete=models.CASCADE)
    name = models.CharField(max_length=40)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    price = models.IntegerField()

class AdvCardAffinity(models.Model):
    advcard = models.ForeignKey(AdvCard, on_delete=models.CASCADE)
    affinity = models.CharField(max_length=30)
    value = models.IntegerField()

class PlayerAdvCard(models.Model):
    player = models.ForeignKey(Player, related_name='Adv_deck', on_delete=models.CASCADE)
    adv_card = models.ForeignKey(AdvCard, related_name='players', on_delete=models.CASCADE)

class TradeCard(models.Model):
    game = models.ForeignKey(Game, related_name='trade_deck', on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    player = models.ForeignKey(Player, related_name='cards', default=None, on_delete=models.SET_NULL, null=True)
    level = models.IntegerField()
    amount = models.IntegerField()

@receiver(post_save, sender=User)
def create_player(sender, instance, created, **kwargs):
    if created:
        Player.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_player(sender, instance, **kwargs):
    instance.player.save()

@receiver(post_save, sender=Game)
def create_game_settings(sender, instance, created, **kwargs):
    if created:
        GameSettings.objects.create(game=instance)

@receiver(post_save, sender=Game)
def save_game_settings(sender, instance, **kwargs):
    instance.settings.save()