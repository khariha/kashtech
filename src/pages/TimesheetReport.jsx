import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";
import API from "../api/config";

const TimesheetReport = () => {
    const [reportData, setReportData] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(API.TIMESHEET_REPORT, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReportData(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch report data", err);
            }
        };
        fetchReport();
    }, []);

    const toggleRow = (idx) => {
        setExpandedRows((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...reportData].sort((a, b) => {
        const aValue =
            sortConfig.key === "period_start_date"
                ? new Date(a[sortConfig.key])
                : (a[sortConfig.key] || "").toString().toLowerCase();
        const bValue =
            sortConfig.key === "period_start_date"
                ? new Date(b[sortConfig.key])
                : (b[sortConfig.key] || "").toString().toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    return (
        <div className="min-h-screen text-gray-800 dark:text-white px-6 py-6">
            <h2 className="text-4xl font-bold mb-6 text-purple-900 dark:text-white">
                Timesheet Report
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
                <table className="w-full table-auto text-sm border-collapse">
                    <thead className="bg-purple-100 dark:bg-purple-900 text-left">
                        <tr>
                            <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort("period_start_date")}>
                                Timesheet Date
                            </th>
                            <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort("employee_name")}>
                                Employee Name
                            </th>
                            <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort("billable")}>
                                Project Type
                            </th>
                            <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort("company_name")}>
                                Company Name
                            </th>
                            <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort("project_category")}>
                                Project Name
                            </th>
                            <th className="py-3 px-4 font-semibold text-center">Actions</th>
                            <th className="py-3 px-4 font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, idx) => {
                            const isExpanded = expandedRows.includes(idx);
                            const totalHours =
                                (parseFloat(row.monday_hours) || 0) +
                                (parseFloat(row.tuesday_hours) || 0) +
                                (parseFloat(row.wednesday_hours) || 0) +
                                (parseFloat(row.thursday_hours) || 0) +
                                (parseFloat(row.friday_hours) || 0) +
                                (parseFloat(row.saturday_hours) || 0) +
                                (parseFloat(row.sunday_hours) || 0);


                            const startDate = new Date(row.period_start_date);
                            const endDate = new Date(startDate);
                            endDate.setDate(startDate.getDate() + 6);

                            return (
                                <React.Fragment key={idx}>
                                    <tr className="border-b dark:border-gray-700">
                                        <td className="py-2 px-4">
                                            {format(startDate, "MMM d")} - {format(endDate, "MMM d")}
                                        </td>
                                        <td className="py-2 px-4">{row.employee_name}</td>
                                        <td className="py-2 px-4">{row.billable ? "Billable" : "Non-Billable"}</td>
                                        <td className="py-2 px-4">{row.company_name}</td>
                                        <td className="py-2 px-4">{row.project_category}</td>
                                        <td className="py-2 px-4 text-center">
                                            <button className="text-xs flex items-center gap-1 text-purple-700 hover:text-purple-900 mx-auto">
                                                <FaEdit /> Edit
                                            </button>
                                        </td>
                                        <td className="py-2 px-4 text-purple-600 hover:underline text-sm cursor-pointer">
                                            <button onClick={() => toggleRow(idx)}>
                                                {isExpanded ? "− Less Info" : "+ More Info"}
                                            </button>
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr className="bg-gray-100 dark:bg-gray-700 text-xs">
                                            <td colSpan="7" className="py-3 px-4">
                                                <div className="flex justify-between flex-wrap gap-4">
                                                    <div>
                                                        <div>
                                                            <strong>Work Area:</strong>{" "}
                                                            <span className="font-medium text-purple-700">
                                                                {row.work_area || row.sub_assignment || "—"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <strong>Task Area:</strong>{" "}
                                                            <span className="font-medium text-purple-700">
                                                                {row.task_area || row.sub_assignment_segment_1 || "—"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <strong>Ticket No.:</strong>{" "}
                                                            <span className="font-medium text-purple-700">{row.ticket_num || "—"}</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="font-semibold mb-1">Record Detail</div>
                                                        <div className="grid grid-cols-8 gap-2 text-center">
                                                            <div>Mon<br />{row.monday_hours}</div>
                                                            <div>Tue<br />{row.tuesday_hours}</div>
                                                            <div>Wed<br />{row.wednesday_hours}</div>
                                                            <div>Thu<br />{row.thursday_hours}</div>
                                                            <div>Fri<br />{row.friday_hours}</div>
                                                            <div>Sat<br />{row.saturday_hours}</div>
                                                            <div>Sun<br />{row.sunday_hours}</div>
                                                            <div className="font-bold text-purple-700">Total<br />{totalHours.toFixed(2)}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start justify-center mt-3">
                                                        <button className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold px-3 py-1 rounded">
                                                            View Notes
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimesheetReport;
