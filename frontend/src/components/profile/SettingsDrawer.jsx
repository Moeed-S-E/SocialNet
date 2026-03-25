import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import NeuButton from "../NeuButton";
import { X, Edit, LogOut } from "lucide-react";
import EditProfileForm from "./EditProfileForm";

const SettingsDrawer = ({ profile, onClose, onSave, logout }) => {
  const [editing, setEditing] = useState(false);
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!backdropRef.current || !drawerRef.current) return;

    // Fade in backdrop
    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
    );

    // Slide in drawer from right - start completely off-screen
    gsap.fromTo(
      drawerRef.current,
      { x: "100%" },
      { x: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  const close = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(drawerRef.current, {
      x: "100%",
      duration: 0.3,
      ease: "power3.in",
    });
    tl.to(backdropRef.current, { opacity: 0, duration: 0.2 }, "<");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={close}
      />

      {/* Drawer - FIXED positioning */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-screen z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      >
        {/* Close button */}
        <div className="sticky top-0 flex justify-end p-4 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
          <button
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
            onClick={close}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!editing ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
                Account
              </p>
              <NeuButton
                onClick={() => setEditing(true)}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
              >
                <Edit size={16} /> Edit Profile
              </NeuButton>
              <NeuButton
                onClick={logout}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100"
              >
                <LogOut size={16} /> Sign Out
              </NeuButton>
            </div>
          ) : (
            <EditProfileForm
              profile={profile}
              onSave={(d) => {
                onSave(d);
                setEditing(false);
                close();
              }}
              onCancel={() => setEditing(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;
