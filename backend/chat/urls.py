from django.urls import path
from .views import (
    ConversationListView,
    MessageListView,
    MessageCreateView,
    MarkMessagesReadView,
)

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('messages/<int:user_id>/', MessageListView.as_view(), name='message-list'),
    path('messages/<int:user_id>/send/', MessageCreateView.as_view(), name='message-create'),
    path('messages/<int:user_id>/read/', MarkMessagesReadView.as_view(), name='message-mark-read'),
]