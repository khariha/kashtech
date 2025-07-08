import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes, FaTrash, FaPlus } from "react-icons/fa";
import API from "../api/config";

const ManageAdmins = ({ companyId, companyName, onClose }) => {
    const [admins, setAdmins] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState("");
    const [selectedRole, setSelectedRole] = useState("Admin");

    useEffect(() => {
        fetchAdmins();
        fetchEmployees();
    }, [companyId]);

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem("token");

            // 1) get the admins already assigned to this company
            const res = await axios.get(
                `${API.GET_ADMINS_BY_COMPANY}/${companyId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const assigned = Array.isArray(res.data) ? res.data : [];
            // keep only Admin or Super Admin
            const filteredAssigned = assigned.filter(
                admin => admin.role === "Admin" || admin.role === "Super Admin"
            );

            // 2) fetch _all_ employees so we can find Super Admins
            const empRes = await axios.get(API.FETCH_ADMIN_EMPLOYEES, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allEmps = Array.isArray(empRes.data) ? empRes.data : [];

            // pick out Super Admins
            const superAdmins = allEmps.filter(emp => emp.role === "Super Admin");

            // 3) merge in any Super Admin not already in filteredAssigned
            const merged = [...filteredAssigned];
            superAdmins.forEach(sa => {
                if (!merged.some(a => a.kash_operations_usn === sa.kash_operations_usn)) {
                    merged.push({
                        kash_operations_usn: sa.kash_operations_usn,
                        full_name: sa.full_name,
                        role: sa.role,
                    });
                }
            });

            // optional: sort the final admins list A→Z as well
            merged.sort((a, b) =>
                (a.full_name || a.kash_operations_usn)
                    .localeCompare(b.full_name || b.kash_operations_usn)
            );

            setAdmins(merged);
        } catch (err) {
            console.error("❌ Failed to fetch admins", err);
            setAdmins([]);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(API.FETCH_ADMIN_EMPLOYEES, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // normalize
            let data = Array.isArray(res.data) ? res.data : [];

            // only include users whose role is exactly "Admin"
            const adminOnly = data.filter(emp => emp.role === "Admin");

            // sort A→Z by full_name
            adminOnly.sort((a, b) =>
                a.full_name.localeCompare(b.full_name)
            );

            setEmployees(adminOnly);
        } catch (err) {
            console.error("❌ Failed to fetch admin‐level employees", err);
        }
    };



    const addAdmin = async () => {
        if (!selectedAdmin) return;
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                API.ADD_COMPANY_ADMIN,
                { companyId, username: selectedAdmin }, // ✅ remove role
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSelectedAdmin("");
            fetchAdmins();
        } catch (err) {
            console.error("Failed to add admin", err);
            alert("❌ Failed to add admin");
        }
    };

    const deleteAdmin = async (username) => {
        const confirmDelete = window.confirm(`Are you sure you want to remove ${username} as an admin?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API.DELETE_COMPANY_ADMIN}/${companyId}/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchAdmins();
        } catch (err) {
            console.error("Failed to delete admin", err);
            alert("❌ Failed to delete admin");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white w-[600px] max-h-[90vh] rounded-xl p-6 overflow-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-xl font-semibold mb-4">Manage Admins for {companyName}</h2>

                <div className="mb-4">
                    <label className="block text-sm mb-1 font-semibold text-purple-900">Add Admin</label>
                    <div className="flex gap-2 mb-2">
                        <select
                            value={selectedAdmin}
                            onChange={(e) => setSelectedAdmin(e.target.value)}
                            className="flex-1 border border-gray-300 px-3 py-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">-- Select Employee --</option>
                            {employees.map((emp) => (
                                <option key={emp.emp_id} value={emp.kash_operations_usn}>
                                    {emp.full_name} ({emp.role})
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={addAdmin}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            <FaPlus className="inline mr-1" /> Add
                        </button>
                    </div>
                </div>

                <h3 className="text-md font-semibold mb-2">Current Admins</h3>
                {admins.length === 0 ? (
                    <p className="text-gray-500">No admins found for this company.</p>
                ) : (
                    <ul className="space-y-2">
                        {admins.map((admin) => (
                            <li
                                key={admin.kash_operations_usn}
                                className="flex justify-between items-center border px-4 py-2 rounded"
                            >
                                <span>
                                    {admin.full_name || admin.kash_operations_usn}{" "}
                                    <span className="text-sm text-gray-500">({admin.role})</span>
                                </span>
                                <button
                                    onClick={() => deleteAdmin(admin.kash_operations_usn)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ManageAdmins;
