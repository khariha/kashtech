import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSearch, FaPlus, FaFileContract } from "react-icons/fa";
import EditClient from "../components/EditClient";
import AddClient from "../components/AddClient";
import ManageProjects from "../components/ManageProjects";
import API from "../api/config";
import { ClipLoader } from "react-spinners";

const ITEMS_PER_PAGE = 10;

const ManageClients = () => {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [editingClient, setEditingClient] = useState(null);
    const [expandedClient, setExpandedClient] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [selectedCompanyName, setSelectedCompanyName] = useState(null);
    const [loadingCompanyId, setLoadingCompanyId] = useState(null);

    // ✅ New for dynamic SOW options
    const [servicesInput, setServicesInput] = useState("Software Development, Integration");
    const [startDateInput, setStartDateInput] = useState(new Date().toISOString().substr(0, 10));
    const [endDateInput, setEndDateInput] = useState(
        new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().substr(0, 10)
    );

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(API.FETCH_MANAGE_CLIENTS, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setClients(res.data);
        } catch (err) {
            console.error("Error fetching clients", err);
        }
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedClients = [...clients].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        return typeof aVal === "string"
            ? (sortConfig.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal))
            : (sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal);
    });

    const filteredClients = sortedClients.filter((c) =>
        c.company_name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleManageProjects = (companyId, companyName) => {
        setSelectedCompanyId(companyId);
        setSelectedCompanyName(companyName);
        setShowProjectModal(true);
    };

    const generateSOW = async (client) => {
        try {
            setLoadingCompanyId(client.company_id);
            const token = localStorage.getItem("token");
            const res = await axios.post("/api/openai/generate-sow", {
                companyName: client.company_name,
                industry: client.industry,
                services: servicesInput,
                startDate: startDateInput,
                endDate: endDateInput,
            }, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `SOW_${client.company_name.replace(/\s+/g, "_")}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("❌ Failed to generate SOW", err);
            alert("Failed to generate SOW. Please check your API or OpenAI settings.");
        } finally {
            setLoadingCompanyId(null);
        }
    };

    return (
        <div className="p-6 relative">
            {/* Heading + Add Client Button */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-purple-900 dark:text-white">Manage Clients</h1>
                <button
                    className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-orange-600 text-sm flex items-center gap-2"
                    onClick={() => setShowAddModal(true)}
                >
                    <FaPlus /> Add Client
                </button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <div className="relative w-72">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Clients"
                        className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-full text-sm dark:bg-[#2b2b3c] dark:text-white dark:border-gray-500"
                    />
                </div>

                {/* ✅ New dynamic fields */}
                <input
                    type="text"
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                    placeholder="Services"
                    className="border border-gray-300 px-4 py-2 rounded text-sm dark:bg-[#2b2b3c] dark:text-white dark:border-gray-500"
                />
                <input
                    type="date"
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded text-sm dark:bg-[#2b2b3c] dark:text-white dark:border-gray-500"
                />
                <input
                    type="date"
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded text-sm dark:bg-[#2b2b3c] dark:text-white dark:border-gray-500"
                />
            </div>
            {/* Table */}
            <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-full text-sm">
                    <thead className="bg-purple-100 dark:bg-purple-800 text-gray-800 dark:text-white">
                        <tr>
                            <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("company_name")}>Company Name</th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("company_id")}>Company ID</th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("industry")}>Industry</th>
                            <th className="p-3 text-center">Active/Total Projects</th>
                            <th className="p-3 text-center">Actions</th>
                            <th className="p-3 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-white">
                        {paginatedClients.map((client) => {
                            const isExpanded = expandedClient?.company_id === client.company_id;

                            return (
                                <React.Fragment key={client.company_id}>
                                    <tr className="border-t">
                                        <td className="p-3">{client.company_name}</td>
                                        <td className="p-3 text-center">{client.company_id}</td>
                                        <td className="p-3 text-center">{client.industry || "N/A"}</td>
                                        <td className="p-3 text-center">{client.active_projects} / {client.total_projects}</td>
                                        <td className="p-3 text-center flex flex-col items-center gap-2">
                                            <button
                                                onClick={() => setEditingClient(client)}
                                                className="text-xs flex items-center gap-1 text-purple-700 hover:text-purple-900"
                                            >
                                                <FaEdit /> Edit
                                            </button>

                                            <button
                                                onClick={() => generateSOW(client)}
                                                className="text-xs flex items-center gap-1 text-green-600 hover:text-green-800"
                                                disabled={loadingCompanyId === client.company_id}
                                            >
                                                {loadingCompanyId === client.company_id ? (
                                                    <>
                                                        <ClipLoader size={16} color="#22c55e" /> Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaFileContract /> Generate SOW
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => setExpandedClient(isExpanded ? null : client)}
                                                className="text-xs text-purple-700 hover:underline flex items-center gap-1"
                                            >
                                                {isExpanded ? "− Less Info" : "+ More Info"}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expand Row */}
                                    {isExpanded && (
                                        <tr className="bg-purple-50 dark:bg-[#2b2b3c] text-sm">
                                            <td colSpan="6" className="p-4">
                                                <div className="grid grid-cols-4 gap-4">
                                                    {/* Address */}
                                                    <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                                                        <h4 className="font-semibold mb-2 text-purple-900 dark:text-white">Address</h4>
                                                        <p className="text-gray-700 dark:text-gray-300">
                                                            {client.address_line1 || "N/A"}{client.address_line2 && `, ${client.address_line2}`}
                                                            <br />
                                                            {client.city || ""}, {client.state || ""}<br />
                                                            {client.country || ""} - {client.zipcode || ""}
                                                        </p>
                                                    </div>

                                                    {/* Admins */}
                                                    <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                                                        <h4 className="font-semibold mb-2 text-purple-900 dark:text-white">Admins</h4>
                                                        {client.admins?.length ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {client.admins.map((admin, idx) => (
                                                                    <span key={idx} className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-xs">
                                                                        {admin}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500">N/A</p>
                                                        )}
                                                    </div>

                                                    {/* Projects */}
                                                    <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="font-semibold text-purple-900 dark:text-white">Projects</h4>
                                                            <button
                                                                onClick={() => handleManageProjects(client.company_id, client.company_name)}
                                                                className="text-xs bg-purple-800 text-white px-3 py-1 rounded-full hover:bg-purple-900"
                                                            >
                                                                Manage Projects
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {client.projects?.length ? client.projects.map((proj, idx) => (
                                                                <span key={idx} className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full">
                                                                    {proj}
                                                                </span>
                                                            )) : <p className="text-gray-500">No Projects</p>}
                                                        </div>
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
            {/* Table */}
            <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-full text-sm">
                    <thead className="bg-purple-100 dark:bg-purple-800 text-gray-800 dark:text-white">
                        <tr>
                            <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("company_name")}>Company Name</th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("company_id")}>Company ID</th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("industry")}>Industry</th>
                            <th className="p-3 text-center">Active/Total Projects</th>
                            <th className="p-3 text-center">Actions</th>
                            <th className="p-3 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-white">
                        {paginatedClients.map((client) => {
                            const isExpanded = expandedClient?.company_id === client.company_id;

                            return (
                                <React.Fragment key={client.company_id}>
                                    <tr className="border-t">
                                        <td className="p-3">{client.company_name}</td>
                                        <td className="p-3 text-center">{client.company_id}</td>
                                        <td className="p-3 text-center">{client.industry || "N/A"}</td>
                                        <td className="p-3 text-center">{client.active_projects} / {client.total_projects}</td>
                                        <td className="p-3 text-center flex flex-col items-center gap-2">
                                            <button
                                                onClick={() => setEditingClient(client)}
                                                className="text-xs flex items-center gap-1 text-purple-700 hover:text-purple-900"
                                            >
                                                <FaEdit /> Edit
                                            </button>

                                            <button
                                                onClick={() => generateSOW(client)}
                                                className="text-xs flex items-center gap-1 text-green-600 hover:text-green-800"
                                                disabled={loadingCompanyId === client.company_id}
                                            >
                                                {loadingCompanyId === client.company_id ? (
                                                    <>
                                                        <ClipLoader size={16} color="#22c55e" /> Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaFileContract /> Generate SOW
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => setExpandedClient(isExpanded ? null : client)}
                                                className="text-xs text-purple-700 hover:underline flex items-center gap-1"
                                            >
                                                {isExpanded ? "− Less Info" : "+ More Info"}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expand Row */}
                                    {isExpanded && (
                                        <tr className="bg-purple-50 dark:bg-[#2b2b3c] text-sm">
                                            <td colSpan="6" className="p-4">
                                                <div className="grid grid-cols-4 gap-4">
                                                    {/* Address */}
                                                    <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                                                        <h4 className="font-semibold mb-2 text-purple-900 dark:text-white">Address</h4>
                                                        <p className="text-gray-700 dark:text-gray-300">
                                                            {client.address_line1 || "N/A"}{client.address_line2 && `, ${client.address_line2}`}
                                                            <br />
                                                            {client.city || ""}, {client.state || ""}<br />
                                                            {client.country || ""} - {client.zipcode || ""}
                                                        </p>
                                                    </div>

                                                    {/* Admins */}
                                                    <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                                                        <h4 className="font-semibold mb-2 text-purple-900 dark:text-white">Admins</h4>
                                                        {client.admins?.length ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {client.admins.map((admin, idx) => (
                                                                    <span key={idx} className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-xs">
                                                                        {admin}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500">N/A</p>
                                                        )}
                                                    </div>

                                                    {/* Projects */}
                                                    <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="font-semibold text-purple-900 dark:text-white">Projects</h4>
                                                            <button
                                                                onClick={() => handleManageProjects(client.company_id, client.company_name)}
                                                                className="text-xs bg-purple-800 text-white px-3 py-1 rounded-full hover:bg-purple-900"
                                                            >
                                                                Manage Projects
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {client.projects?.length ? client.projects.map((proj, idx) => (
                                                                <span key={idx} className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full">
                                                                    {proj}
                                                                </span>
                                                            )) : <p className="text-gray-500">No Projects</p>}
                                                        </div>
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
            <div className="flex justify-between mt-4 items-center">
                <p className="text-sm text-gray-600 dark:text-white">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modals */}
            {editingClient && (
                <EditClient
                    client={editingClient}
                    onClose={() => setEditingClient(null)}
                    onUpdate={() => {
                        fetchClients();
                        setEditingClient(null);
                    }}
                />
            )}

            {showAddModal && (
                <AddClient
                    onClose={() => setShowAddModal(false)}
                    onAdd={() => {
                        setShowAddModal(false);
                        fetchClients();
                    }}
                />
            )}

            {showProjectModal && (
                <ManageProjects
                    companyId={selectedCompanyId}
                    companyName={selectedCompanyName}
                    onClose={() => setShowProjectModal(false)}
                />
            )}
        </div>
    );
};

export default ManageClients;
