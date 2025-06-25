import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API from "../api/config";

const ProjectDetails = () => {
    const { sowId } = useParams();
    const [roleBreakdown, setRoleBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projectInfo, setProjectInfo] = useState(null);

    useEffect(() => {
        const fetchRoleBreakdown = async () => {
            try {
                const token = localStorage.getItem("token");

                const [roleRes, infoRes] = await Promise.all([
                    axios.get(API.GET_ROLE_BREAKDOWN_BY_PROJECT(sowId), {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(API.GET_PROJECT_HEADER_INFO(sowId), {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setRoleBreakdown(roleRes.data);
                setProjectInfo(infoRes.data);
            } catch (err) {
                console.error("Failed to fetch role breakdown or project info", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoleBreakdown();
    }, [sowId]);


    const groupedByRole = roleBreakdown.reduce((acc, curr) => {
        const key = curr.role_name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});



    return (
        <div className="px-6 py-4">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-purple-800">Role-wise Breakdown</h1>
                    {projectInfo && (
                        <h2 className="text-md font-medium text-gray-600 mt-1">
                            {projectInfo.company_name} — {projectInfo.project_name}
                        </h2>
                    )}
                </div>
                <button className="border border-purple-400 px-4 py-1 rounded-full text-purple-700 font-medium text-sm">
                    Create a Report
                </button>
            </div>


            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : Object.keys(groupedByRole).length === 0 ? (
                <p className="bg-white p-6 rounded-lg shadow text-gray-600 text-center">No role assignments found.</p>
            ) : (
                Object.entries(groupedByRole).map(([role, users], idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow mb-6"
                    >
                        <h2 className="text-md font-bold text-gray-700 dark:text-white mb-4">{role} Breakdown</h2>
                        <div className="space-y-4">
                            {users.map((user, uIdx) => {
                                const assigned = parseFloat(user.assigned_hours || 0);
                                const utilized = parseFloat(user.utilized_hours || 0);
                                const usedPercent = Math.min((utilized / assigned) * 100, 100);

                                return (
                                    <div key={uIdx}>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                                            {user.first_name} {user.last_name}
                                        </p>
                                        <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gray-300 dark:bg-gray-500"
                                                style={{ width: `${assigned}px`, maxWidth: "100%" }}
                                            ></div>
                                            <div className="relative bg-gray-300 rounded-full h-6 overflow-hidden">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-purple-800 text-white text-xs font-medium flex items-center justify-center"
                                                    style={{
                                                        width: `${usedPercent}%`,
                                                        minWidth: utilized > 0 ? "2.5rem" : "2.5rem", // Always visible
                                                        borderRadius: "9999px",
                                                    }}
                                                >
                                                    {utilized.toFixed(1)} h
                                                </div>
                                            </div>

                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Assigned: {assigned.toFixed(1)} h
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ProjectDetails;
