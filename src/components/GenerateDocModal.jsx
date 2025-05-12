// File: src/components/GenerateDocModal.jsx
import React, { useState, useRef } from "react";
import { FaTimes, FaDownload, FaMagic, FaSave } from "react-icons/fa";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import API from "../api/config";

const GenerateDocModal = ({ client, docType, onClose }) => {
  const [services, setServices] = useState("Software Development, Integration");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0]);
  const [billingTerms, setBillingTerms] = useState("monthly hours logged");
  const [techStack, setTechStack] = useState("Java, React, PostgreSQL");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [editedHtml, setEditedHtml] = useState("");
  const previewRef = useRef(null);

  const token = localStorage.getItem("token");

  const syncEditedHtml = () => {
    const htmlContent = previewRef.current?.innerHTML;
    if (htmlContent) {
      setEditedHtml(htmlContent);
      return htmlContent;
    }
    return editedHtml;
  };

  const saveEditedToDB = async (htmlContent) => {
    await axios.post(API.SAVE_EDITED_DOC, {
      clientId: client.company_id,
      editedHtml: htmlContent,
      metaFields: {
        companyName: client.company_name,
        industry: client.industry,
        services,
        startDate,
        endDate,
        techStack,
        billingTerms,
        clientContact: "Fred Bond",
        clientEmail: "client@example.com",
        clientPhone: "555-555-1234",
        kasTechContact: "Kamesh Gopalan",
        kasTechEmail: "kamesh@kashtechllc.com",
        kasTechPhone: "847-445-3064",
        engagementModel: "T&M",
        estimatedDuration: "6 months"
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const handleGenerate = async () => {
    if (!token) return alert("⚠️ Please login again. Missing token.");
    setLoading(true);
    try {
      const res = await axios.post(API.OPENAI_GENERATE_SOW_HTML, {
        companyName: client.company_name,
        industry: client.industry,
        services,
        startDate,
        endDate,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const html = res.data?.previewHtml;
      if (html) {
        setPreviewHtml(html);
        setEditedHtml(html);
        await saveEditedToDB(html);
        alert("✅ Preview generated!");
      } else {
        alert("⚠️ Empty preview received");
      }
    } catch (err) {
      console.error("❌ Preview generation failed", err);
      alert("Preview generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstructionEdit = async () => {
    if (!instruction.trim() || !editedHtml) return;
    setLoading(true);
    try {
      const res = await axios.post(API.OPENAI_EDIT_DOC, {
        originalContent: editedHtml,
        instruction,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newHtml = res.data.content || "";
      setEditedHtml(newHtml);
      setPreviewHtml(newHtml);
      setInstruction("");

      await saveEditedToDB(newHtml);
    } catch (err) {
      alert("Error applying edit command");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    const updatedHtml = syncEditedHtml();
    await saveEditedToDB(updatedHtml);
    alert("✅ Manual changes saved!");
  };

  const handleDownload = async () => {
    const updatedHtml = syncEditedHtml();
    await saveEditedToDB(updatedHtml);
    try {
      const res = await axios.get(`${API.OPENAI_DOWNLOAD_DOCX_DOWNLOAD}?clientId=${client.company_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });

      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SOW_${client.company_name.replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Download failed", err);
      alert("Download failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-[1000px] max-h-[90vh] rounded-xl p-6 overflow-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">
          Generate {docType} Document for {client.company_name}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Services *</label>
            <input value={services} onChange={(e) => setServices(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date *</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date *</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {loading ? <ClipLoader size={16} color="#fff" /> : "Generate Document"}
        </button>

        <h3 className="text-md font-semibold mb-2">Preview Document</h3>
        <div
          ref={previewRef}
          className="prose max-w-none bg-white p-4 rounded border overflow-auto max-h-[400px]"
          contentEditable
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        ></div>

        <div className="flex gap-2 items-center mt-3 mb-2">
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Enter command to edit document (e.g., add bullet points)"
            className="flex-1 border px-3 py-2 rounded"
          />
          <button onClick={handleInstructionEdit} className="bg-purple-600 text-white px-4 py-2 rounded">
            <FaMagic className="inline-block mr-1" /> Apply
          </button>
          <button onClick={handleManualSave} className="bg-yellow-500 text-white px-4 py-2 rounded">
            <FaSave className="inline-block mr-1" /> Save Changes
          </button>
        </div>

        <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded">
          <FaDownload className="inline-block mr-1" /> Download .docx
        </button>
      </div>
    </div>
  );
};

export default GenerateDocModal;
