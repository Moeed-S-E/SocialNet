/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { User, Mail, Lock, Loader2 } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { password2, ...submitData } = formData;
      await api.post("auth/register/", submitData);
      navigate("/login");
    } catch (err) {
      const errors = err.response?.data;
      setError(
        typeof errors === "object"
          ? Object.values(errors).flat().join(", ")
          : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Neumorphism styles
  const neu =
    "bg-gray-100 shadow-[8px_8px_16px_#cfcfcf,-8px_-8px_16px_#ffffff]";
  const inset = "bg-gray-100 shadow-inner";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className={`w-full max-w-md p-6 rounded-3xl ${neu}`}>
        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-700 text-center mb-6">
          Create Account
        </h1>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <input
              name="first_name"
              placeholder="First name"
              onChange={handleChange}
              className={`p-3 rounded-xl text-sm outline-none ${inset}`}
            />
            <input
              name="last_name"
              placeholder="Last name"
              onChange={handleChange}
              className={`p-3 rounded-xl text-sm outline-none ${inset}`}
            />
          </div>

          {/* Username */}
          <div className={`flex items-center px-3 py-2 rounded-xl ${inset}`}>
            <User size={18} className="text-gray-400" />
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              className="w-full ml-2 bg-transparent outline-none text-sm"
            />
          </div>

          {/* Email */}
          <div className={`flex items-center px-3 py-2 rounded-xl ${inset}`}>
            <Mail size={18} className="text-gray-400" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full ml-2 bg-transparent outline-none text-sm"
            />
          </div>

          {/* Password */}
          <div className={`flex items-center px-3 py-2 rounded-xl ${inset}`}>
            <Lock size={18} className="text-gray-400" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full ml-2 bg-transparent outline-none text-sm"
            />
          </div>

          {/* Confirm Password */}
          <div className={`flex items-center px-3 py-2 rounded-xl ${inset}`}>
            <Lock size={18} className="text-gray-400" />
            <input
              name="password2"
              type="password"
              placeholder="Confirm password"
              onChange={handleChange}
              required
              className="w-full ml-2 bg-transparent outline-none text-sm"
            />
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium ${neu} active:shadow-inner transition`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
