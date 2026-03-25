from rest_framework import serializers
from .models import Notification
from django.contrib.auth.models import User 


class NotificationUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name']
        read_only_fields = ['id', 'username', 'first_name']

class NotificationSerializer(serializers.ModelSerializer):
    actor = NotificationUserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'receiver', 'actor', 'verb', 'target',
            'target_content_type', 'target_object_id',
            'is_read', 'created_at'
        ]
        read_only_fields = ['receiver', 'created_at']