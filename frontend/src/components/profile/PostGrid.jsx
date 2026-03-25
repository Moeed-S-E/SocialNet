import React from "react";
import ProfilePostCard from "./ProfilePostCard";
import NeuButton from "../NeuButton";
import gsap from "gsap";

const PostGrid = ({ posts, postsLoading, onPostClick }) => {
  if (postsLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-1 bg-[#e6e7ee]">
      {posts.map((post) => (
        <ProfilePostCard
          key={post.id}
          post={post}
          onClick={() => onPostClick(post)}
        />
      ))}
    </div>
  );
};

export default PostGrid;
