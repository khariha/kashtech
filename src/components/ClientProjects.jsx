// src/components/ClientProjects.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearch } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";

const ClientProjects = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true); // 🌀 Loading state
    const [error, setError] = useState(null);     // ❌ Error state

    const { searchTerm } = useSearch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClientProjects = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://172.174.98.154:5000/api/dashboard/client-projects", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("🧾 Client Projects:", res.data);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch client projects", err);
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchClientProjects();
    }, []);

    const filteredClients = Object.entries(data).filter(([clientName]) =>
        clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="px-4 mt-6">
            {loading ? (
                <p className="text-center text-gray-500">Loading projects...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : filteredClients.length === 0 ? (
                <p className="text-center text-gray-500 mt-4">No clients found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients.map(([client, projects]) => (
                        <div
                            key={client}
                            className="bg-white dark:bg-[#1f1f2e] p-6 rounded-xl shadow border border-purple-100 dark:border-gray-600"
                        >
                            <h2 className="text-lg font-bold text-black dark:text-white mb-4">{client}</h2>

                            {projects.map((proj, idx) => {
                                const percent = Math.min((proj.hours_billed / proj.total_hours) * 100, 100);
                                const sowId = proj.sow_id;
                                const offset = percent >= 95 ? 0 : 5;
                                const barWidth = `calc(${percent}% + ${offset}%)`;
                                return (
                                    <div
                                        key={idx}
                                        className="mb-4 cursor-pointer hover:scale-[1.01] transition-all"
                                        onClick={() => {
                                            if (sowId) {
                                                navigate(`/projects/${sowId}`);
                                            } else {
                                                console.warn("Missing sow_id for project:", proj);
                                            }
                                        }}
                                    >
                                        <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-1">
                                            {proj.project}
                                        </p>

                                        <div className="relative w-full h-4 bg-purple-100 dark:bg-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[#1e002c] via-[#802020] to-[#ff6600] text-white text-[10px] flex items-center justify-end pr-1"
                                                style={{
                                                    width: barWidth,
                                                    minWidth: "2rem",
                                                }}
                                            >
                                                {proj.hours_billed} h
                                            </div>

                                        </div>

                                        <p className="text-xs text-right text-gray-400 mt-1">{proj.total_hours} h</p>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientProjects;
