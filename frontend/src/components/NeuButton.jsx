/* eslint-disable no-unused-vars */
import React, { useRef } from "react";
import { gsap } from "gsap";

const neuOut = { boxShadow: "8px 8px 16px #c5c6cc, -8px -8px 16px #ffffff" };
const neuOutSm = { boxShadow: "4px 4px 8px #c5c6cc, -4px -4px 8px #ffffff" };
const neuIn = {
  boxShadow: "inset 4px 4px 8px #c5c6cc, inset -4px -4px 8px #ffffff",
};
const neuInSm = {
  boxShadow: "inset 3px 3px 6px #c5c6cc, inset -3px -3px 6px #ffffff",
};

/* ── Reusable NeuButton ── */
const NeuButton = ({ children, onClick, className = "", inset = false }) => {
  const ref = useRef(null);
  const handleEnter = () =>
    gsap.to(ref.current, { scale: 0.97, duration: 0.15 });
  const handleLeave = () => gsap.to(ref.current, { scale: 1, duration: 0.15 });

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={inset ? neuIn : neuOutSm}
      className={`flex items-center justify-center rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 bg-[#e6e7ee] text-gray-700 transition-none ${className}`}
    >
      {children}
    </button>
  );
};

export default NeuButton;
