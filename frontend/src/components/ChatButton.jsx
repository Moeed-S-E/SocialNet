import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatWindow from "./ChatWindow";

const ChatButton = ({ receiver }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!receiver) return null;

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center z-40"
        title={`Message ${receiver.username}`}
      >
        <MessageCircle size={24} />
        {/* Unread badge */}
        {/* {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )} */}
      </button>

      {/* Chat window */}
      {isOpen && (
        <ChatWindow receiver={receiver} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default ChatButton;
