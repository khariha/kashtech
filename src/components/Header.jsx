// src/components/Header.jsx
import React from "react";

import { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

import { useSearch } from "../context/SearchContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutImage from "../images/logout-icon.png";
import KTLogo from "../images/KASH-Tech-Logo-Black.png";

const Header = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = localStorage.getItem("fullName") || "User";

  const [menuOpen, setMenuOpen] = useState(false);
  let closeTimeout;

  // 🔠 Get initials (e.g., "DA" for Dhinesh Aranganathan)
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else {
      return name.slice(0, 2).toUpperCase();
    }
  };

  // live-search: update context AND URL as you type
  const handleInputChange = (e) => {
    const cleaned = e.target.value.replace(/[^A-Za-z0-9 ]/g, "");
    setSearchTerm(cleaned);
    navigate(
      `${location.pathname}${cleaned ? `?search=${encodeURIComponent(cleaned)}` : ""}`,
      { replace: true }
    );
  };

  const handleMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
      setMenuOpen(false);
    }, 200); // 200ms delay
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 pt-4 border-b border-purple-200 pb-3 dark:bg-[#1e1e2f]">
      {/* Logo + live-search input */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
          <img src={KTLogo} alt="KTLogo" className="w-8 h-8 object-contain" />
        </div>
        <div className="relative">
          <FaSearch className="absolute top-2.5 left-3 text-purple-700 text-sm" />
          <input
            type="text"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={handleInputChange}
            className="pl-9 pr-3 py-2 w-64 rounded-full border border-purple-300 text-sm bg-white text-black dark:bg-[#2b2b3c] dark:text-white dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Theme toggle, logout, initials */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-[#333] rounded-full px-2 py-1 text-sm">
          <button
            onClick={() => toggleTheme("light")}
            className={`px-3 py-1 rounded-full font-medium ${theme === "light"
                ? "bg-white text-purple-900 shadow"
                : "text-gray-400"
              }`}
          >
            Light
          </button>
          <button
            onClick={() => toggleTheme("dark")}
            className={`px-3 py-1 rounded-full font-medium ${theme === "dark"
                ? "bg-white text-purple-900 shadow"
                : "text-gray-400"
              }`}
          >
            Dark
          </button>
        </div>
        
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-10 h-10 bg-purple-700 text-white flex items-center justify-center rounded-full font-semibold cursor-pointer">
            {getInitials(fullName)}
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#2b2b3c] shadow-lg rounded-md overflow-hidden z-50">
              <Link
                to="/change-password"
                className="block px-4 py-2 text-sm hover:bg-purple-100 dark:hover:bg-[#444]"
              >
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-purple-100 dark:hover:bg-[#444]"
              >
                Logout
              </button>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};  // ← Make sure this closing brace is here

export default Header;
