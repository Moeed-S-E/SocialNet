# backend/chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Conversation
from users.models import User
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            await self.close(code=4401)
            return
        
        self.receiver_id = self.scope['url_route']['kwargs']['user_id']
        
        try:
            await database_sync_to_async(User.objects.get)(id=self.receiver_id)
        except User.DoesNotExist:
            await self.close(code=4404)
            return
        
        # Create unique room name
        ids = sorted([int(self.user.id), int(self.receiver_id)])
        self.room_group_name = f'chat_{ids[0]}_{ids[1]}'
        
        # Join room group BEFORE accepting
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()
        
        # Mark messages as read when connecting
        await self.mark_messages_read()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        try:
            data = json.loads(text_data)
            content = data.get('content', '').strip()
            
            if not content:
                return
            
            message = await self.save_message(content)
            
            if message:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': message.id,
                            'sender': {
                                'id': message.sender.id,
                                'username': message.sender.username,
                                'first_name': message.sender.first_name,
                            },
                            'content': message.content,
                            'created_at': message.created_at.isoformat(),
                            'is_read': message.is_read,
                        }
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))
        except Exception as e:
            print(f"❌ Chat error: {e}")
            await self.send(text_data=json.dumps({'error': str(e)}))
    
    async def chat_message(self, event):
        """Send message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'data': event['message']
        }))
    
    @database_sync_to_async
    def save_message(self, content):
        """Save message to database"""
        try:
            receiver = User.objects.get(id=self.receiver_id)
            
            if receiver == self.user:
                return None
            
            message = Message.objects.create(
                sender=self.user,
                receiver=receiver,
                content=content
            )
            
            ids = sorted([self.user.id, receiver.id])
            conversation, _ = Conversation.objects.get_or_create(
                participant1_id=ids[0],
                participant2_id=ids[1],
                defaults={'last_message': message}
            )
            conversation.last_message = message
            conversation.save()
            
            return message
        except User.DoesNotExist:
            return None
        except Exception as e:
            print(f"❌ Save message error: {e}")
            return None
    
    @database_sync_to_async
    def mark_messages_read(self):
        """Mark received messages as read"""
        Message.objects.filter(
            sender_id=self.receiver_id,
            receiver=self.user,
            is_read=False
        ).update(is_read=True)