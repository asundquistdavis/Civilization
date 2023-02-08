from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from datetime import datetime, timedelta
from json import load
import os
from pathlib import Path
from .classes.Player import Player
from .classes.Civ import Civ
from .utils import get_or_create

class Game(models.Model):
    phase = models.ForeignKey('Phase', on_delete=models.SET_NULL, null=True)
    active_player:Player = models.ForeignKey(Player, related_name='active_in_game', default=None, on_delete=models.SET_NULL, null=True)
    settings = models.OneToOneField('GameSettings', related_name='game', default=None, on_delete=models.SET_NULL, null=True)
    phase = models.OneToOneField('Phase', related_name='game', on_delete=models.SET_NULL, default=None, null=True)
    host = models.ForeignKey(Player, related_name='host_for', on_delete=models.CASCADE)

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
    @property
    def timespan(self)->int:
        return self.settings.timespan
    @property
    def board(self)->dict:
        return self.settings.board.board_geometry
    PHASES = (
        # pre game,
        'start of turn',
        'movement',
        'trade',
        'end of turn',
    )

    def desc(self):
        return {
            'id': self.id,
            'name': str(self),
            'players': [player.id for player in self.players.all()],
            'maxPlayers': self.max_players,
            'host': self.host.username,
        }

    def get_games(self):
        return [game.desc() for game in Game.objects.all()]

    # methods to determine oder of play
    def player_order(self, strat='movement'):
        players = self.players.all()
        if strat=='benneficiary':
            metric = lambda player: self.max_cities - player.cities + player.stock/(self.max_stock+1) + (1-player.ast_rank/(self.max_players+1))/(self.max_stock+1)\
                if self.max_cities and player.cities and player.stock and self.max_stock and player.ast_rank and self.max_players else 0
        else:
            metric = lambda player: player.census + 1-player.ast_rank/(self.max_players+1)\
                if player.census and player.ast_rank and self.max_players else 0
        return sorted(players, key=metric, reverse=True)

    # methods for sending and receiving data (serialization)
    def players_info(self, lite=False):
        if lite:
            return [player.info(lite=True) for player in self.players.all()]
        return [player.info() for player in self.players.all()]

    def territories_info(self)->list:
        return [territory.info() for territory in self.territories.all()]

    def adv_cards_info(self, player):
        return [adv_card.info(player) for adv_card in self.adv_cards.all()]

    # process methods

    @staticmethod
    def add_game(player):
        settings = GameSettings()
        settings.save()
        phase = Phase(name='pre game')
        phase.save()
        game = Game(host=player, settings=settings, phase=phase, active_player= player)
        game.save()
        player.game = game
        player.save()

    def add_player(self, player):
        player.game = self
        player.civ = None
        player.save()

    def select_board(self, report):
        board_id = report['boardId']
        board = Board.objects.get(id=board_id)
        self.board = board
        self.save()

    def start(self):
        # check that game can start - settings, players selected civs - assign defaults ect.
        # pass
        # crerat the start of turn phase phase
        phase = Phase(name=self.PHASES[0], duration=self.timespan)
        # run start of turn
        self.start
        return info

    def load_adv_card_deck(self):
        path = os.path.join(Path(__file__).parent, 'assets', 'adv_card_decks', self.settings.adv_card_deck)
        with open(path, 'r') as deck_file:
            deck = load(deck_file)
            for card_ in deck:
                card = {key: value for key, value in card_.items() if key != 'affinities'}
                affinities = card_['affinities']
                adv_card = get_or_create(AdvCard, game=self, **card)
                for affinity in affinities:
                    get_or_create(AdvCardAffinity, adv_card=adv_card, **affinity)
        return self.adv_cards

    def load_board(self):
        path = os.path.join(Path(__file__).parent, 'assets', 'board_files', self.settings.board.board_file)
        with open(path, 'r') as board_file:
            self.board = load(board_file)
        return self.board

    def load_territories(self):
        path = os.path.join(Path(__file__).parent, 'assets', 'territories_files', self.settings.board.territories_file)
        with open(path, 'r') as territories_file:
            features = load(territories_file)['features']
        for feature in features:
            properties = {prop:value for prop, value in feature['properties'].items() if prop != 'adjacent'}
            geometry = feature['geometry']
            get_or_create(Territory, game=self, geometry=geometry, **properties)
        for feature in features:
            adjacencies = feature['properties']['adjacent']
            parent_name = feature['properties']['name']
            parent = Territory.objects.get(game=self, name=parent_name)
            for child_name in adjacencies:
                child = Territory.objects.get(game=self, name=child_name)
                get_or_create(AdjacentTerritory, parent=parent, child=child)

        return self.territories

    # parts of play
    def collect_taxes(self)->None:
        [player.collect_tax() for player in self.players.all()]

    def set_censuses(self)->None:
        [player.set_census() for player in self.players.all()]

    def movement(self, report):
        player = player.objects.get(id=report['playerId'])

    def compile_movements(self):
        pass

    # python methods
    def __str__(self):
        return f'#{self.id}'

