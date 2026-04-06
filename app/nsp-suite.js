"use client";

import { useEffect, useMemo, useState } from "react";

const G = {
  bg: "#070707",
  surface: "#0f0f0f",
  card: "#131313",
  border: "#222222",
  gold: "#c9a96e",
  goldLight: "#dfc28e",
  goldDim: "#7a6030",
  text: "#ede9e3",
  textMuted: "#7a7772",
  textDim: "#3e3c3a",
  green: "#5aab7a",
  greenBg: "#0a1a10",
  red: "#c95f5f",
  redBg: "#1a0a0a",
  blue: "#6a9fd8",
  blueBg: "#0a1220",
  amber: "#d4955a",
  amberBg: "#1a1008",
  purple: "#9b7fe0",
  purpleBg: "#0d0a1a",
  sidebar: "#0a0a0a",
};

const KEYS = {
  leads: "nsp_leads_v1",
  proposals: "nsp_proposals_v1",
  contracts: "nsp_contracts_v1",
  invoices: "nsp_invoices_v1",
  sessions: "nsp_sessions_v1",
  promos: "nsp_promos_v1",
};

const fmt$ = (n) => "$" + Number(n || 0).toLocaleString();
const fmtDate = (d) =>
  d
    ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const today = () => new Date().toISOString().split("T")[0];

const STATUS_META = {
  New: { color: G.blue, bg: G.blueBg },
  Contacted: { color: G.amber, bg: G.amberBg },
  "Proposal Sent": { color: G.purple, bg: G.purpleBg },
  Booked: { color: G.green, bg: G.greenBg },
  Lost: { color: G.red, bg: G.redBg },
  Draft: { color: G.textMuted, bg: G.surface },
  Sent: { color: G.amber, bg: G.amberBg },
  Viewed: { color: G.blue, bg: G.blueBg },
  Accepted: { color: G.green, bg: G.greenBg },
  Declined: { color: G.red, bg: G.redBg },
  Signed: { color: G.green, bg: G.greenBg },
  Paid: { color: G.green, bg: G.greenBg },
  Pending: { color: G.amber, bg: G.amberBg },
  Overdue: { color: G.red, bg: G.redBg },
  Confirmed: { color: G.green, bg: G.greenBg },
  Tentative: { color: G.amber, bg: G.amberBg },
};

const SEED_LEADS = [
  {
    id: 1,
    name: "Sarah & Tyler Mitchell",
    email: "sarah@email.com",
    phone: "248-555-0142",
    type: "Wedding",
    eventDate: "2026-08-15",
    budget: 5000,
    status: "New",
    source: "Website",
    notes: "Interested in Legacy package.",
    createdAt: "2026-03-28",
  },
  {
    id: 2,
    name: "James & Priya Okafor",
    email: "priya.okafor@gmail.com",
    phone: "313-555-0287",
    type: "Family Portrait",
    eventDate: "2026-05-10",
    budget: 1200,
    status: "Proposal Sent",
    source: "Referral",
    notes: "Outdoor session. 2 kids.",
    createdAt: "2026-04-01",
  },
  {
    id: 3,
    name: "Detroit Metro Hospital",
    email: "hr@dmh.com",
    phone: "313-555-0400",
    type: "Corporate Headshots",
    eventDate: "2026-04-22",
    budget: 3800,
    status: "Booked",
    source: "LinkedIn",
    notes: "18 executives. Half-day.",
    createdAt: "2026-03-15",
  },
  {
    id: 4,
    name: "Aaliyah Fontaine",
    email: "aaliyah@fontainepr.com",
    phone: "248-555-0911",
    type: "Personal Branding",
    eventDate: "2026-05-18",
    budget: 2200,
    status: "Contacted",
    source: "Instagram",
    notes: "PR consultant. Editorial feel.",
    createdAt: "2026-04-03",
  },
  {
    id: 5,
    name: "Grand Ballroom at MGM",
    email: "events@mgmgrand.com",
    phone: "313-555-0700",
    type: "Event Coverage",
    eventDate: "2026-06-07",
    budget: 4500,
    status: "Lost",
    source: "Website",
    notes: "Annual gala. Keep on radar.",
    createdAt: "2026-02-20",
  },
];

