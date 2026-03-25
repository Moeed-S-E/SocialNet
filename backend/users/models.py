from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    PRIVACY_CHOICES = (
        ('public', 'Public'),
        ('friends', 'Friends Only'),
        ('private', 'Private'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    privacy_setting = models.CharField(max_length=10, choices=PRIVACY_CHOICES, default='public')

    def __str__(self):
        return f"{self.user.username}'s Profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create a Profile when a new User is created"""
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Automatically save Profile when User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()