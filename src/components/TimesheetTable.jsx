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
  handleRemoveEntry,
}) => {
  const weekDates = weekStartDate
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i))
    : [];

  const [error, setError] = useState("");

  const handleHourChange = (rowIdx, dayIdx, value) => {
    const updated = [...entries];

    if (value === "") {
      updated[rowIdx].hours[dayIdx] = "";
      setEntries(updated);
      return;
    }

    const parsedValue = parseFloat(value);

    if (parsedValue === 0) {
      updated[rowIdx].hours[dayIdx] = 0;
      setEntries(updated);
      setError("");
      return;
    }

    if (isNaN(parsedValue) || parsedValue < 0.25 || parsedValue > 24) return;

    updated[rowIdx].hours[dayIdx] = parsedValue;

    const dayTotal = updated.reduce(
      (sum, row) => sum + (parseFloat(row.hours[dayIdx]) || 0),
      0
    );

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

  const getRowTotal = (entry) =>
    entry.hours.reduce((sum, h) => sum + parseFloat(h || 0), 0);

  const dailyTotals = useMemo(
    () =>
      weekDates.map((_, dayIdx) =>
        entries
          .reduce((sum, row) => sum + (parseFloat(row.hours[dayIdx]) || 0), 0)
          .toFixed(2)
      ),
    [entries, weekDates]
  );

  const overallTotal = useMemo(
    () => entries.reduce((sum, entry) => sum + getRowTotal(entry), 0).toFixed(2),
    [entries]
  );

  return (
    entries.length > 0 &&
    weekStartDate && (
      <div className="mt-6 border rounded-md overflow-x-auto">
        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm border-b">
            {error}
          </div>
        )}

        <table className="w-full text-sm text-left">
          <thead className="bg-purple-800 text-white">
            <tr>
              <th className="p-2 text-left">Timesheet Information</th>
              {weekDates.map((date, idx) => (
                <th key={idx} className="p-2 text-center">
                  <div className="text-sm font-medium">
                    {format(date, "MMM d")}
                  </div>
                  <div className="text-xs font-light">
                    [{format(date, "EEE")}]
                  </div>
                </th>
              ))}
              <th className="p-2 text-center">Total</th>
              <th className="p-2 text-left">Action</th>
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
          <tfoot>
            <tr className="bg-gray-50 border-t text-sm">
              <td className="p-2 font-bold text-purple-700">Total</td>
              {dailyTotals.map((val, i) => (
                <td key={i} className="p-2 text-center font-semibold">
                  {val}
                </td>
              ))}
              <td className="p-2 text-center font-bold">{overallTotal}</td>
              <td className="p-2" />
            </tr>
          </tfoot>
        </table>

        <div className="flex justify-end px-4 py-4">
          <button
            onClick={handleSave}
            disabled={isSaving || !!error}
            className={`bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full text-sm ${isSaving || error ? "opacity-50 cursor-not-allowed" : ""
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