class GameSettings(models.Model):
    board = models.ForeignKey('Board', related_name='void', default=None, on_delete=models.SET_NULL, null=True)
    adv_card_deck = models.CharField(max_length=50, default=None, null=True)
    max_stock = models.IntegerField(default=55)
    max_cities = models.IntegerField(default=9)
    timespan = models.IntegerField(default=None, null=True)

    # board properties
    @property
    def max_players(self):
        return self.board.max_players if self.board else None

    def assets(self):
        path = os.path.join(Path(__file__).parent, 'assets', 'assets.json')
        with open(path, 'r') as assets_file:
            assets = load(assets_file)
        for board_kwargs in assets['boards']:
            get_or_create(Board, game_settings=self, **board_kwargs)
        for civ_kwargs in assets['civs']:
            get_or_create(Civ, game_settings=self, **civ_kwargs)
        self.board = self.boards.all()[0]
        return {
            'boards': [board.desc() for board in Board.objects.filter(game_settings=self)],
            'civs': [civ.desc() for civ in Civ.objects.filter(game_settings=self)],
            'advCards': None,
            'tradeCards': None,
        }

    def __str__(self):
        return f'game settings {self.id}'

class Phase(models.Model):
    start = models.DateTimeField(default=now)
    turn = models.IntegerField(default=0)
    duration = models.IntegerField(default=0)
    name = models.CharField(max_length=20)

    @property
    def next_phase_start_in_seconds(self)->int:
        if self.duration:
            return self.start + timedelta(seconds=self.duration) - now()
        return None

    def __str__(self):
        return f'Phase: {self.name}'

class Board(models.Model):
    game_settings = models.ForeignKey(GameSettings, on_delete=models.CASCADE, related_name='boards')
    board_name = models.CharField(max_length=50)
    board_file = models.CharField(max_length=50)
    territories_file = models.CharField(max_length=50)
    max_players = models.IntegerField(default=18)
    board_geometry = models.JSONField()


    def desc(self):
        return {
            'name': self.board_name,
            'id': self.id,
            'max_players': self.max_players,
            'geometry': self.board_geometry
        }

class Territory(models.Model):
    geometry = models.JSONField()
    name = models.CharField(max_length=50)
    game = models.ForeignKey(Game, related_name='territories', on_delete=models.CASCADE)
    type = models.CharField(max_length=10)
    support = models.IntegerField(default=0)
    has_city_cite = models.BooleanField(default=False)

    def units_for(self, player):
        return PlayerTerritory.objects.get(territory=self, player=player).units

    # methods for sending and receiving data (serialization)
    def info(self):  
        info = {
            'id': self.id,
            'geometry': self.geometry,
            'name': self.name,
            'type': self.type,
            'support': self.support,
            'hasCityCite': self.has_city_cite,
            'adjacent': [adj_ter.child.id for adj_ter in self.adjacencies.all()],
            'players': [player_territory.info for player_territory in self.players.all()]
        }
        return info

    def __str__(self):
        return self.name

class AdjacentTerritory(models.Model):
    parent = models.ForeignKey(Territory, related_name='adjacencies', on_delete=models.CASCADE)
    child = models.ForeignKey(Territory, related_name='void', on_delete=models.CASCADE)

# class StagedMove(models.Model):
#     player = models.ForeignKey(Player, related_name='staged_moves', on_delete=models.CASCADE)
#     game = models.ForeignKey(Game, related_name='staged_moves', on_delete=models.CASCADE)
#     turn = models.IntegerField()
#     origin_territory = models.ForeignKey(Territory, related_name='units_leaving', on_delete=models.CASCADE)
#     target_territory = models.ForeignKey(Territory, related_name='units_entering', on_delete=models.CASCADE)
#     units = models.IntegerField()
#     target_boat = models.ForeignKey('Boat', related_name='units_boarded', on_delete=models.CASCADE, default=None, null=True)
#     boat = models.ForeignKey('Boat', related_name='stage_moves', on_delete=models.CASCADE, default=None, null=True)

