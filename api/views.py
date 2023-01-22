from django.shortcuts import render
from rest_framework.views import View, Response, status
from game.models import Player, User, Game, Phase
from .models import StatusCall

class Status(View):
    def get(self, req):
        user: User = req.user
        player: Player = user.player
        game: Game = player.current_game
        phase: Phase = game.phase
        start = game.start
        clock = game.clock
        player_turn = game.player_turn

        receipt = StatusCall(user=user, game = game)
        receipt.save()

        res = {
            'game': game.id,
            'phase': phase.name,
            'start': start,
            'clock': clock,
            'phaseStart': '',
            'nextPhaseStart': game.next_phase_start(),
            'player': player.username,
            'currentPlayer': player_turn.username,
            'isTurn': True if player_turn == player else False,
            'receipt': receipt.id
        }

        return Response(res, status=status.HTTP_200_OK)

class PlayerList(View):
    def get(self, req):
        user: User = req.user
        player: Player = user.player
        game: Game = player.current_game
        phase: Phase = game.phase
        start = game.start
        clock = game.clock
        player_turn = game.player_turn

        receipt = StatusCall(user=user, game = game)
        receipt.save()

        res = {
            'game': game.id,
            'phase': phase.name,
            'start': start,
            'clock': clock,
            'phaseStart': '',
            'nextPhaseStart': game.next_phase_start(),
            'player': player.username,
            'currentPlayer': player_turn.username,
            'isTurn': True if player_turn == player else False,
            'receipt': receipt.id
        }

        return Response(res, status=status.HTTP_200_OK)
