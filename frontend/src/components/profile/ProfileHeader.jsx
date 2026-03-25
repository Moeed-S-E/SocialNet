import React, { useEffect, useRef } from "react";
import { Settings, Check, Clock, UserPlus, MessageCircle } from "lucide-react";
import NeuButton from "../NeuButton";
import gsap from "gsap";

const ProfileHeader = ({
  profile,
  isOwner = false,
  isFriend = false,
  friendRequestSent = false,
  onAddFriend,
  onSettingsClick,
}) => {
  const wrapRef = useRef(null);
  const avatarRef = useRef(null);
  const infoRef = useRef(null);
  const actionsRef = useRef(null);

  useEffect(() => {
    // Animate header
    gsap.fromTo(
      wrapRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.4 },
    );
  }, []);

  return (
    <div ref={wrapRef} className="p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <div
          ref={avatarRef}
          className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
        >
          {profile?.profile?.profile_picture ? (
            <img
              src={profile.profile.profile_picture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-gray-600">
              {profile?.username?.[0] || "U"}
            </span>
          )}
        </div>

        {/* Info */}
        <div ref={infoRef} className="flex-1">
          <h2 className="font-bold text-xl">{profile?.username}</h2>
          <p className="text-gray-600 text-sm">
            {profile?.profile?.bio || "No bio yet"}
          </p>
          {profile?.profile?.privacy_setting && (
            <p className="text-gray-400 text-xs mt-1">
              Privacy: {profile.profile.privacy_setting}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div ref={actionsRef} className="flex gap-2 mt-4">
        {isOwner ? (
          <>
            <NeuButton onClick={onSettingsClick}>Edit Profile</NeuButton>
            <button
              onClick={onSettingsClick}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              <Settings size={18} />
            </button>
          </>
        ) : isFriend ? (
          <>
            <NeuButton inset>
              <Check size={13} /> Friends
            </NeuButton>
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("openChat", { detail: profile }),
                )
              }
              className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center"
            >
              <MessageCircle size={16} />
            </button>
          </>
        ) : friendRequestSent ? (
          <NeuButton inset>
            <Clock size={13} /> Requested
          </NeuButton>
        ) : (
          <NeuButton onClick={onAddFriend}>
            <UserPlus size={13} /> Add Friend
          </NeuButton>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
