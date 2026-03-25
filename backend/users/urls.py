from django.urls import path
from .views import (
    UserProfileView,
    UserListView,
    RegisterView,
    UserPublicProfileView,
)

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user-me'),
    path('', UserListView.as_view(), name='user-list'),
    path('register/', RegisterView.as_view(), name='user-register'),
    path('<str:username>/', UserPublicProfileView.as_view(), name='user-public-profile'),
]