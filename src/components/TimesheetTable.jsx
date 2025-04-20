// src/components/TimesheetTable.jsx
import React, { useMemo, useState } from "react";
import TimesheetRow from "./TimesheetRow";
import { addDays, format } from "date-fns";

const TimesheetTable = ({
  entries,
  setEntries,
  weekStartDate,
  empId,
  isBillable,
  handleSave,
  isSaving,
  setIsSaving,
}) => {
  const weekDates = weekStartDate
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i))
    : [];

  const [error, setError] = useState("");

  const handleHourChange = (rowIdx, dayIdx, value) => {
    const updated = [...entries];
    const parsedValue = parseFloat(value) || 0;

    // Apply minimum and maximum per cell
    if (parsedValue < 0.25) return;

    updated[rowIdx].hours[dayIdx] = parsedValue;

    // Validate: total hours per day shouldn't exceed 24
    const dayTotal = updated.reduce((sum, row) => sum + (row.hours[dayIdx] || 0), 0);
    if (dayTotal > 24) {
      setError(`❌ Day ${format(weekDates[dayIdx], "EEE MMM d")} exceeds 24 hours.`);
      return;
    }

    setError("");
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

  const getRowTotal = (entry) => entry.hours.reduce((sum, h) => sum + parseFloat(h || 0), 0);

  const dailyTotals = useMemo(() => {
    return weekDates.map((_, dayIdx) =>
      entries.reduce((sum, row) => sum + (row.hours[dayIdx] || 0), 0).toFixed(2)
    );
  }, [entries, weekDates]);

  return (
    entries.length > 0 && weekStartDate && (
      <div className="mt-6 border rounded-md overflow-x-auto">
        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm">{error}</div>
        )}

        <table className="w-full text-sm text-left">
          <thead className="bg-purple-800 text-white">
            <tr>
              <th className="p-2">Timesheet Information</th>
              {weekDates.map((date, idx) => (
                <th key={idx} className="p-2 text-center">
                  {format(date, "MMM d")}<br />{format(date, "EEE")}
                </th>
              ))}
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <TimesheetRow
                key={idx}
                entry={entry}
                rowIdx={idx}
                weekDates={weekDates}
                handleHourChange={handleHourChange}
                handleNoteChange={handleNoteChange}
                handleRemoveEntry={handleRemoveEntry}
                getRowTotal={getRowTotal}
              />
            ))}
          </tbody>
        </table>

        {/* Totals Row */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t">
          <span className="font-bold text-purple-700">Total</span>
          <div className="flex gap-4">
            {dailyTotals.map((val, i) => (
              <span key={i} className="w-16 text-center font-semibold text-sm">
                {val}
              </span>
            ))}
            <span className="w-16 text-right font-bold">
              {entries.reduce((sum, e) => sum + getRowTotal(e), 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end px-4 py-4">
          <button
            onClick={handleSave}
            disabled={isSaving || !!error}
            className={`bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded text-sm ${
              isSaving || error ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    )
  );
};

export default TimesheetTable;
