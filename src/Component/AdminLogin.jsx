import React, { useState } from "react";
import api from "../../api/axios";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await api.post("/admin/login", {
        email,
        password
      });

      alert("Login Successful");

      window.location.href = "/products";

    } catch (error) {

      alert(error.response?.data?.message);

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">

      <div className="bg-white rounded-2xl shadow-2xl p-10 w-[380px]">

        {/* Logo */}
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

          {/* Email */}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
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

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 transition text-white font-semibold py-3 rounded-lg shadow-md"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}