import { useState } from "react";
import api from "../../api/axios";

export default function ResetPassword() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleReset = async (e) => {

    e.preventDefault();

    try {

      await api.post("/admin/reset-password", {
        email,
        newPassword: password
      });

      alert("Password Updated");

    } catch (error) {

      alert(error.response?.data?.message);

    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-xl shadow-lg w-[350px]"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Reset Password
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-3 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-black text-white p-3 rounded"
        >
          Reset Password
        </button>

      </form>

    </div>
  );
}
