# 🌐 Social Network Frontend

A modern, responsive React frontend for a full-stack social network application built with Django REST Framework backend. Connect with friends, share posts, chat in real-time, and manage notifications—all in one sleek interface!

## ✨ Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Feed & Posts**: Create, view, like, and comment on posts
- **Real-time Chat**: Instant messaging with WebSocket integration
- **Friends System**: Send/receive friend requests and manage connections
- **Notifications**: Stay updated with real-time push notifications
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Clean, neumorphic design with smooth animations

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: CSS Modules with neumorphic design
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios for API calls
- **Real-time**: WebSocket for chat and notifications
- **Build Tool**: Vite for fast development and bundling

## 🚀 Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/social-network.git
   cd social-network/frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:

   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_WS_BASE_URL=ws://localhost:8000/ws
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## 📖 Usage

- **Register/Login**: Create an account or sign in
- **Explore Feed**: Browse posts from friends and follow new users
- **Create Posts**: Share text, images, or links
- **Interact**: Like and comment on posts
- **Chat**: Start conversations with friends
- **Manage Friends**: Send requests and build your network

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── profile/         # Profile-related components
│   └── ...
├── context/             # React contexts (Auth, etc.)
├── pages/               # Main application pages
├── services/            # API and WebSocket services
└── utils/               # Utility functions
```

## 📜 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

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

_Built with ❤️ using React and Vite_
