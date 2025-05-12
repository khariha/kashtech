import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API from "../api/config";

const TimesheetReport = () => {
    const [reportData, setReportData] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [visibleNotes, setVisibleNotes] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    const [filterOption, setFilterOption] = useState("monthToDate");
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const fetchReport = async () => {
        try {
            let url = API.TIMESHEET_REPORT;
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

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setReportData(res.data);
            setCurrentPage(1); // Reset to first page
        } catch (err) {
            console.error("❌ Failed to fetch report data", err);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filterOption, customStartDate, customEndDate]);

    const toggleRow = (idx) => {
        setExpandedRows((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
        setVisibleNotes((prev) => prev.filter((i) => i !== idx));
    };

    const toggleNotes = (idx) => {
        setVisibleNotes((prev) =>
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
        const aVal = sortConfig.key === "period_start_date"
            ? new Date(a[sortConfig.key])
            : (a[sortConfig.key] || "").toString().toLowerCase();

        const bVal = sortConfig.key === "period_start_date"
            ? new Date(b[sortConfig.key])
            : (b[sortConfig.key] || "").toString().toLowerCase();

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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer]), "timesheet_report.xlsx");
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-white px-6 py-6">
            <h2 className="text-4xl font-bold mb-6 text-purple-900 dark:text-white">
             Timesheet Report by Weekly Hours
            </h2>
            <div className="flex justify-between items-center mb-6 flex-wrap">
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
                        <div className="flex items-center gap-2">
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
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                    <CSVLink
                        data={reportData}
                        filename="timesheet_report.csv"
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
                        className="bg-[#F97316] hover:bg-[#ea670a] text-white font-bold py-2 px-5 rounded-full text-sm shadow-sm transition-all"
                    >
                        + Add Timesheet
                    </button>
                </div>
            </div>

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
                        {currentData.map((row, idx) => {
                            const isExpanded = expandedRows.includes(idx);
                            const showNote = visibleNotes.includes(idx);
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
                                            <button
                                                onClick={() => {
                                                    localStorage.setItem("edit_emp_id", row.emp_id);
                                                    localStorage.setItem("edit_week_start", row.period_start_date);
                                                    navigate("/manage-timesheet");
                                                }}
                                                className="text-xs flex items-center gap-1 text-purple-700 hover:text-purple-900 mx-auto"
                                            >
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
                                                        <div><strong>Work Area:</strong> {row.work_area || "—"}</div>
                                                        <div><strong>Task Area:</strong> {row.task_area || "—"}</div>
                                                        <div><strong>Ticket No.:</strong> {row.ticket_num || "—"}</div>
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

                                                    <div className="flex flex-col justify-start mt-3">
                                                        <button
                                                            onClick={() => toggleNotes(idx)}
                                                            className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold px-3 py-1 rounded mb-2"
                                                        >
                                                            {showNote ? "Hide Notes" : "View Notes"}
                                                        </button>

                                                        {showNote && (
                                                            <div className="text-sm italic text-gray-800 dark:text-gray-200">
                                                                {row.notes || "No notes provided."}
                                                            </div>
                                                        )}
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

            {/* Pagination */}
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

export default TimesheetReport;
