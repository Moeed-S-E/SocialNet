import React, { useState } from "react";
import api from "../services/api";

const FriendRequestItem = ({ request, currentUser, onAction }) => {
  const [loading, setLoading] = useState(false);

  const isIncoming = request.receiver?.id === currentUser?.id;
  const otherUser = isIncoming ? request.sender : request.receiver;

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "?";

  const handleAccept = async () => {
    if (!isIncoming || loading) return;
    setLoading(true);

    const originalStatus = request.status;
    onAction?.("accepted", request.id);

    try {
      await api.post(`friends/${request.id}/accept/`);
    } catch (error) {
      onAction?.("revert", request.id, originalStatus);
      alert(error.response?.data?.error || "Could not accept request");
      console.error("Accept error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!isIncoming || loading) return;
    setLoading(true);

    try {
      await api.post(`friends/${request.id}/reject/`);
      onAction?.("rejected", request.id);
    } catch (error) {
      alert(error.response?.data?.error || "Could not reject request");
      console.error("Reject error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (isIncoming || loading) return;
    setLoading(true);

    try {
      await api.delete(`friends/${request.id}/cancel/`); // ← fixed
      onAction?.("cancelled", request.id);
    } catch (error) {
      alert(error.response?.data?.error || "Could not cancel request");
      console.error("Cancel error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-none bg-white">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
        {otherUser?.profile?.profile_picture ? (
          <img
            src={otherUser.profile.profile_picture}
            alt={otherUser.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitial(otherUser?.username)
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <p className="font-medium text-gray-800">{otherUser?.username}</p>
        <p className="text-xs text-gray-500">
          {isIncoming ? "Sent you a request" : "Request sent"}
        </p>
      </div>

      {/* Actions */}
      {isIncoming ? (
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
          >
            {loading ? "..." : "Confirm"}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ) : (
        <button
          onClick={handleCancel}
          disabled={loading}
          className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
        >
          {loading ? "..." : "Cancel"}
        </button>
      )}
    </div>
  );
};

export default FriendRequestItem;
