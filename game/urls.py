from django.urls import path
from .api import Load, PreGame, StartTurn, Movement, Trade, EndTurn, test

urlpatterns = [
    path('load/', Load.as_view(), name='load'),
    path('pre-game/', PreGame.as_view(), name='pre game'),
    path('start-of-turn/', StartTurn.as_view(), name='Start of Turn'),
    path('movement/', Movement.as_view(), name='movement'),
    path('trade/', Trade.as_view(), name='trade'),
    path('EndTurn/', EndTurn.as_view(), name='end of turn'),
    path('test/', test, name='test api'),
]