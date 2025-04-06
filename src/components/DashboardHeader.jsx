// src/components/DashboardHeader.jsx
import React from "react";

const DashboardHeader = ({ userName }) => {
    const isLoading = !userName;

    return (
        <div className="flex items-center justify-between px-6 mt-4 mb-2 animate-fadeIn">
            <div>
                {/* 👋 Welcome Text */}
                {isLoading ? (
                    <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded-md mb-1 animate-pulse" />
                ) : (
                    <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                        Welcome Back,{" "}
                        <span className="text-orange-500">{userName || "Daniel"}</span>
                    </p>
                )}

                {/* 📊 Title */}
                <h1 className="text-3xl font-bold text-purple-900 dark:text-white mt-1">
                    Dashboard Overview
                </h1>

                {/* 📅 Dropdown */}
                <select className="mt-3 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-[#1e1e2f] dark:text-white dark:border-gray-600">
                    <option>Month to Date</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>

            {/* 📄 Create Report */}
            <button
                style={{
                    border: '1px solid #a855f7', // Fallback border color (Tailwind's purple-400)
                    padding: '6px 20px',
                    borderRadius: '9999px',
                    color: '#6b21a8',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                }}
            >
                Create a Report
            </button>
        </div>
    );
};

export default DashboardHeader;
