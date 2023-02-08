from django.db import models
from django.contrib.auth.models import User
from .Civ import Civ
import os
from pathlib import Path

class Player(models.Model):
    game = models.ForeignKey('Game', related_name='players', on_delete=models.SET_NULL, null=True)
    user:User = models.OneToOneField(User, on_delete=models.CASCADE)
    civ = models.ForeignKey('Civ', default=None, related_name='player', on_delete=models.SET_NULL, null=True)
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
        return self.civ.name if self.civ else None

    @property
    def ast_rank(self)->int:
        return self.civ.ast_rank if self.civ else None

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

    @property
    def points(self):
        return self.points_on_cards + self.ast_position * 5

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
                'advCards': game.adv_cards_info(self), #list[str]
            }
        else:
            info = {
                'playerId': self.id, #int
                'gameId': game.id, #int
                'games': game.get_games(),
                'turn': game.phase.turn, #int
                'phase': game.phase.name, #str
                'players': game.players_info(), #list[dict],
                'territories': game.territories_info(), #list[dict]
                **game.settings.assets(),
                'board': game.board, #list[dict]
            }
        return info

    def status_info(self):
        info = {
            
        }
        return info

    def pregame_info(self):
        info = {
            'phase': self.game.phase.name,
            'players': self.game.players_info(),
            'games': self.game.get_games(),
        }
        return info
    
    def select_civ(self, report):
        # *for testing purposes - anyone can change anyone's civ*
        # *replace player with self to personalize it*
        player = Player.objects.get(id=report['playerId'])

        # get selected civ and assign it to player
        civ = Civ.objects.get(id=report['civId'])
        
        # if civ is already taken, return nothing
        if not civ.player.all():
            player.civ = civ
            player.user.save()
        return {'players': player.game.players_info(), 'selectedPlayer': player.info()}

    def startturn_info(self):
        info = {
            'phase': self.game.phase.name,
            'turn': self.game.phase.turn,
            'players': self.game.players_info(),
            'activePlayerId': self.game.active_player.id,
            'isActivePlayer': self.game.active_player.id == self.id,
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

    def info(self):
        info = {
            'id': self.id, #int
            'username': self.username, #str
            'civ': self.civ_name if self.civ else None, #str
            'pcolor': self.civ.pcolor if self.civ else None, #str
            'scolor': self.civ.scolor if self.civ else None, #str
            'astRank': self.ast_rank if self.civ else None, #int
            'isActivePlayer': self.game.active_player.id==self.id, #bool
            'treasury': self.treasury, #int
            'tax': self.tax, #int
            'backTax': self.back_tax, #int 
            'census': self.census, #int 
            'stock': self.stock, #int
            'units': self.units, #int
            'cities': self.cities, #int
            'points': self.points, #int
            'movementOrder': self.movement_order, #int
            'benneficiaryOrder': self.benneficiary_order, #int
            'advCards': [adv_card.info(self).id for adv_card in self.adv_cards.all()], #list[int]
            'tradeCards': [trade_card.info() for trade_card in self.trade_cards.all()], #list[dict]
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
