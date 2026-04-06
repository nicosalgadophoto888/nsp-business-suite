"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

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

const fmt$ = (n) => "$" + Number(n || 0).toLocaleString();
const fmtDate = (d) =>
  d
    ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "\u2014";
const today = () => new Date().toISOString().split("T")[0];

/* camelCase <-> snake_case helpers */
function snakeToCamel(obj) {
  if (!obj) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const ck = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[ck] = v;
  }
  return out;
}
function camelToSnake(obj) {
  if (!obj) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const sk = k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
    out[sk] = v;
  }
  return out;
}

/* Supabase CRUD helpers */
async function sbFetch(table) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select("*").order("id", { ascending: true });
  if (error) { console.error("sbFetch " + table + ":", error); return null; }
  return data.map(snakeToCamel);
}

async function sbInsert(table, row) {
  if (!supabase) return null;
  const snaked = camelToSnake(row);
  delete snaked.id;
  const { data, error } = await supabase.from(table).insert(snaked).select().single();
  if (error) { console.error("sbInsert " + table + ":", error); return null; }
  return snakeToCamel(data);
}

/* SEED DATA (fallback when Supabase not connected) */
const SEED_LEADS = [
  { id: 1, name: "Sarah & Tyler Mitchell", email: "sarah@email.com", phone: "248-555-0142", type: "Wedding", eventDate: "2026-08-15", budget: 5000, status: "New", source: "Website", notes: "Interested in Legacy package.", createdAt: "2026-03-28" },
  { id: 2, name: "James & Priya Okafor", email: "priya.okafor@gmail.com", phone: "313-555-0287", type: "Family Portrait", eventDate: "2026-05-10", budget: 1200, status: "Proposal Sent", source: "Referral", notes: "Outdoor session. 2 kids.", createdAt: "2026-04-01" },
  { id: 3, name: "Detroit Metro Hospital", email: "hr@dmh.com", phone: "313-555-0400", type: "Corporate Headshots", eventDate: "2026-04-22", budget: 3800, status: "Booked", source: "LinkedIn", notes: "18 executives. Half-day.", createdAt: "2026-03-15" },
  { id: 4, name: "Aaliyah Fontaine", email: "aaliyah@fontainepr.com", phone: "248-555-0911", type: "Personal Branding", eventDate: "2026-05-18", budget: 2200, status: "Contacted", source: "Instagram", notes: "PR consultant. Editorial feel.", createdAt: "2026-04-03" },
  { id: 5, name: "Grand Ballroom at MGM", email: "events@mgmgrand.com", phone: "313-555-0700", type: "Event Coverage", eventDate: "2026-06-07", budget: 4500, status: "Lost", source: "Website", notes: "Annual gala. Keep on radar.", createdAt: "2026-02-20" },
];
const SEED_PROPOSALS = [
  { id: 1, clientName: "Detroit Metro Hospital", clientEmail: "hr@dmh.com", serviceType: "Headshots", package: "Premium \u2014 The Authority", total: 3720, status: "Accepted", createdAt: "2026-03-18" },
  { id: 2, clientName: "Aaliyah Fontaine", clientEmail: "aaliyah@fontainepr.com", serviceType: "Personal Branding", package: "Signature \u2014 The Identity", total: 3250, status: "Sent", createdAt: "2026-04-03" },
];
const SEED_CONTRACTS = [
  { id: 1, clientName: "Detroit Metro Hospital", clientEmail: "hr@dmh.com", serviceType: "Headshots", sessionDate: "2026-04-22", sessionLocation: "Detroit Metro Hospital", totalAmount: 3720, retainerAmount: 1860, status: "Signed", createdAt: "2026-03-18", signerName: "Marcus Webb" },
];
const SEED_INVOICES = [
  { id: 1, invoiceNumber: "NSP-2026-001", clientName: "Detroit Metro Hospital", serviceType: "Headshots", description: "Retainer \u2014 50% of Corporate Headshots Package", amount: 1860, status: "Paid", dueDate: "2026-03-25", paidDate: "2026-03-22" },
  { id: 2, invoiceNumber: "NSP-2026-002", clientName: "Detroit Metro Hospital", serviceType: "Headshots", description: "Balance \u2014 50% of Corporate Headshots Package", amount: 1860, status: "Pending", dueDate: "2026-04-21" },
];
const SEED_SESSIONS = [
  { id: 1, client: "Detroit Metro Hospital", email: "hr@dmh.com", serviceType: "Corporate Headshots", date: "2026-04-22", time: "9:00 AM", location: "Detroit Metro Hospital, Detroit", status: "Confirmed" },
  { id: 2, client: "Aaliyah Fontaine", email: "aaliyah@fontainepr.com", serviceType: "Personal Branding", date: "2026-05-18", time: "11:00 AM", location: "NSP Studio, West Bloomfield", status: "Tentative" },
];
const SEED_PROMOS = [
  { id: 1, name: "Spring Mini Sessions", code: "SPRING2026", discount: 15, type: "percent", validFrom: "2026-04-01", validTo: "2026-05-31", description: "15% off all spring mini sessions", active: true, timesUsed: 3 },
  { id: 2, name: "Referral Bonus", code: "REFER100", discount: 100, type: "fixed", validFrom: "2026-01-01", validTo: "2026-12-31", description: "$100 off for referred clients", active: true, timesUsed: 7 },
];

