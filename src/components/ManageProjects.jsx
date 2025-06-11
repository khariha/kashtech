import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "axios";
import API from "../api/config";
import Select from "react-select";

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
    });
    const [employees, setEmployees] = useState([]);
    const [rolesFromDB, setRolesFromDB] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [estimatedRoleHours, setEstimatedRoleHours] = useState("");
    const [selectedRoleEmployees, setSelectedRoleEmployees] = useState([]);
    const [roleAssignments, setRoleAssignments] = useState([]);
    const [editingRoleIndex, setEditingRoleIndex] = useState(null);
    const token = localStorage.getItem("token");


    useEffect(() => {
        if (companyId) {
            fetchProjects();
            fetchEmployees();
            fetchRoles();
        }
    }, [companyId]);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(API.PROJECTS_BY_COMPANY(companyId), {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(API.FETCH_ALL_EMPLOYEES, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await axios.get(API.FETCH_ROLES, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRolesFromDB(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch roles", err);
        }
    };


    const handleEdit = async (proj) => {
        const formatDate = (d) => {
            const dt = new Date(d);
            return isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0];
        };

        setEditingProject(proj);
        setFormData({
            project_name: proj.project_name,
            sow_id: proj.sow_id,
            current_status: proj.current_status,
            original_start_date: formatDate(proj.original_start_date),
            original_end_date: formatDate(proj.original_end_date),
            total_projected_hours: proj.total_projected_hours,
        });

        try {
            // ⚠️ IMPORTANT: Correct base URL (port 5000)
            const assignmentsUrl = `http://20.127.197.227:5000/api/projects/${proj.sow_id}/assignments`;

            const [assignRes, empRes, roleRes] = await Promise.all([
                axios.get(assignmentsUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(API.FETCH_ALL_EMPLOYEES, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(API.FETCH_ROLES, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const employeesList = empRes.data;
            const rolesList = roleRes.data;

            const assignmentData = (assignRes.data || []).map(r => ({
                role_id: +r.role_id,
                role_name: r.role_name,
                estimated_hours: +r.estimated_hours,
                employees: (r.employees || []).map(e => +e),
            }));

            setEmployees(employeesList);
            setRolesFromDB(rolesList);
            setRoleAssignments(assignmentData);

            if (assignmentData.length > 0) {
                const first = assignmentData[0];
                setSelectedRoleId(first.role_id);
                setEstimatedRoleHours(first.estimated_hours.toString());

                const mapped = first.employees.map(empId => {
                    const e = employeesList.find(x => x.emp_id === empId);
                    return e ? { value: e.emp_id, label: `${e.first_name} ${e.last_name}` } : null;
                }).filter(Boolean);

                setSelectedRoleEmployees(mapped);
                setEditingRoleIndex(0);
            } else {
                setSelectedRoleId(null);
                setEstimatedRoleHours("");
                setSelectedRoleEmployees([]);
                setEditingRoleIndex(null);
            }

        } catch (err) {
            console.error("Error loading role assignments:", err);
            alert("Couldn't load project roles – check console/network for issues.");
        }
    };





    useEffect(() => {
        console.log("Current roleAssignments", roleAssignments);
    }, [roleAssignments]);


    const handleDelete = async (sow_id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        try {
            await axios.delete(API.GET_PROJECT_BY_SOW_ID(sow_id), {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProjects();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Session expired. Please log in again.");
            return;
        }

        const requiredFields = ['project_name', 'sow_id', 'original_start_date', 'original_end_date'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in ${field.replaceAll('_', ' ')}`);
                return;
            }
        }

        try {
            const payload = { ...formData, company_id: companyId };

            if (editingProject) {
                await axios.put(API.GET_PROJECT_BY_SOW_ID(formData.sow_id), payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(API.GET_ALL_PROJECTS, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            // ✅ DEBUG LOG
            console.log("Submitting roleAssignments:", roleAssignments);

            for (const role of roleAssignments) {
                // Save Role
                await axios.post("/api/projects/assign-role", {
                    sow_id: formData.sow_id,
                    role_id: role.role_id,
                    estimated_hours: role.estimated_hours,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Save Assigned Employees
                for (const emp_id of role.employees) {
                    await axios.post("/api/projects/assign-employee", {
                        sow_id: formData.sow_id,
                        emp_id,
                        role_id: role.role_id,
                    }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }
            }

            await fetchProjects();
            resetForm();
        } catch (err) {
            console.error("Save failed:", err.response?.data || err);
            alert("Save failed. Check console.");
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
        });
        setEditingProject(null);
        setRoleAssignments([]);
        setSelectedRoleId("");
        setEstimatedRoleHours("");
        setSelectedRoleEmployees([]);
    };

    const handleAddRole = () => {
        if (!selectedRoleId || !estimatedRoleHours || selectedRoleEmployees.length === 0) return;

        const roleId = parseInt(selectedRoleId);
        const role = rolesFromDB.find((r) => r.role_id === roleId);
        if (!role) return;

        const updatedRole = {
            role_id: roleId,
            role_name: role.role_name,
            estimated_hours: parseInt(estimatedRoleHours),
            employees: selectedRoleEmployees.map(e => e.value),
        };

        const updatedAssignments = [...roleAssignments];

        if (editingRoleIndex !== null && editingRoleIndex >= 0) {
            updatedAssignments[editingRoleIndex] = updatedRole;
        } else {
            if (roleAssignments.some((r) => r.role_id === roleId)) return;
            updatedAssignments.push(updatedRole);
        }

        setRoleAssignments(updatedAssignments);
        setSelectedRoleId("");
        setEstimatedRoleHours("");
        setSelectedRoleEmployees([]);
        setEditingRoleIndex(null);
    };


    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-[1100px] p-8 relative shadow-lg overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <FaTimes />
                </button>
                <h2 className="text-2xl font-bold text-purple-800 mb-4">Manage Projects for {companyName}</h2>

                <div className="grid grid-cols-2 gap-8">
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

                    <div>
                        <div className="mb-2">
                            <label className="block text-sm mb-1">*Project Name</label>
                            <input value={formData.project_name} onChange={(e) => setFormData({ ...formData, project_name: e.target.value })} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                                <label className="block text-sm mb-1">*SOW ID</label>
                                <input value={formData.sow_id} disabled={!!editingProject} onChange={(e) => setFormData({ ...formData, sow_id: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Project Status</label>
                                <select value={formData.current_status} onChange={(e) => setFormData({ ...formData, current_status: e.target.value })} className="w-full border rounded px-3 py-2">
                                    <option value="Active">Active</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                                <label className="block text-sm mb-1">*Start Date</label>
                                <input type="date" value={formData.original_start_date} onChange={(e) => setFormData({ ...formData, original_start_date: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">*End Date</label>
                                <input type="date" value={formData.original_end_date} onChange={(e) => setFormData({ ...formData, original_end_date: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm mb-1">Estimated Hours</label>
                            <input type="number" value={formData.total_projected_hours} onChange={(e) => setFormData({ ...formData, total_projected_hours: e.target.value })} className="w-full border rounded px-3 py-2" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-1">Assign Roles</label>
                            <div className="flex gap-2 mb-2">
                                <select
                                    value={selectedRoleId ?? ""}
                                    onChange={(e) => setSelectedRoleId(parseInt(e.target.value))}
                                    className="w-1/2 border rounded px-3 py-2"
                                >
                                    <option value="">Select Role</option>
                                    {rolesFromDB.map(role => (
                                        <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    placeholder="Estimated Hours"
                                    value={estimatedRoleHours}
                                    onChange={(e) => setEstimatedRoleHours(e.target.value)}
                                    className="w-1/3 border rounded px-3 py-2"
                                />
                            </div>

                            <label className="block text-sm mb-1">Select Employees</label>
                            <Select
                                isMulti
                                value={selectedRoleEmployees}
                                onChange={(selected) => setSelectedRoleEmployees(selected)}
                                options={employees.map(emp => ({
                                    value: emp.emp_id,
                                    label: `${emp.first_name} ${emp.last_name}`
                                }))}
                                className="mb-2"
                            />

                            <button onClick={handleAddRole} className="bg-purple-600 text-white px-4 py-2 rounded">+ Add</button>
                        </div>
                        {Array.isArray(roleAssignments) && roleAssignments.length > 0 ? (
                            roleAssignments.map((role, index) => (
                                <div key={`${role.role_id}-${index}`} className="mb-3 border p-3 rounded bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold">{role.role_name || `Role ID ${role.role_id}`}</div>
                                        <button
                                            onClick={async () => {
                                                if (editingProject) {
                                                    const confirm = window.confirm(`Remove role ${role.role_name}?`);
                                                    if (!confirm) return;

                                                    try {
                                                        await axios.delete(`/api/projects/${formData.sow_id}/role/${role.role_id}`, {
                                                            headers: { Authorization: `Bearer ${token}` },
                                                        });
                                                    } catch (err) {
                                                        console.error("Failed to remove role from backend:", err);
                                                        alert("Failed to remove role. Please try again.");
                                                        return;
                                                    }
                                                }

                                                const updated = [...roleAssignments];
                                                updated.splice(index, 1);
                                                setRoleAssignments(updated);
                                            }}
                                            className="text-red-600 hover:underline text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-2">
                                        <label className="text-sm text-gray-600 w-32">Estimated Hours</label>
                                        <input
                                            type="number"
                                            className="border px-2 py-1 rounded w-32 text-sm"
                                            value={role.estimated_hours}
                                            onChange={(e) => {
                                                const updated = [...roleAssignments];
                                                updated[index].estimated_hours = parseInt(e.target.value) || 0;
                                                setRoleAssignments(updated);
                                            }}
                                        />
                                    </div>

                                    <div className="mb-2">
                                        <label className="text-sm text-gray-600">Assigned Employees</label>
                                        <Select
                                            isMulti
                                            value={role.employees
                                                .map(empId => {
                                                    const emp = employees.find(e => e.emp_id === empId);
                                                    return emp ? { value: emp.emp_id, label: `${emp.first_name} ${emp.last_name}` } : null;
                                                })
                                                .filter(Boolean)}
                                            onChange={(selected) => {
                                                const updated = [...roleAssignments];
                                                updated[index].employees = selected.map(opt => opt.value);
                                                setRoleAssignments(updated);
                                            }}
                                            options={employees.map(emp => ({
                                                value: emp.emp_id,
                                                label: `${emp.first_name} ${emp.last_name}`,
                                            }))}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500 italic">No roles assigned yet.</div>
                        )}



                        <div className="text-right mt-4">
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
