import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { friendsApi } from "../services/api";

import ProfileHeader from "../components/profile/ProfileHeader";
import TabBar from "../components/profile/TabBar";
import PostGrid from "../components/profile/PostGrid";
import FriendsList from "../components/profile/FriendsList";
import FriendRequestList from "../components/FriendRequestList";
import SettingsDrawer from "../components/profile/SettingsDrawer";
import PostModal from "../components/PostModal";

const Profile = () => {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState(null);

  // Determine if current user is viewing own profile
  const isOwner = useMemo(() => {
    if (!user) return false;
    if (!username) return true;
    return username.toLowerCase() === user.username.toLowerCase();
  }, [username, user]);

  const targetUsername = isOwner ? user?.username : username;

  // Reset state on route change
  useEffect(() => {
    setProfile(null);
    setPosts([]);
    setFriends([]);
    setFriendStatus(null);
    setLoading(true);
  }, [username]);

  // Fetch profile
  useEffect(() => {
    if (!targetUsername) return;
    const fetchProfile = async () => {
      try {
        const endpoint = isOwner ? "users/me/" : `users/${username}/`;
        const res = await api.get(endpoint);
        setProfile(res.data);
        if (!isOwner && user) checkFriendStatus(res.data.id);
      } catch (e) {
        console.error("Profile error:", e);
        if (e.response?.status === 401) {
          logout();
          navigate("/login");
        }
        if (e.response?.status === 404) setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetUsername, isOwner]);

  // Friend status
  const checkFriendStatus = async (targetUserId) => {
    try {
      const pendingRes = await api.get("friends/", {
        params: { user: targetUserId },
      });
      const pendingRelation = pendingRes.data.find(
        (r) =>
          (r.sender?.id === user?.id && r.receiver?.id === targetUserId) ||
          (r.receiver?.id === user?.id && r.sender?.id === targetUserId),
      );

      if (pendingRelation) {
        if (pendingRelation.sender?.id === user?.id) setFriendStatus("sent");
        else setFriendStatus("pending");
        return;
      }

      const friendsRes = await friendsApi.getFriends();
      const isFriend = friendsRes.data.find(
        (r) =>
          (r.sender?.id === user?.id && r.receiver?.id === targetUserId) ||
          (r.receiver?.id === user?.id && r.sender?.id === targetUserId),
      );

      if (isFriend) setFriendStatus("accepted");
      else setFriendStatus(null);
    } catch (e) {
      console.error("Friend status error:", e);
    }
  };

  // Fetch posts
  useEffect(() => {
    if (!profile?.id) return;
    const fetchPosts = async () => {
      try {
        const params = { author: profile.id };
        if (!isOwner && friendStatus !== "accepted")
          params.visibility = "public";
        const res = await api.get("posts/", { params });
        setPosts(res.data);
      } catch (e) {
        console.error("Posts error:", e);
      }
    };
    fetchPosts();
  }, [profile?.id, friendStatus, isOwner]);

  // Fetch friends
  useEffect(() => {
    if (!profile?.id) return;
    const fetchFriends = async () => {
      try {
        const res = await friendsApi.getFriends();
        setFriends(res.data);
      } catch (e) {
        console.error("Friends error:", e);
      }
    };
    fetchFriends();
  }, [profile?.id, friendStatus, isOwner]);

  // Add Friend
  const handleAddFriend = async () => {
    if (!profile?.id || !user) return;
    try {
      await friendsApi.sendRequest(profile.id);
      setFriendStatus("sent");
    } catch (error) {
      console.error("Send request error:", error.response?.data);
      alert(error.response?.data?.error || "Failed to send friend request");
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`posts/${postId}/delete/`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelectedPost(null);
    } catch (e) {
      console.error("Delete post error:", e);
      alert("Failed to delete post");
    }
  };

  // Like Post
  const handleLikePost = async (postId, liked) => {
    try {
      if (liked) {
        await api.post(`posts/${postId}/like/`);
      } else {
        await api.delete(`posts/${postId}/unlike/`);
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                is_liked: liked,
                likes_count: liked ? p.likes_count + 1 : p.likes_count - 1,
              }
            : p,
        ),
      );
    } catch (e) {
      console.error("Like post error:", e);
    }
  };

  // Add Comment
  const handleAddComment = async (postId, comment) => {
    try {
      const res = await api.post("posts/comments/", {
        post: postId,
        content: comment.content,
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments + 1,
                comments_data: [...(p.comments_data || []), res.data],
              }
            : p,
        ),
      );
    } catch (e) {
      console.error("Add comment error:", e);
      alert("Failed to add comment");
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!profile) return <div className="text-center py-10">User not found</div>;

  return (
    <div className="max-w-xl mx-auto md:py-12 py-8 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        isFriend={friendStatus === "accepted"}
        friendRequestSent={friendStatus === "sent"}
        onAddFriend={handleAddFriend}
        onSettingsClick={isOwner ? () => setDrawerOpen(true) : undefined}
      />

      {/* Tabs */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Posts */}
      {activeTab === "posts" && (
        <PostGrid
          posts={posts}
          onPostClick={setSelectedPost}
          onDelete={handleDeletePost}
          onLike={handleLikePost}
          isOwner={isOwner}
        />
      )}

      {/* Friends */}
      {activeTab === "friends" && <FriendsList friends={friends} />}

      {/* Friend Requests */}
      {activeTab === "requests" && isOwner && <FriendRequestList />}

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={handleLikePost}
          onComment={handleAddComment}
        />
      )}

      {/* Settings Drawer */}
      {drawerOpen && isOwner && (
        <SettingsDrawer
          profile={profile}
          onClose={() => setDrawerOpen(false)}
          onSave={(updatedProfile) => setProfile(updatedProfile)}
          logout={logout}
        />
      )}
    </div>
  );
};

export default Profile;
