// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardHeader from "../components/DashboardHeader";
import Metrics from "../components/Metrics";
import ClientProjects from "../components/ClientProjects";

const Dashboard = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserName(res.data.name);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <DashboardHeader userName={userName} />
      <div className="mb-6 mt-2">
        <Metrics />
      </div>
      <ClientProjects />
    </div>
  );
};

export default Dashboard;
