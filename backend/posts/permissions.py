from rest_framework import permissions
from friends.models import FriendRequest

class IsPostAuthorOrFriendsOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Public posts are readable by anyone
        if obj.visibility == 'public':
            return True
        
        # Private posts only by author
        if obj.visibility == 'private':
            return obj.author == request.user

        # Friends Only logic
        if obj.visibility == 'friends':
            if obj.author == request.user:
                return True
            # Check if they are friends (simplified check)
            is_friend = FriendRequest.objects.filter(
                sender=request.user, receiver=obj.author, status='accepted'
            ).exists() or FriendRequest.objects.filter(
                sender=obj.author, receiver=request.user, status='accepted'
            ).exists()
            return is_friend
            
        return False