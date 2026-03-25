import React from "react";
import { Grid, Bookmark, Heart, Users, Inbox } from "lucide-react";

const TabBar = ({ active, onChange }) => {
  // Neu-style inset for active tab
  const neuInSm = {
    boxShadow: "inset 4px 4px 8px #c5c6cc, inset -4px -4px 8px #ffffff",
    backgroundColor: "#e6e7ee",
  };

  const tabs = [
    { key: "posts", icon: Grid, label: "Posts" },
    { key: "saved", icon: Bookmark, label: "Saved" },
    { key: "liked", icon: Heart, label: "Liked" },
    { key: "friends", icon: Users, label: "Friends" },
    { key: "requests", icon: Inbox, label: "Requests" },
  ];

  return (
    <div className="flex border-t bg-[#e6e7ee] p-1 gap-1 rounded-lg mb-4">
      {tabs.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="flex-1 flex flex-col items-center justify-center py-2 transition"
        >
          <div
            style={active === key ? neuInSm : {}}
            className={`p-2 rounded-xl flex items-center justify-center transition`}
          >
            <Icon
              size={18}
              className={active === key ? "text-blue-600" : "text-gray-500"}
            />
          </div>
          <span
            className={`text-xs mt-1 ${active === key ? "text-blue-600" : "text-gray-500"}`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;
