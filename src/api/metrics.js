// src/api/metrics.js
import API from "../api/config";

export const fetchTotalProjects = async () => {
    const token = localStorage.getItem("token");
  
    const response = await fetch(API.TOTAL_PROJECTS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) throw new Error("Failed to fetch total projects");
  
    const data = await response.json();
    return data.totalProjects;
  };
  