from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from datetime import datetime, timedelta
from json import load
import os
from pathlib import Path

class Player(models.Model):
    game = models.ForeignKey('Game', related_name='players', on_delete=models.SET_NULL, null=True)
    user:User = models.OneToOneField(User, on_delete=models.CASCADE)
    civ = models.ForeignKey('Civ', default=None, related_name='void', on_delete=models.SET_NULL, null=True)
    treasury:int = models.IntegerField(default=0)
    tax_rate:int = models.IntegerField(default=2)
    pays_tax:bool = models.BooleanField(default=False)
    back_tax:int = models.IntegerField(default=0)
    census:int = models.IntegerField(default=0)
    ast_position:int = models.IntegerField(default=0)
    adv_credits = models.ForeignKey('PlayerCredit', related_name='void', default=None, on_delete=models.SET_NULL, null=True)

    # user properties - read only
    @property
    def username(self)->str:
        return self.user.username

    # civ properties - read only
    @property
    def civ_name(self)->str:
        return self.civ.name

    @property
    def ast_rank(self)->int:
        return self.civ.ast_rank

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

    # score related properties
    @property
    def points_on_cards(self):
        return sum(adv_card.card_info.points for adv_card in self.adv_cards.all())

    # adv card properties/methods
    @property
    def adv_cards_list(self):
        return [adv_card.card_info.name for adv_card in self.adv_cards.all()]

    def credit(self, color):
        return sum(affinity.credit for adv_car in self.adv_cards.all() for affinity in adv_car.card_info.affinities.all() if affinity.color == color)

    # methods for sending and receiving data (serialization)
       # get all territories:
    def load_info(self):
        game = self.game
        if self.game.phase.name in self.game.PHASES:
            info = {
                'playerId': self.id, #int
                'gameId': game.id, #int
                'turn': game.phase.turn, #int
                'phase': game.phase.name, #str
                'activePlayerId': game.active_player.id, #int
                'isActivePlayer': True if game.active_player.id == self.id else False,
                'board': game.board, #json
                'players': game.players_info(), #list[str]
                'territories': game.territories_info(), #list[str]
                'adv_cards': game.adv_cards_info(self), #list[str]
            }
        else:
            info = {
                'playerId': self.id, #int
                'gameId': game.id, #int
                'turn': game.phase.turn, #int
                'phase': game.phase.name, #str
                'players': game.players_info(lite=True), #list[str]
                **game.settings.get_boards_civs(),
            }
        return info

    def status_info(self):
        info = {
            
        }
        return info

    def pregame_info(self):
        info = {

        }
        return info

    def pregame(self, report):
        path = os.path.join(Path(__file__).parent, 'assets', 'assets.json')
        with open(path, 'r') as assets_file:
            assets = load(assets_file)
        board = list(filter(lambda board: board['name']==report['boardName'], assets['boards']))[0]
        board_kwargs = board['kwargs']
        GameSettings(game=self.game, **board_kwargs).save()
        self.save()
        for player_civ in report['playerCivs']:
            civ_kwargs= list(filter(lambda civ: civ['name']==player_civ['civName'], assets['civs']))[0]
            civ = get_or_create(Civ, **civ_kwargs)
            Player.objects.update(id=player_civ['playerId'], civ=civ)
        if report['startGame']:
            self.game.start()
        info = {
            'message': 'success'
        }
        return info

    def startturn_info(self):
        info = {

        }
        return info

    def movement_info(self):
        info = {

        }
        return info

    def trade_info(self):
        info = {

        }
        return info

    def endturn_info(self):
        info = {

        }
        return info

    def info(self, lite=False):
        if lite:
            info = {
                'id': self.id, #int
                'username': self.username, #str
                'civ': self.civ_name, #str
                'pcolor': self.civ.pcolor, #str
                'scolor': self.civ.scolor, #str
                'astRank': self.ast_rank, #int
                }
        else:
            info = {
                'id': self.id, #int
                'username': self.username, #str
                'civ': self.civ_name, #str
                'pcolor': self.civ.pcolor, #str
                'scolor': self.civ.scolor, #str
                'astRank': self.ast_rank, #int
                'isActivePlayer': True if self.game.active_player.id==self.id else False, #bool
                'treasury': self.treasury, #int
                'tax': self.tax, #int
                'backTax': self.back_tax, #int 
                'census': self.census, #int 
                'stock': self.stock, #int
                'units': self.units, #int
                'cities': self.cities, #int
                'movementOrder': self.movement_order, #int
                'benneficiaryOrder': self.benneficiary_order, #int
                'advCards': [adv_card.info(self).id for adv_card in self.adv_cards.all()], #list[dict]
        }
        return info

    # ordering players
    @property
    def movement_order(self):
        return self.game.player_order(strat='movemenet').index(self)
    @property
    def benneficiary_order(self):
        return self.game.player_order(strat='benneficiary').index(self)
    
    # parts of play
    def collect_tax(self)->None:
        if (back_tax := self.tax - self.treasury) <= 0:
            self.treasury += self.tax
            self.save()
        self.treasury = 0
        self.back_tax = back_tax
        self.save()

    def set_census(self)->None:
        census = self.units
        self.census = census
        self.save()
        return census
    
    # def commit_movement(self, report):
    #     turn = self.game.turn
    #     staged_moves = StagedMove.objects.filter(player=self, turn=turn).all()
    #     for staged_move in staged_moves:
    #         pass

    # python methods
    def __str__(self)->str:
        return f'player: {self.user.username}'

