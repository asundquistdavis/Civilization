from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from .models import Player

# class Status(APIView):
#     def get(self, request, format=None):
#         game = Game()
#         game.save()
#         status = game.status()
#         return Response(status)

#     def post(self, request):
#         print(request.data)
#         username = request.data['username']
#         password = request.data['password']
#         user = User(username=username, password=password)
#         user.save()
#         return Response({'message':'success'}, status=status.HTTP_201_CREATED)

# class AuthUser(APIView):
#     def post(self, request):
#         profile = request.data
#         print(request.data)
#         return Response({'message':'success'}, status=status.HTTP_202_ACCEPTED)

class Login(APIView):
    def post(self, request):
        g_profile = request.data
        print(g_profile)
        # player = Player(g_id=g_profile)
        return Response(g_profile, status=status.HTTP_201_CREATED)

class Logout(APIView):
    def post(self, request):
        print('logged out')
        return Response({'message': 'logged out'}, status=status.HTTP_200_OK)