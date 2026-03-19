import React, { useState } from "react";
import api from "../../api/axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return; // prevent multiple clicks

    setLoading(true);

    try {
      const res = await api.post("/admin/login", {
        email,
        password,
      });

      const token = res.data.token;

      document.cookie = `adminToken=${token}; path=/; max-age=86400`;

      toast.success("Login Successful");

      window.location.href = "/products";

    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">

      <div className="bg-white rounded-2xl shadow-2xl p-10 w-[380px]">

        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Tenda Logo"
            className="h-12 object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full flex items-center justify-center gap-2 
    ${loading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"} 
    text-white font-semibold py-3 rounded-lg shadow-md transition`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

        </form>

      </div>

    </div>
  );
}