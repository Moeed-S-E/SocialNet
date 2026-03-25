import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { friendsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FriendRequestList from "../components/FriendRequestList";

const Friends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await friendsApi.getFriends(); // GET /api/friends/list/
      const friendsList = res.data
        .map((req) => ({
          friend: req.sender?.id === user?.id ? req.receiver : req.sender,
          request: req,
        }))
        .filter((f) => f.friend?.id);

      setFriends(friendsList);
    } catch (error) {
      console.error("Fetch friends error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFriends();
  }, [user]);

  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Remove this friend?")) return;
    try {
      await friendsApi.removeFriend(friendId);
      setFriends((prev) => prev.filter((f) => f.friend?.id !== friendId));
    } catch (error) {
      console.error("Unfriend error:", error);
      alert("Failed to remove friend");
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.friend?.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-xl mx-auto py-4 px-3 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Friends</h2>
        <span className="text-sm text-gray-500">{friends.length} friends</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search friends"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-full bg-white border border-gray-200 text-sm outline-none"
        />
      </div>

      {/* Requests */}
      <FriendRequestList onFriendUpdate={fetchFriends} />

      {/* Friends List */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : filteredFriends.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No friends yet</div>
        ) : (
          filteredFriends.map(({ friend, request }) => (
            <div
              key={friend.id}
              onClick={() => navigate(`/u/${friend.username}`)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-none"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                {friend.profile?.profile_picture ? (
                  <img
                    src={friend.profile.profile_picture}
                    alt={friend.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  friend.username[0]?.toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-medium text-gray-800">{friend.username}</p>
                <p className="text-xs text-gray-500">
                  Friends since{" "}
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Unfriend */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnfriend(friend.id);
                }}
                className="text-red-500 text-sm px-2 py-1 rounded hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends;
