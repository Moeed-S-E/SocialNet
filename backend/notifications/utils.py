from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification

def create_notification(user, message, n_type, actor=None, link='#'):
    
    Notification.objects.create(
        receiver=user,     
        verb=message,   
        actor=actor,      
    )

    # Send WebSocket notification
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'user_{user.id}',
        {
            'type': 'send_notification',
            'message': message,
            'link': link
        }
    )