import React from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const FriendsList = ({ friends }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!friends || !friends.length)
    return (
      <div className="text-center py-10">
        <Users size={40} className="mx-auto text-gray-300" />
        <p className="text-gray-500 mt-2">No friends yet</p>
      </div>
    );

  const getFriendData = (f) => {
    if (f.sender?.id === user?.id) {
      return f.receiver;
    }
    return f.sender;
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-3">
      {friends.map((f) => {
        const friend = getFriendData(f);

        return (
          <div
            key={f.id}
            onClick={() => navigate(`/u/${friend?.username}`)}
            className="flex flex-col items-center text-center cursor-pointer hover:scale-105 transform transition"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-2">
              {friend?.profile?.profile_picture ? (
                <img
                  src={friend.profile.profile_picture}
                  alt={friend.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-xl">
                  {friend?.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            {/* ✅ Display username from nested user object */}
            <span className="text-sm font-medium text-gray-700">
              {friend?.username || "Unknown"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default FriendsList;
