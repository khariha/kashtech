// src/components/Metrics.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Metrics = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchAllMetrics = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const [totalRes, activeRes, clientsRes, empRes, avgRes] = await Promise.all([
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
  
        const combinedMetrics = {
          totalProjects: totalRes.data.totalProjects,
          activeProjects: activeRes.data.activeProjects,
          clients: clientsRes.data.clients,
          employees: empRes.data.employees,
          avgHours: avgRes.data.avgHours,
        };
  
        console.log("📊 Metrics:", combinedMetrics); // ✅ Log correctly
  
        setMetrics(combinedMetrics);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    };
  
    fetchAllMetrics();
  }, []);
  

  if (!metrics) {
    return <p className="text-gray-500 text-center">Loading metrics...</p>;
  }

  const stats = [
    { label: "Total Projects", value: metrics.totalProjects },
    { label: "Active Projects", value: metrics.activeProjects },
    { label: "Clients", value: metrics.clients },
    { label: "Employees Assigned", value: metrics.employees },
    { label: "Avg Hours Billed", value: metrics.avgHours },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4">
      {stats.map((item, index) => (
        <div
          key={index}
          className="rounded-xl border border-purple-200 dark:border-gray-700 p-4 text-center hover:shadow-lg transition bg-white dark:bg-[#1d1d2c]"
        >
          <p className="text-sm text-purple-800 dark:text-purple-300 font-medium border-b border-purple-200 pb-1 dark:border-gray-600">
            {item.label}
          </p>
          <p className="text-3xl font-bold text-orange-500 mt-2">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default Metrics;
