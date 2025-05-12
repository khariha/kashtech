import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "axios";
import API from "../api/config";

const ManageProjects = ({ companyId, companyName, onClose }) => {
    const [projects, setProjects] = useState([]);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        project_name: "",
        sow_id: "",
        current_status: "Active",
        original_start_date: "",
        original_end_date: "",
        total_projected_hours: "",
        assigned_employees: [],
    });
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");

    useEffect(() => {
        if (companyId) {
            fetchProjects();
            fetchEmployees();
        }
    }, [companyId]);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(API.PROJECTS_BY_COMPANY(companyId), {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(API.FETCH_ALL_EMPLOYEES, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployees(res.data);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    const handleEdit = (proj) => {
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toISOString().split("T")[0]; // returns yyyy-mm-dd
        };

        setEditingProject(proj);
        setFormData({
            project_name: proj.project_name,
            sow_id: proj.sow_id,
            current_status: proj.current_status,
            original_start_date: formatDate(proj.original_start_date),
            original_end_date: formatDate(proj.original_end_date),
            total_projected_hours: proj.total_projected_hours,
            assigned_employees: proj.assigned_employees || [],
        });
    };


    const handleDelete = async (sow_id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (!confirmDelete) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(API.GET_PROJECT_BY_SOW_ID(sow_id), {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProjects();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...formData,
                company_id: companyId,
            };

            if (editingProject) {
                // Update existing
                await axios.put(API.GET_PROJECT_BY_SOW_ID(formData.sow_id), payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Create new
                await axios.post(API.GET_ALL_PROJECTS, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            fetchProjects();
            resetForm();
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const resetForm = () => {
        setFormData({
            project_name: "",
            sow_id: "",
            current_status: "Active",
            original_start_date: "",
            original_end_date: "",
            total_projected_hours: "",
            assigned_employees: [],
        });
        setEditingProject(null);
    };

    const handleAddEmployee = () => {
        if (selectedEmployee && !formData.assigned_employees.includes(selectedEmployee)) {
            setFormData({
                ...formData,
                assigned_employees: [...formData.assigned_employees, selectedEmployee],
            });
            setSelectedEmployee("");
        }
    };

    const handleRemoveEmployee = (emp) => {
        setFormData({
            ...formData,
            assigned_employees: formData.assigned_employees.filter((e) => e !== emp),
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-[1100px] p-8 relative shadow-lg">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <FaTimes />
                </button>

                <h2 className="text-2xl font-bold text-purple-800 mb-4">Manage Projects for {companyName}</h2>

                <div className="grid grid-cols-2 gap-8">
                    {/* Projects List */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-800">Select Project to Edit</h3>
                            <button onClick={resetForm} className="text-purple-600 font-medium">+ Add Project</button>
                        </div>
                        <ul className="bg-purple-50 p-3 rounded-lg h-[360px] overflow-auto">
                            {projects.map((proj, idx) => (
                                <li key={proj.sow_id} className="flex justify-between items-center mb-2 bg-white p-2 rounded shadow">
                                    <span>{idx + 1}. {proj.project_name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(proj)}>
                                            <FaEdit className="text-purple-600" />
                                        </button>
                                        <button onClick={() => handleDelete(proj.sow_id)}>
                                            <FaTrash className="text-red-600" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Form */}
                    <div>
                        <div className="mb-2">
                            <label className="block text-sm text-gray-700 mb-1">*Project Name</label>
                            <input
                                value={formData.project_name}
                                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">*SOW ID</label>
                                <input
                                    value={formData.sow_id}
                                    disabled={!!editingProject}
                                    onChange={(e) => setFormData({ ...formData, sow_id: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Project Status</label>
                                <select
                                    value={formData.current_status}
                                    onChange={(e) => setFormData({ ...formData, current_status: e.target.value })}
                                    className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                                >
                                    <option value="Active">Active</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">*Start Date</label>
                                <input
                                    type="date"
                                    value={formData.original_start_date}
                                    onChange={(e) => setFormData({ ...formData, original_start_date: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">*End Date</label>
                                <input
                                    type="date"
                                    value={formData.original_end_date}
                                    onChange={(e) => setFormData({ ...formData, original_end_date: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="block text-sm text-gray-700 mb-1">Estimated Hours</label>
                            <input
                                type="number"
                                value={formData.total_projected_hours}
                                onChange={(e) => setFormData({ ...formData, total_projected_hours: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div className="mb-2">
                            <label className="block text-sm text-gray-700 mb-1">Add Employee to Project</label>
                            <div className="flex gap-2 mb-2">
                                <select
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                    className="flex-1 border rounded px-3 py-2"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.kash_operations_usn} value={emp.kash_operations_usn}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={handleAddEmployee} className="bg-purple-600 text-white px-4 rounded">
                                    + Add
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {formData.assigned_employees.map((emp) => (
                                    <span key={emp} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center">
                                        {emp}
                                        <button onClick={() => handleRemoveEmployee(emp)} className="ml-2 text-red-500">
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 text-right">
                            <button onClick={handleSave} className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageProjects;
