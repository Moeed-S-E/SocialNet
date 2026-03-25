import React, { useEffect, useState } from "react";
import { friendsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FriendRequestItem from "./FriendRequestItem";

const FriendRequestList = ({ onFriendUpdate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await friendsApi.getAll(); // GET /api/friends/ → only pending now
      setRequests(res.data);
    } catch (error) {
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleAction = (action, requestId, originalStatus = null) => {
    if (action === "revert" && originalStatus) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: originalStatus } : req,
        ),
      );
      return;
    }

    setRequests((prev) => prev.filter((req) => req.id !== requestId));

    if (onFriendUpdate) onFriendUpdate(); // ← triggers fetchFriends in parent
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "received") return req.receiver?.id === user?.id;
    if (filter === "sent") return req.sender?.id === user?.id;
    return true;
  });

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl border border-gray-200 flex justify-center items-center mb-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-gray-700" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-4">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h3 className="font-semibold text-gray-800 text-sm">Friend Requests</h3>
        <div className="flex gap-2 text-xs">
          {["all", "received", "sent"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded ${
                filter === f
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredRequests.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">No requests</div>
      ) : (
        filteredRequests.map((request) => (
          <FriendRequestItem
            key={request.id}
            request={request}
            currentUser={user}
            onAction={handleAction}
          />
        ))
      )}
    </div>
  );
};

export default FriendRequestList;
