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
  console.log(`👀 TimesheetRow rendered for rowIdx: ${rowIdx}`);
  console.log("📦 handleRemoveEntry type:", typeof handleRemoveEntry);

  const preventInvalidChars = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <>
      {/* Timesheet Data Row */}
      <tr className="border-b border-gray-200">
        {/* Project and Company Details */}
        <td className="p-3 align-top text-sm text-left w-[230px]">
          <div className="font-semibold text-purple-900">
            {entry.projectName || "Project Name"}
          </div>
          <div className="text-gray-700">
            {entry.companyName || "Company Name"}
          </div>
          <div className="text-xs mt-2 space-y-1">
            <div>
              <strong>Ticket Number:</strong> {entry.ticket || "-"}
            </div>
            {(entry.workArea && entry.workArea !== "-") && (
              <div>
                <strong>Work Area:</strong> {entry.workArea}
              </div>
            )}
            {(entry.taskArea && entry.taskArea !== "-") && (
              <div>
                <strong>Task Area:</strong> {entry.taskArea}
              </div>
            )}
          </div>
        </td>

        {/* Hours Input for Each Day */}
        {entry.hours.map((hour, dayIdx) => (
          <td key={dayIdx} className="p-2 text-center">
            <input
              type="number"
              step="0.25"
              min="0"
              max="24"
              value={hour === "" ? "" : hour}
              onChange={(e) => handleHourChange(rowIdx, dayIdx, e.target.value)}
              onBlur={(e) => {
                if (e.target.value === "") {
                  handleHourChange(rowIdx, dayIdx, 0);
                }
              }}
              onKeyDown={preventInvalidChars}
              className="w-16 text-center border rounded py-1 px-2"
            />
          </td>
        ))}

        {/* Weekly Total */}
        <td className="p-2 text-right font-semibold">
          {getRowTotal(entry).toFixed(2)}
        </td>

        {/* Remove Action */}
        <td className="p-2 text-right">
          <button
            className="text-red-600 hover:underline text-sm"
            onClick={() => {
              console.log("🧹 Remove clicked for row:", rowIdx);
              if (typeof handleRemoveEntry === "function") {
                handleRemoveEntry(rowIdx);
              } else {
                console.warn("❌ handleRemoveEntry is not a function");
              }
            }}
          >
            Remove
          </button>
        </td>
      </tr>

      {/* Notes Section */}
      <tr>
        <td colSpan={weekDates.length + 3} className="p-2">
          <textarea
            value={entry.notes || ""}
            onChange={(e) => handleNoteChange(rowIdx, e.target.value)}
            placeholder="Add Notes"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-1 resize-none"
            rows={1}
          />
        </td>
      </tr>
    </>
  );
};

export default TimesheetRow;
