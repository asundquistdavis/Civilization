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
    civ = get_or_create(Civ, name='egyptians', pcolor='#f8f8cb', scolor='000000', start_territory='upper nile', ast_rank=1)
    # assign test civ to test user
    user.player.civ = civ
    # get second user
    user2:User = get_or_create(User, id=2, username='test2')
    # create player
    player2:Player = get_or_create(Player, id=2, user=user2)
    # bind player to user
    user2.player = player2
    # add player2 to game
    player2.game = game
    # create second civ
    civ2:Civ = get_or_create(Civ, name='minoans', pcolor='#0dd74a', scolor='000000', start_territory='crete', ast_rank=2)
    # bind civ to player
    player2.civ = civ2
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
    user2.save()