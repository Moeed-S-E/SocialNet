from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """Get all notifications for current user"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            receiver=self.request.user
        ).select_related('actor', 'target_content_type').order_by('-created_at')


class NotificationDetailView(APIView):
    """Get, update, or delete a specific notification"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                receiver=self.request.user  
            )
            return notification
        except Notification.DoesNotExist:
            return None

    def get(self, request, notification_id):
        notification = self.get_object(notification_id)
        if not notification:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)

    def patch(self, request, notification_id):
        """Mark notification as read"""
        notification = self.get_object(notification_id)
        if not notification:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        notification.is_read = True
        notification.save()
        
        return Response(
            {'message': 'Notification marked as read'},
            status=status.HTTP_200_OK
        )

    def delete(self, request, notification_id):
        """✅ Delete a notification"""
        notification = self.get_object(notification_id)
        if not notification:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        notification.delete()
        
        return Response(
            {'message': 'Notification deleted successfully'},
            status=status.HTTP_200_OK
        )


class NotificationDeleteView(APIView):
    """✅ Dedicated delete endpoint for notifications"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, notification_id):
        try:
            # ✅ Only allow deleting own notifications
            notification = Notification.objects.get(
                id=notification_id,
                receiver=request.user
            )
            notification.delete()
            
            return Response(
                {'message': 'Notification deleted successfully'},
                status=status.HTTP_200_OK
            )
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class NotificationMarkAsReadView(APIView):
    """Mark notification as read"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                receiver=request.user
            )
            notification.is_read = True
            notification.save()
            
            return Response(
                {'message': 'Notification marked as read'},
                status=status.HTTP_200_OK
            )
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class NotificationMarkAllAsReadView(APIView):
    """Mark all notifications as read"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response(
            {'message': 'All notifications marked as read'},
            status=status.HTTP_200_OK
        )


class NotificationDeleteAllView(APIView):
    """✅ Delete all notifications for current user"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        count, _ = Notification.objects.filter(
            receiver=request.user
        ).delete()
        
        return Response(
            {'message': f'{count} notifications deleted successfully'},
            status=status.HTTP_200_OK
        )