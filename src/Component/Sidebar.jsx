import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { MdDashboard, MdInventory } from "react-icons/md";

const menu = [
  {
    label: "Dashboard",
    path: "/",
    icon: <MdDashboard size={22} />,
  },
  {
    label: "Products",
    icon: <MdInventory size={22} />,
    children: [
      { label: "All Products", path: "/products" },
      { label: "Category Product", path: "/parent-category" },
      { label: "Blogs", path: "/blogs" },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = (label) =>
    setOpenMenu(openMenu === label ? null : label);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-screen bg-white border-r shadow-md transition-all duration-300
        ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-72"}`}
      >
        {/* Toggle */}
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
        <div className="flex items-center gap-3 px-6 py-6 border-b">
          <div className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
            AP
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">Admin Panel</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="px-3 py-4 space-y-1">
          {menu.map((item) => (
            <div key={item.label}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow"
                        : "hover:bg-blue-50 text-gray-700"
                    }`
                  }
                >
                  {item.icon}
                  {!collapsed && item.label}
                </NavLink>
              ) : (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700"
                >
                  {item.icon}
                  {!collapsed && (
                    <>
                      <span>{item.label}</span>
                      <FiChevronRight
                        className={`ml-auto transition ${
                          openMenu === item.label ? "rotate-90" : ""
                        }`}
                      />
                    </>
                  )}
                </button>
              )}

              {/* Sub Menu */}
              {!collapsed && openMenu === item.label && item.children && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm transition
                        ${
                          isActive
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "hover:bg-blue-50 text-gray-600"
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="mt-auto px-4 py-4 border-t flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center">
            <FiUser />
          </div>
          {!collapsed && (
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
              <button
                onClick={() => navigate("/login")}
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
