import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import ManageProjects from "./ManageProjects";
import API from "../api/config";

const EditClient = ({ client, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    company_id: "",
    industry: "",
    company_address: "",
    address_line2: "",
    company_location_city: "",
    company_location_state: "",
    company_location_country: "",
    company_zip_code: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        company_name: client.company_name || "",
        company_id: client.company_id || "",
        industry: client.industry || "",
        company_address: client.address_line1 || "",
        address_line2: client.address_line2 || "",
        company_location_city: client.city || "",
        company_location_state: client.state || "",
        company_location_country: client.country || "",
        company_zip_code: client.zipcode || "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const {
      company_name,
      company_id,
      industry,
      company_address,
      company_location_city,
      company_location_state,
      company_location_country,
      company_zip_code,
      address_line2,
    } = formData;

    if (
      !company_name ||
      !company_id ||
      !industry ||
      !company_address ||
      !company_location_city ||
      !company_location_state ||
      !company_location_country ||
      !company_zip_code
    ) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(API.GET_CLIENT_BY_ID(company_id),
        {
          company_name,
          industry,
          address_line1: company_address,
          address_line2,
          city: company_location_city,
          state: company_location_state,
          country: company_location_country,
          zipcode: company_zip_code,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage("Client updated successfully ✅");

      setTimeout(() => {
        setSuccessMessage("");
        onUpdate(res.data);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Update failed:", err);
      setErrorMessage("Update failed. Please check the data and try again.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this client?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(API.GET_CLIENT_BY_ID(formData.company_id), {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("Client deleted successfully ✅");

      setTimeout(() => {
        onUpdate(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Delete failed:", err);
      setErrorMessage("Delete failed. Please try again.");
    }
  };

  const handleManageProjects = () => {
    setShowProjectModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl w-[950px] p-8 relative shadow-lg">
        <button className="absolute top-5 right-5 text-gray-400 hover:text-black dark:hover:text-white" onClick={onClose}>
          <FaTimes className="text-lg" />
        </button>

        <h2 className="text-2xl font-bold text-purple-900 dark:text-white mb-4">Edit Client</h2>

        {errorMessage && (
          <p className="text-red-600 font-medium mb-4">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-600 font-medium mb-4">{successMessage}</p>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*Company Name</label>
            <input name="company_name" value={formData.company_name} onChange={handleChange} className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*Industry</label>
            <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white">
              <option value="">Select Industry</option>
              <option value="Insurance">Insurance</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Technology">Technology</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*Company ID</label>
            <input name="company_id" value={formData.company_id} readOnly className="w-full px-3 py-2 rounded border text-sm bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*Address Line 1</label>
            <input name="company_address" value={formData.company_address} onChange={handleChange} className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Address Line 2</label>
            <input name="address_line2" value={formData.address_line2} onChange={handleChange} className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*City</label>
            <input name="company_location_city" value={formData.company_location_city} onChange={handleChange} className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*State</label>
            <input name="company_location_state" value={formData.company_location_state} onChange={handleChange} className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*Country</label>
            <input name="company_location_country" value={formData.company_location_country} onChange={handleChange} className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*Zipcode</label>
            <input name="company_zip_code" value={formData.company_zip_code} onChange={handleChange} className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        <div className="flex justify-center items-center gap-6 mt-8">
          <button
            onClick={() => handleManageProjects(formData.company_id)}
            className="text-sm font-semibold text-purple-700 border border-purple-300 px-4 py-2 rounded-full hover:bg-purple-50"
          >
            Manage Projects
          </button>

          <button
            onClick={handleSave}
            className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-600"
          >
            Save
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-800 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-900"
          >
            Delete
          </button>
        </div>
      </div>

      {showProjectModal && (
        <ManageProjects
          companyId={formData.company_id}
          companyName={formData.company_name}
          onClose={() => setShowProjectModal(false)}
        />

      )}

    </div>
  );
};

export default EditClient;