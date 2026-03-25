import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Upload } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", image: null });
  const { user } = useAuth();

  const headerRef = useRef(null);
  const composeRef = useRef(null);
  const postsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -40,
        opacity: 0,
        duration: 0.7,
      });
      gsap.from(composeRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
      });
    });
    return () => ctx.revert();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("posts/");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;
    setPosting(true);

    const formData = new FormData();
    formData.append("content", newPost.content);
    if (newPost.image) formData.append("image", newPost.image);

    try {
      await api.post("posts/", formData);
      setNewPost({ content: "", image: null });
      await fetchPosts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setPosting(false);
    }
  };

  const avatarInitial = user?.username?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen pt-16 pb-20 bg-gray-100">
      <div className="max-w-xl mx-auto px-3 py-4">
        {/* Create Post */}
        <div
          ref={composeRef}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4"
        >
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
              {avatarInitial}
            </div>

            {/* Input */}
            <div className="flex-1">
              <textarea
                className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm resize-none outline-none"
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                rows={2}
              />

              {/* Actions */}
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700 text-sm">
                  <Upload size={18} />
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewPost({ ...newPost, image: e.target.files[0] })
                    }
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handlePostSubmit}
                  disabled={!newPost.content.trim() || posting}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-50"
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>

              {/* Preview image name */}
              {newPost.image && (
                <p className="text-xs text-gray-500 mt-2">
                  📎 {newPost.image.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Feed Header */}
        <div ref={headerRef} className="mb-3 px-1">
          <h1 className="text-lg font-semibold text-gray-700">Home</h1>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No posts yet</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={fetchPosts}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
