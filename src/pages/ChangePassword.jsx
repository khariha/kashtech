// src/pages/ChangePassword.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa"; // ← add this
import API from "../api/config";

const ChangePassword = () => {

    const token = localStorage.getItem("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        try {
            // Example API call — adjust to your backend
            const res = await fetch(API.USER_RESET_PASSWORD, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ✅ add token here
                },
                body: JSON.stringify({ newPassword }),
            });

            if (!res.ok || res.success === false) {
                // Show backend error if present, otherwise fallback
                throw new Error(data.error || data.message || "Failed to change password");
            }

            alert("Password updated successfully!");
            navigate(-1); // or wherever you want to redirect

        } catch (err) {
            console.error("❌ Password change failed:", err);
             alert(err.message || "Error updating password.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#1e1e2f]">

            {/* X button in the top-left */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
                title="Close"
            >
                <FaTimes size={20} />
            </button>

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-[#2b2b3c] p-6 rounded-lg shadow-md w-96 space-y-4"
            >
                <h2 className="text-xl font-bold text-center">Change Password</h2>

                <div className="relative">
                    <input
                         type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800"
                >
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
