import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const PostModal = ({ post, onClose, onLike, onComment }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments_data || []);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (post?.id) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const res = await api.get("posts/comments/", {
        params: { post: post.id },
      });
      setComments(res.data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      if (!liked) {
        await api.post(`posts/${post.id}/like/`);
        setLikesCount(likesCount + 1);
      } else {
        await api.delete(`posts/${post.id}/unlike/`);
        setLikesCount(likesCount - 1);
      }
      setLiked(!liked);
      onLike?.(post.id, !liked);
    } catch (error) {
      console.error("Like/unlike failed:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await api.post("posts/comments/", {
        post: post.id,
        content: commentText.trim(),
      });

      setComments((prev) => [...prev, res.data]);
      setCommentText("");
      onComment?.(post.id, res.data);
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to post comment");
    }
  };

  const handleDeleteComment = async (commentId, commentUserId) => {
    if (user?.id !== commentUserId) return; // ✅ Added optional chaining
    if (!window.confirm("Delete this comment?")) return;

    try {
      await api.delete(`comments/${commentId}/`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment");
    }
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-[#f0f1f5] rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto shadow-lg flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-[#e6e7ee] rounded-full p-2 flex items-center justify-center hover:bg-gray-300 transition z-10"
        >
          <X size={16} />
        </button>

        {post.image ? (
          <img
            src={post.image}
            alt="Post"
            className="w-full max-h-[50vh] object-contain rounded-t-2xl"
          />
        ) : (
          <div className="p-4 text-gray-700 text-center">{post.content}</div>
        )}

        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition ${
              liked ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-2 text-gray-700">
            <MessageCircle size={20} />
            <span>{comments.length}</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-auto flex flex-col gap-3">
          {loadingComments ? (
            <p className="text-gray-400 text-sm text-center">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No comments yet</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2 items-start group">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.author?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="bg-gray-200 rounded-xl px-3 py-2 text-sm flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800">
                      {c.author?.username || "Unknown"}
                    </p>
                    {c.author?.id === user.id && (
                      <button
                        onClick={() => handleDeleteComment(c.id, c.author.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        title="Delete comment"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">{c.content}</p>
                  {c.created_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleAddComment}
          className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white rounded-b-2xl"
        >
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={loadingComments}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || loadingComments}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
