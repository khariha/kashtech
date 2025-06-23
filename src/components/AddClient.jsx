import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import API from "../api/config";

const AddClient = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    project_category: "",
    company_address: "",
    address_line2: "",
    company_location_city: "",
    company_location_state: "",
    company_location_country: "",
    company_zip_code: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [industries, setIndustries] = useState([]);
  const [newIndustry, setNewIndustry] = useState("");
  const [showNewIndustryField, setShowNewIndustryField] = useState(false);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(API.GET_INDUSTRIES, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIndustries(res.data);
      } catch (err) {
        console.error("Failed to load industries", err);
      }
    };

    fetchIndustries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const {
      company_name,
      project_category,
      company_address,
      address_line2,
      company_location_city,
      company_location_state,
      company_location_country,
      company_zip_code,
    } = formData;

    // Validate only mandatory fields
    if (!company_name.trim() || !project_category.trim()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let finalIndustry = project_category;

      // 🔄 Create new industry if needed
      if (project_category === "new") {
        if (!newIndustry.trim()) {
          setErrorMessage("Please enter a name for the new industry.");
          return;
        }

        const industryRes = await axios.post(
          API.CREATE_INDUSTRY,
          { name: newIndustry.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        finalIndustry = industryRes.data.name;
      }

      const res = await axios.post(
        API.FETCH_MANAGE_CLIENTS,
        {
          company_name,
          industry: finalIndustry,
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

      setSuccessMessage("Client added successfully ✅");
      setTimeout(() => {
        setSuccessMessage("");
        onAdd(res.data);
      }, 2000);
    } catch (err) {
      console.error("Add failed:", err);
      setErrorMessage("Add failed. Please check the data and try again.");
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl w-[950px] p-8 relative shadow-lg">
        <button
          className="absolute top-5 right-5 text-gray-400 hover:text-black dark:hover:text-white"
          onClick={onClose}
        >
          <FaTimes className="text-lg" />
        </button>

        <h2 className="text-2xl font-bold text-purple-900 dark:text-white mb-4">Add Client</h2>

        {errorMessage && (
          <p className="text-red-600 font-medium mb-4">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-600 font-medium mb-4">{successMessage}</p>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*Company Name</label>
            <input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">*Industry</label>
            <div className="flex gap-2">
              <select
                name="project_category"
                value={formData.project_category}
                onChange={(e) => {
                  setFormData({ ...formData, project_category: e.target.value });
                  if (e.target.value === "new") {
                    setShowNewIndustryField(true);
                    setNewIndustry("");
                  } else {
                    setShowNewIndustryField(false);
                  }
                }}
                className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Industry</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.name}>
                    {ind.name}
                  </option>
                ))}
                <option value="new">+ Add New Industry</option>
              </select>
            </div>
          </div>

          {showNewIndustryField && (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">New Industry Name</label>
              <input
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}


        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Address Line 1</label>
            <input
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Address Line 2</label>
            <input
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">City</label>
            <input
              name="company_location_city"
              value={formData.company_location_city}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">State</label>
            <input
              name="company_location_state"
              value={formData.company_location_state}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Country</label>
            <input
              name="company_location_country"
              value={formData.company_location_country}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Zipcode</label>
            <input
              name="company_zip_code"
              value={formData.company_zip_code}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border text-sm border-gray-300 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleAdd}
            disabled={!!successMessage}
            className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            Add Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClient;