class Boat(models.Model):
    upkeep_paid = models.BooleanField(default=False)
    territory = models.ForeignKey('PlayerTerritory', related_name='boats', on_delete=models.CASCADE)
    player = models.ForeignKey(Player, related_name='boats', on_delete=models.CASCADE)

    @property
    def info(self):
        return {
            'boatId': self.id,
            'upkeepPaid': self.upkeep_paid,
        }

class PlayerTerritory(models.Model):
    player:Player = models.ForeignKey(Player, related_name='territories', on_delete=models.CASCADE)
    territory:Territory = models.ForeignKey(Territory, related_name='players', on_delete=models.CASCADE)
    units:int = models.IntegerField()
    has_city:bool = models.BooleanField()

    @property
    def info(self):
        info = {
            'playerId': self.player.id, #int
            'territoryId': self.territory.id, #int
            'units': self.units, # int
            'hasCity': self.has_city, #bool
            'boats': [boat.info for boat in self.boats]
        }
        return info

class AdvCard(models.Model):
    game = models.ForeignKey(Game, related_name='adv_cards', on_delete=models.CASCADE)
    name = models.CharField(max_length=40)
    credit_from = models.CharField(max_length=40, default=None, null=True)
    credit_from_amount = models.IntegerField(default=None, null=True)
    credit_for = models.CharField(max_length=40, default=None, null=True)
    credit_for_amount = models.IntegerField(default=None, null=True)
    color_1 = models.CharField(max_length=10)
    color_2 = models.CharField(max_length=10, default=None, null=True)
    price = models.IntegerField()
    desc = models.TextField()

    @property
    def points(self)->int:
        return 1 if (hundreds := self.price//100) == 0 else (3 if hundreds == 1 else 6)

    def cost_for(self, player:Player)->int:
        credit_from_color_1 = player.credit(self.color_1)
        credit_from_color_2 = player.credit(self.color_2) if self.color_2 else 0
        credit_from_card = self.credit_from_amount if self.credit_from in player.adv_cards_list else 0
        credit = max(credit_from_color_1, credit_from_color_2) + credit_from_card
        return self.price - credit
    
    def info(self, player:Player):
        info = {
            'name': self.name, #str
            'price': self.price, #int
            'points': self.points, #int
            'creditFor': self.credit_for, #str
            'creditForAmount': self.credit_for_amount, #int
            'creditFrom': self.credit_from, #str
            'creditFromAmount': self.credit_from_amount, #int
            'color1': self.color_1, #str
            'color2': self.color_2, #str
            'affinities': [affinity.info() for affinity in self.affinities.all()], #list[dict]
            'cost': self.cost_for(player) if player else None, #int | None
        }
        return info

class AdvCardAffinity(models.Model):
    adv_card = models.ForeignKey(AdvCard, related_name='affinities', on_delete=models.CASCADE)
    color = models.CharField(max_length=30)
    credit = models.IntegerField()
    
    def info(self):
        info = {
            'color': self.color,
            'credit': self.credit,
        }
        return info

class PlayerAdvCard(models.Model):
    player = models.ForeignKey(Player, related_name='adv_cards', on_delete=models.CASCADE)
    card_info:AdvCard = models.ForeignKey(AdvCard, related_name='players', on_delete=models.CASCADE)
    purchase_cost = models.IntegerField()

    def info(self, player):
        info = self.card_info.info(player)
        return info

class PlayerCredit(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)

class TradeCard(models.Model):
    game = models.ForeignKey(Game, related_name='trade_deck', on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    player = models.ForeignKey(Player, related_name='trade_cards', default=None, on_delete=models.SET_NULL, null=True)
    level = models.IntegerField()
    max_set = models.IntegerField()

    def info(self):
        info = {
            'name': self.name, #str
            'level': self.level, #int
            'maxSet': self.max_set #int
        }
        return info

@receiver(post_save, sender=User)
def create_player(sender, instance, created, **kwargs):
    if created:
        Player.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_player(sender, instance, **kwargs):
    instance.player.save()
