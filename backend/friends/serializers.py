from rest_framework import serializers
from .models import FriendRequest
from django.contrib.auth.models import User

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name']

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserMinimalSerializer(read_only=True)
    receiver = UserMinimalSerializer(read_only=True)
    

    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='receiver', 
        write_only=True
    )

    class Meta:
        model = FriendRequest
        fields = [
            'id', 'sender', 'receiver', 
            'receiver_id', 
            'status', 'created_at'
        ]
        read_only_fields = ['status', 'created_at', 'sender', 'receiver']