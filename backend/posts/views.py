from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Post, Comment,Like
from .serializers import PostSerializer, CommentSerializer
from notifications.utils import create_notification
from rest_framework.decorators import action
from rest_framework.response import Response


class PostViewSet(viewsets.ModelViewSet):
    """CRUD operations for posts"""
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.select_related('author').all()
        
        # Filter by author (from frontend: ?author=2)
        author_id = self.request.query_params.get('author')
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        # Filter by visibility (for public profiles)
        visibility = self.request.query_params.get('visibility')
        if visibility == 'public':
            queryset = queryset.filter(visibility='public')
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Auto-set author to current user"""
        serializer.save(author=self.request.user)
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(post=post, user=request.user)
        if created:
            return Response({"status": "liked"})
        return Response({"status": "already liked"}, status=400)

    @action(detail=True, methods=["delete"], permission_classes=[permissions.IsAuthenticated])
    def unlike(self, request, pk=None):
        post = self.get_object()
        Like.objects.filter(post=post, user=request.user).delete()
        return Response({"status": "unliked"})
    def destroy(self, request, *args, **kwargs):
        """✅ Delete post - only owner can delete"""
        instance = self.get_object()
        
        if instance.author != request.user:
            return Response(
                {'error': 'You do not have permission to delete this post'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_destroy(instance)
        return Response(
            {'message': 'Post deleted successfully'},
            status=status.HTTP_200_OK
        )


class CommentViewSet(viewsets.ModelViewSet):
    """CRUD operations for comments"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.select_related('author', 'post').all()
        
        # Filter by post (from frontend: ?post=5)
        post_id = self.request.query_params.get('post')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        return queryset.order_by('created_at')

    def perform_create(self, serializer):
        """Auto-set author to current user"""
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """✅ Delete comment - only owner can delete"""
        instance = self.get_object()
        
        if instance.author != request.user:
            return Response(
                {'error': 'You do not have permission to delete this comment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_destroy(instance)
        return Response(
            {'message': 'Comment deleted successfully'},
            status=status.HTTP_200_OK
        )


# ✅ Alternative: Class-based views for delete operations
class PostDeleteView(APIView):
    """Delete a specific post"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if post.author != request.user:
            return Response(
                {'error': 'You do not have permission to delete this post'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.delete()
        return Response(
            {'message': 'Post deleted successfully'},
            status=status.HTTP_200_OK
        )


class CommentDeleteView(APIView):
    """Delete a specific comment"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return Response(
                {'error': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if comment.author != request.user:
            return Response(
                {'error': 'You do not have permission to delete this comment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response(
            {'message': 'Comment deleted successfully'},
            status=status.HTTP_200_OK
        )