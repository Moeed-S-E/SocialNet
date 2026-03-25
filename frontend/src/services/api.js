import axios from "axios";

const API_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:8000/api/";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ✅ Consistent token keys (MUST match AuthContext)
const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "auth_refresh";

// Request interceptor: Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle 401 + token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints (prevent infinite loops)
    if (
      originalRequest.url?.includes("auth/login") ||
      originalRequest.url?.includes("auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) {
        // No refresh token → force logout
        window.dispatchEvent(new Event("auth-logout"));
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const response = await axios.post(`${API_URL}auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;

        // Update stored token + headers
        localStorage.setItem(TOKEN_KEY, access);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

        // Retry queued requests
        processQueue(null, access);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout everyone
        processQueue(refreshError, null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        delete api.defaults.headers.common["Authorization"];
        window.dispatchEvent(new Event("auth-logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const postsApi = {
  // Get all posts
  getAll: (params = {}) => api.get("posts/", { params }),

  // Get single post
  getOne: (postId) => api.get(`posts/${postId}/`),

  // Create post
  create: (data) => api.post("posts/", data),

  // Update post
  update: (postId, data) => api.put(`posts/${postId}/`, data),

  // ✅ Delete post
  delete: (postId) => api.delete(`posts/${postId}/`),

  // Alternative delete endpoint
  deletePost: (postId) => api.delete(`posts/${postId}/delete/`),

  // Comments
  getComments: (postId) =>
    api.get("posts/comments/", { params: { post: postId } }),
  addComment: (postId, content) =>
    api.post("posts/comments/", { post: postId, content }),
  deleteComment: (commentId) => api.delete(`comments/${commentId}/`),
};

// Friend API helpers

export const friendsApi = {
  sendRequest: (receiverId) =>
    api.post("friends/", { receiver_id: receiverId }),
  getAll: (params = {}) => api.get("friends/", { params }),
  accept: (requestId) => api.post(`friends/${requestId}/accept/`),
  reject: (requestId) => api.post(`friends/${requestId}/reject/`),
  cancel: (requestId) => api.delete(`friends/${requestId}/cancel/`),
  removeFriend: (friendId) => api.delete(`friends/remove/${friendId}/`),
  removeFriendByRequest: (requestId) =>
    api.delete(`friends/remove-request/${requestId}/`),
  getFriends: () => api.get("friends/list/"),
};

export const notificationsApi = {
  getAll: () => api.get("notifications/"),
  getOne: (notificationId) => api.get(`notifications/${notificationId}/`),
  delete: (notificationId) =>
    api.delete(`notifications/${notificationId}/delete/`),
  deleteOne: (notificationId) => api.delete(`notifications/${notificationId}/`),
  markAsRead: (notificationId) =>
    api.post(`notifications/${notificationId}/read/`),
  markAllAsRead: () => api.post("notifications/mark-all-read/"),
  deleteAll: () => api.delete("notifications/delete-all/"),
};
export default api;
