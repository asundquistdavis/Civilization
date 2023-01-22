from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from datetime import datetime

class Player(models.Model):
    g_id = models.CharField(max_length=300)
    game = models.ForeignKey('Game', related_name='players', on_delete=models.SET_NULL, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    civ = models.ForeignKey('Civ', default=None, related_name='void', on_delete=models.SET_NULL, null=True)
    ast_order = models.IntegerField(default=None)
    treasury = models.IntegerField(default=0)
    tax_rate = models.IntegerField(default=2)
    pays_tax = models.BooleanField(default=False)
    in_revolt = models.BooleanField(default=False)
    census = models.IntegerField(default=0)

    # user properties - read only
    @property
    def username(self)->str:
        return self.user.username

    # pieces properties - read only
    @property
    def units(self)->int:
        return sum(territory.units for territory in self.territories.all())

    @property
    def stock(self)->int:
        return self.game.max_stock - self.units - self.treasury

    @property
    def cities(self)->int:
        return sum(territory.has_city for territory in self.territories.all())

    @property
    def tax(self)->int:
        return (self.tax_rate*self.cities)*self.pays_tax

    # parts of play
    def collect_tax(self)->None:
        if self.treasury >= self.tax:
            self.treasury += self.tax
            self.save()
        self.treasury = 0
        self.in_revolt = True
        self.save()

    def get_census(self)->None:
        census = self.units
        self.census = census
        self.save()
        return census

    # python methods
    def __str__(self)->str:
        return f'player: {self.user.username}'

class Game(models.Model):
    start = models.DateTimeField(default=now)
    phase = models.ForeignKey('Phase', on_delete=models.SET_NULL, null=True)
    player_turn:Player = models.ForeignKey(Player, related_name='games_is_turn', default=None, on_delete=models.SET_NULL, null=True)
    phase = models.ForeignKey('Phase', related_name='void', on_delete=models.SET_NULL, default=None, null=True)

    # settings properties - read only
    @property
    def max_stock(self)->int:
        return self.settings.max_stock
    
    @property
    def max_cities(self)->int:
        return self.settings.max_cities

    @property
    def max_players(self)->int:
        return self.settings.max_players

    # other properties - read only
    @property
    def clock(self)->datetime:
        return now() - self.start

    # functions to determine oder of play
    # sets order of movement: census order, followed by ast order 
    def get_movem_ord(self, objects=True):
        players = self.players.all()
        if objects:
            return sorted(players, key=lambda player: player.census + 1-player.ast/(self.max_players+1), reverse=True)
        return sorted(players.id, key=lambda player: player.census + 1-player.ast/(self.max_players+1), reverse=True)
    
    # determines order of beneficiary: most cities in stock, followed by most units in stock, followed by ast
    def benef_ord(self, objects=True):
        players = self.players.all()
        if objects:
            return sorted(players, key=lambda player: self.max_cities - player.cities + player.stock/(self.max_stock+1) + (1-player.ast/(self.max_players+1))/(self.max_stock+1), reverse=True)
        return sorted(players, key=lambda player: self.max_cities - player.cities + player.stock/(self.max_stock+1) + (1-player.ast/(self.max_players+1))/(self.max_stock+1), reverse=True)

    # parts of play
    def collect_taxes(self)->None:
        [player.collect_tax() for player in self.players.all()]

    def get_censuses(self)->None:
        [player.get_census() for player in self.players.all()]

    # python methods
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
    max_stock = models.IntegerField(default=55)
    max_cities = models.IntegerField(default=9)
    max_players = models.IntegerField(default=18)

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