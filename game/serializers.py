from rest_framework import serializers
from .models import User, Player, Game

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class GameSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Game

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ('uesr', 'current_game', 'territories')