"use client";

import React, { useEffect, useMemo, useState } from "react";

const G = {
  bg: "#0c0d0f",
  surface: "#131517",
  card: "#191b1e",
  border: "#2a2d31",
  borderLight: "#353a3f",
  text: "#e8e6e3",
  textDim: "#9b9a97",
  textMuted: "#6b6a68",
  gold: "#d4a853",
  goldBg: "rgba(212,168,83,.08)",
  green: "#34d399",
  greenBg: "rgba(52,211,153,.08)",
  red: "#f87171",
  redBg: "rgba(248,113,113,.08)",
  blue: "#60a5fa",
  blueBg: "rgba(96,165,250,.08)",
  amber: "#fbbf24",
  amberBg: "rgba(251,191,36,.08)",
  teal: "#4a9ba5",
};

const STAGES = [
  { key: "Lead", color: "#60a5fa", icon: "◆" },
  { key: "Booked", color: "#d4a853", icon: "★" },
  { key: "Fulfillment", color: "#a78bfa", icon: "◈" },
  { key: "Completed", color: "#34d399", icon: "✓" },
];

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "schedule", label: "Schedule" },
  { key: "quotes", label: "Quotes & Orders" },
  { key: "financials", label: "Financials" },
  { key: "contracts", label: "Contracts" },
  { key: "notes", label: "Notes" },
  { key: "files", label: "Files" },
];

const STORAGE_KEY = "nsp_lead_detail_v2";

const DEFAULT_SETTINGS = {
  businessName: "Nico Salgado Photography",
  address1: "30317 Glenmuer",
  address2: "Farmington Hills, MI 48334",
  website: "https://www.nicosalgadophotography.com",
  email: "nicosalgadophoto@gmail.com",
  phone: "",
  quotePrefix: "Q",
  statuses: ["Draft", "Sent", "Accepted", "Declined"],
};

const DEFAULT_DATA = {
  lead: {
    id: 1,
    name: "Camila & David",
    email: "camila.d@gmail.com",
    phone: "(313) 555-0192",
    type: "Wedding",
    stage: "Booked",
    revenue: 0,
    balance: 0,
    eventDate: "2026-06-14",
    location: "The Planterra Conservatory, West Bloomfield",
    referralSource: "Instagram",
    inquiredOn: "2026-04-07",
    notes:
      "Couple wants documentary-style. Emphasis on candid moments during golden hour.",
  },
  schedule: [
    {
      id: 1,
      title: "Engagement Session",
      date: "2026-05-10",
      time: "4:00 PM",
      location: "Belle Isle Park",
      status: "Confirmed",
    },
    {
      id: 2,
      title: "Wedding Day Coverage",
      date: "2026-06-14",
      time: "1:00 PM",
      location: "The Planterra Conservatory",
      status: "Confirmed",
    },
  ],
  notes: [
    {
      id: 1,
      text: "Spoke on the phone — they want engagement + wedding day. Budget flexible if we include album.",
      date: "2026-04-02T11:00:00",
    },
    {
      id: 2,
      text: "Instagram inquiry received",
      date: "2026-03-22T10:30:00",
    },
  ],
  payments: [
    {
      id: 1,
      kind: "Retainer + Balance",
      name: "Wedding Payment Plan",
      description: "50% retainer to book, remainder due 14 days before event",
      initialPayment: 50,
      initialType: "Percent of Order",
      tipEnabled: true,
      remaining: [{ amount: 50, type: "Percent of Order", due: "before event" }],
    },
  ],
  contracts: [
    {
      id: 1,
      title: "Wedding Photography Agreement",
      status: "Sent",
      sentOn: "2026-04-08",
      signedOn: "",
      signer: "Camila D.",
      version: "v1",
    },
  ],
  files: [
    {
      id: 1,
      name: "moodboard-reference.pdf",
      kind: "Reference",
      uploadedOn: "2026-04-03",
    },
    {
      id: 2,
      name: "venue-timeline.docx",
      kind: "Planning",
      uploadedOn: "2026-04-05",
    },
  ],
  quotes: [
    {
      id: "quote-1",
      quoteNumber: 1,
      quoteNumberLabel: "Q-0001",
      clientName: "Camila & David",
      clientEmail: "camila.d@gmail.com",
      eventName: "Wedding Coverage",
      eventDate: "2026-06-14",
      status: "Draft",
      introduction: "Thank you for the opportunity.",
      expiration: "2026-05-01",
      sections: [
        {
          id: "sec-1",
          packageName: "Signature Collection",
          description: "Full wedding day coverage with polished deliverables.",
          includes: [
            "8 hours coverage",
            "Online gallery",
            "Sneak peeks within 48 hours",
          ],
          notes: "Album available as add-on.",
          lineItems: [
            { id: "li-1", name: "Wedding Collection", price: 4800, qty: 1 },
          ],
        },
      ],
      notes: "50% retainer required to reserve the date.",
      promoCode: "",
      discountType: "amount",
      discountValue: 0,
      createdAt: "2026-04-07T10:00:00",
      updatedAt: "2026-04-07T10:00:00",
      lastViewed: null,
      pageViews: 0,
      selected: false,
    },
  ],
  recipients: [
    {
      id: 1,
      quoteId: "quote-1",
      name: "Camila",
      email: "camila.d@gmail.com",
      lastVisit: null,
    },
  ],
  counters: { nextQuoteNumber: 2 },
  settings: DEFAULT_SETTINGS,
};

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function loadState() {
  if (typeof window === "undefined") return DEFAULT_DATA;
  const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEY), null);
  if (!saved) return DEFAULT_DATA;
  return {
    ...DEFAULT_DATA,
    ...saved,
    lead: { ...DEFAULT_DATA.lead, ...(saved.lead || {}) },
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
    counters: { ...DEFAULT_DATA.counters, ...(saved.counters || {}) },
    schedule: saved.schedule || DEFAULT_DATA.schedule,
    payments: saved.payments || DEFAULT_DATA.payments,
    contracts: saved.contracts || DEFAULT_DATA.contracts,
    files: saved.files || DEFAULT_DATA.files,
    notes: saved.notes || DEFAULT_DATA.notes,
    quotes: saved.quotes || DEFAULT_DATA.quotes,
    recipients: saved.recipients || DEFAULT_DATA.recipients,
  };
}

function genId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toMoney(value) {
  return Math.max(0, Number(value) || 0);
}

function toQty(value) {
  return Math.max(1, Math.floor(Number(value) || 1));
}

function fmt$(n) {
  return "$" + Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateLocal(dateString, options) {
  if (!dateString) return "—";
  if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [y, m, d] = dateString.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", options);
  }
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", options);
}

const fmtShort = (d) =>
  formatDateLocal(d, { month: "short", day: "numeric", year: "numeric" });

