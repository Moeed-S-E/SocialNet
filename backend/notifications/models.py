from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class Notification(models.Model):
    receiver = models.ForeignKey(
        User, 
        related_name='notifications', 
        on_delete=models.CASCADE
    )
    actor = models.ForeignKey(
        User, 
        related_name='actor_notifications', 
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    verb = models.CharField(max_length=255,blank=True)  # e.g., 'liked', 'commented', 'followed'
    target_content_type = models.ForeignKey(
        ContentType, 
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    target_object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('target_content_type', 'target_object_id')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.receiver.username} - {self.verb}'