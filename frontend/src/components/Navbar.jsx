import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ✅ Add useLocation
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import { Home, Bell, User, LogOut, LogIn, UserPlus, Users } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Get current route for active styling

  const navRef = useRef(null);
  const linksRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navLinks = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/friends", icon: Users, label: "Friends" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Entrance animation ── */
  useEffect(() => {
    if (!navRef.current || !linksRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(navRef.current, { opacity: 0, y: -60 });
      gsap.set([...linksRef.current.children], { opacity: 0, y: -10 });

      // Animate in
      const tl = gsap.timeline();
      tl.to(navRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      }).to(
        [...linksRef.current.children],
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power3.out",
        },
        "-=0.5",
      );
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className={`
        fixed top-0 left-0 right-0 z-50 
        min-[768px]:flex justify-center hidden
        transition-all duration-300 w-full
        ${
          scrolled
            ? "bg-[#e0e5ec]/90 backdrop-blur-sm h-14 px-4 mt-2"
            : "bg-[#e0e5ec] h-20"
        }
      `}
    >
      <div
        className={`
          max-w-7xl w-full flex items-center justify-between px-6
          shadow-[8px_8px_16px_#bec3c9,-8px_-8px_16px_#ffffff]
          rounded-2xl transition-all duration-300
          ${scrolled ? "px-4" : "px-6"}
        `}
      >
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center gap-3 transition-all duration-300"
        >
          {logoError ? (
            <div
              className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                scrolled ? "w-10 h-10" : "w-14 h-14"
              }`}
            >
              <span className="text-white font-bold text-lg">S</span>
            </div>
          ) : (
            <img
              src="/logo.png"
              alt="SocialNet Logo"
              className={`object-contain transition-all duration-300 ${
                scrolled ? "h-10 w-10" : "h-14 w-14"
              }`}
              onError={() => setLogoError(true)}
            />
          )}
          {!scrolled && (
            <span className="text-xl font-bold text-gray-800">SocialNet</span>
          )}
        </Link>

        {/* Navigation Links */}
        <div ref={linksRef} className="flex items-center gap-1">
          {user ? (
            navLinks.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2 rounded-xl 
                    transition-all duration-200
                    ${
                      isActive
                        ? "text-gray-900 bg-white/60 shadow-[inset_3px_3px_6px_#c5c6cc,inset_-3px_-3px_6px_#ffffff]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                    }
                  `}
                  title={label}
                >
                  <Icon size={20} />
                  {!scrolled && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                </Link>
              );
            })
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/40 transition-all duration-200"
                title="Login"
              >
                <LogIn size={20} />
                {!scrolled && "Login"}
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-white/40 transition-all duration-200"
                title="Register"
              >
                <UserPlus size={20} />
                {!scrolled && "Register"}
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-white/40 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={20} />
              {!scrolled && <span className="text-sm font-medium">Logout</span>}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
