from django.shortcuts import render
from rest_framework.views import APIView, Response, status
from game.models import Player, User, Game, Phase

from .utils import _test_

class Load(APIView):
    def get(self, req):

        # simulate logging in, and starting new game with new game settings, civ, adv cards ect
        _test_(req)

        player:Player = req.user.player
        info = player.load_info()
        return Response(info, status=status.HTTP_200_OK)

class Status(APIView):
    def get(self, req):
        player:Player = req.user.player
        game:Game = player.game
        info = game.status_info(player)
        return Response(info, status=status.HTTP_200_OK)

class PreGame(APIView):
    def get(self, req):
        player:Player = req.user.player
        info = player.pregame_info()
        return Response(info, status=status.HTTP_200_OK)

    def post(self, req):
        player:Player = req.user.player
        info = player.pregame(req.data)
        return Response(info, status=status.HTTP_200_OK)

class StartTurn(APIView):
    def get(self, req):
        player:Player = req.user.player
        game:Game = player.game
        info = game.startturn_info(player)
        return Response(info, status=status.HTTP_200_OK)

    def post(self, req):
        game:Game = req.user.player.game
        info = game.startturn(req.data)
        return Response(info, status=status.HTTP_200_OK)

class Movement(APIView):
    def get(self, req):
        player:Player = req.user.player
        game:Game = player.game
        info = game.movement_info(player)
        return Response(info, status=status.HTTP_200_OK)

    def post(self, req):
        game:Game = req.user.player.game
        info = game.movement(req.data)
        return Response(info, status=status.HTTP_200_OK)

class Trade(APIView):
    def get(self, req):
        player:Player = req.user.player
        game:Game = player.game
        info = game.trade_info(player)
        return Response(info, status=status.HTTP_200_OK)

    def post(self, req):
        game:Game = req.user.player.game
        info = game.tade(req.data)
        return Response(info, status=status.HTTP_200_OK)

class EndTurn(APIView):
    def get(self, req):
        player:Player = req.user.player
        game:Game = player.game
        info = game.endturn_info(player)
        return Response(info, status=status.HTTP_200_OK)

    def post(self, req):
        game:Game = req.user.player.game
        info = game.endturn(req.data)
        return Response(info, status=status.HTTP_200_OK)

def test(req):
    return render(req, 'game/test_api.html')

"""
outline for json objects sent via api

    Load - called when page is first loaded::
    get info = {
        gameId: id,
        playerId: id,
        tradCards: [
            {
                name: str
                level: int
            }...
                ],
            }...
        ],
        territories: [
            {
                territoryId: id,
                territory: str,
                type: str,
                support: int,
                hasCityCite: bool,
                geometry: geoJSON,
                adjacencies: [
                    {
                        territoryId: id,
                    }...
                ],
            }...
        ],
        advCards: [
            {
                advCardId: id
                advCard: str
                price: int
                points: int
                creditFor: str
                creditForAmount: int
                color1: str
                color2: str
                affinities: [
                    {
                        color: str
                        credit: int
                    }...
                ],
                cost,
            }...
        ],
        players: [
            {
                playerId: id,
                player: str,
                civ: 
                pcolor:
                scolor:
                astRank:
                treasury:
                tax:
                backTax:
                census:
                stock:
                units:
                cities:
                territories: [
                    {
                        playerId: id,
                        units: int
                        boats: int
                        hasCity: bool,
                    }...
                ],
                advCards: [
                    {
                        advCarId: id
                    }...
                ],
                credits: [
                    {

                    }...
                ],
            }
        ]
    }

    Status view::
    
    info = {
        gameId: id,
        playerId: id,
        phase: id,
        player_turn: id or null/None,

    }

    Movement view::
    
    report = {
        gameId: int, 
        playerId: int,
        originId: int,
        targetId: int,
        units: int,
        boatId: int or None,
        unitsLeft: int or None,
    }

    info = {
        gameId: int,
        playerId: int,
        activePlayerId: int,
        isActivePlayer: bool,
        territories: [{
                territoryId: int,
                players: [{
                        territoryId: int,
                        units: int,
                        unitsEntering: int,
                        unitsLeaving: int,
                        boats: [{
                                boatId: int,
                                unitsCarried: int,
                                reamainingMoves: int,
                                maxMoves: int,
                                upkeepPaid: bool,
                                canMoveDeep: bool,
                            }...
                        ],
                    }...
                ],
            }...
        ],
    }

"""