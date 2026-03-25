/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { notificationsApi } from "../services/api";
import {
  Bell,
  UserPlus,
  Heart,
  MessageCircle,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react";

const NotificationItem = ({ notification, onDeleted, onMarkedRead }) => {
  const handleDelete = async () => onDeleted?.(notification.id);
  const handleMarkAsRead = async () => onMarkedRead?.(notification.id);

  const getIcon = () => {
    switch (notification.verb) {
      case "liked":
        return <Heart size={20} className="text-red-500" />;
      case "commented":
        return <MessageCircle size={20} className="text-blue-500" />;
      case "friend_request":
        return <UserPlus size={20} className="text-green-500" />;
      default:
        return <Heart size={20} className="text-gray-400" />;
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-200 ${
        notification.is_read ? "bg-white" : "bg-blue-50"
      }`}
    >
      {/* Actor Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-gray-200">
        {notification.actor?.avatar ? (
          <img
            src={notification.actor.avatar}
            alt={notification.actor.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <Bell size={20} className="text-gray-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            notification.is_read
              ? "text-gray-600"
              : "text-gray-800 font-semibold"
          }`}
        >
          <span className="font-semibold">{notification.actor?.username}</span>{" "}
          {notification.verb} {notification.target && "your post"}
        </p>
        <p className="text-xs text-gray-400">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {/* Action Icons */}
      <div className="flex gap-2 shrink-0">
        {!notification.is_read && (
          <button
            onClick={handleMarkAsRead}
            className="p-2 rounded-full hover:bg-blue-100 transition"
            title="Mark as read"
          >
            <Check size={14} className="text-blue-500" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="p-2 rounded-full hover:bg-red-100 transition"
          title="Delete"
        >
          <Trash2 size={14} className="text-red-500" />
        </button>
        {/* Action Icon */}
        <div className="ml-1">{getIcon()}</div>
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationsApi.getAll();
        setNotifications(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleDeleted = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  const handleMarkedRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all notifications?")) return;
    try {
      await notificationsApi.deleteAll();
      setNotifications([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 pt-30 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Bell size={24} />
          Notifications
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h2>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition text-sm"
            >
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-gray-600 hover:bg-red-100 hover:text-red-600 transition text-sm"
            >
              <Trash2 size={14} /> Delete All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-400 border-t-gray-700" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Bell size={48} className="mx-auto mb-3 text-gray-400" />
          <p className="text-lg">No notifications yet</p>
          <p className="text-sm">
            When you get notifications, they'll appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onDeleted={handleDeleted}
              onMarkedRead={handleMarkedRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
