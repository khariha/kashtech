import React from "react";

const NoAccess = () => {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied 🚫</h1>
        <p className="text-lg">This dashboard is only for Admins and Super Admins.</p>
      </div>
    </div>
  );
};

export default NoAccess;
