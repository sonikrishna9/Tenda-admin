import React, { useState } from "react";
import ApiClient from "../middleware/ApiClient";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiBox,
  FiLayers,
  FiImage,
  FiFileText,
  FiGrid,
} from "react-icons/fi";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menu = [
    {
      label: "Products",
      icon: <FiBox size={20} />,
      path: "/products",
    },
    {
      label: "Category Product",
      icon: <FiLayers size={20} />,
      path: "/parent-category",
    },
    {
      label: "Blogs",
      icon: <FiFileText size={20} />,
      path: "/blogs",
    },
    {
      label: "Slider",
      icon: <FiImage size={20} />,
      path: "/slider-management",
    },
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
    {
      label: "Gallery",
      icon: <FiImage size={20} />,
      path: "/gallery",
    },
    {
      label: "News",
      icon: <FiFileText size={20} />,
      path: "/newstable",
    },
    {
      label: "Buy Link Company",
      icon: <FiLayers size={20} />,
      path: "/company",
    },
    {
      label: "Video",
      icon: <FiLayers size={20} />,
      path: "/video",
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await ApiClient("POST", "api/admin/logout");

      toast.success(res.message || "Logout successful"); // 🔥

      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => {
        navigate("/");
      }, 1000); // thoda delay for UX

    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-screen bg-white border-r shadow-md transition-all duration-300 flex flex-col
        ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-72"}`}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-6 -right-3 hidden lg:flex w-7 h-7 bg-blue-600 text-white rounded-full items-center justify-center shadow"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        {/* Mobile Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
        >
          {collapsed ? <FiMenu /> : <FiX />}
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 px-6 py-6 border-b">
          <div className="w-32 h-20 text-white rounded-xl flex items-center justify-center font-bold">
            <img src={"/logo.png"} />
          </div>


        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">

          {menu.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition
                ${isActive
                  ? "bg-blue-600 text-white shadow"
                  : "hover:bg-blue-50 text-gray-700"
                }`
              }
            >
              {item.icon}
              {!collapsed && item.label}
            </NavLink>
          ))}

        </nav>

        {/* User Section */}
        <div className="px-4 py-4 border-t flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center">
            <FiUser />
          </div>

          {!collapsed && (
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Admin User Logout</p>
                {/* <p className="text-xs text-gray-500">admin@example.com</p> */}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
              >
                <FiLogOut />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}
    </>
  );
}