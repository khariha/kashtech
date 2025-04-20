import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, format, isWithinInterval } from "date-fns";

const TimesheetHeader = ({
  userRole,
  employee,
  setEmployee,
  employeeOptions,
  weekStartDate,
  setWeekStartDate,
  calendarOpen,
  setCalendarOpen,
  showTimesheetFields,
  setShowTimesheetFields,
}) => {
  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleDateSelect = (date) => {
    const selected = new Date(date);
    const monday = new Date(selected.setDate(selected.getDate() - ((selected.getDay() + 6) % 7)));
    setWeekStartDate(monday);
  };

  const getWeekRange = () => {
    if (!weekStartDate) return "";
    const end = addDays(weekStartDate, 6);
    return `${format(weekStartDate, "MMM d")} - ${format(end, "MMM d")}`;
  };

  const isDateInWeek = (date) => {
    if (!weekStartDate) return false;
    return isWithinInterval(date, {
      start: weekStartDate,
      end: addDays(weekStartDate, 6),
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Employee Name Dropdown */}
      <div className="flex flex-col text-sm">
        <label className="mb-1 font-medium">*Employee Name</label>
        <select
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          disabled={userRole === "Basic" || userRole === "Basic User"}
          className="border rounded px-3 py-2 min-w-[200px]"
        >
          {userRole === "Basic" || userRole === "Basic User" ? (
            <option>{employee}</option>
          ) : (
            <>
              <option value="">Select Employee</option>
              {employeeOptions.map((emp) => (
                <option key={emp.emp_id} value={emp.full_name}>
                  {emp.full_name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      {/* Week Picker */}
      <div className="flex flex-col text-sm relative">
        <label className="mb-1 font-medium">*Week</label>
        <button
          onClick={() => setCalendarOpen(true)}
          className="border rounded px-3 py-2 text-left bg-white dark:bg-gray-800 min-w-[200px]"
        >
          {weekStartDate ? getWeekRange() : "Select Week"}
        </button>

        {calendarOpen && (
          <div className="absolute z-20 mt-16 bg-white dark:bg-gray-800 rounded shadow-md w-[250px]">
            <div className="bg-purple-900 text-white text-center py-2 text-sm">
              <div className="uppercase text-xs">Selected Week</div>
              <div className="font-medium">{getWeekRange()}</div>
            </div>
            <DatePicker
              selected={weekStartDate}
              onChange={handleDateSelect}
              inline
              calendarStartDay={0}
              dayClassName={(date) =>
                isDateInWeek(date) ? "react-datepicker__day--highlighted-week" : undefined
              }
            />
            <div className="flex justify-end px-3 py-2 border-t">
              <button
                onClick={() => setCalendarOpen(false)}
                className="text-xs text-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCalendarOpen(false);
                  setShowTimesheetFields(true);
                }}
                className="text-xs bg-orange-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Report Button - Only for Admin and Super Admin */}
      {(userRole === "Admin" || userRole === "Super Admin") && (
        <button
          onClick={() => navigate("/timesheet-report")}
          className="ml-auto border text-purple-700 px-4 py-2 rounded hover:bg-purple-50 text-sm"
        >
          View Report
        </button>
      )}
    </div>
  );
};

export default TimesheetHeader;
