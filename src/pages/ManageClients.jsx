import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSearch, FaPlus } from "react-icons/fa";
import EditClient from "../components/EditClient";
import AddClient from "../components/AddClient";
import ManageProjects from "../components/ManageProjects";
import API from "../api/config";

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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-purple-900 dark:text-white">Manage Clients</h1>
                <button
                    className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-orange-600 text-sm flex items-center gap-2"
                    onClick={() => setShowAddModal(true)}
                >
                    <FaPlus /> Add Client
                </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
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
                <button className="border border-gray-300 text-sm px-4 py-2 rounded-full text-gray-700 dark:text-white dark:border-gray-500">
                    Filters
                </button>
            </div>

            <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-full text-sm">
                    <thead className="bg-purple-100 dark:bg-purple-800 text-gray-800 dark:text-white">
                        <tr>
                            <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("company_name")}>Company Name</th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("company_id")}>Company ID</th>
                            <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("industry")}>Industry</th>
                            <th className="p-3 text-center">Active Projects/Total Projects</th>
                            <th className="p-3 text-center">Action</th>
                            <th className="p-3 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-white">
                        {paginatedClients.map((client, idx) => {
                            const isExpanded = expandedClient?.company_id === client.company_id;

                            return (
                                <React.Fragment key={client.company_id || idx}>
                                    <tr className="border-t">
                                        <td className="p-3 text-left">{client.company_name}</td>
                                        <td className="p-3 text-center">{client.company_id}</td>
                                        <td className="p-3 text-center">{client.industry || "N/A"}</td>
                                        <td className="p-3 text-center text-green-600 font-semibold">
                                            {client.active_projects} Active / {client.total_projects} Total
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => setEditingClient(client)}
                                                className="text-xs flex items-center gap-1 text-purple-700 hover:text-purple-900"
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => setExpandedClient(isExpanded ? null : client)}
                                                className="text-xs text-purple-700 hover:underline flex items-center gap-1"
                                            >
                                                <span className="text-lg">{isExpanded ? "−" : "+"}</span> {isExpanded ? "Less Info" : "More Info"}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-purple-50 dark:bg-[#2b2b3c] text-sm transition-all">
                                            <td colSpan="6" className="p-4">
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border col-span-1">
                                                        <h4 className="font-semibold text-purple-900 dark:text-white mb-2">Address</h4>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            {client.address_line1 || "N/A"}{client.address_line2 ? `, ${client.address_line2}` : ""}<br />
                                                            {client.city || ""}, {client.state || ""},<br />
                                                            {client.country || ""} - {client.zipcode || ""}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border col-span-1">
                                                        <h4 className="font-semibold text-purple-900 dark:text-white mb-2">Admins</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {client.admins?.length ? client.admins.map((admin, idx) => (
                                                                <span key={idx} className="px-3 py-1 text-xs bg-purple-200 text-purple-900 rounded-full">
                                                                    {admin}
                                                                </span>
                                                            )) : <p className="text-sm text-gray-500">N/A</p>}
                                                        </div>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border col-span-1">
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
                                                                <span key={idx} className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-white">
                                                                    {proj}
                                                                </span>
                                                            )) : <p className="text-sm text-gray-500">No Projects</p>}
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
