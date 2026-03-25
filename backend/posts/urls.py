from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, PostDeleteView, CommentDeleteView

router = DefaultRouter()
router.register(r'', PostViewSet, basename='post')

urlpatterns = [

    path('comments/', CommentViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='comment-list-create'),
    
    path('comments/<int:pk>/', CommentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update', 
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='comment-detail'),
    
    path('comments/<int:comment_id>/delete/', CommentDeleteView.as_view(), name='comment-delete'),
    path('', include(router.urls)),
    path('<int:post_id>/delete/', PostDeleteView.as_view(), name='post-delete'),
]