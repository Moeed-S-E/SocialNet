// src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import NeuButton from "../components/NeuButton";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 mt-20">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 Number */}
        <div className="mb-8">
          <h1 className="text-[120px] font-bold text-gray-200 leading-none select-none">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#e6e7ee] flex items-center justify-center">
            <Search size={40} className="text-gray-400" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <NeuButton
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3"
          >
            <ArrowLeft size={16} />
            Go Back
          </NeuButton>
          <NeuButton
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white"
          >
            <Home size={16} />
            Go Home
          </NeuButton>
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-4">Popular Pages</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm text-gray-600 bg-white rounded-lg hover:bg-gray-100 transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/friends")}
              className="px-4 py-2 text-sm text-gray-600 bg-white rounded-lg hover:bg-gray-100 transition"
            >
              Friends
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="px-4 py-2 text-sm text-gray-600 bg-white rounded-lg hover:bg-gray-100 transition"
            >
              Notifications
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 text-sm text-gray-600 bg-white rounded-lg hover:bg-gray-100 transition"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
