# 🚀 Social Network Backend

A robust Django REST Framework backend powering a full-stack social network application. Provides secure APIs for user management, posts, comments, real-time chat, friend requests, and notifications.

## ✨ Features

- **User Authentication**: JWT-based authentication with secure registration and login
- **Posts & Comments**: Full CRUD operations for posts and nested comments
- **Real-time Chat**: WebSocket-powered instant messaging
- **Friends System**: API for sending, accepting, and managing friend requests
- **Notifications**: Real-time push notifications for user interactions
- **Permissions**: Custom permission classes for secure access control
- **Scalable Architecture**: Modular Django apps for easy maintenance

## 🛠️ Tech Stack

- **Framework**: Django 4.x with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Real-time**: Django Channels for WebSocket support
- **Authentication**: JWT tokens with djangorestframework-simplejwt
- **Serialization**: DRF serializers for data validation
- **Testing**: Django's built-in test framework

## 🚀 Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/social-network.git
   cd social-network/backend
   ```

2. **Create virtual environment**:

   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   uv pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the backend directory:

   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   ```

5. **Run migrations**:

   ```bash
   python manage.py migrate
   ```

6. **Create superuser**:

   ```bash
   python manage.py createsuperuser
   ```

7. **Start the server**:

   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000/api`.

## 📖 Usage

- **API Documentation**: Access Swagger UI at `http://localhost:8000/api/docs/`
- **Admin Panel**: Django admin at `http://localhost:8000/admin/`
- **Testing**: Run tests with `python manage.py test`

## 🏗️ Project Structure

```
backend/
├── social_network/       # Main Django project settings
├── users/                # User authentication and profiles
├── posts/                # Posts and comments management
├── friends/              # Friend requests and relationships
├── chat/                 # Real-time messaging
├── notifications/        # Push notifications
└── staticfiles/          # Static assets
```

## 📜 API Endpoints

### Authentication

- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration

### Posts

- `GET /api/posts/` - List posts
- `POST /api/posts/` - Create post
- `GET /api/posts/{id}/` - Retrieve post
- `PUT /api/posts/{id}/` - Update post
- `DELETE /api/posts/{id}/` - Delete post

### Comments

- `GET /api/posts/comments/` - List comments
- `POST /api/posts/comments/` - Create comment
- `GET /api/posts/comments/{id}/` - Retrieve comment
- `PUT /api/posts/comments/{id}/` - Update comment
- `DELETE /api/posts/comments/{id}/` - Delete comment

### Friends

- `GET /api/friends/` - List friends
- `POST /api/friends/requests/` - Send friend request

### Chat

- WebSocket: `ws://localhost:8000/ws/chat/{room_name}/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 📞 Contact

For questions or support, reach out to [your-email@example.com](mailto:your-email@example.com)

---

_Built with ❤️ using Django and DRF_
