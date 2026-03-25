from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
    """Direct message between two users"""
    sender = models.ForeignKey(
        User, 
        related_name='sent_messages', 
        on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        User, 
        related_name='received_messages', 
        on_delete=models.CASCADE
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['receiver', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.sender} → {self.receiver}: {self.content[:30]}'


class Conversation(models.Model):
    """Track conversations between users"""
    participant1 = models.ForeignKey(
        User, 
        related_name='conversations_as_p1', 
        on_delete=models.CASCADE
    )
    participant2 = models.ForeignKey(
        User, 
        related_name='conversations_as_p2', 
        on_delete=models.CASCADE
    )
    last_message = models.ForeignKey(
        'Message', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['participant1', 'participant2']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f'{self.participant1} ↔ {self.participant2}'