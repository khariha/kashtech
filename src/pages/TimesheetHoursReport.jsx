// ✅ Final Updated TimesheetHoursReport.jsx without Sorting Symbols

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const TimesheetHoursReport = () => {
    const [reportData, setReportData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterOption, setFilterOption] = useState("monthToDate");
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
    const itemsPerPage = 15;

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        fetchReport();
    }, [filterOption, customStartDate, customEndDate]);

    const fetchReport = async () => {
        try {
            let params = {};

            if (filterOption === "monthToDate") {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                params.startDate = format(start, "yyyy-MM-dd");
                params.endDate = format(now, "yyyy-MM-dd");
            } else if (filterOption === "lastMonth") {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end = new Date(now.getFullYear(), now.getMonth(), 0);
                params.startDate = format(start, "yyyy-MM-dd");
                params.endDate = format(end, "yyyy-MM-dd");
            } else if (filterOption === "customRange" && customStartDate && customEndDate) {
                params.startDate = format(customStartDate, "yyyy-MM-dd");
                params.endDate = format(customEndDate, "yyyy-MM-dd");
            }

            const response = await axios.get("/api/timesheet/hours-report", {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            setReportData(Array.isArray(response.data) ? response.data : []);
            setCurrentPage(1);
        } catch (err) {
            console.error("❌ Failed to fetch Hours Report", err);
            setReportData([]);
        }
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...reportData].sort((a, b) => {
        const aVal = (a[sortConfig.key] || "").toString().toLowerCase();
        const bVal = (b[sortConfig.key] || "").toString().toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = sortedData.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TimesheetHours");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer]), "timesheet_hours_report.xlsx");
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-white px-6 py-6">
            <h2 className="text-4xl font-bold mb-6 text-purple-900 dark:text-white">
                Timesheet Report by Weekly Hours
            </h2>
            <div className="flex justify-between items-center mb-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <select
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        className="border text-sm rounded px-2 py-1"
                    >
                        <option value="monthToDate">Month to Date</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="customRange">Custom Range</option>
                    </select>

                    {filterOption === "customRange" && (
                        <>
                            <DatePicker
                                selected={customStartDate}
                                onChange={(date) => setCustomStartDate(date)}
                                selectsStart
                                startDate={customStartDate}
                                endDate={customEndDate}
                                placeholderText="Start Date"
                                className="border rounded px-2 py-1 text-sm"
                            />
                            <DatePicker
                                selected={customEndDate}
                                onChange={(date) => setCustomEndDate(date)}
                                selectsEnd
                                startDate={customStartDate}
                                endDate={customEndDate}
                                placeholderText="End Date"
                                className="border rounded px-2 py-1 text-sm"
                            />
                        </>
                    )}
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                    <CSVLink
                        data={reportData}
                        filename="timesheet_hours_report.csv"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                        Export CSV
                    </CSVLink>
                    <button
                        onClick={handleExportExcel}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                        Export Excel
                    </button>
                    <button
                        onClick={() => navigate("/manage-timesheet")}
                        className="bg-[#F97316] hover:bg-[#ea670a] text-white font-bold py-2 px-5 rounded-full text-sm shadow-sm"
                    >
                        + Add Timesheet
                    </button>
                </div>
            </div>

            <div className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {filterOption === "monthToDate" && "Showing Timesheet Report for Month to Date"}
                {filterOption === "lastMonth" && "Showing Timesheet Report for Last Month"}
                {filterOption === "customRange" && customStartDate && customEndDate &&
                    `Showing Timesheet Report from ${format(customStartDate, "MMM dd, yyyy")} to ${format(customEndDate, "MMM dd, yyyy")}`
                }
            </div>

            <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
                <table className="w-full table-auto text-sm border-collapse">
                    <thead className="bg-purple-100 dark:bg-purple-900 text-left">
                        <tr>
                            {[
                                { label: "Employee Name", key: "employee_name" },
                                { label: "Company Name", key: "company_name" },
                                { label: "Project Name", key: "project_name" },
                                { label: "Work Area", key: "work_area" },
                                { label: "Task Area", key: "task_area" },
                                { label: "Ticket Num", key: "ticket_num" },
                                { label: "Total Hours", key: "total_hours" },
                            ].map((col) => (
                                <th
                                    key={col.key}
                                    className="py-3 px-4 font-semibold cursor-pointer"
                                    onClick={() => handleSort(col.key)}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? (
                            currentData.map((row, idx) => (
                                <tr key={idx} className="border-b dark:border-gray-700">
                                    <td className="py-2 px-4">{row.employee_name}</td>
                                    <td className="py-2 px-4">{row.company_name}</td>
                                    <td className="py-2 px-4">{row.project_name}</td>
                                    <td className="py-2 px-4">{row.work_area || '-'}</td>
                                    <td className="py-2 px-4">{row.task_area || '-'}</td>
                                    <td className="py-2 px-4">{row.ticket_num || '-'}</td>
                                    <td className="py-2 px-4">{row.total_hours}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-6">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`text-sm px-3 py-1 rounded ${currentPage === 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-white dark:bg-gray-700 border dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`text-sm px-3 py-1 rounded ${currentPage === totalPages
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-white dark:bg-gray-700 border dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimesheetHoursReport;