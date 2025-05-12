import React from "react";
import { saveAs } from "file-saver";

const GeneratedSOWModal = ({ sowBlob, onClose }) => {
  const handleDownload = () => {
    saveAs(sowBlob, "Generated_SOW_KashTech.docx");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
          <h2 className="text-xl font-bold text-purple-800 dark:text-white">Generated SOW</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-white">
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 text-sm text-gray-700 dark:text-gray-200 text-center flex items-center justify-center">
          ✅ Your Statement of Work (SOW) document is ready!
        </div>

        <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-600">
          <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded text-sm"
          >
            Download SOW
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedSOWModal;
