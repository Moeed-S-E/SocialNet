# backend/chat/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Message, Conversation
from .serializers import MessageSerializer, ConversationSerializer


class ConversationListView(generics.ListAPIView):
    """List conversations for current user"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(participant1=user) | Q(participant2=user)
        ).select_related('participant1', 'participant2', 'last_message').order_by('-updated_at')


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs['user_id']
        return Message.objects.filter(
            Q(sender=user, receiver_id=other_user_id) |
            Q(sender_id=other_user_id, receiver=user)
        ).select_related('sender', 'receiver').order_by('created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class MessageCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            from django.contrib.auth.models import User
            receiver = User.objects.get(id=user_id)
            
            if receiver == request.user:
                return Response({'error': 'Cannot send message to yourself'}, status=status.HTTP_400_BAD_REQUEST)
            
            message = Message.objects.create(
                sender=request.user,
                receiver=receiver,
                content=request.data.get('content', '').strip()
            )
            
            ids = sorted([request.user.id, receiver.id])
            conversation, _ = Conversation.objects.get_or_create(
                participant1_id=ids[0],
                participant2_id=ids[1],
            )
            conversation.last_message = message
            conversation.save()
            
            serializer = MessageSerializer(message, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MarkMessagesReadView(APIView):
    """Mark messages as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        Message.objects.filter(
            sender_id=user_id,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'status': 'marked_read'}, status=status.HTTP_200_OK)