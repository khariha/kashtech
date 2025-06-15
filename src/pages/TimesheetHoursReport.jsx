// ✅ Final Updated TimesheetHoursReport.jsx With Filter Functionality Like TimesheetReport

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
    const [showFilters, setShowFilters] = useState(false);

    const [selectedClients, setSelectedClients] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [isBillable, setIsBillable] = useState(true);
    const [isNonBillable, setIsNonBillable] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);

    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const itemsPerPage = 15;

    useEffect(() => {
        fetchReport();
    }, [filterOption, customStartDate, customEndDate]);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(API.GET_ALL_EMPLOYEES, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ❗ Check for unexpected HTML response (e.g., session expired)
            if (res.headers["content-type"]?.includes("text/html")) {
                console.warn("⚠️ Received HTML instead of JSON. Possible session timeout.");
                alert("Session may have expired. Please log in again.");
                return;
            }

            const getFullName = (emp) => {
                const first = typeof emp?.first_name === "string" ? emp.first_name : "";
                const last = typeof emp?.last_name === "string" ? emp.last_name : "";
                return `${first} ${last}`.trim();
            };

            const filteredEmps = Array.isArray(res.data)
                ? res.data.filter(emp => emp && (emp.first_name || emp.last_name))
                : [];

            const sortedEmps = filteredEmps.sort((a, b) =>
                getFullName(a).localeCompare(getFullName(b))
            );

            console.log("✅ Employee List Loaded:", sortedEmps);
            setEmployeeList(sortedEmps);
        } catch (err) {
            console.error("❌ Failed to fetch employees", err);
        }
    };




    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchReport = async (customParams = {}) => {
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

            Object.assign(params, customParams);

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

    const applyFilters = () => {
        const params = {};

        if (selectedClients.length > 0) {
            params.clients = selectedClients.join(",");
        }

        if (selectedProjects.length > 0) {
            params.projects = selectedProjects.join(",");
        }

        if (selectedEmployees.length > 0) {
            params.employees = selectedEmployees.join(",");
        }

        if (isBillable && !isNonBillable) {
            params.billable = true;
        } else if (!isBillable && isNonBillable) {
            params.billable = false;
        }

        fetchReport(params);
        setShowFilters(false);
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

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-sm text-purple-800 underline hover:text-purple-900"
                    >
                        Other Filters
                    </button>

                    {showFilters && (
                        <div className="absolute z-50 top-full left-0 mt-2 w-[350px] bg-white border border-gray-300 rounded shadow p-6">
                            <div className="space-y-4">
                                <div>
                                    <label>
                                        <input type="checkbox" className="mr-2" checked={isBillable} onChange={() => setIsBillable(!isBillable)} /> Billable
                                    </label>
                                    <label className="ml-4">
                                        <input type="checkbox" className="mr-2" checked={isNonBillable} onChange={() => setIsNonBillable(!isNonBillable)} /> Non-Billable
                                    </label>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">Employees</label>
                                    <select
                                        className="w-full border px-2 py-1 text-sm rounded"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && !selectedEmployees.includes(val)) {
                                                setSelectedEmployees([...selectedEmployees, val]);
                                            }
                                            e.target.selectedIndex = 0;
                                        }}
                                    >
                                        <option value="">Select Employee</option>
                                        {employeeList.map((emp) => {
                                            const fullName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim();
                                            return (
                                                <option key={emp.emp_id} value={fullName}>{fullName}</option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        onClick={() => {
                                            setSelectedClients([]);
                                            setSelectedProjects([]);
                                            setSelectedEmployees([]);
                                            setIsBillable(true);
                                            setIsNonBillable(false);
                                        }}
                                        className="text-purple-600 text-sm underline"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={applyFilters}
                                        className="bg-purple-800 text-white px-4 py-1 rounded-full text-sm hover:bg-purple-900"
                                    >
                                        Show Results
                                    </button>
                                </div>
                            </div>
                        </div>
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

            <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
                <table className="w-full table-auto text-sm border-collapse">
                    <thead className="bg-purple-100 dark:bg-purple-900 text-left">
                        <tr>
                            {["employee_name", "company_name", "project_name", "work_area", "task_area", "ticket_num", "total_hours"].map((key) => (
                                <th
                                    key={key}
                                    className="py-3 px-4 font-semibold cursor-pointer"
                                    onClick={() => handleSort(key)}
                                >
                                    {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? (
                            currentData.map((row, idx) => (
                                <tr key={idx} className="border-b dark:border-gray-700">
                                    <td className="py-2 px-4">{row.employee_name || "-"}</td>
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
                                <td colSpan="7" className="text-center py-6">No data available</td>
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
                        className={`text-sm px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white dark:bg-gray-700 border dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`text-sm px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white dark:bg-gray-700 border dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimesheetHoursReport;
