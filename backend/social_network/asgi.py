import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_network.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.middleware import JWTAuthMiddleware  # ← swap this
import chat.routing

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(  # ← replace AuthMiddlewareStack
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})