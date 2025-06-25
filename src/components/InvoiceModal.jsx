import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import API from "../api/config";

const InvoiceModal = ({ onClose, onInvoiceSaved }) => {

    const [companies, setCompanies] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [dueDate, setDueDate] = useState(null);
    const [taxRate, setTaxRate] = useState(0);
    const [groupedData, setGroupedData] = useState({});
    const [expandedUser, setExpandedUser] = useState({});

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(API.GET_ALL_COMPANIES_INVOICE, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (Array.isArray(res.data)) {
                    console.log("✅ Companies loaded:", res.data);
                    setCompanies(res.data);
                } else {
                    console.warn("⚠️ Unexpected companies response:", res.data);
                    setCompanies([]);
                }
            } catch (err) {
                console.error("❌ Error loading companies", err);
            }
        };
        fetchCompanies();
    }, []);

    const handleCompanyChange = async (companyIdRaw) => {
        const companyId = companyIdRaw; // ← fix here: don't cast to Number
        setSelectedCompany(companyId);
        setSelectedProjects([]);
        setGroupedData({});

        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(API.GET_PROJECTS_BY_COMPANY_INVOICE(companyId), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (Array.isArray(res.data)) {
                console.log("✅ Projects for company:", res.data);
                setProjects(res.data);
            } else {
                console.warn("⚠️ Unexpected projects response:", res.data);
                setProjects([]);
            }
        } catch (err) {
            console.error("❌ Failed to fetch projects", err);
        }
    };




    const applyFilters = async () => {
        if (!selectedCompany || !startDate || !endDate || selectedProjects.length === 0) {
            alert("Please select Company, Project(s), Start Date and End Date.");
            return;
        }

        const token = localStorage.getItem("token");
        const projectIds = selectedProjects.map((p) => p.value);

        try {
            const res = await axios.get(API.GET_INVOICE_TIMESHEET_DATA, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    companyId: selectedCompany,
                    projectIds: projectIds.join(","),
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            });
            groupDataByProject(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch invoice data", err);
            alert("Error: " + (err.response?.data?.error || "Unable to load invoice data"));
        }
    };

    const groupDataByProject = (data) => {
        const grouped = {};
        data.forEach((item) => {
            const key = item.project_name || "Project";
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({
                ...item,
                rate: parseFloat(item.rate) || 0,  // ✅ Use actual rate from backend
                sow_id: item.sow_id
            });
        });
        setGroupedData(grouped);
    };

    const handleRateChange = (projectKey, index, rate) => {
        const updated = { ...groupedData };
        updated[projectKey][index].rate = rate;
        setGroupedData(updated);
    };

    const calculateAmount = (hours, rate) => {
        const h = parseFloat(hours || 0);
        const r = parseFloat(rate || 0);
        return (h * r).toFixed(2);
    };

    const calculateProjectTotal = (rows) => {
        return rows.reduce((sum, row) => sum + parseFloat(row.hours || 0) * parseFloat(row.rate || 0), 0).toFixed(2);
    };

    const calculateInvoiceTotal = () => {
        const subtotal = Object.values(groupedData).flat().reduce((sum, row) => {
            return sum + parseFloat(row.hours || 0) * parseFloat(row.rate || 0);
        }, 0);
        const taxAmount = (subtotal * parseFloat(taxRate || 0)) / 100;
        return (subtotal + taxAmount).toFixed(2);
    };

    const toggleExpand = (projectKey, emp_id) => {
        const key = `${projectKey}_${emp_id}`;
        setExpandedUser((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const [saving, setSaving] = useState(false);
    const handleSave = async () => {
        if (!selectedCompany || !selectedProjects.length || !startDate || !endDate || !dueDate) {
            alert("Please fill all mandatory fields.");
            return;
        }

        const safeGroupedData = groupedData && typeof groupedData === 'object' ? groupedData : {};
        const details = Object.entries(safeGroupedData).flatMap(([projectKey, rows]) =>
            Array.isArray(rows)
                ? rows.map(row => ({
                    emp_id: row.emp_id,
                    sow_id: row.sow_id,
                    rate: parseFloat(row.rate || 0),
                    total_hrs: parseFloat(row.hours || 0),
                    amount: parseFloat(calculateAmount(row.hours, row.rate)),
                    resource_role: row.role,
                    sub_assignment_title: row.work_area,
                    sub_assignment_segment1: row.task_area
                }))
                : []
        );

        if (details.length === 0) {
            alert("No invoice data to save. Make sure to apply filters and enter rates.");
            return;
        }

        const payload = {
            company_id: selectedCompany,
            attention_to: "",
            invoice_num: `INV-${Date.now()}`,
            invoice_period_start: startDate.toISOString(),
            invoice_period_end: endDate.toISOString(),
            due_date: dueDate.toISOString(),
            tax_rate: parseFloat(taxRate),
            internal_notes: "",
            external_notes: "",
            grand_total: parseFloat(calculateInvoiceTotal()),
            details
        };

        console.log("🟢 Sending payload:", payload);

        setSaving(true);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(API.CREATE_INVOICE, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.data || !res.data.invoice_id) {
                throw new Error("Server did not return expected response.");
            }

            console.log("✅ Invoice saved", res.data);
            alert("Invoice saved successfully!");

            // Reset form state
            setSelectedCompany("");
            setSelectedProjects([]);
            setStartDate(null);
            setEndDate(null);
            setDueDate(null);
            setTaxRate(0);
            setGroupedData({});
            setExpandedUser({});
            setSaving(false);

            // Callback triggers
            onInvoiceSaved?.();
            onClose?.();

        } catch (err) {
            console.error("❌ Failed to save invoice:", err);
            alert("Failed to save invoice: " + (err.response?.data?.error || err.message));
            setSaving(false);
        }
    };




    const handleDelete = () => {
        alert("Deleting invoice...");
    };

    return (
        <div className="p-6 bg-white min-h-screen">
            <h2 className="text-xl font-bold text-purple-900 mb-4">ADD Invoice</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-semibold mb-1">Company</label>
                    <select className="w-full border rounded px-3 py-2" value={selectedCompany} onChange={(e) => handleCompanyChange(e.target.value)}>
                        <option value="">Select Company</option>
                        {(Array.isArray(companies) ? companies : []).map((c) => (
                            <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Project</label>
                    <Select
                        isMulti
                        options={(Array.isArray(projects) ? projects : []).map((p) => ({
                            label: `${p.project_name}`,
                            value: p.sow_id,
                        }))}

                        value={selectedProjects}
                        onChange={(opts) => setSelectedProjects(opts)}
                    />
                </div>

                <div className="flex gap-2">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Start Date</label>
                        <DatePicker selected={startDate} onChange={setStartDate} className="border px-2 py-1 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">End Date</label>
                        <DatePicker selected={endDate} onChange={setEndDate} className="border px-2 py-1 rounded" />
                    </div>
                    <div className="flex items-end">
                        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={applyFilters}>Apply Filters</button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedData).map(([projectKey, rows]) => {
                    const groupedByUser = rows.reduce((acc, row) => {
                        const userKey = `${row.emp_id}_${row.first_name}_${row.last_name}`;
                        if (!acc[userKey]) acc[userKey] = [];
                        acc[userKey].push(row);
                        return acc;
                    }, {});
                    return (
                        <div key={projectKey} className="bg-white rounded shadow p-4">
                            <h3 className="font-bold text-gray-700 text-lg mb-4">{projectKey}</h3>
                            {Object.entries(groupedByUser).map(([userKey, userRows]) => {
                                const [emp_id, first, last] = userKey.split("_");
                                const fullKey = `${projectKey}_${emp_id}`;
                                return (
                                    <div key={userKey} className="mb-2">
                                        <div
                                            onClick={() => toggleExpand(projectKey, emp_id)}
                                            className="cursor-pointer bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200 flex justify-between"
                                        >
                                            <span>{`${first} ${last}`}</span>
                                            <span>{userRows[0].role}</span>
                                        </div>
                                        {expandedUser[fullKey] && (
                                            <div className="mt-2 space-y-2">
                                                <div className="grid grid-cols-7 text-sm font-bold px-2">
                                                    <div>Name</div>
                                                    <div>Work Area</div>
                                                    <div>Task</div>
                                                    <div>Role</div>
                                                    <div>Hours</div>
                                                    <div>Rate (/hr)</div>
                                                    <div>Amount</div>
                                                </div>
                                                {userRows.map((row, rowIndex) => (
                                                    <div key={rowIndex} className="grid grid-cols-7 text-sm items-center px-2 border-b py-1">
                                                        <div>{row.first_name} {row.last_name}</div>
                                                        <div>{row.work_area}</div>
                                                        <div>{row.task_area}</div>
                                                        <div>{row.role}</div>
                                                        <div>{row.hours}</div>
                                                        <input
                                                            type="number"
                                                            className="border px-2 py-1"
                                                            value={row.rate}
                                                            onChange={(e) => handleRateChange(projectKey, rows.indexOf(row), e.target.value)}
                                                        />
                                                        <div>${calculateAmount(row.hours, row.rate)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="text-right mt-2 font-bold text-green-700">
                                            Project Subtotal: ${calculateProjectTotal(userRows)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Invoice Bottom Section */}
            <div className="mt-8 border-t pt-4 grid grid-cols-4 gap-4 items-center">
                <div>
                    <label className="block text-sm font-semibold mb-1">Due Date *</label>
                    <DatePicker selected={dueDate} onChange={setDueDate} className="border px-2 py-1 rounded w-full" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Tax Rate (%) *</label>
                    <input
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>
                <div className="text-lg font-bold text-right col-span-2">
                    Invoice Total: ${calculateInvoiceTotal()}
                </div>
            </div>

            <div className="text-right mt-4 space-x-4">
                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save"}
                </button>

            </div>
        </div>
    );
};

export default InvoiceModal;
