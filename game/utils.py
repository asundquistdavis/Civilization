from django.contrib.auth import logout, login
from .models import User, Player, Game, Phase, GameSettings, Civ, get_or_create

def _test_(req):
    # logout user
    logout(req)
    # get test user
    user = User.objects.get(id=1)
    # login as test user
    login(req, user)
    # get test game
    game:Game = get_or_create(Game, id=1)
    # set test user's game to test game
    user.player.game = game
    # create test civ
    civ = get_or_create(Civ, name='egyptians', pcolor='f1f1f1', scolor='e0e0e0', start_territory='upper nile', ast_rank=1)
    # assign test civ to test user
    user.player.civ = civ
    # create test 'pre game' phase
    phase = get_or_create(Phase, name='pre game', duration=999_999_999, turn=0)
    # assign test phase to current game
    game.phase = phase
    # create test settings with test adv_card_deck
    settings = get_or_create(GameSettings, adv_card_deck='test_deck_1.json', board_file='test_board_1.json', territories_file='test_territories_1.json')
    # assign test settings to current game
    game.settings = settings
    # load test adv_card_deck
    game.load_adv_card_deck()
    # load board
    game.load_board()
    # load territories
    game.load_territories()
    # set active player to test user
    game.active_player = user.player
    game.save()
    user.save()