from django.db import models
from django.contrib.auth.models import User

class FriendRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    sender = models.ForeignKey(User, related_name='friend_requests_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='friend_requests_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def accept(self):
        self.status = 'accepted'
        self.save()
        # Create reciprocal friendship logic here if needed, 
        # but usually checking 'sender' or 'receiver' in friends list is enough.

    def reject(self):
        self.status = 'rejected'
        self.save()