/* ====== SHARED UI COMPONENTS ====== */

function Badge({ status }) {
  const meta = STATUS_META[status] || { color: G.textMuted, bg: G.surface };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: meta.bg, color: meta.color, border: "1px solid " + meta.color + "33", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: G.card, border: "1px solid " + G.border, borderRadius: 8, padding: "16px 20px" }}>
      <div style={{ fontSize: 10, letterSpacing: ".12em", color: G.textMuted, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 34, lineHeight: 1, color: accent || G.text, fontFamily: "Georgia, serif" }}>{value}</div>
      <div style={{ fontSize: 11, color: G.textDim, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function Btn({ children, onClick, variant, disabled }) {
  const styles = {
    primary: { background: G.gold, color: "#080808", border: "1px solid " + G.gold },
    ghost: { background: "transparent", color: G.textMuted, border: "1px solid " + G.border },
    outline: { background: "transparent", color: G.gold, border: "1px solid " + G.goldDim },
    danger: { background: "transparent", color: G.red, border: "1px solid " + G.red },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{ padding: "10px 16px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...(styles[variant || "primary"]) }}>
      {children}
    </button>
  );
}

function SectionTitle({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
      <div>
        <h1 style={{ color: G.goldLight, fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 400, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: G.textMuted, fontSize: 12, marginTop: 6 }}>{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

function ListCards({ items, badgeMap }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map(function(item, i) {
        return (
          <div key={i} style={{ background: G.card, border: "1px solid " + G.border, borderRadius: 8, padding: "16px 18px", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{item.title}</div>
              <div style={{ color: G.textMuted, fontSize: 12, marginTop: 4 }}>{item.sub}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {item.badge && <Badge status={item.badge} />}
              {item.right && <div style={{ color: G.gold, fontWeight: 600, marginTop: 8 }}>{item.right}</div>}
            </div>
          </div>
        );
      })}
      {items.length === 0 && (
        <div style={{ border: "1px dashed " + G.border, borderRadius: 8, padding: 24, textAlign: "center", color: G.textDim }}>Nothing here yet.</div>
      )}
    </div>
  );
}

var inputStyle = { background: G.surface, color: G.text, border: "1px solid " + G.border, borderRadius: 6, padding: "10px 12px", width: "100%", boxSizing: "border-box" };

/* ====== ADD LEAD MODAL ====== */

function AddLeadModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "Wedding", eventDate: "", budget: "", status: "New", source: "Website", notes: "" });
  var set = function(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 560, background: G.card, border: "1px solid " + G.border, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid " + G.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: G.goldLight, fontFamily: "Georgia, serif", fontSize: 24 }}>New Inquiry</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: G.textMuted, fontSize: 24, cursor: "pointer" }}>{"\u00D7"}</button>
        </div>
        <div style={{ padding: 24, display: "grid", gap: 14 }}>
          <input placeholder="Full Name" value={form.name} onChange={function(e) { set("name", e.target.value); }} style={inputStyle} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <input placeholder="Email" value={form.email} onChange={function(e) { set("email", e.target.value); }} style={inputStyle} />
            <input placeholder="Phone" value={form.phone} onChange={function(e) { set("phone", e.target.value); }} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <input placeholder="Type" value={form.type} onChange={function(e) { set("type", e.target.value); }} style={inputStyle} />
            <input placeholder="Source" value={form.source} onChange={function(e) { set("source", e.target.value); }} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <input type="date" value={form.eventDate} onChange={function(e) { set("eventDate", e.target.value); }} style={inputStyle} />
            <input type="number" placeholder="Budget" value={form.budget} onChange={function(e) { set("budget", e.target.value); }} style={inputStyle} />
          </div>
          <textarea placeholder="Notes" value={form.notes} onChange={function(e) { set("notes", e.target.value); }} style={Object.assign({}, inputStyle, { minHeight: 90 })} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid " + G.border, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={function() {
            if (!form.name.trim() || !form.email.trim()) return;
            onSave(Object.assign({}, form, { id: Date.now(), budget: Number(form.budget) || 0, createdAt: today() }));
            onClose();
          }}>Add Lead</Btn>
        </div>
      </div>
    </div>
  );
}

/* ====== PAGE VIEWS ====== */

function LeadsView({ leads, setLeads }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  var visible = useMemo(function() {
    var q = search.toLowerCase();
    return leads.filter(function(l) {
      return !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.type.toLowerCase().includes(q);
    });
  }, [leads, search]);

  var booked = leads.filter(function(l) { return l.status === "Booked"; });
  var pipeline = leads.filter(function(l) { return l.status !== "Lost"; });
  var pipelineVal = pipeline.reduce(function(a, l) { return a + Number(l.budget || 0); }, 0);
  var bookedVal = booked.reduce(function(a, l) { return a + Number(l.budget || 0); }, 0);
  var convRate = leads.length ? Math.round((booked.length / leads.length) * 100) : 0;

  var handleSave = async function(lead) {
    var saved = await sbInsert("leads", lead);
    if (saved) setLeads(function(prev) { return prev.concat([saved]); });
    else setLeads(function(prev) { return [lead].concat(prev); });
  };

  return (
    <>
      <SectionTitle title="Lead Pipeline" subtitle={leads.length + " inquiries \u00B7 " + booked.length + " booked \u00B7 " + convRate + "% conversion"} actions={<Btn onClick={function() { setAdding(true); }}>+ New Inquiry</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Leads" value={leads.length} sub="All time" />
        <StatCard label="Pipeline Value" value={fmt$(pipelineVal)} sub="Excl. lost" accent={G.gold} />
        <StatCard label="Booked Revenue" value={fmt$(bookedVal)} sub="Confirmed" accent={G.green} />
        <StatCard label="Conversion Rate" value={convRate + "%"} sub="Inquiry \u2192 Booked" accent={G.amber} />
      </div>
      <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Search by name, email, type..." style={Object.assign({ width: "100%", marginBottom: 18 }, inputStyle)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 14 }}>
        {["New", "Contacted", "Proposal Sent", "Booked", "Lost"].map(function(status) {
          var items = visible.filter(function(l) { return l.status === status; });
          var total = items.reduce(function(a, l) { return a + Number(l.budget || 0); }, 0);
          var meta = STATUS_META[status];
          return (
            <div key={status}>
              <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "2px solid " + meta.color + "55" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: meta.color, fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>{status}</div>
                  <Badge status={status} />
                </div>
                <div style={{ color: G.textDim, fontSize: 11, marginTop: 5 }}>{fmt$(total)}</div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {items.map(function(lead) {
                  return (
                    <div key={lead.id} style={{ background: G.card, border: "1px solid " + G.border, borderLeft: "3px solid " + meta.color, borderRadius: 8, padding: 12 }}>
                      <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{lead.name}</div>
                      <div style={{ color: G.textMuted, fontSize: 12 }}>{lead.type}</div>
                      <div style={{ color: G.gold, marginTop: 8, fontWeight: 600 }}>{fmt$(lead.budget)}</div>
                      <div style={{ color: G.textDim, fontSize: 11 }}>{fmtDate(lead.eventDate)}</div>
                    </div>
                  );
                })}
                {items.length === 0 && <div style={{ border: "1px dashed " + G.border, borderRadius: 8, padding: 18, textAlign: "center", color: G.textDim, fontSize: 12 }}>No leads</div>}
              </div>
            </div>
          );
        })}
      </div>
      {adding && <AddLeadModal onClose={function() { setAdding(false); }} onSave={handleSave} />}
    </>
  );
}

function ProposalsView({ proposals }) {
  var total = proposals.reduce(function(a, p) { return a + Number(p.total || 0); }, 0);
  var accepted = proposals.filter(function(p) { return p.status === "Accepted"; }).reduce(function(a, p) { return a + Number(p.total || 0); }, 0);
  var accCount = proposals.filter(function(p) { return p.status === "Accepted"; }).length;
  var rate = proposals.length ? Math.round((accCount / proposals.length) * 100) : 0;
  return (
    <>
      <SectionTitle title="Proposals" subtitle={proposals.length + " proposals"} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Proposed" value={fmt$(total)} sub="All proposals" />
        <StatCard label="Accepted Value" value={fmt$(accepted)} sub="Accepted" accent={G.green} />
        <StatCard label="Acceptance Rate" value={rate + "%"} sub="Overall" accent={G.gold} />
      </div>
      <ListCards items={proposals.map(function(p) { return { title: p.clientName, sub: p.serviceType + " \u00B7 " + p.package, right: fmt$(p.total), badge: p.status }; })} />
    </>
  );
}

function ContractsView({ contracts }) {
  return (
    <>
      <SectionTitle title="Contracts" subtitle={contracts.length + " contracts"} />
      <ListCards items={contracts.map(function(c) { return { title: c.clientName, sub: c.serviceType + " \u00B7 " + fmtDate(c.sessionDate) + " \u00B7 " + c.sessionLocation, right: fmt$(c.totalAmount), badge: c.status }; })} />
    </>
  );
}

function InvoicesView({ invoices }) {
  return (
    <>
      <SectionTitle title="Invoicing" subtitle={invoices.length + " invoices"} />
      <ListCards items={invoices.map(function(i) { return { title: i.invoiceNumber + " \u00B7 " + i.clientName, sub: i.description + " \u00B7 Due " + fmtDate(i.dueDate), right: fmt$(i.amount), badge: i.status }; })} />
    </>
  );
}

function ScheduleView({ sessions }) {
  return (
    <>
      <SectionTitle title="Schedule" subtitle={sessions.length + " sessions"} />
      <ListCards items={sessions.map(function(s) { return { title: s.client, sub: s.serviceType + " \u00B7 " + fmtDate(s.date) + " \u00B7 " + s.time + " \u00B7 " + s.location, right: "", badge: s.status }; })} />
    </>
  );
}

function ContactsView({ leads, promos }) {
  var contacts = leads.map(function(l) { return { name: l.name, email: l.email, type: l.type, source: l.source, status: l.status }; });
  return (
    <>
      <SectionTitle title="Contacts & Marketing" subtitle={contacts.length + " contacts \u00B7 " + promos.filter(function(p) { return p.active; }).length + " active promos"} />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div>
          <h3 style={{ color: G.goldLight, marginBottom: 12, fontFamily: "Georgia, serif", fontWeight: 400 }}>Contacts</h3>
          <ListCards items={contacts.map(function(c) { return { title: c.name, sub: c.email + " \u00B7 " + c.type + " \u00B7 " + c.source, right: "", badge: c.status }; })} />
        </div>
        <div>
          <h3 style={{ color: G.goldLight, marginBottom: 12, fontFamily: "Georgia, serif", fontWeight: 400 }}>Promos</h3>
          <ListCards items={promos.map(function(p) { return { title: p.name + " \u00B7 " + p.code, sub: (p.type === "percent" ? p.discount + "%" : fmt$(p.discount)) + " off \u00B7 " + fmtDate(p.validFrom) + " \u2014 " + fmtDate(p.validTo), right: "Used " + p.timesUsed + "\u00D7", badge: p.active ? "Active" : "Inactive" }; })} badgeMap={{ Active: { color: G.green, bg: G.greenBg }, Inactive: { color: G.textMuted, bg: G.surface } }} />
        </div>
      </div>
    </>
  );
}

function DocumentsView({ contracts, proposals }) {
  var docs = contracts.filter(function(c) { return c.status === "Signed"; }).map(function(c) { return { title: c.clientName + " Contract", sub: c.serviceType + " \u00B7 Signed by " + (c.signerName || "\u2014"), right: fmtDate(c.createdAt), badge: "Signed" }; })
    .concat(proposals.filter(function(p) { return p.status === "Accepted"; }).map(function(p) { return { title: p.clientName + " Proposal", sub: p.serviceType, right: fmtDate(p.createdAt), badge: "Accepted" }; }));
  return (
    <>
      <SectionTitle title="Documents" subtitle={docs.length + " signed files"} />
      <ListCards items={docs} />
    </>
  );
}

/* ====== REPORTS VIEW — FULL PHASE 1 ====== */

function exportToCSV(leads, invoices, proposals, contracts) {
  var rows = [
    ["NSP BUSINESS SUITE \u2014 REPORT EXPORT"],
    ["Generated: " + new Date().toLocaleDateString()],
    [],
    ["=== INVOICES ==="],
    ["Invoice #", "Client", "Service", "Description", "Amount", "Status", "Due Date", "Paid Date"],
  ];
  invoices.forEach(function(i) { rows.push([i.invoiceNumber, i.clientName, i.serviceType, i.description, i.amount, i.status, i.dueDate || "", i.paidDate || ""]); });
  rows.push([]);
  rows.push(["=== LEADS ==="]);
  rows.push(["Name", "Email", "Type", "Budget", "Status", "Source", "Event Date"]);
  leads.forEach(function(l) { rows.push([l.name, l.email, l.type, l.budget, l.status, l.source, l.eventDate || ""]); });
  rows.push([]);
  rows.push(["=== PROPOSALS ==="]);
  rows.push(["Client", "Service", "Package", "Total", "Status", "Created"]);
  proposals.forEach(function(p) { rows.push([p.clientName, p.serviceType, p.package, p.total, p.status, p.createdAt || ""]); });
  rows.push([]);
  rows.push(["=== CONTRACTS ==="]);
  rows.push(["Client", "Service", "Total", "Retainer", "Status", "Session Date", "Signer"]);
  contracts.forEach(function(c) { rows.push([c.clientName, c.serviceType, c.totalAmount, c.retainerAmount, c.status, c.sessionDate || "", c.signerName || ""]); });

  var csv = rows.map(function(r) { return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "NSP_Report_" + today() + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

function MiniBar({ data, color, labels }) {
  var max = Math.max.apply(null, data.concat([1]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
      {data.map(function(v, i) {
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, color: G.textMuted }}>{v > 0 ? fmt$(v) : ""}</div>
            <div style={{ width: "100%", background: color, borderRadius: 3, height: Math.max(max ? (v / max) * 80 : 0, 2), transition: "height .3s" }} />
            <div style={{ fontSize: 9, color: G.textDim }}>{labels && labels[i] ? labels[i] : ""}</div>
          </div>
        );
      })}
    </div>
  );
}

function ReportsView({ leads, invoices, proposals, contracts }) {
  const [range, setRange] = useState("all");
  var now = new Date();

  var filterByRange = useCallback(function(dateStr) {
    if (range === "all" || !dateStr) return true;
    var d = new Date(dateStr + "T12:00:00");
    if (range === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (range === "quarter") {
      var q = Math.floor(now.getMonth() / 3);
      var dq = Math.floor(d.getMonth() / 3);
      return dq === q && d.getFullYear() === now.getFullYear();
    }
    if (range === "year") return d.getFullYear() === now.getFullYear();
    return true;
  }, [range]);

  var filteredInvoices = invoices.filter(function(i) { return filterByRange(i.dueDate || i.paidDate); });
  var filteredLeads = leads.filter(function(l) { return filterByRange(l.createdAt); });

  var revenue = filteredInvoices.filter(function(i) { return i.status === "Paid"; }).reduce(function(a, i) { return a + Number(i.amount || 0); }, 0);
  var receivables = filteredInvoices.filter(function(i) { return i.status === "Pending"; }).reduce(function(a, i) { return a + Number(i.amount || 0); }, 0);
  var overdue = filteredInvoices.filter(function(i) { return i.status === "Overdue"; }).reduce(function(a, i) { return a + Number(i.amount || 0); }, 0);
  var pipelineVal = filteredLeads.filter(function(l) { return l.status !== "Lost"; }).reduce(function(a, l) { return a + Number(l.budget || 0); }, 0);

  /* Monthly revenue chart (last 6 months) */
  var monthlyData = useMemo(function() {
    var months = [];
    var mLabels = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      mLabels.push(d.toLocaleDateString("en-US", { month: "short" }));
      var total = invoices
        .filter(function(inv) { return inv.status === "Paid" && inv.paidDate; })
        .filter(function(inv) {
          var pd = new Date(inv.paidDate + "T12:00:00");
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        })
        .reduce(function(a, inv) { return a + Number(inv.amount || 0); }, 0);
      months.push(total);
    }
    return { months: months, labels: mLabels };
  }, [invoices]);

  /* Receivables aging */
  var aging = useMemo(function() {
    var buckets = { "0-30": 0, "31-60": 0, "60+": 0 };
    invoices.filter(function(i) { return i.status === "Pending" || i.status === "Overdue"; }).forEach(function(i) {
      if (!i.dueDate) return;
      var due = new Date(i.dueDate + "T12:00:00");
      var diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
      if (diff <= 30) buckets["0-30"] += Number(i.amount || 0);
      else if (diff <= 60) buckets["31-60"] += Number(i.amount || 0);
      else buckets["60+"] += Number(i.amount || 0);
    });
    return buckets;
  }, [invoices]);

  /* Revenue by service type */
  var byType = useMemo(function() {
    var types = {};
    invoices.filter(function(i) { return i.status === "Paid"; }).forEach(function(i) {
      var t = i.serviceType || "Other";
      types[t] = (types[t] || 0) + Number(i.amount || 0);
    });
    return types;
  }, [invoices]);

  /* Pipeline breakdown */
  var pipelineItems = filteredLeads
    .filter(function(l) { return l.status !== "Lost"; })
    .sort(function(a, b) { return Number(b.budget || 0) - Number(a.budget || 0); });

  var rangeButtons = [
    { key: "month", label: "This month" },
    { key: "quarter", label: "This quarter" },
    { key: "year", label: "This year" },
    { key: "all", label: "All time" },
  ];

  var typeColors = [G.green, G.blue, G.amber, G.purple, G.red];

  return (
    <>
      <SectionTitle
        title="Reports"
        subtitle="Revenue & analytics"
        actions={<Btn variant="outline" onClick={function() { exportToCSV(leads, invoices, proposals, contracts); }}>{"\u2193 Export CSV"}</Btn>}
      />

      {/* Date Range Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {rangeButtons.map(function(r) {
          return (
            <button key={r.key} onClick={function() { setRange(r.key); }} style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: "1px solid " + (range === r.key ? G.gold : G.border),
              background: range === r.key ? G.goldDim + "33" : "transparent",
              color: range === r.key ? G.gold : G.textMuted,
            }}>
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 32 }}>
        <StatCard label="Collected Revenue" value={fmt$(revenue)} sub="Paid invoices" accent={G.green} />
        <StatCard label="Receivables" value={fmt$(receivables)} sub="Pending invoices" accent={G.amber} />
        <StatCard label="Overdue" value={fmt$(overdue)} sub="Past due" accent={G.red} />
        <StatCard label="Pipeline Value" value={fmt$(pipelineVal)} sub="Open opportunities" accent={G.gold} />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 32 }}>
        {/* Revenue Over Time */}
        <div style={{ background: G.card, border: "1px solid " + G.border, borderRadius: 8, padding: "18px 20px" }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", color: G.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Revenue over time</div>
          <MiniBar data={monthlyData.months} color={G.green} labels={monthlyData.labels} />
        </div>

        {/* Receivables Aging */}
        <div style={{ background: G.card, border: "1px solid " + G.border, borderRadius: 8, padding: "18px 20px" }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", color: G.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Receivables aging</div>
          <div style={{ display: "grid", gap: 10 }}>
            {Object.entries(aging).map(function(entry) {
              var bucket = entry[0];
              var val = entry[1];
              var barColor = bucket === "0-30" ? G.green : bucket === "31-60" ? G.amber : G.red;
              var agingMax = Math.max.apply(null, Object.values(aging).concat([1]));
              return (
                <div key={bucket}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: G.textMuted }}>{bucket} days</span>
                    <span style={{ fontSize: 12, color: barColor, fontWeight: 600 }}>{fmt$(val)}</span>
                  </div>
                  <div style={{ height: 8, background: G.surface, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: (agingMax ? (val / agingMax) * 100 : 0) + "%", background: barColor, borderRadius: 4, transition: "width .3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue by Type */}
      {Object.keys(byType).length > 0 && (
        <div style={{ background: G.card, border: "1px solid " + G.border, borderRadius: 8, padding: "18px 20px", marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", color: G.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Revenue by service type</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(byType).map(function(entry, i) {
              var typeName = entry[0];
              var val = entry[1];
              var totalRev = Object.values(byType).reduce(function(a, b) { return a + b; }, 0);
              var pct = totalRev ? Math.round((val / totalRev) * 100) : 0;
              return (
                <div key={typeName} style={{ display: "flex", alignItems: "center", gap: 8, background: G.surface, borderRadius: 6, padding: "8px 14px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: typeColors[i % typeColors.length] }} />
                  <span style={{ fontSize: 13, color: G.text }}>{typeName}</span>
                  <span style={{ fontSize: 13, color: typeColors[i % typeColors.length], fontWeight: 600 }}>{fmt$(val)}</span>
                  <span style={{ fontSize: 11, color: G.textDim }}>({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pipeline Breakdown Table */}
      <div style={{ background: G.card, border: "1px solid " + G.border, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid " + G.border }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", color: G.textMuted, textTransform: "uppercase", fontWeight: 700 }}>Pipeline breakdown</div>
        </div>
        {pipelineItems.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: G.textDim }}>No open opportunities</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid " + G.border }}>
                {["Client", "Type", "Value", "Stage", "Event Date"].map(function(h) {
                  return <th key={h} style={{ textAlign: h === "Value" ? "right" : "left", padding: "10px 16px", fontSize: 10, color: G.textDim, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {pipelineItems.map(function(l) {
                return (
                  <tr key={l.id} style={{ borderBottom: "1px solid " + G.border }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: G.text, fontWeight: 600 }}>{l.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: G.textMuted }}>{l.type}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: G.gold, fontWeight: 600, textAlign: "right" }}>{fmt$(l.budget)}</td>
                    <td style={{ padding: "12px 16px" }}><Badge status={l.status} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: G.textMuted }}>{fmtDate(l.eventDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ====== SIDEBAR ====== */

function Sidebar({ page, setPage }) {
  var items = [
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
    <aside style={{ width: 250, background: G.sidebar, borderRight: "1px solid " + G.border, padding: "18px 0", minHeight: "100vh" }}>
      <div style={{ padding: "0 18px 18px", borderBottom: "1px solid " + G.border }}>
        <div style={{ color: G.gold, fontSize: 10, letterSpacing: ".3em", marginBottom: 8 }}>NICO SALGADO PHOTOGRAPHY</div>
        <div style={{ color: G.goldLight, fontSize: 38, fontFamily: "Georgia, serif", lineHeight: 1 }}>Business Suite</div>
      </div>
      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        {items.map(function(item) {
          var key = item[0], label = item[1], sub = item[2];
          var active = page === key;
          return (
            <button key={key} onClick={function() { setPage(key); }} style={{
              textAlign: "left", padding: "14px 16px", borderRadius: 8,
              border: "1px solid " + (active ? G.goldDim : "transparent"),
              background: active ? "#1a1408" : "transparent",
              color: active ? G.gold : G.textMuted, cursor: "pointer",
            }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
              <div style={{ fontSize: 11, color: active ? G.goldDim : G.textDim, marginTop: 2 }}>{sub}</div>
            </button>
          );
        })}
      </div>
      {supabase && (
        <div style={{ padding: "12px 18px", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: G.green }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.green }} />
            Database connected
          </div>
        </div>
      )}
    </aside>
  );
}

/* ====== MAIN APP ====== */

export default function NSPBusinessSuite() {
  const [page, setPage] = useState("leads");
  const [leads, setLeads] = useState(SEED_LEADS);
  const [proposals, setProposals] = useState(SEED_PROPOSALS);
  const [contracts, setContracts] = useState(SEED_CONTRACTS);
  const [invoices, setInvoices] = useState(SEED_INVOICES);
  const [sessions, setSessions] = useState(SEED_SESSIONS);
  const [promos, setPromos] = useState(SEED_PROMOS);
  const [loaded, setLoaded] = useState(false);

  useEffect(function() {
    async function loadAll() {
      if (!supabase) { setLoaded(true); return; }
      try {
        var results = await Promise.all([
          sbFetch("leads"), sbFetch("proposals"), sbFetch("contracts"),
          sbFetch("invoices"), sbFetch("sessions"), sbFetch("promos"),
        ]);
        if (results[0] && results[0].length) setLeads(results[0]);
        if (results[1] && results[1].length) setProposals(results[1]);
        if (results[2] && results[2].length) setContracts(results[2]);
        if (results[3] && results[3].length) setInvoices(results[3]);
        if (results[4] && results[4].length) setSessions(results[4]);
        if (results[5] && results[5].length) setPromos(results[5]);
      } catch (e) {
        console.error("Failed loading from Supabase:", e);
      }
      setLoaded(true);
    }
    loadAll();
  }, []);

  var content = null;
  switch (page) {
    case "leads": content = <LeadsView leads={leads} setLeads={setLeads} />; break;
    case "proposals": content = <ProposalsView proposals={proposals} />; break;
    case "contracts": content = <ContractsView contracts={contracts} />; break;
    case "invoicing": content = <InvoicesView invoices={invoices} />; break;
    case "schedule": content = <ScheduleView sessions={sessions} />; break;
    case "reports": content = <ReportsView leads={leads} invoices={invoices} proposals={proposals} contracts={contracts} />; break;
    case "contacts": content = <ContactsView leads={leads} promos={promos} />; break;
    case "documents": content = <DocumentsView contracts={contracts} proposals={proposals} />; break;
    default: content = <LeadsView leads={leads} setLeads={setLeads} />;
  }

  return (
    <div style={{ background: G.bg, color: G.text, minHeight: "100vh", display: "flex" }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, padding: 28 }}>
        {!loaded && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20, color: G.textMuted }}>
            <div style={{ width: 16, height: 16, border: "2px solid " + G.gold, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            Loading data...
            <style>{"@keyframes spin { to { transform: rotate(360deg) } }"}</style>
          </div>
        )}
        {loaded && content}
      </main>
    </div>
  );
}
