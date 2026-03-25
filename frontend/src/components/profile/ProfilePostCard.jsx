import React, { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";

const ProfilePostCard = ({
  post,
  onClick,
  onDelete,
  onLike,
  isOwner,
  currentUser,
}) => {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(newLiked ? likesCount + 1 : likesCount - 1);
    onLike?.(post.id, newLiked);
  };

  const canDelete = isOwner || post.author?.id === currentUser?.id;

  return (
    <div
      className="relative w-full aspect-square overflow-hidden rounded-lg cursor-pointer group bg-[#e6e7ee]"
      onClick={onClick}
    >
      {post.image ? (
        <img
          src={post.image}
          alt="Post"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-700 font-medium px-2 text-center">
          {post.content || "No content"}
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white flex flex-col gap-2 items-center font-medium text-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${liked ? "text-red-400" : "text-white"}`}
            >
              <Heart size={16} /> <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-1">
              <MessageCircle size={16} />{" "}
              <span>{post.comments?.length || 0}</span>
            </div>

            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(post.id);
                }}
                className="flex items-center gap-1 text-red-400"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePostCard;
