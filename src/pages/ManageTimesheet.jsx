import React, { useState, useEffect } from "react";
import TimesheetHeader from "../components/TimesheetHeader";
import TimesheetForm from "../components/TimesheetForm";
import TimesheetTable from "../components/TimesheetTable";
import API from "../api/config";

const ManageTimesheet = () => {
    const token = localStorage.getItem("token");
    const userInfo = JSON.parse(atob(token.split(".")[1]));
    const empId = userInfo.emp_id;
    const userRole = userInfo.role;

    const [employee, setEmployee] = useState("");
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [weekStartDate, setWeekStartDate] = useState(null);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [showTimesheetFields, setShowTimesheetFields] = useState(false);

    const [isBillable, setIsBillable] = useState(true);
    const [company, setCompany] = useState("");
    const [project, setProject] = useState("");
    const [workArea, setWorkArea] = useState("");
    const [taskArea, setTaskArea] = useState("");
    const [ticket, setTicket] = useState("");

    const [companyOptions, setCompanyOptions] = useState([]);
    const [projectOptions, setProjectOptions] = useState([]);
    const [entries, setEntries] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // ✅ Fetch employee list
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(API.FETCH_ALL_EMPLOYEES1, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setEmployeeOptions(data);
                if (userRole === "Basic") {
                    setEmployee(data[0]?.full_name || "");
                }
            } catch (err) {
                console.error("Error loading employees:", err);
            }
        };
        fetchEmployees();
    }, [token, userRole]);

    // ✅ Add entry to timesheet
    const handleAddToSheet = ({
        company,
        companyName,
        project,
        projectName,
        workArea,
        taskArea,
        ticket
    }) => {
        if (!company || !project) {
            alert("Please fill in all required fields.");
            return;
        }

        const newEntry = {
            emp_id: empId,
            sow_id: project,
            company_id: company,
            companyName,
            projectName,
            ticket: ticket || "-",
            workArea: workArea || "-",
            taskArea: taskArea || "-",
            notes: "",
            hours: [0, 0, 0, 0, 0, 0, 0],
        };

        setEntries((prev) => [...prev, newEntry]);
    };


    // ✅ Save timesheet
    const handleSave = async () => {
        if (!weekStartDate) return alert("Please select a week first.");
        setIsSaving(true);

        try {
            const payload = entries.map((e) => ({
                emp_id: empId,
                sow_id: e.sow_id,
                period_start_date: weekStartDate,
                billable: isBillable,
                non_billable_reason: isBillable ? null : "General",
                ticket_num: e.ticket || "",
                monday_hours: e.hours[0],
                tuesday_hours: e.hours[1],
                wednesday_hours: e.hours[2],
                thursday_hours: e.hours[3],
                friday_hours: e.hours[4],
                saturday_hours: e.hours[5],
                sunday_hours: e.hours[6],
                sub_assignment: e.workArea,
                sub_assignment_segment_1: e.taskArea,
                sub_assignment_segment_2: e.notes,
                timesheet_status_entry: "Submitted",
            }));

            const res = await fetch(API.TIMESHEET_ADD_BATCH, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ entries: payload }),
            });

            if (!res.ok) throw new Error("Save failed");
            alert("✅ Timesheet saved successfully");
            setEntries([]);
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

    const handleRemoveEntry = (rowIdx) => {
        const updated = entries.filter((_, i) => i !== rowIdx);
        setEntries(updated);
    };

    return (
        <div className="min-h-screen p-6 text-gray-800 dark:text-white">
            <h2 className="text-4xl font-bold mb-6 text-purple-900 dark:text-white">Manage Timesheet</h2>

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
                        companyOptions={companyOptions}
                        setCompanyOptions={setCompanyOptions}
                        projectOptions={projectOptions}
                        setProjectOptions={setProjectOptions}
                    />

                    <TimesheetTable
                        entries={entries}
                        setEntries={setEntries}
                        weekStartDate={weekStartDate}
                        empId={empId}
                        ticket=""
                        isBillable={isBillable}
                        workArea=""
                        taskArea=""
                        project=""
                        handleHourChange={handleHourChange}
                        handleNoteChange={handleNoteChange}
                        handleRemoveEntry={handleRemoveEntry}
                        handleSave={handleSave}
                        isSaving={isSaving}
                        setIsSaving={setIsSaving}
                    />
                </>
            )}
        </div>
    );
};

export default ManageTimesheet;
