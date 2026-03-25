from rest_framework import generics, status, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import FriendRequest
from .serializers import FriendRequestSerializer
from notifications.utils import create_notification


class FriendRequestListView(generics.ListCreateAPIView):
    """Returns only pending friend requests"""
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return FriendRequest.objects.filter(
            Q(sender=user) | Q(receiver=user),
            status='pending'
        ).select_related('sender', 'receiver')

    def perform_create(self, serializer):
        sender = self.request.user
        receiver = serializer.validated_data['receiver']

        if sender == receiver:
            raise serializers.ValidationError("Cannot send request to yourself")

        if FriendRequest.objects.filter(
            sender=sender, receiver=receiver, status='pending'
        ).exists():
            raise serializers.ValidationError("Friend request already pending")

        if FriendRequest.objects.filter(
            Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender),
            status='accepted'
        ).exists():
            raise serializers.ValidationError("Already friends")

        serializer.save(sender=sender)

        create_notification(
            receiver,
            f"{sender.username} sent you a friend request!",
            'friend_request',
            actor=sender,
        )


class FriendsListView(generics.ListAPIView):
    """Returns only accepted friends for the current user"""
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return FriendRequest.objects.filter(
            Q(sender=user) | Q(receiver=user),
            status='accepted'
        ).select_related('sender', 'receiver')


class AcceptFriendRequest(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, request_id):
        try:
            friend_request = FriendRequest.objects.get(id=request_id)
        except FriendRequest.DoesNotExist:
            return Response(
                {'error': 'Friend request not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if friend_request.receiver != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        if friend_request.status != 'pending':
            return Response(
                {'error': 'Already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        friend_request.status = 'accepted'
        friend_request.save()

        create_notification(
            friend_request.sender,
            f"{request.user.username} accepted your request!",
            'friend_accepted',
            actor=request.user,
        )

        return Response({'message': 'Accepted'}, status=status.HTTP_200_OK)


class RejectFriendRequest(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, request_id):
        try:
            friend_request = FriendRequest.objects.get(id=request_id)
        except FriendRequest.DoesNotExist:
            return Response(
                {'error': 'Friend request not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if friend_request.receiver != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        if friend_request.status != 'pending':
            return Response(
                {'error': 'Already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        friend_request.delete()
        return Response({'message': 'Rejected'}, status=status.HTTP_200_OK)


class CancelFriendRequest(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, request_id):
        try:
            friend_request = FriendRequest.objects.get(id=request_id)
        except FriendRequest.DoesNotExist:
            return Response(
                {'error': 'Friend request not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if friend_request.sender != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        if friend_request.status != 'pending':
            return Response(
                {'error': 'Already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        friend_request.delete()
        return Response({'message': 'Cancelled'}, status=status.HTTP_200_OK)


class RemoveFriendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, friend_id):
        friend_request = FriendRequest.objects.filter(
            Q(sender=request.user, receiver_id=friend_id) |
            Q(sender_id=friend_id, receiver=request.user),
            status='accepted'
        ).first()

        if not friend_request:
            return Response(
                {'error': 'Friend not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        friend_request.delete()
        return Response({'message': 'Friend removed'}, status=status.HTTP_200_OK)


class RemoveFriendByRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, request_id):
        try:
            friend_request = FriendRequest.objects.get(
                id=request_id,
                status='accepted'
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {'error': 'Friend relationship not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user not in [friend_request.sender, friend_request.receiver]:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        friend_request.delete()
        return Response({'message': 'Friend removed successfully'}, status=status.HTTP_200_OK)