const SEED_PROPOSALS = [
  {
    id: 1,
    clientName: "Detroit Metro Hospital",
    clientEmail: "hr@dmh.com",
    serviceType: "Headshots",
    package: "Premium — The Authority",
    total: 3720,
    status: "Accepted",
    createdAt: "2026-03-18",
  },
  {
    id: 2,
    clientName: "Aaliyah Fontaine",
    clientEmail: "aaliyah@fontainepr.com",
    serviceType: "Personal Branding",
    package: "Signature — The Identity",
    total: 3250,
    status: "Sent",
    createdAt: "2026-04-03",
  },
];

const SEED_CONTRACTS = [
  {
    id: 1,
    clientName: "Detroit Metro Hospital",
    clientEmail: "hr@dmh.com",
    serviceType: "Headshots",
    sessionDate: "2026-04-22",
    sessionLocation: "Detroit Metro Hospital",
    totalAmount: 3720,
    retainerAmount: 1860,
    status: "Signed",
    createdAt: "2026-03-18",
    signerName: "Marcus Webb",
  },
];

const SEED_INVOICES = [
  {
    id: 1,
    invoiceNumber: "NSP-2026-001",
    clientName: "Detroit Metro Hospital",
    serviceType: "Headshots",
    description: "Retainer — 50% of Corporate Headshots Package",
    amount: 1860,
    status: "Paid",
    dueDate: "2026-03-25",
    paidDate: "2026-03-22",
  },
  {
    id: 2,
    invoiceNumber: "NSP-2026-002",
    clientName: "Detroit Metro Hospital",
    serviceType: "Headshots",
    description: "Balance — 50% of Corporate Headshots Package",
    amount: 1860,
    status: "Pending",
    dueDate: "2026-04-21",
  },
];

const SEED_SESSIONS = [
  {
    id: 1,
    client: "Detroit Metro Hospital",
    email: "hr@dmh.com",
    serviceType: "Corporate Headshots",
    date: "2026-04-22",
    time: "9:00 AM",
    location: "Detroit Metro Hospital, Detroit",
    status: "Confirmed",
  },
  {
    id: 2,
    client: "Aaliyah Fontaine",
    email: "aaliyah@fontainepr.com",
    serviceType: "Personal Branding",
    date: "2026-05-18",
    time: "11:00 AM",
    location: "NSP Studio, West Bloomfield",
    status: "Tentative",
  },
];

const SEED_PROMOS = [
  {
    id: 1,
    name: "Spring Mini Sessions",
    code: "SPRING2026",
    discount: 15,
    type: "percent",
    validFrom: "2026-04-01",
    validTo: "2026-05-31",
    description: "15% off all spring mini sessions",
    active: true,
    timesUsed: 3,
  },
  {
    id: 2,
    name: "Referral Bonus",
    code: "REFER100",
    discount: 100,
    type: "fixed",
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    description: "$100 off for referred clients",
    active: true,
    timesUsed: 7,
  },
];

