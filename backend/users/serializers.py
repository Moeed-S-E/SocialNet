
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for User Profile"""
    # ✅ Safe handling of profile_picture
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['bio', 'profile_picture', 'privacy_setting']
    
    def get_profile_picture(self, obj):
        """✅ Return image URL string or None if empty"""
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None  # ✅ Safe fallback


class UserSerializer(serializers.ModelSerializer):
    """Full serializer for own profile"""
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'date_joined']
        extra_kwargs = {'email': {'read_only': True}}


class PublicProfileSerializer(serializers.ModelSerializer):
    """Limited serializer for viewing other users"""
    profile = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    is_friend = serializers.SerializerMethodField()
    # ✅ Remove direct profile_picture field - handled in get_profile()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile', 'posts_count', 'is_friend']
    
    def _get_safe_image_url(self, field_instance, request=None):
        """✅ Reusable helper: Return image URL or None"""
        if field_instance and hasattr(field_instance, 'url'):
            if request:
                return request.build_absolute_uri(field_instance.url)
            return field_instance.url
        return None
    
    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            privacy = obj.profile.privacy_setting
            request = self.context.get('request')
            is_owner = request and request.user.is_authenticated and request.user == obj
            
            # Check if viewer is a friend
            is_friend = False
            if request and request.user.is_authenticated:
                from friends.models import FriendRequest
                from django.db.models import Q
                is_friend = FriendRequest.objects.filter(
                    status='accepted'
                ).filter(
                    Q(sender=request.user, receiver=obj) | Q(sender=obj, receiver=request.user)
                ).exists()
            
            # Hide details for private profiles (unless owner or friend)
            if privacy == 'private' and not is_owner and not is_friend:
                return {
                    'bio': '🔒 This profile is private',
                    'profile_picture': None,  # ✅ Already None
                    'privacy_setting': 'private'
                }
            
            # Hide bio for friends-only (unless owner or friend)
            if privacy == 'friends' and not is_owner and not is_friend:
                return {
                    'bio': '👥 Profile visible to friends only',
                    # ✅ Safe URL handling
                    'profile_picture': self._get_safe_image_url(obj.profile.profile_picture, request),
                    'privacy_setting': 'friends'
                }
            
            # Full details for public/authorized viewers
            return {
                'bio': obj.profile.bio,
                # ✅ Safe URL handling
                'profile_picture': self._get_safe_image_url(obj.profile.profile_picture, request),
                'privacy_setting': privacy
            }
        return None
    
    def get_posts_count(self, obj):
        from posts.models import Post
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            is_owner = request.user == obj
            is_friend = False
            if not is_owner:
                from friends.models import FriendRequest
                from django.db.models import Q
                is_friend = FriendRequest.objects.filter(
                    status='accepted'
                ).filter(
                    Q(sender=request.user, receiver=obj) | Q(sender=obj, receiver=request.user)
                ).exists()
            
            if is_owner or is_friend:
                return Post.objects.filter(author=obj).count()
        
        return Post.objects.filter(author=obj, visibility='public').count()
    
    def get_is_friend(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        from friends.models import FriendRequest
        from django.db.models import Q
        return FriendRequest.objects.filter(
            status='accepted'
        ).filter(
            Q(sender=request.user, receiver=obj) | Q(sender=obj, receiver=request.user)
        ).exists()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # Profile is auto-created by post_save signal in models.py
        return user