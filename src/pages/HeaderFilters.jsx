// src/pages/HeaderFilters.jsx
import React from "react";

const HeaderFilters = ({
  employee,
  setEmployee,
  week,
  setWeek,
  isBillable,
  setIsBillable,
  company,
  setCompany,
  project,
  setProject,
  ticket,
  setTicket,
  workArea,
  setWorkArea,
  taskArea,
  setTaskArea,
  onAddRow,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <select value={employee} onChange={(e) => setEmployee(e.target.value)} className="border p-2 rounded">
        <option value="">Select Employee</option>
        <option value="Daniel Turner">Daniel Turner</option>
      </select>

      <select value={week} onChange={(e) => setWeek(e.target.value)} className="border p-2 rounded">
        <option value="">Select Week</option>
        <option value="Nov 5 - Nov 11">Nov 5 - Nov 11</option>
        <option value="Nov 12 - Nov 18">Nov 12 - Nov 18</option>
      </select>

      <div className="col-span-2 flex items-center space-x-4">
        <button
          className={`px-4 py-2 rounded ${isBillable ? "bg-purple-700 text-white" : "bg-gray-300"}`}
          onClick={() => setIsBillable(true)}
        >
          Billable
        </button>
        <button
          className={`px-4 py-2 rounded ${!isBillable ? "bg-purple-700 text-white" : "bg-gray-300"}`}
          onClick={() => setIsBillable(false)}
        >
          Non-Billable
        </button>
      </div>

      <select value={company} onChange={(e) => setCompany(e.target.value)} className="border p-2 rounded">
        <option value="">Select Company</option>
        <option value="United Healthcare">United Healthcare</option>
      </select>

      <select value={project} onChange={(e) => setProject(e.target.value)} className="border p-2 rounded">
        <option value="">Select Project</option>
        <option value="Power BI Migration">Power BI Migration</option>
      </select>

      <input
        type="text"
        placeholder="Type Ticket No."
        value={ticket}
        onChange={(e) => setTicket(e.target.value)}
        className="border p-2 rounded"
      />

      <select value={workArea} onChange={(e) => setWorkArea(e.target.value)} className="border p-2 rounded">
        <option value="">Select Work Area</option>
        <option value="Work 12345566">Work 12345566</option>
      </select>

      <select value={taskArea} onChange={(e) => setTaskArea(e.target.value)} className="border p-2 rounded">
        <option value="">Select Task Area</option>
        <option value="ABC migration 123">ABC migration 123</option>
      </select>

      <div className="md:col-span-4 flex justify-end">
        <button className="bg-purple-700 text-white px-4 py-2 rounded" onClick={onAddRow}>
          + Add to Sheet
        </button>
      </div>
    </div>
  );
};

export default HeaderFilters;
