"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../supabaseClient";

function decodePayload(raw) {
  try {
    if (!raw) return null;
    const json = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function money(n) {
  return "$" + Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ClientPageContent() {
  const params = useSearchParams();
  const payload = useMemo(() => decodePayload(params.get("payload")), [params]);
  const token = params.get("token");
  const [legacyResolved, setLegacyResolved] = useState(null);
  const [tokenResolved, setTokenResolved] = useState(null);
  const [approveBusy, setApproveBusy] = useState(false);
  const [approveNotice, setApproveNotice] = useState(null);
  const [showAdminNav, setShowAdminNav] = useState(false);
  const [questionnaireBusy, setQuestionnaireBusy] = useState(false);
  const [questionnaireNotice, setQuestionnaireNotice] = useState(null);
  const [questionnaireForm, setQuestionnaireForm] = useState({
    phone: "",
    location: "",
    eventName: "",
    eventDate: "",
    goals: "",
    mustHaves: "",
    styleNotes: "",
    additionalNotes: "",
  });

  useEffect(() => {
    if (payload?.document) return;
    const legacyType = params.get("type");
    const legacyId = params.get("id");
    if (!legacyType || !legacyId) return;

    try {
      const raw = window.localStorage.getItem("nsp_lead_detail_v2");
      if (!raw) return;
      const state = JSON.parse(raw);

      if (legacyType === "contract") {
        const contract = (state?.contracts || []).find((c) => String(c.id) === String(legacyId));
        if (contract) {
          setLegacyResolved({
            type: "contract",
            document: {
              title: contract.title || "",
              clientName: contract.signer || "",
              sessionType: contract.sessionType || "",
              version: contract.version || "v1",
              body: contract.body || "Contract body unavailable in this link.",
            },
          });
        }
      }
    } catch {
      setLegacyResolved(null);
    }
  }, [params, payload]);

  useEffect(() => {
    let canceled = false;
    async function loadTokenDoc() {
      if (!token) {
        setTokenResolved(null);
        return;
      }
      const { data, error } = await supabase.rpc("get_quote_approval_by_token", {
        p_token: token,
      });
      if (canceled) return;
      if (error) {
        setTokenResolved(null);
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.payload) {
        setTokenResolved(null);
        return;
      }
      setTokenResolved({
        type: "quote",
        document: row.payload,
        approvalStatus: row.status || "pending",
      });
    }
    loadTokenDoc();
    return () => {
      canceled = true;
    };
  }, [token]);

  useEffect(() => {
    try {
      setShowAdminNav(Boolean(window.localStorage.getItem("nsp_lead_detail_v2")));
    } catch {
      setShowAdminNav(false);
    }
  }, []);

  const resolved = tokenResolved?.document
    ? tokenResolved
    : payload?.document
      ? payload
      : legacyResolved;
  const isInvoice = resolved?.type === "invoice" && resolved?.document;
  const isQuote = resolved?.type === "quote" && resolved?.document;
  const isSignDoc =
    (resolved?.type === "contract" || resolved?.type === "release") && resolved?.document;
  const inv = isInvoice ? resolved.document : null;
  const quote = isQuote ? resolved.document : null;
  const quoteStatus = isQuote ? resolved?.approvalStatus || "pending" : "pending";
  const doc = isSignDoc ? resolved.document : null;

  useEffect(() => {
    if (!quote) return;
    setQuestionnaireForm((prev) => ({
      ...prev,
      eventName: quote.eventName || prev.eventName,
      eventDate: quote.eventDate || prev.eventDate,
    }));
  }, [quote]);

  if (!isInvoice && !isQuote && !isSignDoc) {
    return (
      <div style={{ background: "#f4f4f5", minHeight: "100vh", padding: "48px 20px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          {showAdminNav && (
            <div style={{ textAlign: "right", padding: "14px 18px 0" }}>
              <a
                href="/"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  background: "#111827",
                  color: "#f3f4f6",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Back to Dashboard
              </a>
            </div>
          )}
          <div
            style={{
              background: "#0e0f11",
              color: "#d4a853",
              padding: "24px 28px",
              fontSize: 46,
              fontWeight: 800,
            }}
          >
            Nico Salgado Photography
          </div>
          <div style={{ padding: "72px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 54, marginBottom: 10 }}>🔗</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#1f2937", marginBottom: 8 }}>
              Link Not Found
            </div>
            <div style={{ fontSize: 30, color: "#6b7280" }}>
              This link may have expired or is no longer valid. Please contact Nico for assistance.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSignDoc) {
    const label = resolved.type === "release" ? "Model Release" : "Contract";
    return (
      <div style={{ background: "#f4f4f5", minHeight: "100vh", padding: "24px 20px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          {showAdminNav && (
            <div style={{ textAlign: "right", padding: "14px 18px 0" }}>
              <a
                href="/"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  background: "#111827",
                  color: "#f3f4f6",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Back to Dashboard
              </a>
            </div>
          )}
          <div
            style={{
              background: "#0e0f11",
              color: "#d4a853",
              padding: "22px 28px",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            Nico Salgado Photography
          </div>
          <div style={{ padding: "28px" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
              {label}
            </div>
            <div style={{ color: "#6b7280", fontSize: 16, marginBottom: 18 }}>
              {doc.title || "Document"}
            </div>
            <div style={{ fontSize: 14, color: "#4b5563", marginBottom: 16 }}>
              {doc.clientName || "Client"}
              {doc.sessionType ? ` · ${doc.sessionType}` : ""}
              {doc.version ? ` · ${doc.version}` : ""}
            </div>
            <div
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 15,
                lineHeight: 1.8,
                color: "#1f2937",
                padding: "20px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            >
              {doc.body || "Document text unavailable."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isQuote) {
    const emailTo = quote.businessEmail || "nicosalgadophoto@gmail.com";
    const subject = `Quote ${quote.quoteNumberLabel || ""} Approved - ${quote.clientName || "Client"}`.trim();
    const bodyText = `Hi Nico,\n\nI approve quote ${
      quote.quoteNumberLabel || ""
    }. Please send the payment link and next steps.\n\nThank you,\n${quote.clientName || ""}`;
    const approveMailto = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyText)}`;
    const approveByToken = async () => {
      if (!token) return;
      setApproveBusy(true);
      setApproveNotice(null);
      const { data, error } = await supabase.rpc("approve_quote_by_token", { p_token: token });
      setApproveBusy(false);
      if (error) {
        setApproveNotice({ type: "error", message: "Could not approve quote. Please try again." });
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setApproveNotice({ type: "error", message: "Approval failed. Link may be invalid." });
        return;
      }
      setTokenResolved((prev) => (prev ? { ...prev, approvalStatus: "approved" } : prev));
      setApproveNotice({
        type: "success",
        message: "Quote approved. Nico has been notified and will send payment next steps.",
      });
    };
    const questionnaireFields = Array.isArray(quote.bookingProcess?.questionnaireFields)
      ? quote.bookingProcess.questionnaireFields
      : [];
    const questionnaireTemplateBody = quote.bookingProcess?.questionnaireTemplateContent || "";
    const showQuestionnaire = Boolean(quote.bookingProcess?.questionnaire);
    const submitQuestionnaire = async () => {
      const workspaceId = quote.workspaceId;
      if (!workspaceId) {
        setQuestionnaireNotice({
          type: "error",
          message: "This questionnaire is not linked to a client workspace yet.",
        });
        return;
      }
      setQuestionnaireBusy(true);
      setQuestionnaireNotice(null);
      const { data, error } = await supabase
        .from("crm_workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();
      if (error || !data) {
        setQuestionnaireBusy(false);
        setQuestionnaireNotice({
          type: "error",
          message: "Could not load the client workspace to save your answers.",
        });
        return;
      }

      const snapshot = data.workspace || {};
      const lead = snapshot.lead || {};
      const nextNotes = Array.isArray(snapshot.notes) ? [...snapshot.notes] : [];
      const summaryLines = Object.entries(questionnaireForm)
        .filter(([, value]) => String(value || "").trim())
        .map(([key, value]) => `${key}: ${value}`);
      if (summaryLines.length > 0) {
        nextNotes.unshift({
          id: `note-${Date.now()}`,
          text: `Questionnaire response\n${summaryLines.join("\n")}`,
          date: new Date().toISOString(),
        });
      }

      const nextWorkspace = {
        ...snapshot,
        lead: {
          ...lead,
          name: quote.clientName || lead.name || "",
          email: quote.clientEmail || lead.email || "",
          phone: questionnaireForm.phone || lead.phone || "",
          type: questionnaireForm.eventName || quote.eventName || lead.type || "",
          eventDate: questionnaireForm.eventDate || quote.eventDate || lead.eventDate || "",
          location: questionnaireForm.location || lead.location || "",
        },
        notes: nextNotes,
      };

      const { error: updateError } = await supabase
        .from("crm_workspaces")
        .update({
          client_name: quote.clientName || data.client_name || "",
          client_email: quote.clientEmail || data.client_email || "",
          event_date: questionnaireForm.eventDate || quote.eventDate || data.event_date || null,
          workspace: nextWorkspace,
          updated_at: new Date().toISOString(),
        })
        .eq("id", workspaceId);

      setQuestionnaireBusy(false);
      if (updateError) {
        setQuestionnaireNotice({
          type: "error",
          message: "We could not save your questionnaire answers. Please try again.",
        });
        return;
      }
      setQuestionnaireNotice({
        type: "success",
        message: "Your questionnaire answers were saved. Nico can now use them to finish the booking details.",
      });
    };

    return (
      <div style={{ background: "#f4f4f5", minHeight: "100vh", padding: "24px 20px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
            border: "1px solid #e5e7eb",
            color: "#111827",
          }}
        >
          {showAdminNav && (
            <div style={{ textAlign: "right", padding: "14px 18px 0" }}>
              <a
                href="/"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  background: "#111827",
                  color: "#f3f4f6",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Back to Dashboard
              </a>
            </div>
          )}
          <div
            style={{
              background: "#0e0f11",
              color: "#d4a853",
              padding: "22px 28px",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            {quote.businessName || "Nico Salgado Photography"}
          </div>

          <div style={{ padding: "28px" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
              Quote {quote.quoteNumberLabel || ""}
            </div>
            <div style={{ color: "#6b7280", fontSize: 16, marginBottom: 18 }}>
              {quote.eventName || "Photography Services"}
            </div>

            {!!quote.introduction && (
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>
                {quote.introduction}
              </div>
            )}

            {Array.isArray(quote.sections) &&
              quote.sections.map((section, idx) => (
                <div
                  key={`${section.packageName || "section"}-${idx}`}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "14px 16px",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                    {section.packageName || "Package"}
                  </div>
                  {!!section.description && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#4b5563",
                        lineHeight: 1.6,
                        marginBottom: 8,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {section.description}
                    </div>
                  )}
                  {Array.isArray(section.includes) && section.includes.length > 0 && (
                    <ul style={{ margin: "0 0 10px 18px", padding: 0, color: "#374151", fontSize: 13 }}>
                      {section.includes.map((inc, incIdx) => (
                        <li key={`${inc}-${incIdx}`} style={{ marginBottom: 4 }}>
                          {inc}
                        </li>
                      ))}
                    </ul>
                  )}
                  {Array.isArray(section.lineItems) &&
                    section.lineItems.map((li, liIdx) => {
                      const qty = Number(li.qty || 1);
                      const price = Number(li.price || 0);
                      return (
                        <div
                          key={`${li.name || "line"}-${liIdx}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            padding: "6px 0",
                            borderTop: "1px solid #f0f1f3",
                          }}
                        >
                          <div style={{ fontSize: 13, color: "#111827" }}>{li.name || "Item"}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                            {money(price * qty)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
              <tbody>
                <tr style={{ borderTop: "2px solid #111827" }}>
                  <td style={{ padding: "12px 0", fontWeight: 700 }}>Subtotal</td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 700 }}>
                    {money(quote.subtotal)}
                  </td>
                </tr>
                {Number(quote.discountAmount || 0) > 0 && (
                  <tr>
                    <td style={{ padding: "8px 0", color: "#dc2626", fontWeight: 700 }}>Discount</td>
                    <td
                      style={{
                        padding: "8px 0",
                        textAlign: "right",
                        color: "#dc2626",
                        fontWeight: 700,
                      }}
                    >
                      -{money(quote.discountAmount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: "8px 0", fontWeight: 800, fontSize: 20 }}>Total</td>
                  <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 800, fontSize: 20 }}>
                    {money(quote.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {!!quote.notes && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid #e5e7eb",
                  fontSize: 14,
                  color: "#4b5563",
                  whiteSpace: "pre-wrap",
                }}
              >
                {quote.notes}
              </div>
            )}

            {showQuestionnaire && (
              <div
                style={{
                  marginTop: 20,
                  padding: "18px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  background: "#faf7f2",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                  {quote.bookingProcess?.questionnaire || "Questionnaire"}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 14, whiteSpace: "pre-wrap" }}>
                  {questionnaireTemplateBody || "Please complete the missing details below so Nico can finalize your booking."}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {(questionnaireFields.length
                    ? questionnaireFields
                    : [
                        { key: "phone", label: "Best phone number", type: "text" },
                        { key: "location", label: "Preferred location / venue", type: "text" },
                        { key: "eventName", label: "Final event or session title", type: "text" },
                        { key: "goals", label: "Goals for this session", type: "textarea" },
                        { key: "additionalNotes", label: "Anything else I should know", type: "textarea" },
                      ]).map((field) => {
                    const isTextarea = field.type === "textarea";
                    return (
                      <div key={field.key} style={{ gridColumn: isTextarea ? "1 / span 2" : "auto" }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 5 }}>
                          {field.label}
                        </label>
                        {isTextarea ? (
                          <textarea
                            value={questionnaireForm[field.key] || ""}
                            onChange={(e) =>
                              setQuestionnaireForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            rows={3}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              border: "1px solid #d1d5db",
                              borderRadius: 8,
                              padding: "10px 12px",
                              fontSize: 14,
                              fontFamily: "inherit",
                              background: "#fff",
                            }}
                          />
                        ) : (
                          <input
                            type={field.key === "eventDate" ? "date" : "text"}
                            value={questionnaireForm[field.key] || ""}
                            onChange={(e) =>
                              setQuestionnaireForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              border: "1px solid #d1d5db",
                              borderRadius: 8,
                              padding: "10px 12px",
                              fontSize: 14,
                              background: "#fff",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={submitQuestionnaire}
                    disabled={questionnaireBusy}
                    style={{
                      border: "none",
                      borderRadius: 8,
                      padding: "11px 18px",
                      background: "#111827",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: questionnaireBusy ? "default" : "pointer",
                      opacity: questionnaireBusy ? 0.7 : 1,
                    }}
                  >
                    {questionnaireBusy ? "Saving..." : "Save Questionnaire"}
                  </button>
                </div>
                {questionnaireNotice && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      background: questionnaireNotice.type === "success" ? "#ecfdf5" : "#fef2f2",
                      color: questionnaireNotice.type === "success" ? "#047857" : "#b91c1c",
                      border:
                        questionnaireNotice.type === "success"
                          ? "1px solid #a7f3d0"
                          : "1px solid #fecaca",
                    }}
                  >
                    {questionnaireNotice.message}
                  </div>
                )}
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 24 }}>
              {token ? (
                <button
                  onClick={approveByToken}
                  disabled={approveBusy || quoteStatus === "approved"}
                  style={{
                    display: "inline-block",
                    padding: "12px 28px",
                    background: quoteStatus === "approved" ? "#10b981" : "#d4a853",
                    color: "#0e0f11",
                    textDecoration: "none",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 800,
                    cursor: approveBusy || quoteStatus === "approved" ? "default" : "pointer",
                    opacity: approveBusy ? 0.7 : 1,
                  }}
                >
                  {quoteStatus === "approved"
                    ? "Approved"
                    : approveBusy
                      ? "Approving..."
                      : "Approve Quote"}
                </button>
              ) : (
                <a
                  href={approveMailto}
                  style={{
                    display: "inline-block",
                    padding: "12px 28px",
                    background: "#d4a853",
                    color: "#0e0f11",
                    textDecoration: "none",
                    borderRadius: 8,
                    fontWeight: 800,
                  }}
                >
                  Approve Quote
                </a>
              )}
            </div>

            {approveNotice && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  background: approveNotice.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: approveNotice.type === "success" ? "#047857" : "#b91c1c",
                  border:
                    approveNotice.type === "success"
                      ? "1px solid #a7f3d0"
                      : "1px solid #fecaca",
                }}
              >
                {approveNotice.message}
              </div>
            )}

            <div style={{ marginTop: 18, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
              After approval, we'll send your payment link and next booking steps.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f4f5", minHeight: "100vh", padding: "24px 20px" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
          border: "1px solid #e5e7eb",
          color: "#111827",
        }}
      >
        {showAdminNav && (
          <div style={{ textAlign: "right", padding: "14px 18px 0" }}>
            <a
              href="/"
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#111827",
                color: "#f3f4f6",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Back to Dashboard
            </a>
          </div>
        )}
        <div
          style={{
            background: "#0e0f11",
            color: "#d4a853",
            padding: "22px 28px",
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          Nico Salgado Photography
        </div>
        <div style={{ padding: "28px" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
            Invoice {inv.invoiceNumber || ""}
          </div>
          <div style={{ color: "#6b7280", fontSize: 16, marginBottom: 18 }}>
            {inv.title || "Photography Services"}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", color: "#6b7280" }}>Client</td>
                <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 700 }}>
                  {inv.clientName || "—"}
                </td>
              </tr>
              {!!inv.sessionType && (
                <tr>
                  <td style={{ padding: "8px 0", color: "#6b7280" }}>Service</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>
                    {inv.sessionType}
                    {inv.packageName ? ` — ${inv.packageName}` : ""}
                  </td>
                </tr>
              )}
              {!!inv.sessionDate && (
                <tr>
                  <td style={{ padding: "8px 0", color: "#6b7280" }}>Date</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{inv.sessionDate}</td>
                </tr>
              )}
              <tr style={{ borderTop: "2px solid #111827" }}>
                <td style={{ padding: "12px 0", fontWeight: 700 }}>Total</td>
                <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 700 }}>
                  {money(inv.totalAmount)}
                </td>
              </tr>
              {Number(inv.amountPaid || 0) > 0 && (
                <tr>
                  <td style={{ padding: "6px 0", color: "#059669", fontWeight: 700 }}>Paid</td>
                  <td
                    style={{
                      padding: "6px 0",
                      textAlign: "right",
                      color: "#059669",
                      fontWeight: 700,
                    }}
                  >
                    {money(inv.amountPaid)}
                  </td>
                </tr>
              )}
              {Number(inv.balanceDue || 0) > 0 && (
                <tr>
                  <td style={{ padding: "6px 0", color: "#dc2626", fontWeight: 700 }}>
                    Balance Due
                  </td>
                  <td
                    style={{
                      padding: "6px 0",
                      textAlign: "right",
                      color: "#dc2626",
                      fontWeight: 800,
                    }}
                  >
                    {money(inv.balanceDue)}
                  </td>
                </tr>
              )}
              {Number(inv.balanceDue || 0) <= 0 && (
                <tr>
                  <td style={{ padding: "6px 0", color: "#059669", fontWeight: 700 }}>
                    Status
                  </td>
                  <td
                    style={{
                      padding: "6px 0",
                      textAlign: "right",
                      color: "#059669",
                      fontWeight: 800,
                    }}
                  >
                    Paid in full
                  </td>
                </tr>
              )}
              {!!inv.dueDate && (
                <tr>
                  <td style={{ padding: "6px 0", color: "#6b7280" }}>Due Date</td>
                  <td style={{ padding: "6px 0", textAlign: "right" }}>{inv.dueDate}</td>
                </tr>
              )}
            </tbody>
          </table>

          {!!inv.squareLink && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a
                href={inv.squareLink}
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  background: "#d4a853",
                  color: "#0e0f11",
                  textDecoration: "none",
                  borderRadius: 8,
                  fontWeight: 800,
                }}
              >
                Pay Now
              </a>
            </div>
          )}

          {!!inv.notes && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 12,
                borderTop: "1px solid #e5e7eb",
                fontSize: 14,
                color: "#4b5563",
              }}
            >
              {inv.notes}
            </div>
          )}

          <div style={{ marginTop: 18, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
            Questions? Reply to Nico Salgado Photography for assistance.
          </div>
        </div>
      </div>
    </div>
  );
}
