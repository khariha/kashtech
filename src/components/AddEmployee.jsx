import React, { useState } from "react";
import axios from "axios";
import API from "../api/config";

const contractTypes = ["1099", "W2", "Intern"];
const statusOptions = ["Active", "Inactive", "On Leave"];
const adminLevels = ["Basic", "Admin", "Super Admin"];

const AddEmployee = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        emp_id: "",
        kash_operations_usn: "",
        admin_level: "",
        employee_status: "",
        employee_type: "",
        email_address: "",
        phone_number: "",
        employee_address: "",
        employee_address_line2: "",
        emp_location_city: "",
        emp_location_state: "",
        emp_location_country: "",
        employee_zip_code: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const validateForm = () => {
        const requiredFields = [
            "first_name", "last_name",
            "kash_operations_usn", "admin_level", "email_address"
        ];

        for (let field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === "") {
                setError("Please fill out all required fields.");
                return false;
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Unauthorized: No token found.");
                return;
            }

            const result = await axios.post(API.FETCH_ALL_EMPLOYEES, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData(prev => ({ ...prev, emp_id: res.data.emp_id }));



            setSuccess("Employee added successfully!");
            onAdd(res.data); // update parent list
            setTimeout(() => {
                setSuccess("");
                onClose();
            }, 1000);
        } catch (err) {
            const backendMsg = err?.response?.data?.error;

            if (backendMsg?.includes("Employee ID already exists")) {
                setError("Employee ID already exists. Please use a different one.");
            } else {
                setError(backendMsg || "Failed to add employee.");
            }

            console.error("Add employee error:", backendMsg || err.message);
        }

    };



    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-[#1e1e2f] p-6 rounded-lg w-[900px] shadow-xl max-h-[95vh] overflow-y-auto">
                {/* Close button */}
                <div className="flex justify-end mb-2">
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-purple-900 dark:text-white">
                    Add Employee
                </h2>

                {error && <div className="text-red-600 mb-2">{error}</div>}
                {success && <div className="text-green-600 mb-2">{success}</div>}

                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: "*First Name", name: "first_name" },
                        { label: "Middle Name", name: "middle_name" },
                        { label: "*Last Name", name: "last_name" },
                        { label: "*Employee ID", name: "emp_id", type: "readonly" },
                        { label: "*Username", name: "kash_operations_usn" },
                        {
                            label: "*Admin Level", name: "admin_level", type: "select", options: adminLevels
                        },
                        {
                            label: "Status", name: "employee_status", type: "select", options: statusOptions
                        },
                        {
                            label: "Contract Type", name: "employee_type", type: "select", options: contractTypes
                        },
                        { label: "*Email", name: "email_address" },
                        { label: "Phone", name: "phone_number" },
                        { label: "Address Line 1", name: "employee_address", colSpan: 2 },
                        { label: "Address Line 2", name: "employee_address_line2", colSpan: 2 },
                        { label: "City", name: "emp_location_city" },
                        { label: "State", name: "emp_location_state" },
                        { label: "Country", name: "emp_location_country" },
                        { label: "Zipcode", name: "employee_zip_code" },
                    ].map(({ label, name, type, options, colSpan }) => (
                        <div key={name} className={colSpan ? `col-span-${colSpan}` : ""}>
                            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                                {label}
                            </label>
                            {type === "select" ? (
                                <select
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="">-- Select --</option>
                                    {options.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                    placeholder={name === "emp_id" ? "Will be generated automatically!" : ""}
                                    disabled={name === "emp_id"}
                                    className={`input ${name === "emp_id" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                />

                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={handleSave}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;
