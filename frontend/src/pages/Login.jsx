import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Lock, Loader2 } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.username, formData.password);
      navigate("/");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Neumorphism styles
  const neumorphic =
    "bg-gray-100 shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff]";
  const inset = "bg-gray-100 shadow-inner";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className={`w-full max-w-sm p-6 rounded-3xl ${neumorphic}`}>
        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-700 text-center mb-6">
          Welcome Back
        </h1>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-500 mb-4 text-center">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className={`flex items-center px-3 py-2 rounded-xl ${inset}`}>
            <User size={18} className="text-gray-400" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              className="w-full bg-transparent outline-none ml-2 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className={`flex items-center px-3 py-2 rounded-xl ${inset}`}>
            <Lock size={18} className="text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full bg-transparent outline-none ml-2 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              neumorphic
            } active:shadow-inner`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-500 text-center mt-5">
          Don’t have an account?{" "}
          <Link to="/register" className="text-gray-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
