import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaDownload, FaMagic } from "react-icons/fa";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import API from "../api/config";

const GenerateDocModal = ({ client, docType, onClose }) => {
  const [services, setServices] = useState("Software Development, Integration");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0]
  );
  const [billingTerms, setBillingTerms] = useState("monthly hours logged");
  const [techStack, setTechStack] = useState("Java, React, PostgreSQL");

  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [editedHtml, setEditedHtml] = useState("");

  const [rewriteBtnPos, setRewriteBtnPos] = useState({ visible: false, top: 0, left: 0 });
  const [selectedTextInfo, setSelectedTextInfo] = useState({
    text: "",
    start: null,
    end: null,
  });

  const [rewriteInstruction, setRewriteInstruction] = useState("");
  const [showRewriteForm, setShowRewriteForm] = useState(false);

  const lastSelectionRef = useRef({ start: null, end: null });
  const rewriteBtnRef = useRef(null);
  const showRewriteFormRef = useRef(false);

  const [isGeneratingRewrite, setIsGeneratingRewrite] = useState(false);

  const previewRef = useRef();

  const token = localStorage.getItem("token");

  const isMSA = docType === "MSA";

  const handleGenerate = async () => {
    if (!token) return alert("⚠️ Please login again. Missing token.");
    setLoading(true);
    try {
      const res = await axios.post(
        isMSA ? API.OPENAI_GENERATE_MSA_HTML : API.OPENAI_GENERATE_SOW_HTML,
        {
          companyName: client.company_name,
          industry: client.industry,
          services,
          startDate,
          endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const html = res.data?.previewHtml;
      if (html) {
        setPreviewHtml(html);
        setEditedHtml(html);
        alert(`✅ ${docType} preview generated!`);
      } else {
        alert("⚠️ Empty preview received");
      }
    } catch (err) {
      console.error(`❌ ${docType} preview generation failed`, err);
      alert("Preview generation failed.");
    } finally {
      setLoading(false);
    }
  };

  // Map a linear character offset (over textContent) to a concrete DOM {node, offset}
  const locateTextPosition = (container, target) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    let acc = 0, n;
    while ((n = walker.nextNode())) {
      const len = n.nodeValue.length;
      if (target <= acc + len) {
        return { node: n, offset: target - acc };
      }
      acc += len;
    }
    return null;
  };

  const handleInstructionEdit = async () => {
    if (isGeneratingRewrite) return;

    const container = previewRef.current;
    const { start, end, text: originalText } = selectedTextInfo || {};

    if (!container) return;
    if (!(Number.isFinite(start) && Number.isFinite(end) && end > start)) {
      alert("No valid selection to rewrite.");
      return;
    }

    setIsGeneratingRewrite(true);
    try {
      // 1) Get edited text for the selected span
      const { data } = await axios.post(
        API.OPENAI_EDIT_DOC,
        {
          originalContent: originalText,
          rewriteInstruction: rewriteInstruction?.trim() || "Rewrite this text.",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console

      const rewritten = (data?.content ?? "").trim() || "Testing Replacement";

      // 2) Rebuild DOM Range from linear offsets
      const startPos = locateTextPosition(container, start);
      const endPos = locateTextPosition(container, end);
      if (!startPos || !endPos) {
        alert("Could not resolve selection range in the preview.");
        return;
      }

      const range = document.createRange();
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, endPos.offset);

      range.deleteContents();
      const replacementNode = document.createTextNode(rewritten || "Testing Replacement");
      range.insertNode(replacementNode);

      // 5) Sync back to state
      const updatedHtml = container.innerHTML;
      setEditedHtml(updatedHtml);
      setPreviewHtml(updatedHtml);

      setRewriteInstruction("");
      setShowRewriteForm(false);
      setRewriteBtnPos(p => ({ ...p, visible: false }));

      // Update offsets to the new text span
      setSelectedTextInfo({
        text: rewritten,
        start,
        end: start + rewritten.length,
      });
    } catch (err) {
      console.error("Edit/replace failed:", err);
      alert("Edit failed.");
    } finally {
      setIsGeneratingRewrite(false);
    }
  };

  const handleSaveAndDownload = async () => { // This function downloads the file by convering the html back into docx
    if (!token || !client?.company_id) {
      return alert("Missing required fields or token");
    }

    setLoading(true);
    try {
      const updatedHtml = previewRef.current?.innerHTML || editedHtml;
      setEditedHtml(updatedHtml);

      const meta = {
        services,
        techStack,
        billingTerms,
        startDate,
        endDate,
        companyName: client.company_name,
        industry: client.industry,
      };

      const docTypeValue = isMSA ? "MSA" : "SOW";

      const saveApi = isMSA ? API.OPENAI_SAVE_MSA_DOC : API.OPENAI_SAVE_FINAL_DOC; // Save then download
      const downloadApi = isMSA ? API.OPENAI_DOWNLOAD_MSA_DOC : API.OPENAI_DOWNLOAD_FINAL_DOC;

      // Save document with doc_type
      const saveRes = await axios.post(
        saveApi,
        {
          clientId: client.company_id,
          editedHtml: updatedHtml,
          metaFields: meta,
          doc_type: docType, // ✅ Critical
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Probably validate saveRes here

      // Download document
      const res = await axios.get(
        `${downloadApi}?clientId=${client.company_id}&docType=${docTypeValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${docTypeValue}_${client.company_name.replace(/\s+/g, "_")}.docx`;
      link.click();
      link.remove();

    } catch (err) {
      console.error(`❌ Save/Download failed for ${docType}`, err.response?.data || err);
      alert(`Download failed for ${docType}`);
    } finally {
      setLoading(false);
    }
  };

  const getSelectionOffsets = (container, sel) => {
    const range = sel.getRangeAt(0);
    const text = sel.toString();
    const pre = document.createRange();
    pre.selectNodeContents(container);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const end = start + text.length;
    return { text, start, end };
  };

  const handleSelectionChange = () => {
    const container = previewRef.current;
    const sel = window.getSelection();
    if (!container || !sel || sel.rangeCount === 0) return;

    // Only react to changes inside preview
    if (!selectionInsidePreview()) return;

    const { text, start, end } = getSelectionOffsets(container, sel);

    // If empty selection inside preview, hide + reset
    if (!text.trim()) {
      setRewriteBtnPos(p => ({ ...p, visible: false }));
      setShowRewriteForm(false);
      setRewriteInstruction("");
      lastSelectionRef.current = { start: null, end: null };
      return;
    }

    const last = lastSelectionRef.current;
    const changed = last.start !== start || last.end !== end;

    if (changed) {
      // New selection → reset UI to fresh button state
      setShowRewriteForm(false);
      setRewriteInstruction("");
      setSelectedTextInfo({ text, start, end });

      // Position near the caret immediately (ignore showRewriteFormRef)
      const rect = getCaretViewportRect();
      if (rect) {
        const GAP = 8, BTN_W = 150, BTN_H = 32;
        let top = rect.top, left = rect.right + GAP;
        left = Math.max(6, Math.min(left, window.innerWidth - BTN_W - 6));
        top = Math.max(6, Math.min(top, window.innerHeight - BTN_H - 6));
        setRewriteBtnPos({ visible: true, top, left });
      } else {
        setRewriteBtnPos(p => ({ ...p, visible: false }));
      }

      lastSelectionRef.current = { start, end };
    }
  };


  // Try to get the viewport rect of a collapsed range at the caret.
  // Falls back to a temporary <span> if the browser returns an empty rect.
  const getCaretViewportRect = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    const baseRange = sel.getRangeAt(0);
    const caret = document.createRange();

    const { focusNode, focusOffset } = sel;

    try {
      caret.setStart(focusNode, Math.min(focusOffset, (focusNode?.length ?? focusOffset)));
      caret.collapse(true);

      // Prefer client rects of the collapsed range
      const rects = caret.getClientRects();
      if (rects && rects.length > 0) return rects[0];

      // Fallback to bounding rect
      const br = caret.getBoundingClientRect();
      if (br && (br.width || br.height)) return br;
    } catch {
      // ignore and fall through to span fallback
    }

    // Fallback: insert a zero-width marker at the caret to measure
    try {
      const span = document.createElement("span");
      // Zero-size, no layout disruption
      span.textContent = "\u200b";
      span.style.position = "fixed"; // not required, but harmless
      span.style.padding = "0";
      span.style.margin = "0";
      span.style.lineHeight = "0";
      span.style.opacity = "0";

      const tmpRange = document.createRange();
      tmpRange.setStart(focusNode, Math.min(focusOffset, (focusNode?.length ?? focusOffset)));
      tmpRange.collapse(true);
      tmpRange.insertNode(span);

      const rect = span.getBoundingClientRect();
      span.parentNode?.removeChild(span);
      return rect;
    } catch {
      // Final fallback to base selection rect (may be off a bit)
      return baseRange.getBoundingClientRect();
    }
  };

  const selectionInsidePreview = () => {
    const sel = window.getSelection();
    const container = previewRef.current;
    if (!sel || !container || sel.rangeCount === 0) return false;

    const { anchorNode, focusNode } = sel;
    const isDesc = (node, parent) => {
      for (let n = node; n; n = n.parentNode) if (n === parent) return true;
      return false;
    };
    return isDesc(anchorNode, container) && isDesc(focusNode, container);
  };

  useEffect(() => {
    const onMouseUp = () => requestAnimationFrame(handleSelectionChange);
    const onKeyUp = () => requestAnimationFrame(handleSelectionChange);
    const onSelChange = () => requestAnimationFrame(handleSelectionChange);
    const onScroll = () => requestAnimationFrame(handleSelectionChange);
    const onResize = () => requestAnimationFrame(handleSelectionChange);

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("selectionchange", onSelChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Hide if clicking outside preview
    const onDocMouseDown = (e) => {
      if (rewriteBtnRef.current?.contains(e.target)) return; // keep UI if clicking the floating form
      if (!previewRef.current?.contains(e.target)) {
        setRewriteBtnPos(p => ({ ...p, visible: false }));
        setShowRewriteForm(false);
        setRewriteInstruction("");
        lastSelectionRef.current = { start: null, end: null };
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("selectionchange", onSelChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, []);

  useEffect(() => {
    showRewriteFormRef.current = showRewriteForm;
  }, [showRewriteForm]);

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

        <button onClick={handleGenerate} disabled={loading} className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {loading ? <ClipLoader size={16} color="#fff" /> : "Generate Document"}
        </button>

        <h3 className="text-md font-semibold mb-2">Preview Document</h3>

        <div className="relative"> { }
          <div
            ref={previewRef}
            className="prose relative max-w-none bg-white p-4 rounded border overflow-auto max-h-[400px]"
            contentEditable
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />

          {rewriteBtnPos.visible && (
            <div
              ref={rewriteBtnRef}
              style={{
                position: "fixed",
                top: rewriteBtnPos.top,
                left: rewriteBtnPos.left,
                zIndex: 9999,
              }}
              className="flex items-center gap-2"
              onMouseDown={(e) => {
                // Keep selection & prevent global handlers
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {!showRewriteForm ? (
                <button
                  type="button"
                  className="px-2 py-1 text-xs rounded bg-black text-white shadow hover:opacity-90"
                  onClick={() => {
                    // capture selection (optional, if you want to persist it here too)
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                      const range = sel.getRangeAt(0);
                      const text = sel.toString();
                      const container = previewRef.current;
                      let start = null, end = null;
                      if (container) {
                        const preRange = document.createRange();
                        preRange.selectNodeContents(container);
                        preRange.setEnd(range.startContainer, range.startOffset);
                        start = preRange.toString().length;
                        end = start + text.length;
                      }
                      setSelectedTextInfo({ text, start, end });
                    }
                    setShowRewriteForm(true);
                    // optional: focus next tick
                    requestAnimationFrame(() => {
                      const input = document.getElementById("rewrite-instruction-input");
                      input?.focus();
                    });
                  }}
                >
                  Rewrite using AI
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-white border rounded px-2 py-1 shadow">
                    <input
                      id="rewrite-instruction-input"
                      type="text"
                      value={rewriteInstruction}
                      onChange={(e) => setRewriteInstruction(e.target.value)}
                      placeholder="How do you want to change this text?"
                      className="text-xs px-2 py-1 outline-none min-w-[260px]"
                      disabled={isGeneratingRewrite}
                      aria-busy={isGeneratingRewrite}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setShowRewriteForm(false);
                        if (e.key === "Enter" && !isGeneratingRewrite) handleInstructionEdit();
                      }}
                    />
                    {isGeneratingRewrite ? (
                      <button
                        type="button"
                        disabled
                        className="text-xs px-2 py-1 rounded bg-black text-white opacity-70 cursor-not-allowed flex items-center gap-2"
                      >
                        <ClipLoader size={12} color="#fff" />
                        <span>Generating…</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded bg-black text-white hover:opacity-90"
                        onClick={handleInstructionEdit}
                      >
                        Generate
                      </button>
                    )}
                  </div>
              )}
            </div>
          )}


        </div>

        <div className="mt-2"
        ><button onClick={handleSaveAndDownload} className="bg-blue-600 text-white px-4 py-2 rounded">
            <FaDownload className="inline-block mr-1" /> Save & Download
          </button>
        </div>

      </div>
    </div>
  );
};

export default GenerateDocModal;
