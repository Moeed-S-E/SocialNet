import { Home, Bell, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomBar = () => {
  const location = useLocation();

  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/friends", icon: Users, label: "Friends" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md md:hidden z-50">
      <div className="flex justify-around py-2">
        {items.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;

          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`flex flex-col items-center text-xs transition-colors duration-200 ${
                active ? "text-black" : "text-gray-400 hover:text-black"
              }`}
            >
              <Icon size={22} />
              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomBar;
