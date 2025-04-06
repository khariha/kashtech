// src/api/metrics.js
export const fetchTotalProjects = async () => {
    const token = localStorage.getItem("token");
  
    const response = await fetch("http://localhost:5000/api/metrics/total-projects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) throw new Error("Failed to fetch total projects");
  
    const data = await response.json();
    return data.totalProjects;
  };
  