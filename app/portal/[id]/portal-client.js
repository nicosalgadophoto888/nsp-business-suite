"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const G = {
  bg: "#f7f5f0",
  surface: "#fcfaf6",
  card: "#ffffff",
  border: "#e4ddd2",
  text: "#1f2937",
  textDim: "#5f6875",
  gold: "#b48a3a",
  goldBg: "rgba(180,138,58,.14)",
  green: "#0f9f6e",
  blue: "#2f6fde",
};

function money(n) {
  return "$" + Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(ds) {
  if (!ds) return "TBD";
  const d = new Date(ds);
  if (isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PortalClientPage({ id }) {
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    async function loadWorkspace() {
      if (!id) return;
      const { data, error } = await supabase
        .from("crm_workspaces")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error || !data || !data.workspace) {
        setError("We couldn't load your portal. The link may be invalid or expired.");
      } else {
        setWorkspace(data.workspace);
      }
      setLoading(false);
    }
    loadWorkspace();
  }, [id]);

  if (loading) {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", padding: "24px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 40, textAlign: "center", color: G.textDim }}>
          Loading your portal...
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", padding: "48px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: G.card, padding: 40, borderRadius: 12, border: `1px solid ${G.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
          <h1 style={{ fontSize: 24, color: G.text, marginBottom: 8 }}>Portal Not Found</h1>
          <p style={{ color: G.textDim }}>{error}</p>
        </div>
      </div>
    );
  }

  const { lead = {}, schedule = [], quotes = [], contracts = [], payments = [] } = workspace;
  const settings = workspace.settings || {};
  const businessName = settings.businessName || "Nico Salgado Photography";

  const renderTabs = () => {
    const tabs = [
      { key: "info", label: "Info" },
      { key: "schedule", label: "Schedule" },
      { key: "quotes", label: "Quotes & Orders" },
      { key: "financial", label: "Financials" },
      { key: "contracts", label: "Contracts" },
    ];
    return (
      <div style={{ display: "flex", borderBottom: `1px solid ${G.border}`, marginBottom: 24, overflowX: "auto" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              background: "none",
              border: "none",
              padding: "16px 24px",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: activeTab === t.key ? 700 : 500,
              color: activeTab === t.key ? G.gold : G.textDim,
              borderBottom: activeTab === t.key ? `3px solid ${G.gold}` : "3px solid transparent",
              whiteSpace: "nowrap"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  };

  const renderInfo = () => (
    <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <h2 style={{ fontSize: 24, color: G.text, marginBottom: 16 }}>Welcome, {lead.name || "Client"}!</h2>
      <div style={{ background: G.surface, borderRadius: 8, border: `1px solid ${G.border}`, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: G.textDim, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Service Type</div>
            <div style={{ fontSize: 16, color: G.text }}>{lead.type || "Photography"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: G.textDim, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Event Date</div>
            <div style={{ fontSize: 16, color: G.text }}>{formatDate(lead.eventDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: G.textDim, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Location</div>
            <div style={{ fontSize: 16, color: G.text }}>{lead.location || "TBD"}</div>
          </div>
        </div>
      </div>
      
      <div style={{ background: G.card, borderRadius: 8, border: `1px solid ${G.border}`, padding: 24 }}>
        <h3 style={{ fontSize: 18, color: G.text, borderBottom: `1px solid ${G.border}`, paddingBottom: 12, marginBottom: 16 }}>Notes & Goals</h3>
        <p style={{ color: G.textDim, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {lead.notes || "No notes have been added yet."}
        </p>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <h2 style={{ fontSize: 24, color: G.text, marginBottom: 24 }}>Your Schedule</h2>
      {schedule.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: G.textDim, background: G.surface, borderRadius: 8, border: `1px solid ${G.border}` }}>
          No sessions scheduled yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {schedule.map((session, idx) => (
            <div key={idx} style={{ background: G.card, borderRadius: 8, border: `1px solid ${G.border}`, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ fontSize: 18, margin: "0 0 4px 0", color: G.text }}>{session.title || "Session"}</h4>
                <div style={{ color: G.textDim, fontSize: 14 }}>
                  {formatDate(session.date)} {session.time ? `• ${session.time}` : ""}
                </div>
                {session.location && <div style={{ color: G.textDim, fontSize: 13, marginTop: 4 }}>📍 {session.location}</div>}
              </div>
              <div style={{ background: G.goldBg, color: G.gold, padding: "6px 12px", borderRadius: 16, fontSize: 12, fontWeight: 700 }}>
                {session.status || "Scheduled"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuotes = () => (
    <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <h2 style={{ fontSize: 24, color: G.text, marginBottom: 24 }}>Quotes & Orders</h2>
      {quotes.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: G.textDim, background: G.surface, borderRadius: 8, border: `1px solid ${G.border}` }}>
          No quotes or orders yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {quotes.map((q, idx) => {
            const isApproved = q.status === "Accepted" || q.status === "Approved";
            return (
              <div key={idx} style={{ background: G.card, borderRadius: 8, border: `1px solid ${G.border}`, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h4 style={{ fontSize: 20, margin: "0 0 4px 0", color: G.text }}>{q.eventName || "Quote"} ({q.quoteNumberLabel})</h4>
                    <div style={{ color: G.textDim, fontSize: 14 }}>Created {formatDate(q.createdAt)}</div>
                  </div>
                  <div style={{ 
                    background: isApproved ? G.greenBg : q.status === "Sent" ? G.blueBg : "#f3f4f6", 
                    color: isApproved ? G.green : q.status === "Sent" ? G.blue : G.textDim, 
                    padding: "6px 12px", borderRadius: 16, fontSize: 12, fontWeight: 700 
                  }}>
                    {q.status || "Draft"}
                  </div>
                </div>

                {q.sections && q.sections.map((sec, sIdx) => (
                  <div key={sIdx} style={{ background: G.surface, padding: 16, borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: G.text }}>{sec.packageName || "Package"}</div>
                    {sec.lineItems && sec.lineItems.map((li, lIdx) => (
                      <div key={lIdx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: G.textDim, padding: "4px 0" }}>
                        <div>{li.qty}x {li.name}</div>
                        <div style={{ fontWeight: 600, color: G.text }}>{money(li.price * li.qty)}</div>
                      </div>
                    ))}
                  </div>
                ))}
                
                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${G.border}`, paddingTop: 16, marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: G.text }}>Total: {money(q.totalAmount)}</div>
                    {!isApproved && (
                      <a href={`mailto:${settings.email || "nicosalgadophoto@gmail.com"}?subject=Approving Quote ${q.quoteNumberLabel}`} 
                         style={{ background: G.gold, color: "#fff", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                        Approve via Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFinancial = () => (
    <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <h2 style={{ fontSize: 24, color: G.text, marginBottom: 24 }}>Payments & Financials</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ background: G.surface, borderRadius: 8, border: `1px solid ${G.border}`, padding: 24 }}>
          <div style={{ fontSize: 13, color: G.textDim, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Total Investment</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: G.text }}>{money(lead.revenue)}</div>
        </div>
        <div style={{ background: G.surface, borderRadius: 8, border: `1px solid ${G.border}`, padding: 24 }}>
          <div style={{ fontSize: 13, color: G.textDim, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Balance Due</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: lead.balance > 0 ? "#dc2626" : G.green }}>{money(lead.balance)}</div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, color: G.text, marginBottom: 16 }}>Payment Plans</h3>
      {payments.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: G.textDim, background: G.card, borderRadius: 8, border: `1px solid ${G.border}` }}>
          No payment plans set up yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {payments.map((p, idx) => (
            <div key={idx} style={{ background: G.card, borderRadius: 8, border: `1px solid ${G.border}`, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 18, margin: "0 0 4px 0", color: G.text }}>{p.name || "Payment Plan"}</h4>
                  <div style={{ color: G.textDim, fontSize: 14 }}>{p.description}</div>
                </div>
                <a href={`mailto:${settings.email || "nicosalgadophoto@gmail.com"}?subject=Payment inquiry for ${p.name}`} 
                   style={{ background: "#111827", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14, height: "max-content" }}>
                  Make Payment
                </a>
              </div>
              <div style={{ background: G.surface, padding: 16, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderBottom: `1px solid ${G.border}` }}>
                  <div>Initial Payment</div>
                  <div style={{ fontWeight: 600 }}>{p.initialPayment} {p.initialType === "Percent of Order" ? "%" : ""}</div>
                </div>
                {p.remaining && p.remaining.map((rem, rIdx) => (
                  <div key={rIdx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderBottom: rIdx === p.remaining.length - 1 ? "none" : `1px solid ${G.border}` }}>
                    <div>Remaining due {rem.due}</div>
                    <div style={{ fontWeight: 600 }}>{rem.amount} {rem.type === "Percent of Order" ? "%" : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContracts = () => (
    <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <h2 style={{ fontSize: 24, color: G.text, marginBottom: 24 }}>Contracts</h2>
      {contracts.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: G.textDim, background: G.surface, borderRadius: 8, border: `1px solid ${G.border}` }}>
          No contracts have been generated yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {contracts.map((c, idx) => {
            const isSigned = c.status === "Signed" || !!c.signedOn;
            return (
              <div key={idx} style={{ background: G.card, borderRadius: 8, border: `1px solid ${G.border}`, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: 18, margin: "0 0 4px 0", color: G.text }}>{c.title || "Agreement"}</h4>
                  <div style={{ color: G.textDim, fontSize: 14 }}>
                    {isSigned ? `Signed on ${formatDate(c.signedOn)}` : `Sent on ${formatDate(c.sentOn)}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ 
                      background: isSigned ? G.greenBg : G.goldBg, 
                      color: isSigned ? G.green : G.gold, 
                      padding: "6px 12px", borderRadius: 16, fontSize: 12, fontWeight: 700 
                    }}>
                    {c.status || "Sent"}
                  </div>
                  {!isSigned && (
                    <a href={`mailto:${settings.email || "nicosalgadophoto@gmail.com"}?subject=Ready to sign: ${c.title}`} 
                       style={{ background: "#111827", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                      Review & Sign
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <header style={{ background: "#111827", padding: "20px 0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: G.gold, fontSize: 24, fontWeight: 800 }}>{businessName}</div>
          <div style={{ color: "#9ca3af", fontSize: 14 }}>Client Portal</div>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ background: G.card, borderRadius: 12, border: `1px solid ${G.border}`, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ padding: "0 12px" }}>
            {renderTabs()}
          </div>
          <div style={{ padding: "0 24px 32px 24px" }}>
            {activeTab === "info" && renderInfo()}
            {activeTab === "schedule" && renderSchedule()}
            {activeTab === "quotes" && renderQuotes()}
            {activeTab === "financial" && renderFinancial()}
            {activeTab === "contracts" && renderContracts()}
          </div>
        </div>
      </main>
    </div>
  );
}
