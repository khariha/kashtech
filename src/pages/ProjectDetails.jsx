import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProjectDetails = () => {
    const { sowId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);

    const getColorByIndex = (index) => {
        const colors = [
            "#2e1065", "#5b21b6", "#7e22ce", "#9333ea", "#a855f7",
            "#c084fc", "#d8b4fe", "#e9d5ff", "#ede9fe", "#f3e8ff"
        ];
        return colors[index % colors.length];
    };

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://172.174.98.154:5000/api/projects/${sowId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProject(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch project details", err);
            }
        };

        fetchProject();
    }, [sowId]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://172.174.98.154:5000/api/projects/${sowId}/tasks`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTasks(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch task breakdown", err);
            }
        };

        fetchTasks();
    }, [sowId]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://172.174.98.154:5000/api/projects/${sowId}/employees`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEmployees(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch employee breakdown", err);
            }
        };

        fetchEmployees();
    }, [sowId]);

    const projectedHours = project?.total_projected_hours || 1;

    if (!project) {
        return <p className="text-center text-gray-500 mt-10">Loading project details...</p>;
    }

    return (
        <div className="px-6 py-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-purple-900">{project.project_category}</h1>
                    <p className="text-xl text-gray-500">{project.company_name}</p>
                    <div className="mt-2">
                        <select className="border border-gray-300 rounded px-3 py-1">
                            <option>Month to Date</option>
                        </select>
                    </div>
                </div>
                <button
                    style={{
                        border: '1px solid #a855f7', // Fallback border color (Tailwind's purple-400)
                        padding: '6px 20px',
                        borderRadius: '9999px',
                        color: '#6b21a8',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                    }}
                >
                    Create a Report
                </button>


            </div>

            {/* Breakdown of Tasks */}
            {tasks.length > 0 && (
                <div className="bg-white dark:bg-[#f8f8f8] rounded-xl p-6 shadow border border-gray-200 mb-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Breakdown of Tasks</h3>
                    <div className="flex items-center h-8 rounded-full overflow-hidden">
                        {tasks.map((task, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                    width: `${task.percent_complete}%`,
                                    backgroundColor: getColorByIndex(idx),
                                    borderRadius:
                                        idx === 0
                                            ? "9999px 0 0 9999px"
                                            : idx === tasks.length - 1
                                                ? "0 9999px 9999px 0"
                                                : "0",
                                }}
                            >
                                {task.percent_complete}%
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                        {tasks.map((task, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <span
                                    className="w-3 h-3 inline-block rounded-full"
                                    style={{ backgroundColor: getColorByIndex(idx) }}
                                ></span>
                                <span>{task.task_name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Breakdown of Employees */}
            {employees.length > 0 && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow mt-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Breakdown of Employees
                    </h2>

                    <div className="space-y-4">
                        {employees.map((emp, idx) => {
                            const total = parseFloat(emp.total_hours) || 0;
                            const percent = Math.min((total / projectedHours) * 100, 100);
                            const offset = percent >= 95 ? 0 : 5;
                            const barWidth = `calc(${percent}% + ${offset}%)`;

                            return (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="w-40 text-sm text-gray-800 dark:text-gray-200">
                                        {emp.emp_name}
                                    </span>
                                    <div className="relative flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="h-full bg-[#18002c] rounded-full text-white text-xs font-medium flex items-center justify-end pr-3"
                                            style={{ width: barWidth, maxWidth: "100%" }}
                                            title={`${total.toFixed(2)} hours`}
                                        >
                                            {total.toFixed(2)} h
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