function Badge({ status }) {
  const meta = STATUS_META[status] || { color: G.textMuted, bg: G.surface };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.color}33`,
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: meta.color,
        }}
      />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent = G.text }) {
  return (
    <div
      style={{
        background: G.card,
        border: `1px solid ${G.border}`,
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: ".12em",
          color: G.textMuted,
          textTransform: "uppercase",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 34,
          lineHeight: 1,
          color: accent,
          fontFamily: "Georgia, serif",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: G.textDim, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled = false }) {
  const styles = {
    primary: {
      background: G.gold,
      color: "#080808",
      border: `1px solid ${G.gold}`,
    },
    ghost: {
      background: "transparent",
      color: G.textMuted,
      border: `1px solid ${G.border}`,
    },
    outline: {
      background: "transparent",
      color: G.gold,
      border: `1px solid ${G.goldDim}`,
    },
    danger: {
      background: "transparent",
      color: G.red,
      border: `1px solid ${G.red}`,
    },
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

function SectionTitle({ title, subtitle, actions }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div>
        <h1
          style={{
            color: G.goldLight,
            fontFamily: "Georgia, serif",
            fontSize: 32,
            fontWeight: 400,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: G.textMuted, fontSize: 12, marginTop: 6 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}

function AddLeadModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Wedding",
    eventDate: "",
    budget: "",
    status: "New",
    source: "Website",
    notes: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          background: G.card,
          border: `1px solid ${G.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${G.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: G.goldLight, fontFamily: "Georgia, serif", fontSize: 24 }}>
            New Inquiry
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: G.textMuted, fontSize: 24 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 24, display: "grid", gap: 14 }}>
          <input placeholder="Full Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <input placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <input placeholder="Type" value={form.type} onChange={(e) => set("type", e.target.value)} />
            <input placeholder="Source" value={form.source} onChange={(e) => set("source", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <input type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
            <input type="number" placeholder="Budget" value={form.budget} onChange={(e) => set("budget", e.target.value)} />
          </div>
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            style={{
              minHeight: 90,
              background: G.surface,
              color: G.text,
              border: `1px solid ${G.border}`,
              borderRadius: 6,
              padding: 12,
            }}
          />
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${G.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn
            onClick={() => {
              if (!form.name.trim() || !form.email.trim()) return;
              onSave({
                ...form,
                id: Date.now(),
                budget: Number(form.budget) || 0,
                createdAt: today(),
              });
              onClose();
            }}
          >
            Add Lead
          </Btn>
        </div>
      </div>
    </div>
  );
}

function LeadsView({ leads, setLeads }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const booked = leads.filter((l) => l.status === "Booked");
  const pipeline = leads.filter((l) => l.status !== "Lost");
  const pipelineVal = pipeline.reduce((a, l) => a + Number(l.budget || 0), 0);
  const bookedVal = booked.reduce((a, l) => a + Number(l.budget || 0), 0);
  const convRate = leads.length ? Math.round((booked.length / leads.length) * 100) : 0;

  return (
    <>
      <SectionTitle
        title="Lead Pipeline"
        subtitle={`${leads.length} inquiries · ${booked.length} booked · ${convRate}% conversion`}
        actions={<Btn onClick={() => setAdding(true)}>+ New Inquiry</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Leads" value={leads.length} sub="All time" />
        <StatCard label="Pipeline Value" value={fmt$(pipelineVal)} sub="Excl. lost" accent={G.gold} />
        <StatCard label="Booked Revenue" value={fmt$(bookedVal)} sub="Confirmed" accent={G.green} />
        <StatCard label="Conversion Rate" value={`${convRate}%`} sub="Inquiry → Booked" accent={G.amber} />
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, type..."
        style={{
          width: "100%",
          marginBottom: 18,
          background: G.surface,
          color: G.text,
          border: `1px solid ${G.border}`,
          borderRadius: 6,
          padding: "10px 12px",
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 14 }}>
        {["New", "Contacted", "Proposal Sent", "Booked", "Lost"].map((status) => {
          const items = visible.filter((l) => l.status === status);
          const total = items.reduce((a, l) => a + Number(l.budget || 0), 0);
          const meta = STATUS_META[status];
          return (
            <div key={status}>
              <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `2px solid ${meta.color}55` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: meta.color, fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>
                    {status}
                  </div>
                  <Badge status={status} />
                </div>
                <div style={{ color: G.textDim, fontSize: 11, marginTop: 5 }}>{fmt$(total)}</div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {items.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      background: G.card,
                      border: `1px solid ${G.border}`,
                      borderLeft: `3px solid ${meta.color}`,
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{lead.name}</div>
                    <div style={{ color: G.textMuted, fontSize: 12 }}>{lead.type}</div>
                    <div style={{ color: G.gold, marginTop: 8, fontWeight: 600 }}>{fmt$(lead.budget)}</div>
                    <div style={{ color: G.textDim, fontSize: 11 }}>{fmtDate(lead.eventDate)}</div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div
                    style={{
                      border: `1px dashed ${G.border}`,
                      borderRadius: 8,
                      padding: 18,
                      textAlign: "center",
                      color: G.textDim,
                      fontSize: 12,
                    }}
                  >
                    No leads
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {adding && (
        <AddLeadModal
          onClose={() => setAdding(false)}
          onSave={(lead) => setLeads((prev) => [lead, ...prev])}
        />
      )}
    </>
  );
}

function ProposalsView({ proposals }) {
  const total = proposals.reduce((a, p) => a + Number(p.total || 0), 0);
  const accepted = proposals
    .filter((p) => p.status === "Accepted")
    .reduce((a, p) => a + Number(p.total || 0), 0);

  return (
    <>
      <SectionTitle title="Proposals" subtitle={`${proposals.length} proposals`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Proposed" value={fmt$(total)} sub="All proposals" />
        <StatCard label="Accepted Value" value={fmt$(accepted)} sub="Accepted" accent={G.green} />
        <StatCard
          label="Acceptance Rate"
          value={`${proposals.length ? Math.round((proposals.filter((p) => p.status === "Accepted").length / proposals.length) * 100) : 0}%`}
          sub="Overall"
          accent={G.gold}
        />
      </div>
      <ListCards
        items={proposals.map((p) => ({
          title: p.clientName,
          sub: `${p.serviceType} · ${p.package}`,
          right: fmt$(p.total),
          badge: p.status,
        }))}
      />
    </>
  );
}

function ContractsView({ contracts }) {
  return (
    <>
      <SectionTitle title="Contracts" subtitle={`${contracts.length} contracts`} />
      <ListCards
        items={contracts.map((c) => ({
          title: c.clientName,
          sub: `${c.serviceType} · ${fmtDate(c.sessionDate)} · ${c.sessionLocation}`,
          right: fmt$(c.totalAmount),
          badge: c.status,
        }))}
      />
    </>
  );
}

function InvoicesView({ invoices }) {
  return (
    <>
      <SectionTitle title="Invoicing" subtitle={`${invoices.length} invoices`} />
      <ListCards
        items={invoices.map((i) => ({
          title: `${i.invoiceNumber} · ${i.clientName}`,
          sub: `${i.description} · Due ${fmtDate(i.dueDate)}`,
          right: fmt$(i.amount),
          badge: i.status,
        }))}
      />
    </>
  );
}

function ScheduleView({ sessions }) {
  return (
    <>
      <SectionTitle title="Schedule" subtitle={`${sessions.length} sessions`} />
      <ListCards
        items={sessions.map((s) => ({
          title: s.client,
          sub: `${s.serviceType} · ${fmtDate(s.date)} · ${s.time} · ${s.location}`,
          right: "",
          badge: s.status,
        }))}
      />
    </>
  );
}

function ContactsView({ leads, promos }) {
  const contacts = leads.map((l) => ({
    name: l.name,
    email: l.email,
    type: l.type,
    source: l.source,
    status: l.status,
  }));

  return (
    <>
      <SectionTitle
        title="Contacts & Marketing"
        subtitle={`${contacts.length} contacts · ${promos.filter((p) => p.active).length} active promos`}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div>
          <h3 style={{ color: G.goldLight, marginBottom: 12, fontFamily: "Georgia, serif", fontWeight: 400 }}>Contacts</h3>
          <ListCards
            items={contacts.map((c) => ({
              title: c.name,
              sub: `${c.email} · ${c.type} · ${c.source}`,
              right: "",
              badge: c.status,
            }))}
          />
        </div>
        <div>
          <h3 style={{ color: G.goldLight, marginBottom: 12, fontFamily: "Georgia, serif", fontWeight: 400 }}>Promos</h3>
          <ListCards
            items={promos.map((p) => ({
              title: `${p.name} · ${p.code}`,
              sub: `${p.type === "percent" ? `${p.discount}%` : fmt$(p.discount)} off · ${fmtDate(p.validFrom)} — ${fmtDate(p.validTo)}`,
              right: `Used ${p.timesUsed}×`,
              badge: p.active ? "Active" : "Inactive",
            }))}
            badgeMap={{
              Active: { color: G.green, bg: G.greenBg },
              Inactive: { color: G.textMuted, bg: G.surface },
            }}
          />
        </div>
      </div>
    </>
  );
}

function DocumentsView({ contracts, proposals }) {
  const docs = [
    ...contracts
      .filter((c) => c.status === "Signed")
      .map((c) => ({
        title: `${c.clientName} Contract`,
        sub: `${c.serviceType} · Signed by ${c.signerName || "—"}`,
        right: fmtDate(c.createdAt),
        badge: "Signed",
      })),
    ...proposals
      .filter((p) => p.status === "Accepted")
      .map((p) => ({
        title: `${p.clientName} Proposal`,
        sub: `${p.serviceType}`,
        right: fmtDate(p.createdAt),
        badge: "Accepted",
      })),
  ];

  return (
    <>
      <SectionTitle title="Documents" subtitle={`${docs.length} signed files`} />
      <ListCards items={docs} />
    </>
  );
}

function ReportsView({ leads, invoices }) {
  const revenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((a, i) => a + Number(i.amount || 0), 0);
  const receivables = invoices
    .filter((i) => i.status === "Pending")
    .reduce((a, i) => a + Number(i.amount || 0), 0);
  const pipeline = leads
    .filter((l) => l.status !== "Lost")
    .reduce((a, l) => a + Number(l.budget || 0), 0);

  return (
    <>
      <SectionTitle title="Reports" subtitle="Revenue & analytics" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14 }}>
        <StatCard label="Collected Revenue" value={fmt$(revenue)} sub="Paid invoices" accent={G.green} />
        <StatCard label="Receivables" value={fmt$(receivables)} sub="Pending invoices" accent={G.amber} />
        <StatCard label="Pipeline Value" value={fmt$(pipeline)} sub="Open opportunities" accent={G.gold} />
      </div>
    </>
  );
}

function ListCards({ items, badgeMap }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item, i) => {
        const map = badgeMap || STATUS_META;
        return (
          <div
            key={i}
            style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: 8,
              padding: "16px 18px",
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{item.title}</div>
              <div style={{ color: G.textMuted, fontSize: 12, marginTop: 4 }}>{item.sub}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {item.badge && <Badge status={item.badge} meta={map} />}
              {item.right && <div style={{ color: G.gold, fontWeight: 600, marginTop: 8 }}>{item.right}</div>}
            </div>
          </div>
        );
      })}
      {items.length === 0 && (
        <div
          style={{
            border: `1px dashed ${G.border}`,
            borderRadius: 8,
            padding: 24,
            textAlign: "center",
            color: G.textDim,
          }}
        >
          Nothing here yet.
        </div>
      )}
    </div>
  );
}

function Sidebar({ page, setPage }) {
  const items = [
    ["leads", "Leads", "Pipeline & inquiries"],
    ["proposals", "Proposals", "Quotes & packages"],
    ["contracts", "Contracts", "E-sign agreements"],
    ["invoicing", "Invoicing", "Payments & billing"],
    ["schedule", "Schedule", "Calendar & sessions"],
    ["reports", "Reports", "Revenue & analytics"],
    ["contacts", "Contacts", "Import/Export & promos"],
    ["documents", "Documents", "Signed files"],
  ];

  return (
    <aside
      style={{
        width: 250,
        background: G.sidebar,
        borderRight: `1px solid ${G.border}`,
        padding: "18px 0",
        minHeight: "100vh",
      }}
    >
      <div style={{ padding: "0 18px 18px", borderBottom: `1px solid ${G.border}` }}>
        <div style={{ color: G.gold, fontSize: 10, letterSpacing: ".3em", marginBottom: 8 }}>
          NICO SALGADO PHOTOGRAPHY
        </div>
        <div style={{ color: G.goldLight, fontSize: 38, fontFamily: "Georgia, serif", lineHeight: 1 }}>
          Business Suite
        </div>
      </div>

      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        {items.map(([key, label, sub]) => {
          const active = page === key;
          return (
            <button
              key={key}
              onClick={() => setPage(key)}
              style={{
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 8,
                border: `1px solid ${active ? G.goldDim : "transparent"}`,
                background: active ? "#1a1408" : "transparent",
                color: active ? G.gold : G.textMuted,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
              <div style={{ fontSize: 11, color: active ? G.goldDim : G.textDim, marginTop: 2 }}>
                {sub}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default function NSPBusinessSuite() {
  const [page, setPage] = useState("leads");
  const [leads, setLeads] = useState(SEED_LEADS);
  const [proposals, setProposals] = useState(SEED_PROPOSALS);
  const [contracts, setContracts] = useState(SEED_CONTRACTS);
  const [invoices, setInvoices] = useState(SEED_INVOICES);
  const [sessions, setSessions] = useState(SEED_SESSIONS);
  const [promos, setPromos] = useState(SEED_PROMOS);

  useEffect(() => {
    try {
      const savedLeads = localStorage.getItem(KEYS.leads);
      const savedProposals = localStorage.getItem(KEYS.proposals);
      const savedContracts = localStorage.getItem(KEYS.contracts);
      const savedInvoices = localStorage.getItem(KEYS.invoices);
      const savedSessions = localStorage.getItem(KEYS.sessions);
      const savedPromos = localStorage.getItem(KEYS.promos);

      if (savedLeads) setLeads(JSON.parse(savedLeads));
      if (savedProposals) setProposals(JSON.parse(savedProposals));
      if (savedContracts) setContracts(JSON.parse(savedContracts));
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedSessions) setSessions(JSON.parse(savedSessions));
      if (savedPromos) setPromos(JSON.parse(savedPromos));
    } catch (e) {
      console.error("Failed loading local data", e);
    }
  }, []);

  useEffect(() => localStorage.setItem(KEYS.leads, JSON.stringify(leads)), [leads]);
  useEffect(() => localStorage.setItem(KEYS.proposals, JSON.stringify(proposals)), [proposals]);
  useEffect(() => localStorage.setItem(KEYS.contracts, JSON.stringify(contracts)), [contracts]);
  useEffect(() => localStorage.setItem(KEYS.invoices, JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem(KEYS.sessions, JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem(KEYS.promos, JSON.stringify(promos)), [promos]);

  let content = null;

  switch (page) {
    case "leads":
      content = <LeadsView leads={leads} setLeads={setLeads} />;
      break;
    case "proposals":
      content = <ProposalsView proposals={proposals} />;
      break;
    case "contracts":
      content = <ContractsView contracts={contracts} />;
      break;
    case "invoicing":
      content = <InvoicesView invoices={invoices} />;
      break;
    case "schedule":
      content = <ScheduleView sessions={sessions} />;
      break;
    case "reports":
      content = <ReportsView leads={leads} invoices={invoices} />;
      break;
    case "contacts":
      content = <ContactsView leads={leads} promos={promos} />;
      break;
    case "documents":
      content = <DocumentsView contracts={contracts} proposals={proposals} />;
      break;
    default:
      content = <LeadsView leads={leads} setLeads={setLeads} />;
  }

  return (
    <div
      style={{
        background: G.bg,
        color: G.text,
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, padding: 28 }}>{content}</main>
    </div>
  );
}