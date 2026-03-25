import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ChatWindow from "./ChatWindow";

const Messenger = () => {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useAuth();

  // Fetch friends
  useEffect(() => {
    if (!open) return;

    const fetchFriends = async () => {
      try {
        const res = await api.get("friends/", {
          params: { status: "accepted" },
        });

        const friendsList = res.data
          .map((req) => {
            const friend =
              req.sender?.id === user?.id ? req.receiver : req.sender;
            return friend;
          })
          .filter((f) => f?.id);

        setFriends(friendsList);
      } catch (err) {
        console.error("Fetch friends error:", err);
      }
    };

    fetchFriends();
  }, [open, user]);

  useEffect(() => {
    const handler = (e) => setSelectedUser(e.detail);
    window.addEventListener("openChat", handler);
    return () => window.removeEventListener("openChat", handler);
  }, []);

  const getInitial = (name) => name?.charAt?.(0)?.toUpperCase() || "?";

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Friend List */}
      {open && (
        <div className="fixed inset-0 md:bottom-20 md:right-4 md:left-auto md:top-auto md:w-80 bg-white z-40 md:rounded-2xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b font-semibold text-gray-800 flex justify-between items-center">
            <span>Chats</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto">
            {friends.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No friends yet
              </div>
            ) : (
              friends.map((f) => {
                // ✅ Safe access to username
                const username = f?.username || "Unknown";
                const avatar = f?.profile?.profile_picture || f?.avatar;

                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedUser(f);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling?.style?.display?.(
                              "flex",
                            );
                          }}
                        />
                      ) : (
                        <span className="font-semibold text-gray-600">
                          {getInitial(username)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {username}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {selectedUser && (
        <ChatWindow
          receiver={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
};

export default Messenger;
