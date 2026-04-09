"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  const [legacyResolved, setLegacyResolved] = useState(null);
  const [showAdminNav, setShowAdminNav] = useState(false);

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
    try {
      setShowAdminNav(Boolean(window.localStorage.getItem("nsp_lead_detail_v2")));
    } catch {
      setShowAdminNav(false);
    }
  }, []);

  const resolved = payload?.document ? payload : legacyResolved;
  const isInvoice = resolved?.type === "invoice" && resolved?.document;
  const isSignDoc =
    (resolved?.type === "contract" || resolved?.type === "release") && resolved?.document;
  const inv = isInvoice ? resolved.document : null;
  const doc = isSignDoc ? resolved.document : null;

  if (!isInvoice && !isSignDoc) {
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
