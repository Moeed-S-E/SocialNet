from django.urls import path
from .views import (
    NotificationListView,
    NotificationDetailView,
    NotificationDeleteView,
    NotificationMarkAsReadView,
    NotificationMarkAllAsReadView,
    NotificationDeleteAllView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:notification_id>/', NotificationDetailView.as_view(), 
         name='notification-detail'),
    path('<int:notification_id>/delete/', NotificationDeleteView.as_view(), 
         name='notification-delete'),
    path('<int:notification_id>/read/', NotificationMarkAsReadView.as_view(), 
         name='notification-mark-read'),
    path('mark-all-read/', NotificationMarkAllAsReadView.as_view(), 
         name='notification-mark-all-read'),
    path('delete-all/', NotificationDeleteAllView.as_view(), 
         name='notification-delete-all'),
]  