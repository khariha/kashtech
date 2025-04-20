// src/pages/AccessDenied.jsx
import React from "react";
import { FaLock } from "react-icons/fa";

const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-700 dark:text-red-400">
      <FaLock size={60} className="mb-4" />
      <h2 className="text-3xl font-semibold">Access Denied</h2>
      <p className="mt-2 text-lg">You don’t have permission to view this page.</p>
    </div>
  );
};

export default AccessDenied;
