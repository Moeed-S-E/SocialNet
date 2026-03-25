import React, { useState, useRef } from "react";
import NeuButton from "../NeuButton";
import gsap from "gsap";

const EditProfileForm = ({ profile, onSave, onCancel }) => {
  const [bio, setBio] = useState(profile.profile?.bio || "");
  const [privacy, setPrivacy] = useState(
    profile.profile?.privacy_setting || "public",
  );
  const fileRef = useRef(null);

  const handleSave = () => {
    const fd = new FormData();
    fd.append("bio", bio);
    fd.append("privacy_setting", privacy);
    if (fileRef.current?.files[0])
      fd.append("profile_picture", fileRef.current.files[0]);
    onSave(fd);
  };

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <p className="text-sm font-bold text-gray-700 mb-1">Edit Profile</p>

      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
        Bio
      </label>
      <textarea
        rows={3}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Write something…"
        className="rounded-xl px-3 py-2 text-sm text-gray-700 bg-[#e6e7ee] outline-none resize-none"
      />

      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
        Privacy
      </label>
      <select
        value={privacy}
        onChange={(e) => setPrivacy(e.target.value)}
        className="rounded-xl px-3 py-2 text-sm text-gray-700 bg-[#e6e7ee] outline-none"
      >
        <option value="public">Public</option>
        <option value="friends">Friends Only</option>
        <option value="private">Private</option>
      </select>

      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
        Photo
      </label>
      <input type="file" ref={fileRef} className="text-xs text-gray-500" />

      <div className="flex gap-2 mt-2">
        <NeuButton onClick={handleSave} className="flex-1 text-gray-700">
          Save
        </NeuButton>
        <NeuButton onClick={onCancel} className="flex-1 text-red-400">
          Cancel
        </NeuButton>
      </div>
    </div>
  );
};

export default EditProfileForm;
