"use client";

import React, { useMemo } from "react";
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
  const isInvoice = payload?.type === "invoice" && payload?.document;
  const isSignDoc =
    (payload?.type === "contract" || payload?.type === "release") && payload?.document;
  const inv = isInvoice ? payload.document : null;
  const doc = isSignDoc ? payload.document : null;

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
    const label = payload.type === "release" ? "Model Release" : "Contract";
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
        }}
      >
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
        </div>
      </div>
    </div>
  );
}

