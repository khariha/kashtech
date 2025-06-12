import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TimesheetHeader from "../components/TimesheetHeader";
import TimesheetForm from "../components/TimesheetForm";
import TimesheetTable from "../components/TimesheetTable";
import API from "../api/config";
import { format } from "date-fns";

const ManageTimesheet = () => {
  const token = localStorage.getItem("token");
  const userInfo = JSON.parse(atob(token.split(".")[1]));
  const empIdFromToken = userInfo.emp_id;
  const userRole = userInfo.role;
  const navigate = useNavigate();

  const [employee, setEmployee] = useState("");
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(null);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showTimesheetFields, setShowTimesheetFields] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isBillable, setIsBillable] = useState(true);
  const [company, setCompany] = useState("");
  const [project, setProject] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [taskArea, setTaskArea] = useState("");
  const [ticket, setTicket] = useState("");

  const [entries, setEntries] = useState([]);
  const [originalEntries, setOriginalEntries] = useState([]);
  const deletedEntriesRef = useRef([]);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(API.FETCH_ALL_EMPLOYEES1, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEmployeeOptions(data);
        if (userRole === "Basic" || userRole === "Basic User") {
          const self = data.find((e) => e.emp_id === empIdFromToken);
          if (self) setEmployee(self.emp_id);
        }
      } catch (err) {
        console.error("Error loading employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const storedEmpId = localStorage.getItem("edit_emp_id");
    const storedWeek = localStorage.getItem("edit_week_start");
    if (storedEmpId && storedWeek) {
      setEmployee(parseInt(storedEmpId));
      setWeekStartDate(new Date(storedWeek));
      setShowTimesheetFields(true);
      setIsEditMode(true);
      localStorage.removeItem("edit_emp_id");
      localStorage.removeItem("edit_week_start");
    }
  }, []);

  useEffect(() => {
    const fetchSavedEntries = async () => {
      if (!weekStartDate || !employee) return;
      const formattedDate = format(weekStartDate, "yyyy-MM-dd");

      try {
        const res = await fetch(API.GET_TIMESHEET_BY_WEEK(employee, formattedDate), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        console.log("📥 Loaded timesheet data:", data);

        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((e) => ({
            timesheet_entry_id: e.timesheet_entry_id,
            emp_id: e.emp_id,
            sow_id: e.sow_id,
            company_id: e.company_id,
            companyName: e.company_name || "",
            projectName: e.project_category || "",
            ticket: e.ticket_num || "-",
            workArea: e.sub_assignment || "-",
            taskArea: e.sub_assignment_segment_1 || "-",
            notes: e.sub_assignment_segment_2 || "",
            hours: [
              parseFloat(e.monday_hours || 0),
              parseFloat(e.tuesday_hours || 0),
              parseFloat(e.wednesday_hours || 0),
              parseFloat(e.thursday_hours || 0),
              parseFloat(e.friday_hours || 0),
              parseFloat(e.saturday_hours || 0),
              parseFloat(e.sunday_hours || 0),
            ],
            period_start_date: formattedDate,
          }));

          const firstEntry = data[0];

          // ✅ Ensure values are correctly mapped
          setCompany(firstEntry.company_id ?? "");
          setProject(firstEntry.sow_id ?? "");
          setIsBillable(Boolean(firstEntry.billable));

          setEntries(formatted);
          setOriginalEntries(formatted);
          setShowTimesheetFields(true); // 🔑 Important to show the form
        } else {
          console.warn("⚠️ No data returned for timesheet.");
          setEntries([]);
          setOriginalEntries([]);
        }
      } catch (err) {
        console.error("❌ Error fetching timesheet:", err);
      }
    };

    fetchSavedEntries();
  }, [weekStartDate, employee]);




  const handleAddToSheet = ({ company, companyName, project, projectName, workArea, taskArea, ticket }) => {
    if (!company || !project) {
      alert("Please fill in all required fields.");
      return;
    }

    const newEntry = {
      emp_id: employee,
      sow_id: project,
      company_id: company,
      companyName,
      projectName,
      ticket: ticket || "-",
      workArea: workArea || "-",
      taskArea: taskArea || "-",
      notes: "",
      hours: [0, 0, 0, 0, 0, 0, 0],
      period_start_date: format(new Date(weekStartDate), "yyyy-MM-dd"),
    };

    setEntries((prev) => [...prev, newEntry]);
  };

  const handleRemoveEntry = (rowIdx) => {
    const removed = entries[rowIdx];
    console.log("🧹 Trying to remove:", removed);
    setEntries((prev) => prev.filter((_, i) => i !== rowIdx));

    if (!removed.timesheet_entry_id) {
      console.log("⛔ Skipped delete tracking: Missing timesheet_entry_id.");
      return;
    }

    deletedEntriesRef.current.push({ timesheet_entry_id: removed.timesheet_entry_id });
    console.log("🚨 Deleting from ManageTimesheet:", deletedEntriesRef.current);
  };

  const handleSave = async () => {
    if (!weekStartDate) return alert("Please select a week.");
    setIsSaving(true);
    const formattedDate = format(new Date(weekStartDate), "yyyy-MM-dd");

    try {
      const newEntries = [];
      const updateEntries = [];

      for (const e of entries) {
        const hours = e.hours.map((h) => parseFloat(h) || 0);
        const payload = {
          emp_id: e.emp_id,
          sow_id: e.sow_id,
          period_start_date: formattedDate,
          billable: isBillable,
          non_billable_reason: isBillable ? null : "General",
          ticket_num: e.ticket || "",
          monday_hours: hours[0],
          tuesday_hours: hours[1],
          wednesday_hours: hours[2],
          thursday_hours: hours[3],
          friday_hours: hours[4],
          saturday_hours: hours[5],
          sunday_hours: hours[6],
          sub_assignment: e.workArea,
          sub_assignment_segment_1: e.taskArea,
          sub_assignment_segment_2: e.notes,
          timesheet_status_entry: "Submitted",
        };

        const matchInOriginal = originalEntries.find(
          (orig) =>
            orig.emp_id === e.emp_id &&
            orig.sow_id === e.sow_id &&
            orig.period_start_date === formattedDate
        );

        if (matchInOriginal) updateEntries.push(payload);
        else newEntries.push(payload);
      }

      console.log("🗑️ Entries to delete:", deletedEntriesRef.current);

      if (deletedEntriesRef.current.length > 0) {
        await Promise.all(
          deletedEntriesRef.current.map((e) =>
            fetch(API.DELETE_TIMESHEET_ENTRY_BY_ID(e.timesheet_entry_id), {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
              if (!res.ok) {
                console.error("❌ Failed to delete entry:", e);
              } else {
                console.log("✅ Deleted:", e);
              }
            })
          )
        );
        deletedEntriesRef.current.length = 0;
      }

      if (newEntries.length > 0) {
        await fetch(API.TIMESHEET_ADD_BATCH, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ entries: newEntries }),
        });
      }

      if (updateEntries.length > 0) {
        await fetch(API.UPDATE_TIMESHEET_BATCH, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ entries: updateEntries }),
        });
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (isEditMode) navigate("/timesheet-report");
      }, 2000);
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("❌ Failed to save timesheet.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = (rowIdx, dayIdx, value) => {
    const updated = [...entries];
    updated[rowIdx].hours[dayIdx] = parseFloat(value) || 0;
    setEntries(updated);
  };

  const handleNoteChange = (rowIdx, value) => {
    const updated = [...entries];
    updated[rowIdx].notes = value;
    setEntries(updated);
  };

  return (
    <div className="min-h-screen p-6 text-gray-800 dark:text-white">
      <h2 className="text-4xl font-bold mb-6 text-purple-900 dark:text-white">
        Manage Timesheet
      </h2>

      <TimesheetHeader
        userRole={userRole}
        employee={employee}
        setEmployee={setEmployee}
        employeeOptions={employeeOptions}
        weekStartDate={weekStartDate}
        setWeekStartDate={setWeekStartDate}
        calendarOpen={calendarOpen}
        setCalendarOpen={setCalendarOpen}
        showTimesheetFields={showTimesheetFields}
        setShowTimesheetFields={setShowTimesheetFields}
      />

      {showTimesheetFields && (
        <>
          <TimesheetForm
            isBillable={isBillable}
            setIsBillable={setIsBillable}
            company={company}
            setCompany={setCompany}
            project={project}
            setProject={setProject}
            workArea={workArea}
            setWorkArea={setWorkArea}
            taskArea={taskArea}
            setTaskArea={setTaskArea}
            ticket={ticket}
            setTicket={setTicket}
            handleAddToSheet={handleAddToSheet}
            selectedWeek={weekStartDate}
          />

          <TimesheetTable
            entries={entries}
            setEntries={setEntries}
            weekStartDate={weekStartDate}
            empId={employee}
            isBillable={isBillable}
            handleHourChange={handleHourChange}
            handleNoteChange={handleNoteChange}
            handleRemoveEntry={handleRemoveEntry}
            handleSave={handleSave}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
          />

          {showSuccess && (
            <div className="mt-4 text-green-700 bg-green-100 px-4 py-2 rounded text-sm">
              ✅ Timesheet saved successfully!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageTimesheet;
