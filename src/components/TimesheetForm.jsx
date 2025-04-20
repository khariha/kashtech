import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/config";

const TimesheetForm = ({
  isBillable,
  setIsBillable,
  company,
  setCompany,
  project,
  setProject,
  workArea,
  setWorkArea,
  taskArea,
  setTaskArea,
  ticket,
  setTicket,
  handleAddToSheet,
}) => {
  const [companyOptions, setCompanyOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState({ work: [], task: [] });

  const token = localStorage.getItem("token");

  // 🔁 Load companies on billable change
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(API.GET_COMPANIES_BY_BILLABLE(isBillable),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCompanyOptions(res.data);
        setCompany("");
        setProject("");
        setProjectOptions([]);
        setAreaOptions({ work: [], task: [] });
      } catch (err) {
        console.error("❌ Failed to fetch companies", err);
      }
    };

    fetchCompanies();
  }, [isBillable]);

  // 🔁 Load projects on company change
  useEffect(() => {
    if (!company) return;

    const fetchProjects = async () => {
      try {
        const res = await axios.get(API.GET_PROJECTS_BY_COMPANY(company) ,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjectOptions(res.data);
        setProject("");
        setAreaOptions({ work: [], task: [] });
      } catch (err) {
        console.error("❌ Failed to fetch projects", err);
      }
    };

    fetchProjects();
  }, [company]);

  // 🔁 Load areas on project change
  useEffect(() => {
    if (!project) return;

    const fetchAreas = async () => {
      try {
        const res = await axios.get(API.GET_AREAS_BY_PROJECT(project) ,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAreaOptions({
          work: res.data.workAreas || [],
          task: res.data.taskAreas || [],
        });
      } catch (err) {
        console.error("❌ Failed to fetch areas", err);
      }
    };

    fetchAreas();
  }, [project]);

  // ➕ Handle Add Button Click
  const handleClick = () => {
    if (!company || !project) {
      alert("Please select both Company and Project before adding to sheet.");
      return;
    }

    const companyName =
      companyOptions.find((c) => c.company_id === company)?.company_name || "";
    const projectName =
      projectOptions.find((p) => p.sow_id === project)?.project_category || "";

    handleAddToSheet({
      company,
      companyName,
      project,
      projectName,
      workArea,
      taskArea,
      ticket,
    });
  };

  return (
    <div className="mt-6 border rounded-lg p-4 flex flex-wrap gap-3 items-end">
      {/* 🔘 Billable Toggle */}
      <div className="flex items-center bg-gray-100 rounded-full p-1">
        <button
          className={`px-4 py-1 rounded-full text-sm ${
            isBillable ? "bg-purple-700 text-white" : "text-gray-600"
          }`}
          onClick={() => setIsBillable(true)}
        >
          Billable
        </button>
        <button
          className={`px-4 py-1 rounded-full text-sm ${
            !isBillable ? "bg-purple-700 text-white" : "text-gray-600"
          }`}
          onClick={() => setIsBillable(false)}
        >
          Non-Billable
        </button>
      </div>

      {/* 🏢 Company Dropdown */}
      <div className="flex flex-col text-sm">
        <label className="mb-1 font-medium">*Company</label>
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="border rounded px-3 py-2 min-w-[180px]"
        >
          <option value="">Select Company</option>
          {companyOptions.map((opt) => (
            <option key={opt.company_id} value={opt.company_id}>
              {opt.company_name}
            </option>
          ))}
        </select>
      </div>

      {/* 📁 Project Dropdown */}
      <div className="flex flex-col text-sm">
        <label className="mb-1 font-medium">*Project</label>
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="border rounded px-3 py-2 min-w-[180px]"
        >
          <option value="">Select Project</option>
          {projectOptions.map((opt) => (
            <option key={opt.sow_id} value={opt.sow_id}>
              {opt.project_category}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Work & Task Areas */}
      {project && (
        <>
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Work Area</label>
            <select
              value={workArea}
              onChange={(e) => setWorkArea(e.target.value)}
              className="border rounded px-3 py-2 min-w-[180px]"
            >
              <option value="">Select Work Area</option>
              {areaOptions.work.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Task Area</label>
            <select
              value={taskArea}
              onChange={(e) => setTaskArea(e.target.value)}
              className="border rounded px-3 py-2 min-w-[180px]"
            >
              <option value="">Select Task Area</option>
              {areaOptions.task.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* 🎫 Ticket Input */}
      <div className="flex flex-col text-sm">
        <label className="mb-1 font-medium">Ticket #</label>
        <input
          type="text"
          value={ticket}
          onChange={(e) => setTicket(e.target.value)}
          className="border rounded px-3 py-2 min-w-[180px]"
          placeholder="e.g. INC12345"
        />
      </div>

      {/* ➕ Add to Sheet */}
      <div className="ml-auto">
        <button
          type="button"
          className="border border-purple-600 text-purple-700 px-4 py-2 rounded hover:bg-purple-50 text-sm"
          onClick={handleClick}
        >
          + Add to Sheet
        </button>
      </div>
    </div>
  );
};

export default TimesheetForm;