class Game(models.Model):
    phase = models.ForeignKey('Phase', on_delete=models.SET_NULL, null=True)
    active_player:Player = models.ForeignKey(Player, related_name='active_in_game', default=None, on_delete=models.SET_NULL, null=True)
    settings = models.OneToOneField('GameSettings', related_name='game', default=None, on_delete=models.SET_NULL, null=True)
    phase = models.OneToOneField('Phase', related_name='game', on_delete=models.SET_NULL, default=None, null=True)
    board = models.JSONField()

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

    PHASES = (
        # pre game,
        'start of turn',
        'movement',
        'trade',
        'end of turn',
    )

    # managing time properties/methods
    @property
    def clock(self)->datetime:
        return now() - self.start_time

    def phase_duration(self, phase_name):
        return self.timespan

    # methods to determine oder of play
    def player_order(self, strat='movement'):
        players = self.players.all()
        if strat=='benneficiary':
            metric = lambda player: self.max_cities - player.cities + player.stock/(self.max_stock+1) + (1-player.ast_rank/(self.max_players+1))/(self.max_stock+1)
        else:
            metric = lambda player: player.census + 1-player.ast_rank/(self.max_players+1)
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
    def start(self):
        pass

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
        path = os.path.join(Path(__file__).parent, 'assets', 'board_files', self.settings.board_file)
        with open(path, 'r') as board_file:
            self.board = load(board_file)
        return self.board

    def load_territories(self):
        path = os.path.join(Path(__file__).parent, 'assets', 'territories_files', self.settings.territories_file)
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
    def pre_game(self):
        pass

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

class Phase(models.Model):
    start = models.DateTimeField(default=now)
    turn = models.IntegerField()
    duration = models.IntegerField()
    name = models.CharField(max_length=20)

    @property
    def next_phase_start_in_seconds(self)->int:
        if self.duration:
            return self.start + timedelta(seconds=self.duration) - now()
        return None

    def __str__(self):
        return f'Phase: {self.name}'

class GameSettings(models.Model):
    board_name = models.CharField(max_length=50, default=None, null=True)
    board_file = models.CharField(max_length=50, default=None, null=True)
    territories_file = models.CharField(max_length=50, default=None, null=True)
    adv_card_deck = models.CharField(max_length=50, default=None, null=True)
    max_stock = models.IntegerField(default=55)
    max_cities = models.IntegerField(default=9)
    max_players = models.IntegerField(default=18)
    timespan = models.IntegerField(default=None, null=True)

    def get_boards_civs(self):
        path = os.path.join(Path(__file__).parent, 'assets', 'assets.json')
        with open(path, 'r') as assets_file:
            assets = load(assets_file)
        return {
            'boards': assets['boards'],
            'civs': assets['civs']
        }

    def __str__(self):
        return f'game settings {self.id}'

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

class Civ(models.Model):
    name = models.CharField(max_length=50)
    pcolor = models.CharField(max_length=10)
    scolor = models.CharField(max_length=10)
    start_territory = models.CharField(max_length=50)
    ast_rank = models.IntegerField()

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
            'maxSet': self.max_set #intnbvfg
        }
        return info

@receiver(post_save, sender=User)
def create_player(sender, instance, created, **kwargs):
    if created:
        Player.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_player(sender, instance, **kwargs):
    instance.player.save()

def get_or_create(Model, **kwargs)->object:
    try:
        model = Model.objects.filter(**kwargs)[0]
    except IndexError:
        model = Model.objects.create(**kwargs)
    return model