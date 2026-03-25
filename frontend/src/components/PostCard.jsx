/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, MessageCircle } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

gsap.registerPlugin(ScrollTrigger);

const PostCard = ({ post, onUpdate, index }) => {
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cardRef = useRef(null);
  const likeBtnRef = useRef(null);
  const commentsRef = useRef(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAvatarClick = (authorUsername) => {
    if (!authorUsername) return;

    const isOwnProfile = user?.username === authorUsername;
    const targetPath = isOwnProfile ? "/profile" : `/u/${authorUsername}`;

    navigate(targetPath);
  };

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
          invalidateOnRefresh: true,
        },
        clearProps: "all",
      },
    );
  }, []);

  useEffect(() => {
    if (!commentsRef.current) return;

    if (showComments) {
      commentsRef.current.style.display = "block";
      gsap.fromTo(
        commentsRef.current,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          clearProps: "height",
        },
      );
    } else {
      gsap.to(commentsRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          commentsRef.current.style.display = "none";
        },
      });
    }
  }, [showComments]);

  const handleLike = async () => {
    gsap.fromTo(
      likeBtnRef.current,
      { scale: 0.8 },
      { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 },
    );

    try {
      if (liked) {
        await api.delete(`posts/${post.id}/like/`);
        setLikesCount(likesCount - 1);
      } else {
        await api.post(`posts/${post.id}/like/`);
        setLikesCount(likesCount + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post("posts/comments/", {
        post: post.id,
        content: newComment,
      });
      setComments([...comments, res.data]);
      setNewComment("");
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };
  const handleDelete = async () => {
    setDeleting(true);

    try {
      await api.delete(`posts/${post.id}/`);

      // Optional animation
      gsap.to(cardRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => onUpdate?.(post.id),
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };
  const authorUsername = post.author?.username;
  const avatarInitial = authorUsername?.[0]?.toUpperCase() || "?";
  const isOwnPost = user?.username === authorUsername;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-sm border border-gray-200 mb-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            onClick={() => handleAvatarClick(authorUsername)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 cursor-pointer"
          >
            {avatarInitial}
          </div>

          <div
            onClick={() => handleAvatarClick(authorUsername)}
            className="cursor-pointer"
          >
            <p className="font-semibold text-gray-800 hover:underline">
              {authorUsername || "Unknown"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {isOwnPost && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-full text-sm"
          >
            •••
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="mt-2">
          <img
            src={post.image}
            alt="Post"
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex justify-between text-sm text-gray-500">
        <span>{likesCount} likes</span>
        <span>{comments.length} comments</span>
      </div>

      <hr />

      {/* Actions */}
      <div className="flex justify-around text-gray-600 text-sm font-medium">
        <button
          ref={likeBtnRef}
          onClick={handleLike}
          className={`flex items-center gap-2 py-2 w-full justify-center hover:bg-gray-100 ${
            liked ? "text-blue-600 font-semibold" : ""
          }`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          Like
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 py-2 w-full justify-center hover:bg-gray-100"
        >
          <MessageCircle size={18} />
          Comment
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-3 pt-2 border-t">
          {/* Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 rounded-full bg-gray-100 text-sm outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm"
            >
              Post
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2">
            {comments.map((comment) => {
              const commentAuthor = comment.author?.username;
              const commentInitial = commentAuthor?.[0]?.toUpperCase() || "?";

              return (
                <div key={comment.id} className="flex gap-2">
                  <div
                    onClick={() => handleAvatarClick(commentAuthor)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    {commentInitial}
                  </div>

                  <div className="bg-gray-100 px-3 py-2 rounded-2xl text-sm">
                    <p
                      onClick={() => handleAvatarClick(commentAuthor)}
                      className="font-semibold cursor-pointer hover:underline"
                    >
                      {commentAuthor}
                    </p>
                    <p>{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
};

export default PostCard;
