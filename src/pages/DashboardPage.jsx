// src/pages/DashboardPage.jsx
import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";

export default function DashboardPage() {
  return (
    <div className="flex">
      <div className="w-20">
        <Sidebar />
      </div>
      <div className="flex-1 ml-20 px-6 py-4">
        <Header />
        <DashboardStats />
      </div>
    </div>
  );
}
