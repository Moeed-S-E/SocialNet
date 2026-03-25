import React from "react";

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-800" />
      <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
    </div>
  </div>
);

export default PageLoader;