const fmtLong = (d) =>
  formatDateLocal(d, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const fmtTime = (d) => {
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
};

function cleanIncludes(arr) {
  return (arr || [])
    .map((x) => String(x || "").trim())
    .filter(Boolean);
}

function calcQuoteTotals(q) {
  const subtotal = (q.sections || []).reduce(
    (sum, section) =>
      sum +
      (section.lineItems || []).reduce(
        (sectionSum, li) => sectionSum + toMoney(li.price) * toQty(li.qty),
        0
      ),
    0
  );

  const rawDiscount = Math.max(0, Number(q.discountValue) || 0);
  const discountAmount =
    q.discountType === "percent"
      ? Math.min(subtotal, subtotal * (Math.min(100, rawDiscount) / 100))
      : Math.min(subtotal, rawDiscount);

  return {
    subtotal,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount),
  };
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function quoteToPrintableHtml(quote, settings) {
  const { subtotal, discountAmount, total } = calcQuoteTotals(quote);
  const sectionsHtml = (quote.sections || [])
    .map((section) => {
      const includesHtml = cleanIncludes(section.includes)
        .map(
          (inc) =>
            `<div style="padding:3px 0;font-size:13px;color:#444;">${escapeHtml(
              inc
            )}</div>`
        )
        .join("");

      const itemsHtml = (section.lineItems || [])
        .map((li) => {
          const lineTotal = toMoney(li.price) * toQty(li.qty);
          const qtyText =
            toQty(li.qty) > 1
              ? `<div style="font-size:11px;color:#888;">(${escapeHtml(
                  fmt$(li.price)
                )} × ${toQty(li.qty)})</div>`
              : "";
          return `
            <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #eee;padding-top:10px;margin-top:10px;gap:12px;">
              <div style="font-size:14px;font-weight:700;">${escapeHtml(
                li.name || "Untitled item"
              )}</div>
              <div style="text-align:right;white-space:nowrap;">
                <div style="font-size:14px;font-weight:700;font-family:monospace;">${escapeHtml(
                  fmt$(lineTotal)
                )}</div>
                ${qtyText}
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div style="margin-bottom:28px;">
          ${
            section.packageName
              ? `<div style="font-size:16px;font-weight:700;color:${G.teal};margin-bottom:8px;">${escapeHtml(
                  section.packageName
                )}</div>`
              : ""
          }
          ${
            section.description
              ? `<div style="font-size:13px;color:#444;line-height:1.7;margin-bottom:10px;white-space:pre-wrap;">${escapeHtml(
                  section.description
                )}</div>`
              : ""
          }
          ${includesHtml}
          ${
            section.notes
              ? `<div style="font-size:12px;color:#888;font-style:italic;margin-top:8px;white-space:pre-wrap;">${escapeHtml(
                  section.notes
                )}</div>`
              : ""
          }
          ${itemsHtml}
        </div>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(quote.quoteNumberLabel || "Quote")}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color:#1a1a1a; padding:32px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div style="max-width:800px;margin:0 auto;">
          <div style="display:flex;justify-content:space-between;margin-bottom:32px;gap:24px;">
            <div>
              <div style="font-size:22px;font-weight:800;color:${G.teal};letter-spacing:-.02em;">${escapeHtml(
    settings.businessName || "Business"
  )}</div>
              <div style="font-size:12px;color:#666;line-height:1.7;margin-top:4px;">
                ${settings.address1 ? `${escapeHtml(settings.address1)}<br />` : ""}
                ${settings.address2 ? `${escapeHtml(settings.address2)}<br />` : ""}
                ${settings.website ? `${escapeHtml(settings.website)}<br />` : ""}
                ${settings.email ? `${escapeHtml(settings.email)}<br />` : ""}
                ${settings.phone ? `${escapeHtml(settings.phone)}<br />` : ""}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:18px;font-weight:700;">${escapeHtml(
                quote.quoteNumberLabel || "Quote Summary"
              )}</div>
              <div style="font-size:13px;color:#666;margin-top:4px;">Quote Total: <strong>${escapeHtml(
                fmt$(total)
              )}</strong></div>
              <div style="margin-top:12px;">
                <div style="font-size:14px;font-weight:700;">Recipient</div>
                <div style="font-size:13px;color:#666;">${escapeHtml(
                  quote.clientName || "—"
                )}</div>
                ${
                  quote.clientEmail
                    ? `<div style="font-size:13px;color:#666;">${escapeHtml(
                        quote.clientEmail
                      )}</div>`
                    : ""
                }
              </div>
            </div>
          </div>

          ${
            quote.eventName || quote.eventDate
              ? `
            <div style="text-align:center;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #e0e0e0;">
              <div style="font-size:18px;font-weight:700;color:${G.teal};">
                ${escapeHtml(quote.eventName || quote.clientName || "Quote")}${
                  quote.eventDate ? ` on ${escapeHtml(fmtLong(quote.eventDate))}` : ""
                }
              </div>
            </div>
          `
              : ""
          }

          ${
            quote.introduction
              ? `<div style="font-size:13px;color:#444;margin-bottom:24px;font-style:italic;">${escapeHtml(
                  quote.introduction
                )}</div>`
              : ""
          }
          ${sectionsHtml}
          ${
            quote.notes
              ? `<div style="font-size:12px;color:#666;margin-top:16px;padding-top:12px;border-top:1px solid #eee;white-space:pre-wrap;">${escapeHtml(
                  quote.notes
                )}</div>`
              : ""
          }
          ${
            quote.expiration
              ? `<div style="font-size:12px;color:#888;margin-top:8px;">This quote expires on ${escapeHtml(
                  fmtShort(quote.expiration)
                )}</div>`
              : ""
          }

          <div style="border-top:2px solid #1a1a1a;padding-top:16px;margin-top:20px;">
            <div style="display:flex;justify-content:flex-end;gap:16px;margin-bottom:6px;">
              <div style="font-size:14px;color:#666;">Subtotal:</div>
              <div style="font-size:16px;font-weight:700;font-family:monospace;">${escapeHtml(
                fmt$(subtotal)
              )}</div>
            </div>
            ${
              discountAmount > 0
                ? `
              <div style="display:flex;justify-content:flex-end;gap:16px;margin-bottom:6px;">
                <div style="font-size:14px;color:#666;">Discount${
                  quote.promoCode ? ` (${escapeHtml(quote.promoCode)})` : ""
                }:</div>
                <div style="font-size:16px;font-weight:700;font-family:monospace;color:#b42318;">-${escapeHtml(
                  fmt$(discountAmount)
                )}</div>
              </div>
            `
                : ""
            }
            <div style="display:flex;justify-content:flex-end;align-items:baseline;gap:16px;">
              <div style="font-size:14px;color:#666;">Total:</div>
              <div style="font-size:18px;font-weight:800;font-family:monospace;">${escapeHtml(
                fmt$(total)
              )}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function openPrintWindow(html) {
  const win = window.open("", "_blank", "width=1000,height=800");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
  return true;
}

function Btn({
  children,
  onClick,
  variant = "primary",
  small,
  full,
  disabled,
  style,
}) {
  const base = {
    primary: { bg: G.gold, color: "#0e0f11", border: "none" },
    secondary: {
      bg: "transparent",
      color: G.text,
      border: `1px solid ${G.border}`,
    },
    ghost: { bg: "transparent", color: G.textDim, border: "none" },
    danger: { bg: G.redBg, color: G.red, border: `1px solid ${G.red}33` },
  };
  const s = base[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: s.bg,
        color: s.color,
        border: s.border,
        padding: small ? "6px 14px" : "9px 20px",
        borderRadius: 6,
        fontWeight: 600,
        fontSize: small ? 11 : 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        width: full ? "100%" : "auto",
        textAlign: "center",
        letterSpacing: ".02em",
        transition: "all .15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: G.card,
        border: `1px solid ${G.border}`,
        borderRadius: 10,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, actions }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: G.text }}>{children}</div>
      {actions}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  style,
  multiline,
  readOnly,
}) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: G.text,
            marginBottom: 5,
          }}
        >
          {label}
          {required && <span style={{ color: G.red }}> *</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          readOnly={readOnly}
          style={{
            width: "100%",
            background: G.surface,
            color: G.text,
            border: `1px solid ${G.border}`,
            borderRadius: 6,
            padding: "9px 12px",
            fontSize: 13,
            boxSizing: "border-box",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{
            width: "100%",
            background: G.surface,
            color: G.text,
            border: `1px solid ${G.border}`,
            borderRadius: 6,
            padding: "9px 12px",
            fontSize: 13,
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

function Pill({ children, color, bg }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg,
        letterSpacing: ".03em",
      }}
    >
      {children}
    </span>
  );
}

function Badge({ n, color }) {
  if (!n) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        fontSize: 10,
        fontWeight: 700,
        background: color || G.red,
        color: "#fff",
        padding: "0 5px",
        marginLeft: 6,
      }}
    >
      {n}
    </span>
  );
}

function EmptyState({ icon, text, action }) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", color: G.textMuted }}>
      <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 13, marginBottom: action ? 16 : 0 }}>{text}</div>
      {action}
    </div>
  );
}

function ErrorList({ errors }) {
  if (!errors?.length) return null;
  return (
    <div
      style={{
        background: G.redBg,
        border: `1px solid ${G.red}33`,
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 14,
      }}
    >
      {errors.map((e, i) => (
        <div key={i} style={{ fontSize: 12, color: G.red }}>
          {e}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "9px 0",
        borderBottom: `1px solid ${G.border}33`,
      }}
    >
      <span style={{ color: G.textMuted, fontSize: 12, fontWeight: 600 }}>
        {label}
      </span>
      <span
        style={{
          color: accent || G.text,
          fontSize: 13,
          fontWeight: 500,
          textAlign: "right",
          maxWidth: "60%",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function OverviewTab({ lead, setLead, quotes }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...lead });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const save = () => {
    setLead(form);
    setEditing(false);
  };

  const openQuoteCount = quotes.filter((q) => q.status !== "Declined").length;
  const latestQuote = quotes[0];

  if (editing) {
    return (
      <Card>
        <SectionLabel>Edit Lead Details</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <InputField
            label="Name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <InputField
            label="Email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          <InputField
            label="Phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <InputField
            label="Type"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
          />
          <InputField
            label="Event Date"
            value={form.eventDate}
            onChange={(e) => set("eventDate", e.target.value)}
            type="date"
          />
          <InputField
            label="Location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
          <InputField
            label="Referral Source"
            value={form.referralSource}
            onChange={(e) => set("referralSource", e.target.value)}
          />
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: G.text,
                marginBottom: 5,
              }}
            >
              Stage
            </label>
            <select
              value={form.stage}
              onChange={(e) => set("stage", e.target.value)}
              style={{
                width: "100%",
                background: G.surface,
                color: G.text,
                border: `1px solid ${G.border}`,
                borderRadius: 6,
                padding: "9px 12px",
                fontSize: 13,
              }}
            >
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.key}
                </option>
              ))}
            </select>
          </div>
        </div>
        <InputField
          label="Lead Notes"
          value={form.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
          multiline
        />
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <Btn
            variant="ghost"
            small
            onClick={() => {
              setForm({ ...lead });
              setEditing(false);
            }}
          >
            Cancel
          </Btn>
          <Btn small onClick={save}>
            Save Changes
          </Btn>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <Card>
        <SectionLabel
          actions={
            <Btn variant="ghost" small onClick={() => setEditing(true)}>
              edit
            </Btn>
          }
        >
          Lead Details
        </SectionLabel>
        <InfoRow label="Name" value={lead.name} />
        <InfoRow label="Email" value={lead.email} accent={G.blue} />
        <InfoRow label="Phone" value={lead.phone} />
        <InfoRow label="Type" value={lead.type} />
        <InfoRow label="Stage" value={lead.stage} accent={G.gold} />
        <InfoRow label="Event Date" value={fmtLong(lead.eventDate)} />
        <InfoRow label="Location" value={lead.location} />
        <InfoRow label="Referral" value={lead.referralSource} accent={G.gold} />
        <InfoRow label="Inquired On" value={fmtShort(lead.inquiredOn)} />
        <div style={{ marginTop: 12, fontSize: 13, color: G.textDim, lineHeight: 1.7 }}>
          {lead.notes || "No lead notes yet."}
        </div>
      </Card>

      <Card>
        <SectionLabel>Quote Snapshot</SectionLabel>
        <InfoRow label="Active Quotes" value={String(openQuoteCount)} accent={G.gold} />
        <InfoRow label="Latest Quote" value={latestQuote?.quoteNumberLabel || "—"} />
        <InfoRow
          label="Latest Total"
          value={latestQuote ? fmt$(calcQuoteTotals(latestQuote).total) : "—"}
          accent={G.green}
        />
        <InfoRow
          label="Accepted Quotes"
          value={String(quotes.filter((q) => q.status === "Accepted").length)}
        />
        <InfoRow label="Open Balance" value={fmt$(lead.balance)} accent={G.amber} />
        <InfoRow label="Revenue" value={fmt$(lead.revenue)} accent={G.green} />
      </Card>
    </div>
  );
}

function ScheduleTab({ schedule, setSchedule }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    status: "Pending",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Card>
      <SectionLabel actions={<Btn small onClick={() => setAdding(true)}>+ Add Event</Btn>}>
        Schedule
      </SectionLabel>

      {adding && (
        <div
          style={{
            background: G.surface,
            border: `1px solid ${G.borderLight}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField
              label="Title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
            <InputField
              label="Location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
            <InputField
              label="Date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              type="date"
            />
            <InputField
              label="Time"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
            <Btn variant="ghost" small onClick={() => setAdding(false)}>
              Cancel
            </Btn>
            <Btn
              small
              onClick={() => {
                if (!form.title.trim()) return;
                setSchedule((p) => [...p, { ...form, id: Date.now() }]);
                setForm({
                  title: "",
                  date: "",
                  time: "",
                  location: "",
                  status: "Pending",
                });
                setAdding(false);
              }}
            >
              Save
            </Btn>
          </div>
        </div>
      )}

      {schedule.length === 0 && !adding ? (
        <EmptyState icon="📅" text="No events scheduled" />
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {schedule.map((ev) => (
            <div
              key={ev.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                background: G.surface,
                borderRadius: 8,
                border: `1px solid ${G.border}`,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  background: G.blueBg,
                  display: "grid",
                  placeItems: "center",
                  color: G.blue,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                📅
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{ev.title}</div>
                <div style={{ fontSize: 12, color: G.textDim }}>
                  {fmtShort(ev.date)} · {ev.time} · {ev.location}
                </div>
              </div>
              <Pill
                color={ev.status === "Confirmed" ? G.green : G.amber}
                bg={ev.status === "Confirmed" ? G.greenBg : G.amberBg}
              >
                {ev.status}
              </Pill>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function QuotePreview({ quote, settings, onBack, onDownloadPdf }) {
  const { subtotal, discountAmount, total } = calcQuoteTotals(quote);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Btn variant="ghost" small onClick={onBack}>
          ← Back to Quotes
        </Btn>
        <Btn small onClick={() => onDownloadPdf(quote)}>
          Download / Save as PDF
        </Btn>
      </div>

      <div
        style={{
          background: "#fff",
          color: "#1a1a1a",
          borderRadius: 12,
          padding: "40px 48px",
          maxWidth: 800,
          margin: "0 auto",
          fontFamily: "Arial, Helvetica, sans-serif",
          boxShadow: "0 8px 40px rgba(0,0,0,.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, gap: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: G.teal, letterSpacing: "-.02em" }}>
              {settings.businessName}
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7, marginTop: 4 }}>
              {settings.address1 && (
                <>
                  {settings.address1}
                  <br />
                </>
              )}
              {settings.address2 && (
                <>
                  {settings.address2}
                  <br />
                </>
              )}
              {settings.website && (
                <>
                  {settings.website}
                  <br />
                </>
              )}
              {settings.email && (
                <>
                  {settings.email}
                  <br />
                </>
              )}
              {settings.phone && (
                <>
                  {settings.phone}
                  <br />
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {quote.quoteNumberLabel || "Quote Summary"}
            </div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              Quote Total: <strong>{fmt$(total)}</strong>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Recipient</div>
              <div style={{ fontSize: 13, color: "#666" }}>{quote.clientName || "—"}</div>
              {quote.clientEmail && (
                <div style={{ fontSize: 13, color: "#666" }}>{quote.clientEmail}</div>
              )}
            </div>
          </div>
        </div>

        {(quote.eventName || quote.eventDate) && (
          <div
            style={{
              textAlign: "center",
              marginBottom: 32,
              paddingBottom: 20,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: G.teal }}>
              {quote.eventName || quote.clientName}
              {quote.eventDate ? ` on ${fmtLong(quote.eventDate)}` : ""}
            </div>
          </div>
        )}

        {quote.introduction && (
          <div style={{ fontSize: 13, color: "#444", marginBottom: 24, fontStyle: "italic" }}>
            {quote.introduction}
          </div>
        )}

        {(quote.sections || []).map((sec) => (
          <div key={sec.id} style={{ marginBottom: 28 }}>
            {sec.packageName && (
              <div style={{ fontSize: 16, fontWeight: 700, color: G.teal, marginBottom: 8 }}>
                {sec.packageName}
              </div>
            )}
            {sec.description && (
              <div
                style={{
                  fontSize: 13,
                  color: "#444",
                  lineHeight: 1.7,
                  marginBottom: 10,
                  whiteSpace: "pre-wrap",
                }}
              >
                {sec.description}
              </div>
            )}
            {cleanIncludes(sec.includes).map((inc, i) => (
              <div key={i} style={{ fontSize: 13, color: "#444", padding: "3px 0" }}>
                {inc}
              </div>
            ))}
            {sec.notes && (
              <div
                style={{
                  fontSize: 12,
                  color: "#888",
                  fontStyle: "italic",
                  marginTop: 8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {sec.notes}
              </div>
            )}
            {(sec.lineItems || []).map((li) => {
              const liTotal = toMoney(li.price) * toQty(li.qty);
              const showQty = toQty(li.qty) > 1;
              return (
                <div
                  key={li.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderTop: "1px solid #eee",
                    paddingTop: 10,
                    marginTop: 10,
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{li.name}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>
                      {fmt$(liTotal)}
                    </div>
                    {showQty && (
                      <div style={{ fontSize: 11, color: "#888" }}>
                        ({fmt$(li.price)} × {li.qty})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {quote.notes && (
          <div
            style={{
              fontSize: 12,
              color: "#666",
              marginTop: 16,
              paddingTop: 12,
              borderTop: "1px solid #eee",
              whiteSpace: "pre-wrap",
            }}
          >
            {quote.notes}
          </div>
        )}

        {quote.expiration && (
          <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
            This quote expires on {fmtShort(quote.expiration)}
          </div>
        )}

        <div style={{ borderTop: "2px solid #1a1a1a", paddingTop: 16, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginBottom: 6 }}>
            <div style={{ fontSize: 14, color: "#666" }}>Subtotal:</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>
              {fmt$(subtotal)}
            </div>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginBottom: 6 }}>
              <div style={{ fontSize: 14, color: "#666" }}>
                Discount{quote.promoCode ? ` (${quote.promoCode})` : ""}:
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: "#b42318",
                }}
              >
                -{fmt$(discountAmount)}
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 16 }}>
            <div style={{ fontSize: 14, color: "#666" }}>Total:</div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "monospace" }}>
              {fmt$(total)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuotesTab({
  lead,
  setLead,
  quotes,
  setQuotes,
  recipients,
  setRecipients,
  settings,
  counters,
  setCounters,
}) {
  const [building, setBuilding] = useState(null);
  const [previewQuote, setPreviewQuote] = useState(null);
  const [errors, setErrors] = useState([]);

  const emptyQuote = {
    id: "",
    quoteNumber: null,
    quoteNumberLabel: "",
    clientName: lead.name || "",
    clientEmail: lead.email || "",
    eventName: lead.type || "",
    eventDate: lead.eventDate || "",
    status: settings.statuses[0] || "Draft",
    introduction: "",
    expiration: "",
    sections: [],
    notes: "",
    promoCode: "",
    discountType: "amount",
    discountValue: 0,
    createdAt: null,
    updatedAt: null,
    lastViewed: null,
    pageViews: 0,
    selected: false,
  };

  const issueNextQuoteNumber = () => {
    const nextNumber = counters.nextQuoteNumber || 1;
    setCounters((prev) => ({ ...prev, nextQuoteNumber: nextNumber + 1 }));
    return nextNumber;
  };

  const startNew = () => {
    const quoteNumber = issueNextQuoteNumber();
    const quoteNumberLabel = `${settings.quotePrefix || "Q"}-${String(quoteNumber).padStart(
      4,
      "0"
    )}`;
    setErrors([]);
    setBuilding({
      ...emptyQuote,
      id: genId("quote"),
      quoteNumber,
      quoteNumberLabel,
      createdAt: new Date().toISOString(),
    });
  };

  const setField = (key, value) => setBuilding((prev) => ({ ...prev, [key]: value }));

  const addCustomSection = () => {
    setBuilding((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        {
          id: genId("sec"),
          packageName: "Custom Section",
          description: "",
          includes: [],
          notes: "",
          lineItems: [{ id: genId("qli"), name: "", price: 0, qty: 1 }],
        },
      ],
    }));
  };

  const updateSection = (sectionIdx, key, value) => {
    setBuilding((prev) => {
      const nextSections = [...prev.sections];
      nextSections[sectionIdx] = { ...nextSections[sectionIdx], [key]: value };
      return { ...prev, sections: nextSections };
    });
  };

  const updateSectionLI = (sectionIdx, itemIdx, key, value) => {
    setBuilding((prev) => {
      const nextSections = [...prev.sections];
      const nextItems = [...nextSections[sectionIdx].lineItems];
      nextItems[itemIdx] = {
        ...nextItems[itemIdx],
        [key]: key === "price" ? toMoney(value) : key === "qty" ? toQty(value) : value,
      };
      nextSections[sectionIdx] = { ...nextSections[sectionIdx], lineItems: nextItems };
      return { ...prev, sections: nextSections };
    });
  };

  const addSectionLI = (sectionIdx) => {
    setBuilding((prev) => {
      const nextSections = [...prev.sections];
      nextSections[sectionIdx] = {
        ...nextSections[sectionIdx],
        lineItems: [
          ...nextSections[sectionIdx].lineItems,
          { id: genId("qli"), name: "", price: 0, qty: 1 },
        ],
      };
      return { ...prev, sections: nextSections };
    });
  };

  const removeSectionLI = (sectionIdx, itemIdx) => {
    setBuilding((prev) => {
      const nextSections = [...prev.sections];
      if (nextSections[sectionIdx].lineItems.length <= 1) return prev;
      nextSections[sectionIdx] = {
        ...nextSections[sectionIdx],
        lineItems: nextSections[sectionIdx].lineItems.filter((_, i) => i !== itemIdx),
      };
      return { ...prev, sections: nextSections };
    });
  };

  const removeSection = (sectionIdx) =>
    setBuilding((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== sectionIdx),
    }));

  const totals = useMemo(
    () => (building ? calcQuoteTotals(building) : { subtotal: 0, discountAmount: 0, total: 0 }),
    [building]
  );

  const validate = () => {
    const nextErrors = [];
    if (!building.clientName.trim()) nextErrors.push("Client name is required");
    if (!(building.sections || []).length) nextErrors.push("Add at least one quote section");
    (building.sections || []).forEach((section, sIdx) => {
      if (!(section.lineItems || []).length) {
        nextErrors.push(`Section ${sIdx + 1} has no line items`);
      }
      (section.lineItems || []).forEach((li, i) => {
        if (!String(li.name || "").trim()) {
          nextErrors.push(`Section ${sIdx + 1}, item ${i + 1} needs a name`);
        }
      });
    });
    if (
      building.clientEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(building.clientEmail)
    ) {
      nextErrors.push("Invalid email format");
    }
    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const recalcLeadNumbers = (nextQuotes) => {
    const acceptedRevenue = nextQuotes
      .filter((q) => q.status === "Accepted")
      .reduce((sum, q) => sum + calcQuoteTotals(q).total, 0);

    const latestAccepted = nextQuotes.find((q) => q.status === "Accepted");
    setLead((prev) => ({
      ...prev,
      revenue: acceptedRevenue,
      balance: latestAccepted ? calcQuoteTotals(latestAccepted).total : prev.balance,
    }));
  };

  const saveQuote = () => {
    if (!validate()) return;

    const existing = quotes.find((q) => q.id === building.id);
    const saved = {
      ...building,
      ...calcQuoteTotals(building),
      sections: (building.sections || []).map((s) => ({
        ...s,
        includes: cleanIncludes(s.includes),
        lineItems: (s.lineItems || []).map((li) => ({
          ...li,
          price: toMoney(li.price),
          qty: toQty(li.qty),
        })),
      })),
      createdAt: existing?.createdAt || building.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let nextQuotes;
    if (quotes.some((q) => q.id === saved.id)) {
      nextQuotes = quotes.map((q) => (q.id === saved.id ? saved : q));
    } else {
      nextQuotes = [saved, ...quotes];
    }

    setQuotes(nextQuotes);
    recalcLeadNumbers(nextQuotes);

    if (
      saved.clientEmail &&
      !recipients.some((r) => r.quoteId === saved.id && r.email === saved.clientEmail)
    ) {
      setRecipients((prev) => [
        ...prev,
        {
          id: Date.now(),
          quoteId: saved.id,
          name: saved.clientName || lead.name,
          email: saved.clientEmail || lead.email,
          lastVisit: null,
        },
      ]);
    }

    setBuilding(null);
    setErrors([]);
  };

  const deleteQuote = (id) => {
    const nextQuotes = quotes.filter((q) => q.id !== id);
    setQuotes(nextQuotes);
    recalcLeadNumbers(nextQuotes);
  };

  const duplicateQuote = (quote) => {
    const newNumber = issueNextQuoteNumber();
    const quoteNumberLabel = `${settings.quotePrefix || "Q"}-${String(newNumber).padStart(
      4,
      "0"
    )}`;
    const copy = JSON.parse(JSON.stringify(quote));
    copy.id = genId("quote");
    copy.quoteNumber = newNumber;
    copy.quoteNumberLabel = quoteNumberLabel;
    copy.status = "Draft";
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    setQuotes((prev) => [copy, ...prev]);
  };

  const handleDownloadPdf = (quote) => {
    const html = quoteToPrintableHtml(quote, settings);
    openPrintWindow(html);
  };

  if (previewQuote) {
    return (
      <QuotePreview
        quote={previewQuote}
        settings={settings}
        onBack={() => setPreviewQuote(null)}
        onDownloadPdf={handleDownloadPdf}
      />
    );
  }

  if (building) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Btn
            variant="ghost"
            small
            onClick={() => {
              setBuilding(null);
              setErrors([]);
            }}
          >
            ← Back
          </Btn>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" small onClick={() => setPreviewQuote(building)}>
              Preview Quote
            </Btn>
            <Btn small onClick={saveQuote}>
              Save Quote
            </Btn>
          </div>
        </div>

        <ErrorList errors={errors} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <Card>
            <SectionLabel>Client & Event Info</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <InputField
                label="Client Name"
                value={building.clientName}
                onChange={(e) => setField("clientName", e.target.value)}
                required
              />
              <InputField
                label="Client Email"
                value={building.clientEmail}
                onChange={(e) => setField("clientEmail", e.target.value)}
                placeholder="email@example.com"
              />
              <InputField
                label="Event / Job Name"
                value={building.eventName}
                onChange={(e) => setField("eventName", e.target.value)}
              />
              <InputField
                label="Event Date"
                value={building.eventDate}
                onChange={(e) => setField("eventDate", e.target.value)}
                type="date"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <InputField
                label="Introduction"
                value={building.introduction}
                onChange={(e) => setField("introduction", e.target.value)}
                placeholder="Thank you for the opportunity."
              />
              <InputField
                label="Expiration Date"
                value={building.expiration}
                onChange={(e) => setField("expiration", e.target.value)}
                type="date"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: G.text,
                    marginBottom: 5,
                  }}
                >
                  Status
                </label>
                <select
                  value={building.status}
                  onChange={(e) => setField("status", e.target.value)}
                  style={{
                    width: "100%",
                    background: G.surface,
                    color: G.text,
                    border: `1px solid ${G.border}`,
                    borderRadius: 6,
                    padding: "9px 12px",
                    fontSize: 13,
                  }}
                >
                  {settings.statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <InputField
                label="Quote Number"
                value={building.quoteNumberLabel}
                readOnly
                onChange={() => {}}
              />
            </div>
          </Card>

          <Card>
            <SectionLabel
              actions={
                <Btn variant="ghost" small onClick={addCustomSection}>
                  + Custom Section
                </Btn>
              }
            >
              Quote Sections
            </SectionLabel>

            {!building.sections.length ? (
              <EmptyState icon="📋" text="Create a custom section to begin" />
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {building.sections.map((section, sectionIdx) => (
                  <div
                    key={section.id}
                    style={{
                      background: G.surface,
                      border: `1px solid ${G.borderLight}`,
                      borderRadius: 8,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <input
                        value={section.packageName}
                        onChange={(e) =>
                          updateSection(sectionIdx, "packageName", e.target.value)
                        }
                        placeholder="Section name"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: G.gold,
                          fontSize: 14,
                          fontWeight: 700,
                          outline: "none",
                          flex: 1,
                        }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn variant="ghost" small onClick={() => addSectionLI(sectionIdx)}>
                          + item
                        </Btn>
                        <button
                          onClick={() => removeSection(sectionIdx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: G.red,
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <InputField
                      label="Section Description"
                      value={section.description || ""}
                      onChange={(e) =>
                        updateSection(sectionIdx, "description", e.target.value)
                      }
                      multiline
                    />

                    <InputField
                      label="Included Items (comma separated)"
                      value={(section.includes || []).join(", ")}
                      onChange={(e) =>
                        updateSection(
                          sectionIdx,
                          "includes",
                          e.target.value.split(",").map((x) => x.trim())
                        )
                      }
                    />

                    <InputField
                      label="Section Notes"
                      value={section.notes || ""}
                      onChange={(e) => updateSection(sectionIdx, "notes", e.target.value)}
                      multiline
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 90px 60px 80px auto",
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        color: G.textMuted,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                      }}
                    >
                      <div>Item</div>
                      <div>Price</div>
                      <div>Qty</div>
                      <div>Sub</div>
                      <div></div>
                    </div>

                    {section.lineItems.map((li, itemIdx) => (
                      <div
                        key={li.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 90px 60px 80px auto",
                          gap: 6,
                          marginBottom: 4,
                          alignItems: "center",
                        }}
                      >
                        <input
                          value={li.name}
                          onChange={(e) =>
                            updateSectionLI(sectionIdx, itemIdx, "name", e.target.value)
                          }
                          placeholder="Item name"
                          style={{
                            background: G.card,
                            color: G.text,
                            border: `1px solid ${G.border}`,
                            borderRadius: 5,
                            padding: "6px 8px",
                            fontSize: 12,
                          }}
                        />
                        <input
                          type="number"
                          value={li.price}
                          min="0"
                          onChange={(e) =>
                            updateSectionLI(sectionIdx, itemIdx, "price", e.target.value)
                          }
                          style={{
                            background: G.card,
                            color: G.text,
                            border: `1px solid ${G.border}`,
                            borderRadius: 5,
                            padding: "6px 8px",
                            fontSize: 12,
                          }}
                        />
                        <input
                          type="number"
                          value={li.qty}
                          min="1"
                          onChange={(e) =>
                            updateSectionLI(sectionIdx, itemIdx, "qty", e.target.value)
                          }
                          style={{
                            background: G.card,
                            color: G.text,
                            border: `1px solid ${G.border}`,
                            borderRadius: 5,
                            padding: "6px 8px",
                            fontSize: 12,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: G.text,
                            textAlign: "right",
                          }}
                        >
                          {fmt$(toMoney(li.price) * toQty(li.qty))}
                        </div>
                        <button
                          onClick={() => removeSectionLI(sectionIdx, itemIdx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: G.red,
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 12, marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: G.textDim }}>Subtotal:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: G.text }}>
                  {fmt$(totals.subtotal)}
                </span>
              </div>
              {totals.discountAmount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 13, color: G.textDim }}>
                    Discount{building.promoCode ? ` (${building.promoCode})` : ""}:
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: G.red }}>
                    -{fmt$(totals.discountAmount)}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontSize: 13, color: G.textDim }}>Quote Total:</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: G.gold }}>
                  {fmt$(totals.total)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionLabel>Promotion / Discount</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 14 }}>
              <InputField
                label="Promo Code / Label"
                value={building.promoCode}
                onChange={(e) => setField("promoCode", e.target.value)}
                placeholder="SPRING25 or Loyalty Discount"
              />
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: G.text,
                    marginBottom: 5,
                  }}
                >
                  Discount Type
                </label>
                <select
                  value={building.discountType}
                  onChange={(e) => setField("discountType", e.target.value)}
                  style={{
                    width: "100%",
                    background: G.surface,
                    color: G.text,
                    border: `1px solid ${G.border}`,
                    borderRadius: 6,
                    padding: "9px 12px",
                    fontSize: 13,
                  }}
                >
                  <option value="amount">Dollar Amount</option>
                  <option value="percent">Percent</option>
                </select>
              </div>
              <InputField
                label={building.discountType === "percent" ? "Percent Off" : "Discount Amount"}
                type="number"
                value={building.discountValue}
                onChange={(e) => {
                  const value = Number(e.target.value) || 0;
                  setField(
                    "discountValue",
                    building.discountType === "percent"
                      ? Math.min(100, Math.max(0, value))
                      : Math.max(0, value)
                  );
                }}
                placeholder={building.discountType === "percent" ? "10" : "100"}
              />
            </div>
          </Card>

          <Card>
            <InputField
              label="Additional Notes"
              value={building.notes}
              onChange={(e) => setField("notes", e.target.value)}
              multiline
              placeholder="Terms, conditions, or notes..."
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 14, color: G.textDim }}>
          {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
        </div>
        <Btn small onClick={startNew}>
          + New Quote
        </Btn>
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          icon="📋"
          text="No quotes yet. Create your first quote."
          action={
            <Btn small onClick={startNew}>
              Create Quote
            </Btn>
          }
        />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {quotes.map((q) => {
            const statusColorMap = {
              Draft: { color: G.textDim, bg: G.surface },
              Sent: { color: G.amber, bg: G.amberBg },
              Accepted: { color: G.green, bg: G.greenBg },
              Declined: { color: G.red, bg: G.redBg },
            };
            const colors = statusColorMap[q.status] || {
              color: G.textDim,
              bg: G.surface,
            };
            const total = calcQuoteTotals(q).total;

            return (
              <div
                key={q.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  gap: 14,
                  alignItems: "center",
                  padding: "16px 18px",
                  background: G.card,
                  border: `1px solid ${G.border}`,
                  borderRadius: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {q.clientName || "Untitled"}
                  </div>
                  <div style={{ fontSize: 12, color: G.textDim, marginTop: 2 }}>
                    {q.quoteNumberLabel || "No number"} · {q.eventName || "No event"} ·{" "}
                    {fmtShort(q.createdAt)}
                  </div>
                  <div style={{ fontSize: 12, color: G.textMuted, marginTop: 4 }}>
                    {recipients.filter((r) => r.quoteId === q.id).length} recipient(s)
                  </div>
                </div>

                <Pill color={colors.color} bg={colors.bg}>
                  {q.status}
                </Pill>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: G.gold,
                    minWidth: 90,
                    textAlign: "right",
                  }}
                >
                  {fmt$(total)}
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => {
                      setErrors([]);
                      setBuilding(JSON.parse(JSON.stringify(q)));
                    }}
                  >
                    Edit
                  </Btn>
                  <Btn variant="ghost" small onClick={() => setPreviewQuote(q)}>
                    Preview
                  </Btn>
                  <Btn variant="secondary" small onClick={() => handleDownloadPdf(q)}>
                    PDF
                  </Btn>
                  <Btn variant="secondary" small onClick={() => duplicateQuote(q)}>
                    Duplicate
                  </Btn>
                  <Btn variant="danger" small onClick={() => deleteQuote(q.id)}>
                    ×
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FinancialsTab({ payments, setPayments, quotes }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const empty = {
    kind: "Custom",
    name: "",
    description: "",
    initialPayment: 0,
    initialType: "Fixed amount",
    tipEnabled: true,
    remaining: [{ amount: 100, type: "Percent of Order", due: "on delivery" }],
  };

  const [form, setForm] = useState(empty);

  const KINDS = ["Custom", "Monthly", "Multiple", "One"];
  const DUES = ["on delivery", "on booking", "before event", "after event", "custom date"];
  const AMTS = ["Percent of Order", "Fixed amount"];
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const showForm = adding || editing !== null;

  const acceptedTotal = quotes
    .filter((q) => q.status === "Accepted")
    .reduce((sum, q) => sum + calcQuoteTotals(q).total, 0);

  const openTotal = quotes
    .filter((q) => q.status !== "Declined")
    .reduce((sum, q) => sum + calcQuoteTotals(q).total, 0);

  const save = () => {
    if (!form.name.trim()) return;
    if (editing !== null) {
      setPayments((p) => p.map((x, i) => (i === editing ? { ...form, id: x.id } : x)));
    } else {
      setPayments((p) => [...p, { ...form, id: Date.now() }]);
    }
    setForm(empty);
    setEditing(null);
    setAdding(false);
  };

  if (showForm) {
    return (
      <Card>
        <SectionLabel>Payment Schedule</SectionLabel>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: G.text,
              marginBottom: 6,
            }}
          >
            Kind <span style={{ color: G.red }}>*</span>
          </label>
          <div style={{ display: "flex" }}>
            {KINDS.map((k, i) => (
              <button
                key={k}
                onClick={() => set("kind", k)}
                style={{
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  background: form.kind === k ? G.gold : G.surface,
                  color: form.kind === k ? "#0e0f11" : G.textDim,
                  border: `1px solid ${form.kind === k ? G.gold : G.border}`,
                  cursor: "pointer",
                  borderRadius:
                    i === 0
                      ? "6px 0 0 6px"
                      : i === KINDS.length - 1
                      ? "0 6px 6px 0"
                      : 0,
                }}
              >
                {form.kind === k && "✓ "}
                {k}
              </button>
            ))}
          </div>
        </div>

        <InputField
          label="Name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
        <InputField
          label="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: G.text,
                marginBottom: 5,
              }}
            >
              Initial Payment
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                value={form.initialPayment}
                onChange={(e) => set("initialPayment", Number(e.target.value))}
                style={{
                  width: 80,
                  background: G.surface,
                  color: G.text,
                  border: `1px solid ${G.border}`,
                  borderRadius: 6,
                  padding: "9px 12px",
                  fontSize: 13,
                }}
              />
              <select
                value={form.initialType}
                onChange={(e) => set("initialType", e.target.value)}
                style={{
                  background: G.surface,
                  color: G.text,
                  border: `1px solid ${G.border}`,
                  borderRadius: 6,
                  padding: "9px 12px",
                  fontSize: 13,
                }}
              >
                {AMTS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: G.text,
                marginBottom: 5,
              }}
            >
              Online Payment Restrictions
            </label>
            <select
              style={{
                width: "100%",
                background: G.surface,
                color: G.text,
                border: `1px solid ${G.border}`,
                borderRadius: 6,
                padding: "9px 12px",
                fontSize: 13,
              }}
            >
              <option>None</option>
              <option>Credit card only</option>
            </select>
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 14,
            fontSize: 13,
            color: G.text,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.tipEnabled}
            onChange={(e) => set("tipEnabled", e.target.checked)}
            style={{ accentColor: G.gold }}
          />{" "}
          Client can leave a tip
        </label>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${G.border}` }}>
          <SectionLabel
            actions={
              <Btn
                small
                variant="secondary"
                onClick={() =>
                  set("remaining", [
                    ...form.remaining,
                    { amount: 0, type: "Percent of Order", due: "on delivery" },
                  ])
                }
              >
                New Payment
              </Btn>
            }
          >
            Remaining Payments
          </SectionLabel>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr auto",
              fontSize: 11,
              fontWeight: 600,
              color: G.textMuted,
              padding: "8px 0",
              borderBottom: `1px solid ${G.border}`,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            <div>Amount</div>
            <div>Due</div>
            <div></div>
          </div>

          {form.remaining.map((r, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr auto",
                gap: 10,
                padding: "10px 0",
                borderBottom: `1px solid ${G.border}33`,
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="number"
                  value={r.amount}
                  onChange={(e) => {
                    const rem = [...form.remaining];
                    rem[idx] = { ...rem[idx], amount: Number(e.target.value) };
                    set("remaining", rem);
                  }}
                  style={{
                    width: 70,
                    background: G.surface,
                    color: G.text,
                    border: `1px solid ${G.border}`,
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 13,
                  }}
                />
                <select
                  value={r.type}
                  onChange={(e) => {
                    const rem = [...form.remaining];
                    rem[idx] = { ...rem[idx], type: e.target.value };
                    set("remaining", rem);
                  }}
                  style={{
                    background: G.surface,
                    color: G.text,
                    border: `1px solid ${G.border}`,
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 12,
                  }}
                >
                  {AMTS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <select
                value={r.due}
                onChange={(e) => {
                  const rem = [...form.remaining];
                  rem[idx] = { ...rem[idx], due: e.target.value };
                  set("remaining", rem);
                }}
                style={{
                  background: G.surface,
                  color: G.text,
                  border: `1px solid ${G.border}`,
                  borderRadius: 6,
                  padding: "7px 10px",
                  fontSize: 12,
                }}
              >
                {DUES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <Btn
                variant="danger"
                small
                onClick={() => set("remaining", form.remaining.filter((_, i) => i !== idx))}
              >
                delete
              </Btn>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          {editing !== null && (
            <Btn
              variant="danger"
              small
              onClick={() => {
                setPayments((p) => p.filter((_, i) => i !== editing));
                setEditing(null);
                setAdding(false);
                setForm(empty);
              }}
            >
              Delete
            </Btn>
          )}
          <Btn
            variant="ghost"
            small
            onClick={() => {
              setEditing(null);
              setAdding(false);
              setForm(empty);
            }}
          >
            Cancel
          </Btn>
          <Btn onClick={save}>Save & Continue</Btn>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card>
        <SectionLabel>Financial Snapshot</SectionLabel>
        <InfoRow label="Open Quote Value" value={fmt$(openTotal)} accent={G.gold} />
        <InfoRow label="Accepted Revenue" value={fmt$(acceptedTotal)} accent={G.green} />
        <InfoRow label="Payment Plans" value={String(payments.length)} />
        <InfoRow
          label="Average Quote"
          value={quotes.length ? fmt$(openTotal / quotes.length) : fmt$(0)}
        />
      </Card>

      <Card>
        <SectionLabel
          actions={
            <Btn
              small
              onClick={() => {
                setForm(empty);
                setAdding(true);
              }}
            >
              + New Payment Schedule
            </Btn>
          }
        >
          Payment Schedules
        </SectionLabel>

        {payments.length === 0 ? (
          <EmptyState icon="💰" text="No payment schedules configured" />
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {payments.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => {
                  setForm({ ...p });
                  setEditing(idx);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  background: G.surface,
                  borderRadius: 8,
                  border: `1px solid ${G.border}`,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: G.goldBg,
                    display: "grid",
                    placeItems: "center",
                    color: G.gold,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  💰
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: G.textDim }}>
                    {p.kind} · {p.description}
                  </div>
                </div>
                <Pill color={G.gold} bg={G.goldBg}>
                  {p.kind}
                </Pill>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ContractsTab({ contracts, setContracts }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    status: "Draft",
    sentOn: "",
    signedOn: "",
    signer: "",
    version: "v1",
  });

  const save = () => {
    if (!form.title.trim()) return;
    setContracts((prev) => [{ id: Date.now(), ...form }, ...prev]);
    setForm({
      title: "",
      status: "Draft",
      sentOn: "",
      signedOn: "",
      signer: "",
      version: "v1",
    });
    setAdding(false);
  };

  return (
    <Card>
      <SectionLabel actions={<Btn small onClick={() => setAdding(true)}>+ Add Contract</Btn>}>
        Contracts
      </SectionLabel>

      {adding && (
        <div
          style={{
            background: G.surface,
            border: `1px solid ${G.borderLight}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField
              label="Contract Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: G.text,
                  marginBottom: 5,
                }}
              >
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                style={{
                  width: "100%",
                  background: G.surface,
                  color: G.text,
                  border: `1px solid ${G.border}`,
                  borderRadius: 6,
                  padding: "9px 12px",
                  fontSize: 13,
                }}
              >
                <option>Draft</option>
                <option>Sent</option>
                <option>Signed</option>
              </select>
            </div>
            <InputField
              label="Sent On"
              type="date"
              value={form.sentOn}
              onChange={(e) => setForm((p) => ({ ...p, sentOn: e.target.value }))}
            />
            <InputField
              label="Signed On"
              type="date"
              value={form.signedOn}
              onChange={(e) => setForm((p) => ({ ...p, signedOn: e.target.value }))}
            />
            <InputField
              label="Signer"
              value={form.signer}
              onChange={(e) => setForm((p) => ({ ...p, signer: e.target.value }))}
            />
            <InputField
              label="Version"
              value={form.version}
              onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))}
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" small onClick={() => setAdding(false)}>
              Cancel
            </Btn>
            <Btn small onClick={save}>
              Save
            </Btn>
          </div>
        </div>
      )}

      {contracts.length === 0 && !adding ? (
        <EmptyState icon="📄" text="No contracts yet" />
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {contracts.map((c) => (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "14px 16px",
                background: G.surface,
                borderRadius: 8,
                border: `1px solid ${G.border}`,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: G.textDim, marginTop: 3 }}>
                  Version {c.version} · Signer: {c.signer || "—"} · Sent{" "}
                  {c.sentOn ? fmtShort(c.sentOn) : "—"} · Signed{" "}
                  {c.signedOn ? fmtShort(c.signedOn) : "—"}
                </div>
              </div>
              <Pill
                color={
                  c.status === "Signed"
                    ? G.green
                    : c.status === "Sent"
                    ? G.amber
                    : G.textDim
                }
                bg={
                  c.status === "Signed"
                    ? G.greenBg
                    : c.status === "Sent"
                    ? G.amberBg
                    : G.surface
                }
              >
                {c.status}
              </Pill>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function NotesTab({ notes, setNotes }) {
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setNotes((p) => [
      { id: Date.now(), text: text.trim(), date: new Date().toISOString() },
      ...p,
    ]);
    setText("");
  };

  return (
    <Card>
      <SectionLabel>Notes</SectionLabel>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note..."
          style={{
            flex: 1,
            background: G.surface,
            color: G.text,
            border: `1px solid ${G.border}`,
            borderRadius: 8,
            padding: 12,
            fontSize: 13,
            minHeight: 60,
            resize: "vertical",
          }}
        />
        <Btn small onClick={add} disabled={!text.trim()} style={{ alignSelf: "flex-end" }}>
          Add
        </Btn>
      </div>

      {notes.length === 0 ? (
        <EmptyState icon="📝" text="No notes yet" />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {notes.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "12px 14px",
                background: G.surface,
                borderRadius: 8,
                border: `1px solid ${G.border}`,
              }}
            >
              <div style={{ fontSize: 13, color: G.text, lineHeight: 1.6 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: G.textMuted, marginTop: 6 }}>
                {fmtShort(n.date)} · {fmtTime(n.date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function FilesTab({ files, setFiles }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", kind: "Reference", uploadedOn: "" });

  const save = () => {
    if (!form.name.trim()) return;
    setFiles((prev) => [
      {
        id: Date.now(),
        ...form,
        uploadedOn: form.uploadedOn || new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setForm({ name: "", kind: "Reference", uploadedOn: "" });
    setAdding(false);
  };

  return (
    <Card>
      <SectionLabel actions={<Btn small onClick={() => setAdding(true)}>+ Add File</Btn>}>
        Files
      </SectionLabel>

      {adding && (
        <div
          style={{
            background: G.surface,
            border: `1px solid ${G.borderLight}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <InputField
              label="File Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <InputField
              label="Type"
              value={form.kind}
              onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
            />
            <InputField
              label="Uploaded On"
              type="date"
              value={form.uploadedOn}
              onChange={(e) => setForm((p) => ({ ...p, uploadedOn: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" small onClick={() => setAdding(false)}>
              Cancel
            </Btn>
            <Btn small onClick={save}>
              Save
            </Btn>
          </div>
        </div>
      )}

      {files.length === 0 && !adding ? (
        <EmptyState icon="📁" text="No files yet" />
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {files.map((f) => (
            <div
              key={f.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 12,
                alignItems: "center",
                padding: "14px 16px",
                background: G.surface,
                borderRadius: 8,
                border: `1px solid ${G.border}`,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: G.textDim, marginTop: 3 }}>{f.kind}</div>
              </div>
              <div style={{ fontSize: 12, color: G.textDim }}>{fmtShort(f.uploadedOn)}</div>
              <Btn
                variant="ghost"
                small
                onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
              >
                remove
              </Btn>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function NSPBusinessSuite() {
  const initial = loadState();

  const [lead, setLead] = useState(initial.lead);
  const [activeTab, setActiveTab] = useState("overview");
  const [quotes, setQuotes] = useState(initial.quotes);
  const [recipients, setRecipients] = useState(initial.recipients);
  const [schedule, setSchedule] = useState(initial.schedule);
  const [payments, setPayments] = useState(initial.payments);
  const [contracts, setContracts] = useState(initial.contracts);
  const [files, setFiles] = useState(initial.files);
  const [notes, setNotes] = useState(initial.notes);
  const [settings, setSettings] = useState(initial.settings);
  const [counters, setCounters] = useState(initial.counters);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lead,
        quotes,
        recipients,
        schedule,
        payments,
        contracts,
        files,
        notes,
        settings,
        counters,
      })
    );
  }, [lead, quotes, recipients, schedule, payments, contracts, files, notes, settings, counters]);

  const stageIdx = STAGES.findIndex((s) => s.key === lead.stage);
  const quoteBadge = quotes.length;

  const handleEmailQuote = () => {
    const firstQuote = quotes[0];
    if (!firstQuote || !lead.email) return;
    const subject = encodeURIComponent(`${firstQuote.quoteNumberLabel} from ${settings.businessName}`);
    const body = encodeURIComponent(
      `Hi ${lead.name},

Your quote ${firstQuote.quoteNumberLabel} is ready.

Total: ${fmt$(calcQuoteTotals(firstQuote).total)}

Thanks,
${settings.businessName}`
    );
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  const handlePdf = () => {
    if (quotes[0]) openPrintWindow(quoteToPrintableHtml(quotes[0], settings));
  };

  const handleResetActivity = () => {
    setQuotes((prev) => prev.map((q) => ({ ...q, lastViewed: null, pageViews: 0 })));
  };

  const handleDeleteLead = () => {
    if (!window.confirm("Delete local lead data for this page?")) return;
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const SIDEBAR_ACTIONS = [
    { label: "← Return to Leads", variant: "primary", onClick: () => window.history.back() },
    { label: "Email Latest Quote", variant: "secondary", onClick: handleEmailQuote },
    { label: "View / Print PDF", variant: "secondary", onClick: handlePdf },
    { label: "Reset Client Activity", variant: "secondary", onClick: handleResetActivity },
    { label: "Revision History", variant: "secondary", onClick: () => setActiveTab("notes") },
    { label: "Delete", variant: "danger", onClick: handleDeleteLead },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab lead={lead} setLead={setLead} quotes={quotes} />;
      case "schedule":
        return <ScheduleTab schedule={schedule} setSchedule={setSchedule} />;
      case "quotes":
        return (
          <QuotesTab
            lead={lead}
            setLead={setLead}
            quotes={quotes}
            setQuotes={setQuotes}
            recipients={recipients}
            setRecipients={setRecipients}
            settings={settings}
            counters={counters}
            setCounters={setCounters}
          />
        );
      case "financials":
        return <FinancialsTab payments={payments} setPayments={setPayments} quotes={quotes} />;
      case "contracts":
        return <ContractsTab contracts={contracts} setContracts={setContracts} />;
      case "notes":
        return <NotesTab notes={notes} setNotes={setNotes} />;
      case "files":
        return <FilesTab files={files} setFiles={setFiles} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        background: G.bg,
        color: G.text,
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", height: 44, overflow: "hidden" }}>
        {STAGES.map((s, i) => {
          const active = i <= stageIdx;
          const current = s.key === lead.stage;
          return (
            <button
              key={s.key}
              onClick={() => setLead((p) => ({ ...p, stage: s.key }))}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: active ? s.color : G.surface,
                color: active ? "#0e0f11" : G.textMuted,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: current ? 800 : 600,
                letterSpacing: ".02em",
                clipPath:
                  i < STAGES.length - 1
                    ? "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%)",
                marginLeft: i > 0 ? -8 : 0,
                paddingLeft: i > 0 ? 20 : 0,
                transition: "all .2s",
              }}
            >
              {s.icon} {s.key}
            </button>
          );
        })}
      </div>

      <div
        style={{
          padding: "20px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `1px solid ${G.border}`,
          background: G.surface,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.02em" }}>
              {lead.name}
            </h1>
            <span style={{ color: G.textMuted, fontSize: 16 }}>📌</span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 13 }}>
            <span>
              Revenue: <span style={{ color: G.green, fontWeight: 600 }}>{fmt$(lead.revenue)}</span>
            </span>
            <span>
              Balance: <span style={{ color: G.amber, fontWeight: 600 }}>{fmt$(lead.balance)}</span>
            </span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtLong(lead.eventDate)}</div>
          <div style={{ fontSize: 13, color: G.textDim, marginTop: 4 }}>
            Inquired on{" "}
            <span style={{ fontWeight: 700, color: G.text }}>{fmtShort(lead.inquiredOn)}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${G.border}`,
          background: G.surface,
          overflowX: "auto",
          padding: "0 28px",
        }}
      >
        {TABS.map((t) => {
          const badge = t.key === "quotes" ? quoteBadge : 0;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "12px 18px",
                fontSize: 12,
                fontWeight: 600,
                color: activeTab === t.key ? G.gold : G.textDim,
                background: "none",
                border: "none",
                cursor: "pointer",
                borderBottom:
                  activeTab === t.key ? `2px solid ${G.gold}` : "2px solid transparent",
                transition: "all .15s",
                whiteSpace: "nowrap",
                letterSpacing: ".02em",
              }}
            >
              {t.label}
              {badge > 0 && <Badge n={badge} color={G.gold} />}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          minHeight: "calc(100vh - 170px)",
        }}
      >
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>{renderTab()}</div>

        <div
          style={{
            borderLeft: `1px solid ${G.border}`,
            padding: "20px 14px",
            background: G.surface,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {SIDEBAR_ACTIONS.map((a, i) => (
            <Btn key={i} variant={a.variant} full small onClick={a.onClick}>
              {a.label}
            </Btn>
          ))}
        </div>
      </div>
    </div>
  );
}
