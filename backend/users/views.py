from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Q
from friends.models import FriendRequest
from .serializers import UserSerializer, PublicProfileSerializer, UserRegistrationSerializer
from posts.models import Post
from posts.serializers import PostSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user's profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """List all users (excluding current user)"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)


class RegisterView(generics.CreateAPIView):
    """Register a new user"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)


class UserPublicProfileView(generics.RetrieveAPIView):
    """View any user's profile by username with privacy controls"""
    permission_classes = [AllowAny]
    lookup_field = 'username'
    serializer_class = PublicProfileSerializer
    
    def get_queryset(self):
        return User.objects.select_related('profile').all()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Determine privacy level
        privacy = 'public'
        if hasattr(instance, 'profile'):
            privacy = getattr(instance.profile, 'privacy_setting', 'public')
        
        is_owner = request.user.is_authenticated and instance == request.user
        
        # Check friendship status
        is_friend = False
        if request.user.is_authenticated and not is_owner:
            is_friend = FriendRequest.objects.filter(
                status='accepted'
            ).filter(
                Q(sender=request.user, receiver=instance) | 
                Q(sender=instance, receiver=request.user)
            ).exists()
        
        # Build response
        serializer = self.get_serializer(instance, context={'request': request})
        data = serializer.data
        
        # Filter posts by visibility + relationship
        if request.user.is_authenticated and (is_owner or is_friend):
            posts = Post.objects.filter(author=instance).order_by('-created_at')[:10]
        else:
            posts = Post.objects.filter(
                author=instance, 
                visibility='public'
            ).order_by('-created_at')[:10]
        
        # ✅ Critical: Pass context to nested serializer
        data['posts'] = PostSerializer(
            posts, 
            many=True, 
            context={'request': request}
        ).data
        
        # Add privacy messages
        if privacy == 'private' and not is_owner and not is_friend:
            data['message'] = 'This user has a private profile'
        elif privacy == 'friends' and not is_owner and not is_friend:
            data['message'] = 'Send a friend request to see more'
        
        return Response(data)
        instance = self.get_object()
        
        # Determine privacy level
        privacy = getattr(instance.profile, 'privacy_setting', 'public') if hasattr(instance, 'profile') else 'public'
        is_owner = instance == request.user if request.user.is_authenticated else False
        
        # Check friendship status
        is_friend = False
        if request.user.is_authenticated and not is_owner:
            is_friend = FriendRequest.objects.filter(
                status='accepted'
            ).filter(
                Q(sender=request.user, receiver=instance) | 
                Q(sender=instance, receiver=request.user)
            ).exists()
        
        # Build response data
        serializer = self.get_serializer(instance, context={'request': request})
        data = serializer.data
        
        # Add posts (filtered by visibility and relationship)
        if request.user.is_authenticated and (is_owner or is_friend):
            posts = Post.objects.filter(author=instance).order_by('-created_at')[:10]
        else:
            posts = Post.objects.filter(author=instance, visibility='public').order_by('-created_at')[:10]
        
        data['posts'] = PostSerializer(posts, many=True, context={'request': request}).data
        
        # Add privacy message if restricted
        if privacy == 'private' and not is_owner and not is_friend:
            data['message'] = 'This user has a private profile'
        elif privacy == 'friends' and not is_owner and not is_friend:
            data['message'] = 'Send a friend request to see more'
        
        return Response(data)