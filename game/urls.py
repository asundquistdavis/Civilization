from django.urls import path

from .views import Status

urlpatterns = [
    path('status/', Status.as_view(), name='api')
]