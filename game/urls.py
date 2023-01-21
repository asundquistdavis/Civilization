from django.urls import path

from .views import Login

urlpatterns = [
    path('status/', Login.as_view(), name='login')
]