from rest_framework import serializers
from .models import Post, Comment, Like
from django.contrib.auth.models import User

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name']

class CommentSerializer(serializers.ModelSerializer):
    author = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    author = UserMinimalSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'content', 'image', 'visibility', 
            'created_at', 'comments', 'likes_count', 'is_liked'
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        """✅ Safe: Check authentication BEFORE querying"""
        request = self.context.get('request')
        
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.likes.filter(user_id=request.user.id).exists()
        return False  
    

