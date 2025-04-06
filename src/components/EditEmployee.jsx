import React, { useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";

const statusOptions = ["Active", "Inactive", "On Leave"];
const contractTypes = ["1099", "W2", "Intern"];
const adminLevels = ["Basic", "Admin", "Super Admin"];

const EditEmployee = ({ employee, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ ...employee });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    const requiredFields = [
      "first_name", "last_name", "emp_id", "kash_operations_usn",
      "admin_level", "employee_status", "employee_type",
      "email_address", "phone_number", "employee_address",
      "emp_location_city", "emp_location_state",
      "emp_location_country", "employee_zip_code"
    ];
  
    for (let field of requiredFields) {
      if (!String(formData[field] || "").trim()) {
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
      const res = await axios.put(
        `http://localhost:5000/api/employees/${formData.emp_id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Employee updated successfully!");
      onUpdate(res.data);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError("Update failed. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/employees/${formData.emp_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdate(null);
      onClose();
    } catch (err) {
      setError("Failed to delete employee.");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-[900px] shadow-lg dark:bg-[#1e1e2f] relative">
        {/* ❌ Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl"
          onClick={onClose}
        >
          <IoClose />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-purple-900 dark:text-white">
          Edit Employee
        </h2>

        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}

        <div className="grid grid-cols-4 gap-4">
          {/* Full form with labels */}
          {[
            { label: "*First Name", name: "first_name" },
            { label: "Middle Name", name: "middle_name" },
            { label: "*Last Name", name: "last_name" },
            { label: "*Employee ID", name: "emp_id" },
            { label: "*Username", name: "kash_operations_usn" },
            {
              label: "*Admin Level",
              name: "admin_level",
              type: "select",
              options: adminLevels,
            },
            {
              label: "*Status",
              name: "employee_status",
              type: "select",
              options: statusOptions,
            },
            {
              label: "*Contract Type",
              name: "employee_type",
              type: "select",
              options: contractTypes,
            },
            { label: "*Email", name: "email_address" },
            { label: "*Phone", name: "phone_number" },
            { label: "*Address Line 1", name: "employee_address", colSpan: 2 },
            {
              label: "Address Line 2",
              name: "employee_address_line2",
              colSpan: 2,
            },
            { label: "*City", name: "emp_location_city" },
            { label: "*State", name: "emp_location_state" },  // 👈 changed to input
            { label: "*Country", name: "emp_location_country" }, // 👈 changed to input
            { label: "*Zipcode", name: "employee_zip_code" },
          ].map(({ label, name, type, options = [], colSpan = 1 }) => (
            <div className={`col-span-${colSpan}`} key={name}>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                {label}
              </label>
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="input"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleSave}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;
