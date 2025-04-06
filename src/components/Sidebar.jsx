// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTh,
  FaUsers,
  FaUserFriends,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";

const menuItems = [
  { icon: FaTh, route: "/", label: "Dashboard" },
  { icon: FaUsers, route: "/manage-employees", label: "Manage Employees" },
  { icon: FaUserFriends, route: "/clients", label: "Clients" },
  { icon: FaCalendarAlt, route: "/calendar", label: "Calendar" },
  { icon: FaFileAlt, route: "/settings", label: "Settings" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-20 h-screen bg-white dark:bg-[#1e1e2f] flex flex-col items-center py-6 space-y-6">
      {menuItems.map(({ icon: Icon, route, label }, idx) => {
        const isActive = location.pathname === route;

        return (
          <Link
            key={idx}
            to={route}
            title={label}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition
              ${
                isActive
                  ? "bg-[#2a153c] text-white shadow-md border-transparent"
                  : "border-purple-300 text-[#2a153c] hover:bg-purple-50 dark:text-white"
              }`}
          >
            <Icon size={18} />
          </Link>
        );
      })}
    </div>
  );
};

export default Sidebar;
