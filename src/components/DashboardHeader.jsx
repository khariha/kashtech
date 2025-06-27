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
            </div>

            {/* 📄 Create Report */}

        </div>
    );
};

export default DashboardHeader;
