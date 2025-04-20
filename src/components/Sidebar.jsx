// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTh,
  FaUsers,
  FaUserFriends,
  FaCalendarAlt,
  FaFileAlt,
  FaUserCircle
} from "react-icons/fa";

// Updated sidebar items with role-specific visibility
const allMenuItems = [
  {
    icon: FaTh,
    route: "/",
    label: "Dashboard",
    roles: ["Admin", "Super Admin"]
  },
  {
    icon: FaUsers,
    route: "/manage-employees",
    label: "Manage Employees",
    roles: ["Admin", "Super Admin"]
  },
  {
    icon: FaUserFriends,
    route: "/manage-clients",
    label: "Manage Clients",
    roles: ["Admin", "Super Admin"]
  },
  {
    icon: FaCalendarAlt,
    route: "/manage-timesheet",
    label: "Manage Timesheet",
    roles: ["Admin", "Super Admin", "Basic"]
  },
  {
    icon: FaUserCircle,
    route: "/employee-dashboard",
    label: "Employee Dashboard",
    roles: ["Basic"]
  },
  {
    icon: FaFileAlt,
    route: "/settings",
    label: "Settings",
    roles: ["Admin", "Super Admin"]
  }
];

const Sidebar = () => {
  const location = useLocation();

  let role = "";
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      role = decoded.role;
    } catch (error) {
      console.warn("Failed to decode JWT:", error);
    }
  }

  const filteredMenu = allMenuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <div className="w-20 h-screen bg-white dark:bg-[#1e1e2f] flex flex-col items-center py-6 space-y-6">
      {filteredMenu.map(({ icon: Icon, route, label }, idx) => {
        const isActive = location.pathname === route;
        return (
          <Link
            key={idx}
            to={route}
            title={label}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition ${
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
