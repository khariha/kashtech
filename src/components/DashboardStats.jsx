// src/components/DashboardStats.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    clients: 0,
    employees: 0,
    avgHours: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    const token = localStorage.getItem("token");

    try {
      const [
        totalRes,
        activeRes,
        clientsRes,
        employeesRes,
        avgHoursRes,
      ] = await Promise.all([
        axios.get("http://172.174.98.154:5000/api/metrics/total-projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://172.174.98.154:5000/api/metrics/active-projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://172.174.98.154:5000/api/metrics/clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://172.174.98.154:5000/api/metrics/employees-assigned", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://172.174.98.154:5000/api/metrics/avg-hours-billed", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats({
        totalProjects: totalRes.data.totalProjects,
        activeProjects: activeRes.data.activeProjects,
        clients: clientsRes.data.clients,
        employees: employeesRes.data.employees,
        avgHours: avgHoursRes.data.avgHours,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error loading metrics:", err);
      setError("Failed to load metrics. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const StatCard = ({ label, value }) => (
    <div className="bg-white border border-purple-200 rounded-xl px-6 py-5 text-center shadow-sm">
      <h3 className="text-md font-semibold text-purple-800 mb-2">{label}</h3>
      <p className="text-3xl font-bold text-orange-500">
        {loading ? "Loading..." : value ?? "0"}
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 px-1">
      {error && (
        <div className="col-span-full text-center text-red-600">
          {error}
        </div>
      )}

      <StatCard label="Total Projects" value={stats.totalProjects} />
      <StatCard label="Active Projects" value={stats.activeProjects} />
      <StatCard label="Clients" value={stats.clients} />
      <StatCard label="Employees Assigned" value={stats.employees} />
      <StatCard label="Avg Hours Billed" value={stats.avgHours ?? "0"} />
    </div>
  );
};

export default DashboardStats;
