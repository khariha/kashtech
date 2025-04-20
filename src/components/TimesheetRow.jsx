import React from "react";

const TimesheetRow = ({
  entry,
  rowIdx,
  weekDates,
  handleHourChange,
  handleNoteChange,
  handleRemoveEntry,
  getRowTotal,
}) => {
  return (
    <>
      {/* Project Info & Hour Inputs */}
      <tr className="border-b border-gray-200">
        {/* Left Info Cell */}
        <td className="p-3 align-top text-sm text-left w-[230px]">
          <div className="font-semibold text-purple-900">{entry.projectName || "Project Name"}</div>
          <div className="text-gray-700">{entry.companyName || "Company Name"}</div>
          <div className="text-xs mt-2">
            <div><strong>Ticket Number:</strong> {entry.ticket || "-"}</div>
            <div><strong>Work Area:</strong> {entry.workArea || "-"}</div>
            <div><strong>Task Area:</strong> {entry.taskArea || "-"}</div>
          </div>
        </td>

        {/* Hour Inputs per Day */}
        {entry.hours.map((hour, dayIdx) => (
          <td key={dayIdx} className="p-2 text-center">
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={hour}
              onChange={(e) => handleHourChange(rowIdx, dayIdx, e.target.value)}
              className="w-16 text-center border rounded py-1 px-2"
            />
          </td>
        ))}

        {/* Row Total */}
        <td className="p-2 text-right font-semibold">{getRowTotal(entry).toFixed(2)}</td>

        {/* Remove Button */}
        <td className="p-2 text-right">
          <button
            onClick={() => handleRemoveEntry(rowIdx)}
            className="text-red-600 hover:underline text-sm"
          >
            Remove
          </button>
        </td>
      </tr>

      {/* Notes Row */}
      {/* Notes (below hour inputs) */}
      <tr>
        <td colSpan={weekDates.length + 3}>
          <textarea
            value={entry.notes}
            onChange={(e) => handleNoteChange(rowIdx, e.target.value)}
            placeholder="Add Notes"
            className="w-full border border-gray-300 rounded px-3 py-1 text-sm mt-1 resize-none"
            rows={1} // ✅ Reduced height
          />
        </td>
      </tr>

    </>
  );
};

export default TimesheetRow;
