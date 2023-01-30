from django.urls import path
from .api import Load, PreGame, StartTurn, Movement, Trade, EndTurn, test

urlpatterns = [
    path('load/', Load.as_view(), name='load'),
    path('pre-game/', PreGame.as_view(), name='pre game'),
    path('test/', test, name='test api'),
]