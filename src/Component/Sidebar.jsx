import React, { useState } from "react";
import ApiClient from "../middleware/ApiClient";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiBox,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiGrid,
  FiImage,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";

export default function Sidebar() {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const [adminProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminProfile") || "null");
    } catch (error) {
      return null;
    }
  });

  const menu = [
    { label: "Products", icon: <FiBox size={20} />, path: "/products" },
    {
      label: "Category Product",
      icon: <FiLayers size={20} />,
      path: "/parent-category",
    },
    { label: "Blogs", icon: <FiFileText size={20} />, path: "/blogs" },
    { label: "Slider", icon: <FiImage size={20} />, path: "/slider-management" },
    {
      label: "Sub Category Banner",
      icon: <FiGrid size={20} />,
      path: "/subcategorybannertable",
    },
    {
      label: "Parent Category Banner",
      icon: <FiGrid size={20} />,
      path: "/parentcategorybannertable",
    },
    { label: "Gallery", icon: <FiImage size={20} />, path: "/gallery" },
    { label: "News", icon: <FiFileText size={20} />, path: "/newstable" },
    {
      label: "Buy Link Company",
      icon: <FiLayers size={20} />,
      path: "/company",
    },
    { label: "Video", icon: <FiLayers size={20} />, path: "/video" },
    { label: "Meta SEO", icon: <FiLayers size={20} />, path: "/seo" },
    {
      label: "Admin Access",
      icon: <FiShield size={20} />,
      path: "/admin-access",
    },
  ];

  const handleLogout = async () => {
    try {
      document.cookie =
        "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Logout successful");

      try {
        await ApiClient("POST", "api/admin/logout");
      } catch (error) {
        console.log("Logout API skipped:", error?.response?.data || error.message);
      }

      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-50 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 p-3 text-white shadow-lg lg:hidden"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-orange-100 bg-gradient-to-b from-[#fff7ef] via-white to-[#fff1df] shadow-2xl shadow-orange-100/50 transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopCollapsed ? "lg:w-24" : "lg:w-72"} lg:static lg:translate-x-0`}
      >
        <button
          onClick={() => setDesktopCollapsed((prev) => !prev)}
          className="absolute -right-3 top-6 hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg lg:flex"
        >
          {desktopCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <div className="border-b border-orange-100 px-5 py-6">
          <div
            className={`flex items-center ${
              desktopCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="rounded-2xl bg-white p-3 shadow-lg shadow-orange-100">
              <img src="/logo.png" alt="logo" className="h-10 object-contain" />
            </div>

           
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {menu.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center rounded-2xl px-4 py-3 transition ${
                  desktopCollapsed ? "justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-200"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                }`
              }
              title={desktopCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!desktopCollapsed && (
                <span className="truncate text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-orange-100 p-4">
          <div
            className={`rounded-3xl bg-white/90 p-3 shadow-lg shadow-orange-100 ${
              desktopCollapsed ? "text-center" : ""
            }`}
          >
            <div
              className={`flex items-center ${
                desktopCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md">
                <FiUser />
              </div>

              {!desktopCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    Admin User
                  </p>
                  <p className="truncate text-xs text-gray-500">
                   Authenticated session
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`mt-3 flex w-full items-center justify-center rounded-2xl bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 ${
                desktopCollapsed ? "gap-0" : "gap-2"
              }`}
            >
              <FiLogOut />
              {!desktopCollapsed && "Logout"}
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden"
        />
      )}
    </>
  );
}
