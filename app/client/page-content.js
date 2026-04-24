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
  const showAdminNav = params.get("admin") === "1";

  useEffect(() => {
    let canceled = false;
    async function loadLegacyDoc() {
      if (payload?.document) return;
      const legacyType = params.get("type");
      const legacyId = params.get("id");
      if (!legacyType || !legacyId) {
        setLegacyResolved(null);
        return;
      }

      try {
        if (legacyType === "contract") {
          const { data, error } = await supabase
            .from("contracts")
            .select("*")
            .eq("id", legacyId)
            .single();
          if (canceled || error || !data) return;
          setLegacyResolved({
            type: "contract",
            document: {
              title: data.title || "",
              clientName: data.client_name || data.signer || "",
              sessionType: data.session_type || "",
              version: data.version || "v1",
              body: data.body || "Contract body unavailable in this link.",
            },
          });
          return;
        }

        if (legacyType === "release") {
          const { data, error } = await supabase
            .from("model_releases")
            .select("*")
            .eq("id", legacyId)
            .single();
          if (canceled || error || !data) return;
          setLegacyResolved({
            type: "release",
            document: {
              title: data.title || "",
              clientName: data.client_name || data.signer || "",
              sessionType: data.session_type || "",
              version: data.version || "v1",
              body: data.body || "Release body unavailable in this link.",
            },
          });
          return;
        }

        if (legacyType === "invoice") {
          const { data, error } = await supabase
            .from("invoices")
            .select("*")
            .eq("id", legacyId)
            .single();
          if (canceled || error || !data) return;
          setLegacyResolved({
            type: "invoice",
            document: {
              invoiceNumber: data.invoice_number || "",
              title: data.title || "",
              clientName: data.client_name || "",
              sessionType: data.session_type || "",
              packageName: data.package_name || "",
              sessionDate: data.session_date || "",
              totalAmount: Number(data.total_amount || data.amount || 0),
              amountPaid: Number(data.amount_paid || 0),
              balanceDue: Number(data.balance_due || 0),
              dueDate: data.due_date || "",
              notes: data.notes || "",
              paymentMethod: data.payment_method || "",
              squareLink: data.square_link || "",
            },
          });
        }
      } catch {
        if (!canceled) setLegacyResolved(null);
      }
    }

    loadLegacyDoc();
    return () => {
      canceled = true;
    };
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
    const teal = "#0891b2";
    const contractsList = Array.isArray(quote.contractTemplates)
      ? quote.contractTemplates
      : quote.contractTemplate ? [quote.contractTemplate] : [];
    const logoUrl = quote.logoUrl || "/nsp-logo.jpg";

    return (
      <div style={{ background: "#f0f0f0", minHeight: "100vh", padding: "32px 20px", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.08)", color: "#1a1a1a" }}>
          {showAdminNav && (
            <div style={{ textAlign: "right", padding: "10px 18px 0" }}>
              <a href="/" style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}>← Back to Dashboard</a>
            </div>
          )}

          {/* Header: logo+info left, quote#+recipient right */}
          <div style={{ padding: "28px 32px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, borderBottom: "1px solid #e5e5e5" }}>
            <div>
              <img src={logoUrl} alt="NSP Logo" style={{ maxHeight: 52, width: "auto", display: "block", marginBottom: 8 }} onError={e => { e.target.style.display = "none"; }} />
              <div style={{ fontSize: 22, fontWeight: 800, color: teal, letterSpacing: "-0.02em" }}>{quote.businessName || "Nico Salgado Photography"}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.8, marginTop: 4 }}>
                30317 Glenmuer<br />
                Farmington Hills, MI 48334<br />
                https://www.nicosalgadophotography.com<br />
                nicosalgadophoto@gmail.com
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{quote.quoteNumberLabel || "Quote"}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Quote Total: <strong>{money(quote.totalAmount)}</strong></div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Recipient</div>
                <div style={{ fontSize: 13, color: "#666" }}>{quote.clientName || ""}</div>
                {!!quote.clientEmail && <div style={{ fontSize: 13, color: "#666" }}>{quote.clientEmail}</div>}
              </div>
            </div>
          </div>

          <div style={{ padding: "24px 32px" }}>
            {/* Event heading */}
            {(quote.eventName || quote.eventDate) && (
              <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #e0e0e0" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: teal }}>
                  {quote.clientName || quote.eventName || "Quote"}
                  {quote.eventDate ? ` on ${new Date(quote.eventDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}` : ""}
                </div>
              </div>
            )}

            {!!quote.introduction && (
              <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>{quote.introduction}</div>
            )}

            {/* Sections */}
            {Array.isArray(quote.sections) && quote.sections.map((section, idx) => {
              const cleanInc = (section.includes || []).filter(Boolean);
              // If description exists, skip includes (they're already in description text)
              const showIncludes = cleanInc.length > 0 && !section.description;
              return (
                <div key={idx} style={{ marginBottom: 28 }}>
                  {!!section.packageName && (
                    <div style={{ fontSize: 16, fontWeight: 700, color: teal, marginBottom: 8 }}>{section.packageName}</div>
                  )}
                  {!!section.description && (
                    <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, marginBottom: 10, whiteSpace: "pre-wrap" }}>{section.description}</div>
                  )}
                  {showIncludes && cleanInc.map((inc, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#444", padding: "2px 0" }}>{inc}</div>
                  ))}
                  {(section.lineItems || []).map((li, liIdx) => {
                    const qty = Number(li.qty || 1);
                    const price = Number(li.price || 0);
                    return (
                      <div key={liIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid #eee", paddingTop: 10, marginTop: 10, gap: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{li.name || "Item"}</div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>{money(price * qty)}</div>
                          {qty > 1 && <div style={{ fontSize: 11, color: "#888" }}>({money(price)} × {qty})</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Booking Process */}
            {(quote.paymentSchedule || quote.questionnaire || contractsList.length > 0) && (
              <div style={{ marginTop: 24, padding: "16px 18px", border: "1px solid #e5e5e5", borderRadius: 10, background: "#faf7f2" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Booking Process</div>
                {!!quote.paymentSchedule && <div style={{ fontSize: 13, color: "#444", marginBottom: 4 }}><strong>Payment Schedule:</strong> {quote.paymentSchedule}</div>}
                {!!quote.questionnaire && <div style={{ fontSize: 13, color: "#444", marginBottom: 4 }}><strong>Questionnaire:</strong> {quote.questionnaire}</div>}
                {contractsList.length > 0 && <div style={{ fontSize: 13, color: "#444" }}><strong>Attached Documents:</strong> {contractsList.join(", ")}</div>}
              </div>
            )}

            {/* Totals */}
            <div style={{ borderTop: "2px solid #1a1a1a", paddingTop: 16, marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginBottom: 6 }}>
                <div style={{ fontSize: 14, color: "#666" }}>Subtotal:</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", minWidth: 90, textAlign: "right" }}>{money(quote.subtotal)}</div>
              </div>
              {Number(quote.discountAmount || 0) > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, color: "#666" }}>Discount{quote.promoCode ? ` (${quote.promoCode})` : ""}:</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", minWidth: 90, textAlign: "right", color: "#b42318" }}>-{money(quote.discountAmount)}</div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 16 }}>
                <div style={{ fontSize: 14, color: "#666" }}>Total:</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", minWidth: 90, textAlign: "right" }}>{money(quote.totalAmount)}</div>
              </div>
            </div>

            {!!quote.notes && (
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee", fontSize: 12, color: "#666", whiteSpace: "pre-wrap" }}>{quote.notes}</div>
            )}
            {!!quote.expiration && (
              <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>This quote expires on {quote.expiration}</div>
            )}

            {/* Approve button */}
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button
                onClick={token ? approveByToken : undefined}
                disabled={approveBusy || quoteStatus === "approved"}
                style={{
                  display: "inline-block", padding: "14px 36px",
                  background: quoteStatus === "approved" ? "#10b981" : "#d4a853",
                  color: "#0e0f11", border: "none", borderRadius: 8,
                  fontWeight: 800, fontSize: 15,
                  cursor: (approveBusy || quoteStatus === "approved") ? "default" : "pointer",
                  opacity: approveBusy ? 0.7 : 1,
                }}
              >
                {quoteStatus === "approved" ? "✓ Approved" : approveBusy ? "Approving..." : "Approve Quote"}
              </button>
            </div>

            {approveNotice && (
              <div style={{
                marginTop: 14, padding: "10px 12px", borderRadius: 8, fontSize: 13, textAlign: "center",
                background: approveNotice.type === "success" ? "#ecfdf5" : "#fef2f2",
                color: approveNotice.type === "success" ? "#047857" : "#b91c1c",
                border: approveNotice.type === "success" ? "1px solid #a7f3d0" : "1px solid #fecaca",
              }}>
                {approveNotice.message}
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
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
