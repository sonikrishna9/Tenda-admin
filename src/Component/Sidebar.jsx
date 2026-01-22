import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiMessageSquare,
  FiTrendingUp,
  FiMenu,
  FiX,
} from "react-icons/fi";
import {
  MdDashboard,
  MdInventory,
  MdLocalShipping,
  MdPeople,
} from "react-icons/md";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [notifications] = useState(3);
  const [messages] = useState(2);
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <MdDashboard size={22} />,
      subItems: [
        { path: "/analytics", label: "Analytics" },
        { path: "/reports", label: "Reports" },
        { path: "/statistics", label: "Statistics" },
      ],
    },
    {
      path: "/products",
      label: "Products",
      icon: <MdInventory size={22} />,
      subItems: [
        { path: "/products", label: "All Products" },
        { path: "/products/create", label: "Add New" },
        { path: "/products/feature", label: "Feature Products" },
        { path: "/products/inventory", label: "Inventory" },
      ],
    },
    {
      path: "/orders",
      label: "Orders",
      icon: <MdLocalShipping size={22} />,
      subItems: [
        { path: "/orders/pending", label: "Pending" },
        { path: "/orders/completed", label: "Completed" },
        { path: "/orders/returns", label: "Returns" },
      ],
    },
    {
      path: "/users",
      label: "Users",
      icon: <MdPeople size={22} />,
      subItems: [
        { path: "/users/all", label: "All Users" },
        { path: "/users/admins", label: "Admins" },
        { path: "/users/customers", label: "Customers" },
        { path: "/users/roles", label: "Roles & Permissions" },
      ],
    },
  ];

  const toggleSubMenu = (label) => {
    setActiveSubMenu(activeSubMenu === label ? null : label);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative z-40
          transition-transform duration-300 ease-in-out
          ${collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
          w-72 lg:${collapsed ? "w-20" : "w-72"}
          bg-gradient-to-b from-orange-50 via-orange-100 to-white
          min-h-screen shadow-xl border-r border-orange-200
          overflow-hidden
        `}
      >
        {/* Header */}
        <div className="px-6 py-8 border-b border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
              AP
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-gray-600">Management Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-orange-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-lg border">
                <FiBell className="text-orange-500" />
                <p className="text-xs">Notifications ({notifications})</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <FiMessageSquare className="text-blue-500" />
                <p className="text-xs">Messages ({messages})</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="px-3 py-6 space-y-1 h-[calc(100vh-280px)] overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.path}>
              <NavLink
                to={item.path}
                onClick={(e) => {
                  if (item.subItems) {
                    e.preventDefault();
                    toggleSubMenu(item.label);
                  }
                }}
              >
                <div className="flex items-center px-4 py-3 rounded-xl hover:bg-orange-50">
                  {item.icon}
                  {!collapsed && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      {item.subItems && (
                        <FiChevronRight
                          className={`ml-auto transition ${
                            activeSubMenu === item.label ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </>
                  )}
                </div>
              </NavLink>

              {!collapsed &&
                activeSubMenu === item.label &&
                item.subItems && (
                  <div className="ml-8 space-y-1">
                    {item.subItems.map((sub) => (
                      <NavLink key={sub.path} to={sub.path}>
                        <div className="px-3 py-2 rounded hover:bg-orange-100 text-sm">
                          {sub.label}
                        </div>
                      </NavLink>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="absolute bottom-0 w-full px-4 py-4 border-t bg-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
              <FiUser />
            </div>
            {!collapsed && (
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="font-medium">Admin User</p>
                  <p className="text-xs text-gray-500">admin@example.com</p>
                </div>
                <button onClick={handleLogout}>
                  <FiLogOut />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;
