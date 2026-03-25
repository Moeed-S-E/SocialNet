import React, { useEffect, useRef, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import BottomBar from "./components/BottomBar";
import NotificationsPage from "./pages/NotificationsPage";
import Friends from "./pages/Friends";
import NotFound from "./pages/NotFound";
import PageLoader from "./components/PageLoader";
import Messenger from "./components/Messenger";
gsap.registerPlugin(ScrollTrigger);

// ── Route Guard: Protected Route ──
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

// ── Route Guard: Public Route ──
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  return !user ? children : <Navigate to="/" replace />;
};

// ── Main App Content ──
const AppContent = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const lenisRef = useRef(null);

  // Global logout listener
  useEffect(() => {
    const handleGlobalLogout = () => {
      logout();
    };
    window.addEventListener("auth-logout", handleGlobalLogout);
    return () => window.removeEventListener("auth-logout", handleGlobalLogout);
  }, [logout]);

  // Lenis + ScrollTrigger Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length
          ? lenis.scrollTo(value, { immediate: true })
          : lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    const onRefreshInit = () => lenis.resize();
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);

    // ✅ Complete cleanup
    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.killAll();
      ScrollTrigger.clearScrollMemory();
      lenis.destroy();
    };
  }, [location.pathname]); // Re-init on route change

  // Hide Navbar/BottomBar on auth pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const showLayout = user && !isAuthPage;

  return (
    <div className="app min-h-screen bg-[#f0f2f5]">
      {/* ✅ Hide Navbar on login/register pages */}
      {showLayout && <Navbar />}

      <main className={showLayout ? "pb-20" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/u/:username"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </main>

      {/* ✅ Hide BottomBar on login/register pages */}
      {showLayout && <BottomBar />}

      {/* ✅ GLOBAL MESSENGER (Facebook-style) */}
      {showLayout && <Messenger />}
    </div>
  );
};

// ── Root App ──
function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
