from django.urls import path
from .views import (
    FriendRequestListView,
    FriendsListView,
    AcceptFriendRequest,
    RejectFriendRequest,
    CancelFriendRequest,
    RemoveFriendView,
    RemoveFriendByRequestView,
)

urlpatterns = [
    path('', FriendRequestListView.as_view(), name='friend-request-list'),
    path('list/', FriendsListView.as_view(), name='friends-list'),

    path('<int:request_id>/accept/', AcceptFriendRequest.as_view(), name='friend-request-accept'),
    path('<int:request_id>/reject/', RejectFriendRequest.as_view(), name='friend-request-reject'),
    path('<int:request_id>/cancel/', CancelFriendRequest.as_view(), name='friend-request-cancel'),
    path('remove/<int:friend_id>/', RemoveFriendView.as_view(), name='friend-remove'),
    path('remove-request/<int:request_id>/', RemoveFriendByRequestView.as_view(), name='friend-remove-by-request'),
]