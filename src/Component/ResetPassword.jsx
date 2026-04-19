import React, { useState } from "react";
import toast from "react-hot-toast";
import ApiClient from "../middleware/ApiClient";
import {
  FiKey,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ResetPassword() {
  const [form, setForm] = useState(initialForm);
  const [resetLoading, setResetLoading] = useState(false);

  const adminProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminProfile") || "null");
    } catch (error) {
      return null;
    }
  })();

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!form.currentPassword || !form.newPassword) {
      toast.error("Current password aur new password required hain");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("New password minimum 6 characters ka hona chahiye");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password aur confirm password match nahi kar rahe");
      return;
    }

    try {
      setResetLoading(true);

      const response = await ApiClient("POST", "api/admin/reset-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (response.success) {
        toast.success("Password successfully update ho gaya");
        setForm(initialForm);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset nahi hua");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <span className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 p-3 text-white shadow-lg shadow-orange-200">
              <FiShield />
            </span>
            Admin Access
          </h1>
          <p className="mt-2 text-gray-600">
            System mein sirf ek hi admin user rahega, aur wahi apna password yahin se reset kar sakta hai.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                <FiUser size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Current Admin</h2>
                <p className="text-sm text-gray-500">
                  Logged-in admin account details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <FiUser className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-800">
                    {adminProfile?.name || "Admin User"}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <FiMail className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-800">
                    {adminProfile?.email || "Logged-in session"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              Naya admin create option hata diya gaya hai. Ye panel sirf current admin ke self password update ke liye hai.
            </div>
          </div>

          <form
            onSubmit={handleResetPassword}
            className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                <FiKey size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                <p className="text-sm text-gray-500">
                  Apna current password verify karke naya password set karo.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-300 px-4 py-3 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                  <FiLock className="text-gray-400" />
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-300 px-4 py-3 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                  <FiLock className="text-gray-400" />
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-300 px-4 py-3 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                  <FiKey className="text-gray-400" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="Re-enter new password"
                    className="w-full outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-amber-200 transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetLoading ? "Updating Password..." : "Update My Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
