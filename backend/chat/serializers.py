# backend/chat/serializers.py
from rest_framework import serializers
from .models import Message, Conversation
from django.contrib.auth.models import User

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name']
        read_only_fields = ['id', 'username', 'first_name']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserMinimalSerializer(read_only=True)
    receiver = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'is_read', 'created_at']
        read_only_fields = ['sender', 'created_at']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)

class ConversationSerializer(serializers.ModelSerializer):
    participant1 = UserMinimalSerializer(read_only=True)
    participant2 = UserMinimalSerializer(read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participant1', 'participant2', 'last_message', 'updated_at', 'unread_count']
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        other_user = obj.participant2 if obj.participant1 == request.user else obj.participant1
        return Message.objects.filter(
            sender=other_user,
            receiver=request.user,
            is_read=False
        ).count()