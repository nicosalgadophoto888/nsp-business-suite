"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const G = {
  bg: "#f7f5f0",
  surface: "#fcfaf6",
  card: "#ffffff",
  border: "#e4ddd2",
  borderLight: "#d7cfc3",
  text: "#1f2937",
  textDim: "#5f6875",
  textMuted: "#7f8794",
  gold: "#b48a3a",
  goldBg: "rgba(180,138,58,.14)",
  green: "#0f9f6e",
  greenBg: "rgba(15,159,110,.12)",
  red: "#d14343",
  redBg: "rgba(209,67,67,.12)",
  blue: "#2f6fde",
  blueBg: "rgba(47,111,222,.12)",
  amber: "#c28518",
  amberBg: "rgba(194,133,24,.14)",
  teal: "#2b7f87",
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
  { key: "templates", label: "Templates" },
  { key: "notes", label: "Notes" },
  { key: "files", label: "Files" },
];

const STORAGE_KEY = "nsp_lead_detail_v2";

const DEFAULT_SETTINGS = {
  businessName: "Nico Salgado Photography",
  logoUrl: "/nsp-logo.jpg",
  address1: "30317 Glenmuer",
  address2: "Farmington Hills, MI 48334",
  website: "https://www.nicosalgadophotography.com",
  email: "nicosalgadophoto@gmail.com",
  phone: "",
  quotePrefix: "Q",
  statuses: ["Draft", "Sent", "Accepted", "Declined"],
};

const DEFAULT_FILE_TEMPLATES = [
  {
    id: "tpl-file-1",
    type: "file",
    action: "Contract",
    name: "Wedding Services Agreement",
    category: "Contracts",
    folder: "Made for you",
    content:
      "This Wedding Services Agreement is entered into by {{client_name}} and Nico Salgado Photography...",
    createdAt: "2026-04-01T10:00:00",
    updatedAt: "2026-04-01T10:00:00",
  },
  {
    id: "tpl-file-2",
    type: "file",
    action: "Invoice, Pay",
    name: "Simple Invoice",
    category: "Invoices",
    folder: "Made for you",
    content: "Invoice template for {{client_name}} with session {{session_type}} on {{session_date}}.",
    createdAt: "2026-04-03T10:00:00",
    updatedAt: "2026-04-03T10:00:00",
  },
  {
    id: "tpl-file-3",
    type: "file",
    action: "Proposal",
    name: "Story Proposal",
    category: "Proposals",
    folder: "My Templates",
    content: "Proposal for {{client_name}} including package options and timeline.",
    createdAt: "2026-04-04T10:00:00",
    updatedAt: "2026-04-04T10:00:00",
  },
];

const DEFAULT_PACKAGE_TEMPLATES = [
  {
    id: "tpl-package-hs-first",
    type: "file",
    action: "Services, Quote",
    name: "Headshots - The First Impression",
    category: "Headshots",
    folder: "Made for you",
    content:
      "Price: $349\nDuration: 30-minute session\nIncludes:\n- Pre-session consultation\n- Expert posing and expression coaching\n- 3 fully retouched digital images\n- Professional licensing included\nAdd-on: Additional headshots $125 each",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-package-hs-statement",
    type: "file",
    action: "Services, Quote",
    name: "Headshots - The Statement",
    category: "Headshots",
    folder: "Made for you",
    content:
      "Price: $649\nDuration: 45-minute session\nIncludes:\n- Brand consultation\n- 2 background / lighting setups\n- Wardrobe guidance\n- 5 fully retouched digital images\n- Professional licensing included",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-package-hs-authority",
    type: "file",
    action: "Services, Quote",
    name: "Headshots - The Authority",
    category: "Headshots",
    folder: "Made for you",
    content:
      "Price: $895\nDuration: 75-minute session\nIncludes:\n- 3 background / lighting setups\n- Full wardrobe and styling guidance\n- 8 fully retouched digital images\n- Same-week delivery\n- Professional licensing included",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-package-br-foundation",
    type: "file",
    action: "Services, Proposal",
    name: "Branding - The Foundation",
    category: "Personal Branding",
    folder: "Made for you",
    content:
      "Price: $1,400\nDuration: Up to 1.5 hours\nIncludes:\n- Brand strategy call\n- 2-3 lighting / background setups\n- Wardrobe consultation\n- 15 fully retouched digital images\n- Full licensing",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-package-br-identity",
    type: "file",
    action: "Services, Proposal",
    name: "Branding - The Identity",
    category: "Personal Branding",
    folder: "Made for you",
    content:
      "Price: $2,400\nDuration: Up to 2.5 hours\nIncludes:\n- In-depth brand discovery\n- Studio plus optional location\n- 4-5 setups and 3 wardrobe changes\n- 30 fully retouched images\n- Full licensing",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-package-br-campaign",
    type: "file",
    action: "Services, Proposal",
    name: "Branding - The Brand Campaign",
    category: "Personal Branding",
    folder: "Made for you",
    content:
      "Price: $3,800\nDuration: Half-day (4+ hours)\nIncludes:\n- Comprehensive brand strategy\n- Studio plus 1-2 on-location setups\n- 50+ retouched images\n- Priority delivery within 8 days\n- Social-ready crop package",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-package-ev-coverage",
    type: "file",
    action: "Services, Quote",
    name: "Events - The Coverage",
    category: "Events",
    folder: "Made for you",
    content:
      "Price: $500\nDuration: 2 hours on-site\nIncludes:\n- Planning call\n- Candid and posed shots\n- Professional editing\n- 50+ digital images\n- Online gallery",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-package-ev-production",
    type: "file",
    action: "Services, Quote",
    name: "Events - The Production",
    category: "Events",
    folder: "Made for you",
    content:
      "Price: $1,200\nDuration: 4 hours on-site\nIncludes:\n- Shot list and planning\n- Speaker and keynote coverage\n- 100+ digital images\n- Next-day highlights\n- Full licensing",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-package-ev-showcase",
    type: "file",
    action: "Services, Quote",
    name: "Events - The Showcase",
    category: "Events",
    folder: "Made for you",
    content:
      "Price: $2,400\nDuration: 8 hours on-site\nIncludes:\n- Full event narrative coverage\n- VIP and panel coverage\n- 200+ digital images\n- 48-hour highlights\n- Full licensing",
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
];

const DEFAULT_EMAIL_TEMPLATES = [
  {
    id: "tpl-email-booking",
    type: "email",
    action: "Send",
    name: "Booking Confirmation",
    category: "Booking",
    folder: "Made for you",
    subject: "You're Booked! - {{service_type}} Session Confirmed",
    content: `Hi {{client_name}},

Great news - your {{service_type}} session is officially confirmed! I'm excited to work with you.

Here are the details:

Session: {{package_name}} ({{package_tier}})
Date: {{session_date}}
Time: {{session_time}}
Location: {{location}}
Investment: {{total_price}}

Your 50% retainer of {{retainer_amount}} has been received - thank you! The remaining balance of {{balance_due}} is due before your session date.

What happens next:
1. You'll receive a New Client Questionnaire shortly - please complete it at least 3 days before our session so I can tailor the experience to you.
2. If you haven't already, please review and sign your contract via the link I'll send separately.
3. Start thinking about wardrobe! I'll share a style guide to help you prepare.

If you have any questions at all, don't hesitate to reach out. I'm here to make this process seamless and fun.

Looking forward to creating something amazing together!

Warm regards,
Nico Salgado
Nico Salgado Photography
nico@nicosalgadophotography.com
www.nicosalgadophotography.com`,
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-email-onboarding",
    type: "email",
    action: "Send",
    name: "Client Onboarding",
    category: "Onboarding",
    folder: "Made for you",
    subject: "Welcome to NSP! Here's What to Expect",
    content: `Hi {{client_name}},

Welcome aboard - I'm thrilled to have you as a client!

I wanted to take a moment to walk you through the process so you know exactly what to expect as we move forward together.

Your Session Roadmap:

Step 1 - Questionnaire
I'll be sending you a brief questionnaire to learn more about your goals, preferences, and vision. This helps me design a session that's uniquely yours.

Step 2 - Contract & Retainer
You'll receive a contract for review and e-signature, along with a secure payment link for your 50% retainer to lock in your date.

Step 3 - Pre-Session Prep
About a week before your session, I'll send over a prep guide covering wardrobe tips, location details, and what to expect on shoot day.

Step 4 - Shoot Day
This is the fun part! I'll guide you through every pose and angle - no modeling experience needed.

Step 5 - Gallery Delivery
Your professionally edited images will be delivered within 2-3 weeks via a private online gallery.

If anything comes up between now and then, you can always reach me at nico@nicosalgadophotography.com.

Let's make something incredible.

Best,
Nico Salgado
Nico Salgado Photography
www.nicosalgadophotography.com`,
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-email-testimonial",
    type: "email",
    action: "Reminder",
    name: "Testimonial Request",
    category: "Testimonials",
    folder: "Made for you",
    subject: "Quick Favor? I'd Love Your Feedback!",
    content: `Hi {{client_name}},

I hope you've been enjoying your images from our {{service_type}} session! It was such a pleasure working with you.

I have a small favor to ask - would you be willing to share a brief testimonial about your experience? Your words mean the world to me and help future clients feel confident about booking.

It doesn't have to be long! Even 2-3 sentences about what stood out to you would be amazing.

You can simply reply to this email with your thoughts, or leave a review on Google here:
{{google_review_link}}

As a thank you, I'd love to offer you {{testimonial_incentive}} toward your next session.

Thank you so much for your trust and your time - it truly means a lot.

Gratefully,
Nico Salgado
Nico Salgado Photography
nico@nicosalgadophotography.com`,
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-email-discount",
    type: "email",
    action: "Reply",
    name: "Discount Request Response",
    category: "Sales",
    folder: "Made for you",
    subject: "Re: Pricing for {{service_type}} Session",
    content: `Hi {{client_name}},

Thank you for reaching out and for your interest in working with me - I really appreciate it!

I completely understand that budget is an important consideration. My rates reflect the time, expertise, and care that goes into every session.

That said, I want to help make this work for you. Here are a few options:

Option 1 - Flexible Payment Plan
I can split your investment into two or three payments.

Option 2 - A Different Package
If {{current_package}} feels like a stretch, my {{alternative_package}} package at {{alternative_price}} might be a great fit.

Option 3 - Mini Session Waitlist
I occasionally offer limited mini sessions at a reduced rate.

I never want price to be the only thing standing between you and images you'll love.

Looking forward to hearing from you!

Best,
Nico Salgado
Nico Salgado Photography
nico@nicosalgadophotography.com`,
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-email-questionnaire-followup",
    type: "email",
    action: "Reminder",
    name: "Questionnaire Follow-Up",
    category: "Onboarding",
    folder: "Made for you",
    subject: "Friendly Reminder - Your Session Questionnaire",
    content: `Hi {{client_name}},

Just a quick, friendly reminder - I haven't received your completed questionnaire yet, and your {{service_type}} session is coming up on {{session_date}}!

It only takes about 5-10 minutes. You can complete it here:
{{questionnaire_link}}

Ideally, I'd love to have it back at least 3 days before your session so I have time to prepare.

Can't wait to start planning your session!

Best,
Nico Salgado
Nico Salgado Photography
nico@nicosalgadophotography.com`,
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
  {
    id: "tpl-email-questionnaire",
    type: "email",
    action: "Send",
    name: "New Client Questionnaire",
    category: "Onboarding",
    folder: "Made for you",
    subject: "Let's Get to Know You - Your Session Questionnaire",
    content: `Hi {{client_name}},

I'm so excited for your upcoming {{service_type}} session!

Please take a few minutes to fill out this questionnaire:
{{questionnaire_link}}

There are no wrong answers - this is all about making your session feel personal, comfortable, and you.

Please complete this at least 3 days before our session.

Cheers,
Nico Salgado
Nico Salgado Photography
nico@nicosalgadophotography.com
www.nicosalgadophotography.com`,
    createdAt: "2026-04-07T10:00:00",
    updatedAt: "2026-04-07T10:00:00",
  },
];

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
  emailActivity: [],
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
  templates: [...DEFAULT_FILE_TEMPLATES, ...DEFAULT_PACKAGE_TEMPLATES, ...DEFAULT_EMAIL_TEMPLATES],
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

function mergeDefaultTemplates(savedTemplates) {
  const saved = Array.isArray(savedTemplates) ? savedTemplates : [];
  const defaults = DEFAULT_DATA.templates || [];
  const byId = new Map();
  defaults.forEach((t) => byId.set(t.id, t));
  saved.forEach((t) => byId.set(t.id, { ...byId.get(t.id), ...t }));
  return Array.from(byId.values());
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
    emailActivity: saved.emailActivity || DEFAULT_DATA.emailActivity,
    quotes: saved.quotes || DEFAULT_DATA.quotes,
    recipients: saved.recipients || DEFAULT_DATA.recipients,
    templates: mergeDefaultTemplates(saved.templates),
  };
}

function genId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function genUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return genId("uuid");
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

async function parseApiResponse(res, fallbackMessage) {
  const raw = await res.text();
  const data = safeJsonParse(raw, null);
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      (raw && !raw.startsWith("<!DOCTYPE") ? raw : "") ||
      fallbackMessage ||
      "Request failed";
    throw new Error(msg);
  }
  return data || {};
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

function encodeClientPayload(payload) {
  try {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return "";
  }
}

function toAbsoluteAssetUrl(path) {
  const raw = String(path || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (typeof window === "undefined") return raw.startsWith("/") ? raw : `/${raw}`;
  return raw.startsWith("/") ? `${window.location.origin}${raw}` : `${window.location.origin}/${raw}`;
}

function quoteToPrintableHtml(quote, settings) {
  const { subtotal, discountAmount, total } = calcQuoteTotals(quote);
  const logoUrl = toAbsoluteAssetUrl(settings.logoUrl || "/nsp-logo.jpg");
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
              ${
                logoUrl
                  ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(
                      settings.businessName || "Business"
                    )}" style="max-height:52px;width:auto;display:block;margin-bottom:8px;" />`
                  : ""
              }
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

function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
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

function ScheduleTab({ schedule, setSchedule, lead }) {
  const [adding, setAdding] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(true);
  const [showEventNotes, setShowEventNotes] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [form, setForm] = useState({
    title: lead?.type ? `${lead.type} Session` : "",
    date: lead?.eventDate || "",
    time: "",
    endTime: "",
    location: lead?.location || "",
    status: lead?.stage === "Booked" ? "Booked" : "Tentative",
    notes: "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const sortedEvents = [...(schedule || [])].sort(
    (a, b) => new Date(`${a.date || ""} ${a.time || ""}`) - new Date(`${b.date || ""} ${b.time || ""}`)
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visibleEvents = sortedEvents.filter((ev) => {
    if (showPastEvents) return true;
    const d = new Date(ev.date || "");
    return Number.isNaN(d.getTime()) ? true : d >= today;
  });
  const selectedEvent =
    visibleEvents.find((ev) => String(ev.id) === String(selectedEventId)) || visibleEvents[0] || null;
  const mapLocation = selectedEvent?.location || lead?.location || "Michigan";

  const statusPill = (s) => {
    if (s === "Booked" || s === "Confirmed") return { color: G.green, bg: G.greenBg };
    if (s === "Tentative") return { color: G.amber, bg: G.amberBg };
    return { color: G.textDim, bg: G.surface };
  };

  return (
    <Card>
      <SectionLabel actions={<Btn small onClick={() => setAdding(true)}>+ New Event</Btn>}>
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
            <InputField
              label="End Time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
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
                onChange={(e) => set("status", e.target.value)}
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
                <option value="Tentative">Tentative</option>
                <option value="Booked">Booked</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <InputField
            label="Event Notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            multiline
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
            <Btn variant="ghost" small onClick={() => setAdding(false)}>
              Cancel
            </Btn>
            <Btn
              small
              onClick={() => {
                if (!form.title.trim()) return;
                const created = { ...form, id: Date.now() };
                setSchedule((p) => [...p, created]);
                setSelectedEventId(created.id);
                setForm({
                  title: lead?.type ? `${lead.type} Session` : "",
                  date: lead?.eventDate || "",
                  time: "",
                  endTime: "",
                  location: lead?.location || "",
                  status: lead?.stage === "Booked" ? "Booked" : "Tentative",
                  notes: "",
                });
                setAdding(false);
              }}
            >
              Save
            </Btn>
          </div>
        </div>
      )}

      {visibleEvents.length === 0 && !adding ? (
        <EmptyState icon="📅" text="No events scheduled for this client yet." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 250px", gap: 14 }}>
          <div>
            <div
              style={{
                height: 270,
                border: `1px solid ${G.border}`,
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <iframe
                title="Event map"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapLocation)}&output=embed`}
                style={{ border: "none" }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {visibleEvents.map((ev) => {
                const pill = statusPill(ev.status);
                const active = String(selectedEvent?.id) === String(ev.id);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 14px",
                      background: active ? G.goldBg : G.surface,
                      borderRadius: 8,
                      border: `1px solid ${active ? G.gold : G.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: G.textMuted }}>{fmtShort(ev.date)}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{ev.time || "TBD"}</div>
                      {ev.endTime ? (
                        <div style={{ fontSize: 11, color: G.textDim }}>to {ev.endTime}</div>
                      ) : null}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: G.textDim }}>{ev.location || "Location TBD"}</div>
                      {showEventNotes && ev.notes ? (
                        <div style={{ fontSize: 12, color: G.textMuted, marginTop: 3 }}>{ev.notes}</div>
                      ) : null}
                    </div>
                    <Pill color={pill.color} bg={pill.bg}>
                      {ev.status || "Tentative"}
                    </Pill>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              border: `1px solid ${G.border}`,
              borderRadius: 8,
              padding: 12,
              background: G.surface,
              height: "fit-content",
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <Btn small onClick={() => setAdding(true)} full>
                New Event
              </Btn>
              <Btn variant="secondary" small full onClick={() => window.print()}>
                Print Schedule
              </Btn>
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12, color: G.text }}>
                <input
                  type="checkbox"
                  checked={showPastEvents}
                  onChange={(e) => setShowPastEvents(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Show Past Events
              </label>
              <label style={{ fontSize: 12, color: G.text }}>
                <input
                  type="checkbox"
                  checked={showEventNotes}
                  onChange={(e) => setShowEventNotes(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Show Event Notes
              </label>
            </div>
            {selectedEvent ? (
              <div style={{ marginTop: 14, borderTop: `1px solid ${G.border}`, paddingTop: 10 }}>
                <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 6 }}>Selected Event</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedEvent.title}</div>
                <div style={{ fontSize: 12, color: G.textDim }}>{fmtLong(selectedEvent.date)}</div>
                <div style={{ fontSize: 12, color: G.textDim }}>
                  {selectedEvent.time || "TBD"} {selectedEvent.endTime ? `- ${selectedEvent.endTime}` : ""}
                </div>
                <div style={{ fontSize: 12, color: G.textDim }}>{selectedEvent.location || "Location TBD"}</div>
              </div>
            ) : null}
          </div>
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
  templates,
  settings,
  counters,
  setCounters,
}) {
  const [building, setBuilding] = useState(null);
  const [previewQuote, setPreviewQuote] = useState(null);
  const [errors, setErrors] = useState([]);
  const [quoteNotice, setQuoteNotice] = useState(null);
  const [emailingApproval, setEmailingApproval] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPackageTemplateId, setSelectedPackageTemplateId] = useState("");

  const quoteTemplates = useMemo(
    () => (templates || []).filter((t) => t.type === "file"),
    [templates]
  );

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

  const extractTemplatePrice = (tpl) => {
    if (typeof tpl?.basePrice === "number") return toMoney(tpl.basePrice);
    const match = String(tpl?.content || "").match(/\$([\d,]+(?:\.\d{1,2})?)/);
    return match ? toMoney(String(match[1]).replaceAll(",", "")) : 0;
  };

  const extractTemplateIncludes = (tpl) => {
    if (Array.isArray(tpl?.includes) && tpl.includes.length) return cleanIncludes(tpl.includes);
    return cleanIncludes(
      String(tpl?.content || "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^[-•]\s+/.test(line) || /^includes?:/i.test(line))
        .map((line) => line.replace(/^includes?:\s*/i, "").replace(/^[-•]\s+/, ""))
    );
  };

  const addSectionFromTemplate = (tpl) => {
    if (!tpl) return;
    const price = extractTemplatePrice(tpl);
    const includes = extractTemplateIncludes(tpl);
    setBuilding((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        {
          id: genId("sec"),
          packageName: tpl.name || "Package Template",
          description: tpl.content || "",
          includes,
          notes: "",
          lineItems: [
            {
              id: genId("qli"),
              name: tpl.name || "Package",
              price,
              qty: 1,
            },
          ],
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

  const persistQuoteFromBuilding = () => {
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

    setErrors([]);
    return saved;
  };

  const saveQuote = () => {
    const saved = persistQuoteFromBuilding();
    if (!saved) return;
    setQuoteNotice(null);
    setBuilding(null);
  };

  const emailQuoteForApproval = async (quote) => {
    const recipient = quote.clientEmail || lead.email;
    if (!recipient) {
      setQuoteNotice({ type: "error", message: "Client email is required to send approval." });
      return false;
    }
    try {
      setEmailingApproval(true);
      setQuoteNotice(null);
      const totals = calcQuoteTotals(quote);
      const sectionSummary = (quote.sections || [])
        .map((s) => {
          const lineTotal = (s.lineItems || []).reduce(
            (sum, li) => sum + toMoney(li.price) * toQty(li.qty),
            0
          );
          return `<li style="margin:4px 0;"><strong>${escapeHtml(
            s.packageName || "Package"
          )}</strong> — ${escapeHtml(fmt$(lineTotal))}</li>`;
        })
        .join("");
      const quotePayload = {
        type: "quote",
        document: {
          id: quote.id,
          quoteNumberLabel: quote.quoteNumberLabel || "",
          clientName: quote.clientName || lead.name || "",
          clientEmail: quote.clientEmail || lead.email || "",
          eventName: quote.eventName || "",
          eventDate: quote.eventDate || "",
          introduction: quote.introduction || "",
          notes: quote.notes || "",
          expiration: quote.expiration || "",
          subtotal: Number(totals.subtotal || 0),
          discountAmount: Number(totals.discountAmount || 0),
          totalAmount: Number(totals.total || 0),
          sections: (quote.sections || []).map((s) => ({
            packageName: s.packageName || "",
            description: s.description || "",
            includes: cleanIncludes(s.includes || []),
            notes: s.notes || "",
            lineItems: (s.lineItems || []).map((li) => ({
              name: li.name || "",
              price: toMoney(li.price),
              qty: toQty(li.qty),
            })),
          })),
          businessName: settings.businessName || "Nico Salgado Photography",
          businessEmail: settings.email || "nicosalgadophoto@gmail.com",
        },
      };

      let reviewLink = "";
      try {
        const token = genUuid();
        const approvalRecord = {
          token,
          quote_id: String(quote.id || ""),
          quote_number_label: quote.quoteNumberLabel || "",
          client_name: quote.clientName || lead.name || "",
          client_email: recipient,
          status: "pending",
          payload: quotePayload.document,
          approved_at: null,
        };
        const { data, error } = await supabase
          .from("quote_approvals")
          .upsert(approvalRecord, { onConflict: "quote_id" })
          .select("token")
          .single();
        if (error) throw error;
        if (!data?.token) throw new Error("Token not returned");
        reviewLink = `${window.location.origin}/client?token=${encodeURIComponent(data.token)}`;
      } catch {
        const encoded = encodeClientPayload(quotePayload);
        reviewLink = encoded
          ? `${window.location.origin}/client?payload=${encodeURIComponent(encoded)}`
          : `${window.location.origin}/client`;
      }

      const htmlBody = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;max-width:620px;margin:0 auto;">
  <div style="background:#0e0f11;padding:24px 28px;border-radius:12px 12px 0 0;">
    <div style="font-size:18px;font-weight:800;color:#d4a853;">${escapeHtml(
      settings.businessName || "Nico Salgado Photography"
    )}</div>
  </div>
  <div style="background:#ffffff;padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 12px 12px;">
    <h2 style="margin:0 0 8px;font-size:18px;">Quote Approval Request</h2>
    <p style="margin:0 0 16px;font-size:13px;color:#555;">Quote ${escapeHtml(
      quote.quoteNumberLabel || ""
    )} for ${escapeHtml(quote.clientName || lead.name || "Client")}</p>
    <ul style="padding-left:18px;margin:0 0 14px;">${sectionSummary}</ul>
    <div style="border-top:1px solid #ddd;padding-top:10px;margin-top:10px;font-size:14px;">
      <strong>Total:</strong> ${escapeHtml(fmt$(totals.total))}
    </div>
    <div style="text-align:center;margin-top:16px;">
      <a href="${reviewLink}" style="display:inline-block;padding:11px 24px;background:#d4a853;color:#0e0f11;text-decoration:none;border-radius:8px;font-weight:800;">
        Review & Approve Quote
      </a>
    </div>
    <p style="margin-top:16px;font-size:13px;color:#444;line-height:1.6;">
      Please review and approve this quote using the secure button above.
      Once approved, your status updates in our system and we can send your payment link immediately.
    </p>
    <p style="margin-top:10px;font-size:12px;color:#666;line-height:1.5;">
      Trouble with the button? Copy this link into your browser:<br />
      <a href="${reviewLink}" style="color:#b48a3a;">${reviewLink}</a>
    </p>
  </div>
</div>`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject: `Approval Needed: Quote ${quote.quoteNumberLabel || ""} - ${
            settings.businessName || "Nico Salgado Photography"
          }`.trim(),
          htmlBody,
        }),
      });
      await parseApiResponse(res, "Failed to send quote approval email");

      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quote.id ? { ...q, status: "Sent", updatedAt: new Date().toISOString() } : q
        )
      );
      setQuoteNotice({ type: "success", message: `Approval email sent to ${recipient}` });
      return true;
    } catch (err) {
      setQuoteNotice({ type: "error", message: err.message || "Failed to send approval email." });
      return false;
    } finally {
      setEmailingApproval(false);
    }
  };

  const saveAndEmailQuote = async () => {
    const saved = persistQuoteFromBuilding();
    if (!saved) return;
    const ok = await emailQuoteForApproval(saved);
    if (ok) setBuilding(null);
  };

  const markQuoteAccepted = (quoteId) => {
    const nextQuotes = quotes.map((q) =>
      q.id === quoteId ? { ...q, status: "Accepted", updatedAt: new Date().toISOString() } : q
    );
    setQuotes(nextQuotes);
    recalcLeadNumbers(nextQuotes);
    setQuoteNotice({ type: "success", message: "Quote marked as accepted." });
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

  const visibleQuotes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let next = quotes.filter((q) => {
      const matchesStatus = statusFilter === "All" ? true : q.status === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      const haystack = [
        q.clientName,
        q.clientEmail,
        q.eventName,
        q.quoteNumberLabel,
        q.status,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });

    next = [...next].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0);
      }
      if (sortBy === "amountHigh") {
        return calcQuoteTotals(b).total - calcQuoteTotals(a).total;
      }
      if (sortBy === "amountLow") {
        return calcQuoteTotals(a).total - calcQuoteTotals(b).total;
      }
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });

    return next;
  }, [quotes, searchTerm, statusFilter, sortBy]);

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
            <Btn variant="secondary" small onClick={saveAndEmailQuote} disabled={emailingApproval}>
              {emailingApproval ? "Sending..." : "Save & Email Approval"}
            </Btn>
            <Btn small onClick={saveQuote}>
              Save Quote
            </Btn>
          </div>
        </div>

        <ErrorList errors={errors} />
        {quoteNotice && (
          <div
            style={{
              background: quoteNotice.type === "success" ? G.greenBg : G.redBg,
              border: `1px solid ${
                quoteNotice.type === "success" ? `${G.green}33` : `${G.red}33`
              }`,
              color: quoteNotice.type === "success" ? G.green : G.red,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 14,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {quoteNotice.message}
          </div>
        )}

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
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={selectedPackageTemplateId}
                    onChange={(e) => setSelectedPackageTemplateId(e.target.value)}
                    style={{
                      background: G.surface,
                      color: G.text,
                      border: `1px solid ${G.border}`,
                      borderRadius: 6,
                      padding: "6px 10px",
                      fontSize: 12,
                      minWidth: 190,
                    }}
                  >
                    <option value="">Select package template…</option>
                    {quoteTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))}
                  </select>
                  <Btn
                    variant="secondary"
                    small
                    onClick={() => {
                      const tpl = quoteTemplates.find((t) => t.id === selectedPackageTemplateId);
                      if (!tpl) return;
                      addSectionFromTemplate(tpl);
                    }}
                    disabled={!selectedPackageTemplateId}
                  >
                    + Use Template
                  </Btn>
                  <Btn variant="ghost" small onClick={addCustomSection}>
                    + Custom Section
                  </Btn>
                </div>
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
          {visibleQuotes.length === quotes.length
            ? `${quotes.length} quote${quotes.length !== 1 ? "s" : ""}`
            : `${visibleQuotes.length} of ${quotes.length} quotes`}
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
          <Card style={{ padding: 14 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr auto",
                gap: 10,
                alignItems: "end",
              }}
            >
              <InputField
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Client, email, quote #, event..."
                style={{ marginBottom: 0 }}
              />
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
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  <option value="All">All</option>
                  {settings.statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
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
                  Sort
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                  <option value="newest">Recently Updated</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amountHigh">Amount High → Low</option>
                  <option value="amountLow">Amount Low → High</option>
                </select>
              </div>
              <Btn
                variant="ghost"
                small
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setSortBy("newest");
                }}
                disabled={!searchTerm && statusFilter === "All" && sortBy === "newest"}
              >
                Clear
              </Btn>
            </div>
          </Card>

          {visibleQuotes.length === 0 ? (
            <EmptyState
              icon="🔎"
              text="No quotes match your current filters."
              action={
                <Btn
                  small
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setSortBy("newest");
                  }}
                >
                  Clear Filters
                </Btn>
              }
            />
          ) : (
            visibleQuotes.map((q) => {
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
                  <Btn
                    variant="secondary"
                    small
                    onClick={async () => {
                      await emailQuoteForApproval(q);
                    }}
                  >
                    Email Approval
                  </Btn>
                  {q.status !== "Accepted" && (
                    <Btn variant="secondary" small onClick={() => markQuoteAccepted(q.id)}>
                      Mark Accepted
                    </Btn>
                  )}
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
            })
          )}
        </div>
      )}
    </div>
  );
}

function FinancialsTab({ payments, setPayments, quotes, lead, settings }) {
  const [subTab, setSubTab] = useState("invoices"); // invoices | schedules
  const [view, setView] = useState("list"); // list | create | edit | preview | recordPayment
  const [invoices, setInvoices] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [form, setForm] = useState({});
  const [payForm, setPayForm] = useState({});
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [squareLoading, setSquareLoading] = useState(null); // invoice id being processed
  const [emailLoading, setEmailLoading] = useState(null); // invoice id being emailed
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  // ── Generate Square Checkout Link ──
  const generateSquareLink = async (inv) => {
    if (!inv.balanceDue || inv.balanceDue <= 0) return;
    setSquareLoading(inv.id);
    setToast(null);
    try {
      const res = await fetch("/api/square-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: inv.invoiceNumber,
          title: inv.title || `Invoice ${inv.invoiceNumber}`,
          clientName: inv.clientName,
          clientEmail: inv.clientEmail,
          amount: inv.balanceDue,
          description: [inv.sessionType, inv.packageName].filter(Boolean).join(" — "),
        }),
      });
      const data = await parseApiResponse(res, "Failed to generate link");

      // Save link to invoice in Supabase only when id is UUID-shaped.
      if (isUuid(inv.id)) {
        await supabase.from("invoices").update({ square_link: data.url }).eq("id", inv.id);
      }
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, squareLink: data.url } : i));
      setToast({ type: "success", message: `Pay link generated for ${inv.invoiceNumber}` });
    } catch (err) {
      console.error("Square error:", err);
      setToast({ type: "error", message: err.message });
    }
    setSquareLoading(null);
  };

  // ── Send Invoice Email ──
  const emailInvoice = async (inv) => {
    if (!inv.clientEmail) {
      setToast({ type: "error", message: "No client email on this invoice" });
      return;
    }
    setEmailLoading(inv.id);
    setToast(null);
    try {
      const zelleNote = inv.paymentMethod === "zelle"
        ? `<p style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;font-size:13px;color:#92400e;"><strong>Zelle Payment:</strong> To pay via Zelle, please text Nico to arrange payment. Reference invoice: <strong>${inv.invoiceNumber || ""}</strong></p>`
        : "";
      const squareBtn = inv.squareLink
        ? `<p style="text-align:center;margin:20px 0;"><a href="${inv.squareLink}" style="display:inline-block;padding:14px 36px;background:#d4a853;color:#0e0f11;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Pay Now - $${Number(inv.balanceDue || 0).toLocaleString()}</a></p>`
        : "";
      const encoded = encodeClientPayload({
        type: "invoice",
        document: {
          invoiceNumber: inv.invoiceNumber || "",
          title: inv.title || "",
          clientName: inv.clientName || "",
          sessionType: inv.sessionType || "",
          packageName: inv.packageName || "",
          sessionDate: inv.sessionDate || "",
          totalAmount: Number(inv.totalAmount || 0),
          amountPaid: Number(inv.amountPaid || 0),
          balanceDue: Number(inv.balanceDue || 0),
          dueDate: inv.dueDate || "",
          notes: inv.notes || "",
          paymentMethod: inv.paymentMethod || "",
          squareLink: inv.squareLink || "",
        },
      });
      const viewLink = encoded
        ? `${window.location.origin}/client?payload=${encodeURIComponent(encoded)}`
        : `${window.location.origin}`;

      const htmlBody = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;">
  <div style="background:#0e0f11;padding:24px 28px;border-radius:12px 12px 0 0;">
    <div style="font-size:18px;font-weight:800;color:#d4a853;letter-spacing:-.01em;">Nico Salgado Photography</div>
    <div style="font-size:12px;color:#9b9a97;margin-top:4px;">30317 Glenmuer · Farmington Hills, MI 48334</div>
  </div>
  <div style="background:#ffffff;padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 12px 12px;">
    <h2 style="margin:0 0 4px;font-size:18px;">Invoice ${inv.invoiceNumber || ""}</h2>
    <p style="color:#666;font-size:13px;margin:0 0 20px;">${inv.title || "Photography Services"}</p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#666;">Client</td><td style="padding:8px 0;text-align:right;font-weight:600;">${inv.clientName || "—"}</td></tr>
      ${inv.sessionType ? `<tr><td style="padding:8px 0;color:#666;">Service</td><td style="padding:8px 0;text-align:right;">${inv.sessionType}${inv.packageName ? ` — ${inv.packageName}` : ""}</td></tr>` : ""}
      ${inv.sessionDate ? `<tr><td style="padding:8px 0;color:#666;">Date</td><td style="padding:8px 0;text-align:right;">${inv.sessionDate}</td></tr>` : ""}
      <tr style="border-top:2px solid #1a1a1a;"><td style="padding:12px 0;font-weight:700;font-size:16px;">Total</td><td style="padding:12px 0;text-align:right;font-weight:700;font-size:16px;">$${Number(inv.totalAmount || 0).toLocaleString()}</td></tr>
      ${inv.amountPaid > 0 ? `<tr><td style="padding:6px 0;color:#16a34a;">Paid</td><td style="padding:6px 0;text-align:right;color:#16a34a;font-weight:600;">$${Number(inv.amountPaid).toLocaleString()}</td></tr>` : ""}
      ${inv.balanceDue > 0 ? `<tr><td style="padding:6px 0;color:#dc2626;font-weight:700;">Balance Due</td><td style="padding:6px 0;text-align:right;color:#dc2626;font-weight:700;font-size:16px;">$${Number(inv.balanceDue).toLocaleString()}</td></tr>` : ""}
      ${inv.dueDate ? `<tr><td style="padding:6px 0;color:#666;">Due Date</td><td style="padding:6px 0;text-align:right;">${inv.dueDate}</td></tr>` : ""}
    </table>

    ${squareBtn}
    ${zelleNote}

    ${inv.notes ? `<p style="margin-top:20px;padding-top:12px;border-top:1px solid #eee;font-size:12px;color:#666;">${inv.notes}</p>` : ""}

    <p style="margin-top:20px;text-align:center;"><a href="${viewLink}" style="font-size:13px;color:#d4a853;">View Invoice Online</a></p>
    <p style="margin-top:12px;font-size:12px;color:#999;text-align:center;">Questions? Reply to this email or text Nico directly.</p>
  </div>
</div>`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: inv.clientEmail,
          subject: `Invoice ${inv.invoiceNumber || ""} - Nico Salgado Photography`.trim(),
          htmlBody,
        }),
      });
      const data = await parseApiResponse(res, "Failed to send email");

      // Mark as sent
      if (inv.status === "Draft") {
        if (isUuid(inv.id)) {
          await supabase
            .from("invoices")
            .update({ status: "Sent", issued_on: new Date().toISOString().split("T")[0] })
            .eq("id", inv.id);
        }
        setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Sent", issuedOn: new Date().toISOString().split("T")[0] } : i));
      }
      setToast({ type: "success", message: `Invoice emailed to ${inv.clientEmail}` });
    } catch (err) {
      console.error("Email error:", err);
      setToast({ type: "error", message: err.message });
    }
    setEmailLoading(null);
  };

  // ── Payment schedule state (keep existing) ──
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const emptySchedule = {
    kind: "Custom", name: "", description: "",
    initialPayment: 0, initialType: "Fixed amount",
    tipEnabled: true,
    remaining: [{ amount: 100, type: "Percent of Order", due: "on delivery" }],
  };
  const [scheduleForm, setScheduleForm] = useState(emptySchedule);

  // ── Load from Supabase ──
  useEffect(() => {
    async function load() {
      try {
        const [invRes, payRes] = await Promise.all([
          supabase.from("invoices").select("*").order("created_at", { ascending: false }),
          supabase.from("payments").select("*").order("paid_on", { ascending: false }),
        ]);
        if (invRes.data) setInvoices(invRes.data.map(dbToInvoice));
        if (payRes.data) setPaymentRecords(payRes.data);
      } catch (err) { console.error("Failed to load invoices:", err); }
      setLoading(false);
    }
    load();
  }, []);

  // ── DB mappers ──
  function dbToInvoice(row) {
    return {
      id: row.id, invoiceNumber: row.invoice_number, title: row.title || "",
      clientName: row.client_name, clientEmail: row.client_email,
      sessionType: row.session_type, sessionDate: row.session_date,
      packageName: row.package_name, subtotal: Number(row.subtotal) || 0,
      discountAmount: Number(row.discount_amount) || 0,
      totalAmount: Number(row.total_amount) || Number(row.amount) || 0,
      amountPaid: Number(row.amount_paid) || 0,
      balanceDue: Number(row.balance_due) || 0,
      status: row.status || "Draft", dueDate: row.due_date,
      invoiceType: row.invoice_type || "full",
      paymentMethod: row.payment_method || "square",
      squareLink: row.square_link || "", notes: row.notes || "",
      issuedOn: row.issued_on, leadId: row.lead_id,
      quoteId: row.quote_id, contractId: row.contract_id,
    };
  }
  function invoiceToDb(item) {
    return {
      id: item.id, invoice_number: item.invoiceNumber, title: item.title || `Invoice ${item.invoiceNumber || ""}`,
      client_name: item.clientName || "", client_email: item.clientEmail || "",
      session_type: item.sessionType || "", session_date: item.sessionDate || null,
      package_name: item.packageName || "", subtotal: item.subtotal || 0,
      discount_amount: item.discountAmount || 0, total_amount: item.totalAmount || 0,
      amount: item.totalAmount || 0,
      amount_paid: item.amountPaid || 0, balance_due: item.balanceDue || 0,
      status: item.status || "Draft", due_date: item.dueDate || null,
      invoice_type: item.invoiceType || "full",
      payment_method: item.paymentMethod || "square",
      square_link: item.squareLink || "", notes: item.notes || "",
      issued_on: item.issuedOn || null, lead_id: item.leadId || null,
      quote_id: item.quoteId || null, contract_id: item.contractId || null,
      updated_at: new Date().toISOString(),
    };
  }

  // ── Invoice status helpers ──
  const invoiceStatusColor = (s) => {
    if (s === "Paid") return { color: G.green, bg: G.greenBg };
    if (s === "Partial") return { color: G.amber, bg: G.amberBg };
    if (s === "Sent" || s === "Pending") return { color: G.blue, bg: G.blueBg };
    if (s === "Overdue") return { color: G.red, bg: G.redBg };
    return { color: G.textDim, bg: G.surface };
  };

  // ── Next invoice number ──
  const nextInvNum = useMemo(() => {
    const nums = invoices.map(i => {
      const match = (i.invoiceNumber || "").match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    return `INV-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
  }, [invoices]);

  // ── Totals ──
  const totalRevenue = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + (i.balanceDue || 0), 0);
  const totalInvoiced = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);

  // ── CRUD ──
  const startCreate = (type) => {
    const quoteTotal = quotes.filter(q => q.status === "Accepted").reduce((s, q) => s + calcQuoteTotals(q).total, 0);
    const total = quoteTotal || 0;
    const isRetainer = type === "retainer";
    const amt = isRetainer ? Math.round(total * 0.5 * 100) / 100 : total;

    setForm({
      id: genUuid(), invoiceNumber: nextInvNum,
      title: isRetainer ? "Retainer (50%)" : "Full Balance",
      clientName: lead?.name || "", clientEmail: lead?.email || "",
      sessionType: lead?.type || "", sessionDate: lead?.eventDate || "",
      packageName: "", subtotal: total, discountAmount: 0,
      totalAmount: amt, amountPaid: 0, balanceDue: amt,
      status: "Draft", dueDate: "",
      invoiceType: isRetainer ? "retainer" : "full",
      paymentMethod: "square", squareLink: "", notes: "",
      issuedOn: new Date().toISOString().split("T")[0],
      leadId: lead?.id?.toString() || null, quoteId: null, contractId: null,
    });
    setView("create");
  };

  const startEdit = (inv) => {
    setForm({ ...inv });
    setActiveInvoice(inv);
    setView("edit");
  };

  const saveInvoice = async () => {
    const dbRow = invoiceToDb(form);
    const existing = invoices.find(i => i.id === form.id);
    if (existing && isUuid(form.id)) {
      await supabase.from("invoices").update(dbRow).eq("id", form.id);
      setInvoices(prev => prev.map(i => i.id === form.id ? { ...form } : i));
    } else {
      const { data } = await supabase.from("invoices").insert(dbRow).select().single();
      setInvoices(prev => [dbToInvoice(data || dbRow), ...prev]);
    }
    setView("list"); setForm({}); setActiveInvoice(null);
  };

  const deleteInvoice = async (id) => {
    if (isUuid(id)) {
      await supabase.from("invoices").delete().eq("id", id);
      await supabase.from("payments").delete().eq("invoice_id", id);
    }
    setInvoices(prev => prev.filter(i => i.id !== id));
    setPaymentRecords(prev => prev.filter(p => p.invoice_id !== id));
    setView("list"); setActiveInvoice(null);
  };

  const markSent = async (id) => {
    if (isUuid(id)) {
      await supabase
        .from("invoices")
        .update({ status: "Sent", issued_on: new Date().toISOString().split("T")[0] })
        .eq("id", id);
    }
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: "Sent", issuedOn: new Date().toISOString().split("T")[0] } : i));
  };

  // ── Record payment ──
  const startRecordPayment = (inv) => {
    setActiveInvoice(inv);
    setPayForm({
      amount: inv.balanceDue || 0, method: "square",
      reference: "", note: "", paidOn: new Date().toISOString().split("T")[0],
    });
    setView("recordPayment");
  };

  const savePayment = async () => {
    const paymentRow = {
      id: genUuid(), invoice_id: activeInvoice.id,
      amount: Number(payForm.amount) || 0, method: payForm.method,
      reference: payForm.reference, note: payForm.note,
      paid_on: payForm.paidOn,
    };
    if (isUuid(activeInvoice.id)) {
      await supabase.from("payments").insert(paymentRow);
    }
    setPaymentRecords(prev => [paymentRow, ...prev]);

    // Update invoice
    const newPaid = (activeInvoice.amountPaid || 0) + Number(payForm.amount);
    const newBalance = Math.max(0, (activeInvoice.totalAmount || 0) - newPaid);
    const newStatus = newBalance <= 0 ? "Paid" : "Partial";
    if (isUuid(activeInvoice.id)) {
      await supabase
        .from("invoices")
        .update({
          amount_paid: newPaid,
          balance_due: newBalance,
          status: newStatus,
        })
        .eq("id", activeInvoice.id);
    }
    setInvoices(prev => prev.map(i => i.id === activeInvoice.id ? { ...i, amountPaid: newPaid, balanceDue: newBalance, status: newStatus } : i));

    setView("list"); setPayForm({}); setActiveInvoice(null);
  };

  // ── Invoice PDF ──
  const printInvoice = (inv) => {
    const logoUrl = toAbsoluteAssetUrl(settings?.logoUrl || "/nsp-logo.jpg");
    const businessName = settings?.businessName || "Nico Salgado Photography";
    const businessAddress1 = settings?.address1 || "30317 Glenmuer";
    const businessAddress2 = settings?.address2 || "Farmington Hills, MI 48334";
    const businessEmail = settings?.email || "nicosalgadophoto@gmail.com";
    const businessWebsite = settings?.website || "nicosalgadophotography.com";
    const payments = paymentRecords.filter(p => p.invoice_id === inv.id);
    const paymentsHtml = payments.length ? payments.map(p =>
      `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px;">
        <span>${escapeHtml(fmtShort(p.paid_on))} — ${escapeHtml(p.method === "zelle" ? "Zelle" : "Square")}${p.reference ? ` (${escapeHtml(p.reference)})` : ""}</span>
        <span style="color:#16a34a;font-weight:700;">+ ${escapeHtml(fmt$(p.amount))}</span>
      </div>`
    ).join("") : '<div style="font-size:13px;color:#999;padding:8px 0;">No payments recorded yet.</div>';

    const zelleNote = inv.paymentMethod === "zelle" ? `<div style="margin-top:16px;padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;font-size:13px;color:#92400e;">
      <strong>Zelle Payment:</strong> To pay via Zelle, please text Nico at the number on file to arrange payment. Reference this invoice number: <strong>${escapeHtml(inv.invoiceNumber || "")}</strong>
    </div>` : "";

    const squareNote = inv.paymentMethod === "square" && inv.squareLink ? `<div style="margin-top:16px;text-align:center;">
      <a href="${escapeHtml(inv.squareLink)}" style="display:inline-block;padding:12px 32px;background:#0070f3;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Pay with Square</a>
    </div>` : "";

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(inv.invoiceNumber || "Invoice")}</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;padding:32px;}@media print{body{padding:0;}}</style></head><body>
    <div style="max-width:800px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;margin-bottom:28px;">
        <div>
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(businessName)}" style="max-height:52px;width:auto;display:block;margin-bottom:8px;" />` : ""}
          <div style="font-size:20px;font-weight:800;color:#4a9ba5;letter-spacing:-.02em;">${escapeHtml(businessName)}</div>
          <div style="font-size:12px;color:#666;line-height:1.7;margin-top:4px;">${escapeHtml(businessAddress1)}<br>${escapeHtml(businessAddress2)}<br>${escapeHtml(businessEmail)}<br>${escapeHtml(businessWebsite)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:18px;font-weight:700;">${escapeHtml(inv.invoiceNumber || "INVOICE")}</div>
          <div style="font-size:12px;color:#666;margin-top:4px;">Status: <strong>${escapeHtml(inv.status)}</strong></div>
          <div style="font-size:12px;color:#666;">Issued: ${escapeHtml(fmtShort(inv.issuedOn))}</div>
          ${inv.dueDate ? `<div style="font-size:12px;color:#666;">Due: ${escapeHtml(fmtShort(inv.dueDate))}</div>` : ""}
        </div>
      </div>
      <div style="padding:16px;background:#f9f9f9;border-radius:8px;margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;">Bill To</div>
        <div style="font-size:13px;color:#444;margin-top:4px;">${escapeHtml(inv.clientName || "—")}</div>
        <div style="font-size:13px;color:#666;">${escapeHtml(inv.clientEmail || "")}</div>
      </div>
      <div style="font-size:14px;font-weight:700;margin-bottom:8px;">${escapeHtml(inv.title || "Invoice")}</div>
      ${inv.sessionType ? `<div style="font-size:13px;color:#666;margin-bottom:4px;">Service: ${escapeHtml(inv.sessionType)}${inv.packageName ? ` — ${escapeHtml(inv.packageName)}` : ""}</div>` : ""}
      ${inv.sessionDate ? `<div style="font-size:13px;color:#666;margin-bottom:16px;">Session Date: ${escapeHtml(fmtShort(inv.sessionDate))}</div>` : ""}
      <div style="border-top:2px solid #1a1a1a;padding-top:12px;margin-top:12px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;"><span>Subtotal</span><span style="font-weight:700;">${escapeHtml(fmt$(inv.subtotal || inv.totalAmount))}</span></div>
        ${inv.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;"><span>Discount</span><span style="color:#b42318;font-weight:700;">-${escapeHtml(fmt$(inv.discountAmount))}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:16px;font-weight:800;border-top:1px solid #ddd;"><span>Total</span><span>${escapeHtml(fmt$(inv.totalAmount))}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;"><span>Amount Paid</span><span style="color:#16a34a;font-weight:700;">${escapeHtml(fmt$(inv.amountPaid))}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:16px;font-weight:800;border-top:1px solid #ddd;"><span>Balance Due</span><span style="color:${inv.balanceDue > 0 ? '#dc2626' : '#16a34a'};">${escapeHtml(fmt$(inv.balanceDue))}</span></div>
      </div>
      <div style="margin-top:24px;"><div style="font-size:14px;font-weight:700;margin-bottom:8px;">Payment History</div>${paymentsHtml}</div>
      ${zelleNote}${squareNote}
      ${inv.notes ? `<div style="margin-top:20px;padding-top:12px;border-top:1px solid #eee;font-size:12px;color:#666;white-space:pre-wrap;">${escapeHtml(inv.notes)}</div>` : ""}
    </div></body></html>`;
    openPrintWindow(html);
  };

  // ── Sub tabs ──
  const SubTabs = () => (
    <div style={{ display: "flex", gap: 4, background: G.surface, borderRadius: 8, padding: 3, marginBottom: 16 }}>
      {[
        { key: "invoices", label: "Invoices", count: invoices.length },
        { key: "schedules", label: "Payment Schedules", count: payments.length },
      ].map(t => (
        <button key={t.key} onClick={() => { setSubTab(t.key); setView("list"); }}
          style={{
            padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
            background: subTab === t.key ? G.gold : "transparent",
            color: subTab === t.key ? "#0e0f11" : G.textDim, transition: "all .15s",
          }}>
          {t.label}
          <span style={{ marginLeft: 5, fontSize: 10, padding: "1px 6px", borderRadius: 10,
            background: subTab === t.key ? "rgba(0,0,0,.15)" : G.border,
            color: subTab === t.key ? "#0e0f11" : G.textMuted }}>{t.count}</span>
        </button>
      ))}
    </div>
  );

  // ═══ SCHEDULES SUB-TAB (keep existing logic) ═══
  if (subTab === "schedules") {
    const KINDS = ["Custom", "Monthly", "Multiple", "One"];
    const DUES = ["on delivery", "on booking", "before event", "after event", "custom date"];
    const AMTS = ["Percent of Order", "Fixed amount"];
    const setS = (k, v) => setScheduleForm(p => ({ ...p, [k]: v }));
    const showScheduleForm = adding || editing !== null;

    const acceptedTotal = quotes.filter(q => q.status === "Accepted").reduce((s, q) => s + calcQuoteTotals(q).total, 0);
    const openTotal = quotes.filter(q => q.status !== "Declined").reduce((s, q) => s + calcQuoteTotals(q).total, 0);

    const saveSchedule = () => {
      if (!scheduleForm.name.trim()) return;
      if (editing !== null) {
        setPayments(p => p.map((x, i) => (i === editing ? { ...scheduleForm, id: x.id } : x)));
      } else {
        setPayments(p => [...p, { ...scheduleForm, id: Date.now() }]);
      }
      setScheduleForm(emptySchedule); setEditing(null); setAdding(false);
    };

    if (showScheduleForm) {
      return (
        <Card>
          <SubTabs />
          <SectionLabel>Payment Schedule</SectionLabel>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 6 }}>Kind <span style={{ color: G.red }}>*</span></label>
            <div style={{ display: "flex" }}>
              {KINDS.map((k, i) => (
                <button key={k} onClick={() => setS("kind", k)}
                  style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: scheduleForm.kind === k ? G.gold : G.surface, color: scheduleForm.kind === k ? "#0e0f11" : G.textDim, border: `1px solid ${scheduleForm.kind === k ? G.gold : G.border}`, cursor: "pointer", borderRadius: i === 0 ? "6px 0 0 6px" : i === KINDS.length - 1 ? "0 6px 6px 0" : 0 }}>
                  {scheduleForm.kind === k && "✓ "}{k}
                </button>
              ))}
            </div>
          </div>
          <InputField label="Name" value={scheduleForm.name} onChange={(e) => setS("name", e.target.value)} required />
          <InputField label="Description" value={scheduleForm.description} onChange={(e) => setS("description", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 5 }}>Initial Payment</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={scheduleForm.initialPayment} onChange={(e) => setS("initialPayment", Number(e.target.value))}
                  style={{ width: 80, background: G.surface, color: G.text, border: `1px solid ${G.border}`, borderRadius: 6, padding: "9px 12px", fontSize: 13 }} />
                <select value={scheduleForm.initialType} onChange={(e) => setS("initialType", e.target.value)}
                  style={{ background: G.surface, color: G.text, border: `1px solid ${G.border}`, borderRadius: 6, padding: "9px 12px", fontSize: 13 }}>
                  {AMTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, color: G.text, cursor: "pointer" }}>
            <input type="checkbox" checked={scheduleForm.tipEnabled} onChange={(e) => setS("tipEnabled", e.target.checked)} style={{ accentColor: G.gold }} /> Client can leave a tip
          </label>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${G.border}` }}>
            <SectionLabel actions={<Btn small variant="secondary" onClick={() => setS("remaining", [...scheduleForm.remaining, { amount: 0, type: "Percent of Order", due: "on delivery" }])}>New Payment</Btn>}>Remaining Payments</SectionLabel>
            {scheduleForm.remaining.map((r, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 2fr auto", gap: 10, padding: "10px 0", borderBottom: `1px solid ${G.border}33`, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="number" value={r.amount} onChange={(e) => { const rem = [...scheduleForm.remaining]; rem[idx] = { ...rem[idx], amount: Number(e.target.value) }; setS("remaining", rem); }}
                    style={{ width: 70, background: G.surface, color: G.text, border: `1px solid ${G.border}`, borderRadius: 6, padding: "7px 10px", fontSize: 13 }} />
                  <select value={r.type} onChange={(e) => { const rem = [...scheduleForm.remaining]; rem[idx] = { ...rem[idx], type: e.target.value }; setS("remaining", rem); }}
                    style={{ background: G.surface, color: G.text, border: `1px solid ${G.border}`, borderRadius: 6, padding: "7px 10px", fontSize: 12 }}>
                    {AMTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <select value={r.due} onChange={(e) => { const rem = [...scheduleForm.remaining]; rem[idx] = { ...rem[idx], due: e.target.value }; setS("remaining", rem); }}
                  style={{ background: G.surface, color: G.text, border: `1px solid ${G.border}`, borderRadius: 6, padding: "7px 10px", fontSize: 12 }}>
                  {DUES.map(d => <option key={d}>{d}</option>)}
                </select>
                <Btn variant="danger" small onClick={() => setS("remaining", scheduleForm.remaining.filter((_, i) => i !== idx))}>delete</Btn>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
            {editing !== null && <Btn variant="danger" small onClick={() => { setPayments(p => p.filter((_, i) => i !== editing)); setEditing(null); setAdding(false); setScheduleForm(emptySchedule); }}>Delete</Btn>}
            <Btn variant="ghost" small onClick={() => { setEditing(null); setAdding(false); setScheduleForm(emptySchedule); }}>Cancel</Btn>
            <Btn onClick={saveSchedule}>Save & Continue</Btn>
          </div>
        </Card>
      );
    }

    return (
      <div style={{ display: "grid", gap: 20 }}>
        <Card>
          <SubTabs />
          <SectionLabel>Financial Snapshot</SectionLabel>
          <InfoRow label="Open Quote Value" value={fmt$(openTotal)} accent={G.gold} />
          <InfoRow label="Accepted Revenue" value={fmt$(acceptedTotal)} accent={G.green} />
          <InfoRow label="Payment Plans" value={String(payments.length)} />
          <InfoRow label="Average Quote" value={quotes.length ? fmt$(openTotal / quotes.length) : fmt$(0)} />
        </Card>
        <Card>
          <SectionLabel actions={<Btn small onClick={() => { setScheduleForm(emptySchedule); setAdding(true); }}>+ New Payment Schedule</Btn>}>Payment Schedules</SectionLabel>
          {payments.length === 0 ? <EmptyState icon="💰" text="No payment schedules configured" /> : (
            <div style={{ display: "grid", gap: 8 }}>
              {payments.map((p, idx) => (
                <div key={p.id} onClick={() => { setScheduleForm({ ...p }); setEditing(idx); }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: G.surface, borderRadius: 8, border: `1px solid ${G.border}`, cursor: "pointer" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: G.goldBg, display: "grid", placeItems: "center", color: G.gold, fontSize: 14, flexShrink: 0 }}>💰</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: G.textDim }}>{p.kind} · {p.description}</div>
                  </div>
                  <Pill color={G.gold} bg={G.goldBg}>{p.kind}</Pill>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ═══ LOADING ═══
  if (loading) {
    return <Card><SubTabs /><div style={{ textAlign: "center", padding: "40px 20px", color: G.textMuted, fontSize: 13 }}>Loading invoices...</div></Card>;
  }

  // ═══ RECORD PAYMENT VIEW ═══
  if (view === "recordPayment" && activeInvoice) {
    return (
      <Card>
        <div style={{ marginBottom: 16 }}><Btn variant="ghost" small onClick={() => { setView("list"); setActiveInvoice(null); }}>← Back</Btn></div>
        <SectionLabel>Record Payment — {activeInvoice.invoiceNumber}</SectionLabel>

        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <InfoRow label="Invoice Total" value={fmt$(activeInvoice.totalAmount)} accent={G.gold} />
          <InfoRow label="Previously Paid" value={fmt$(activeInvoice.amountPaid)} accent={G.green} />
          <InfoRow label="Balance Due" value={fmt$(activeInvoice.balanceDue)} accent={G.red} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField label="Amount" type="number" value={payForm.amount || ""} onChange={(e) => setPayForm(p => ({ ...p, amount: e.target.value }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 5 }}>Payment Method</label>
            <div style={{ display: "flex", gap: 0 }}>
              {["square", "zelle"].map((m, i) => (
                <button key={m} onClick={() => setPayForm(p => ({ ...p, method: m }))}
                  style={{
                    flex: 1, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: payForm.method === m ? G.gold : G.surface,
                    color: payForm.method === m ? "#0e0f11" : G.textDim,
                    border: `1px solid ${payForm.method === m ? G.gold : G.border}`,
                    borderRadius: i === 0 ? "6px 0 0 6px" : "0 6px 6px 0",
                  }}>
                  {m === "square" ? "◼ Square" : "⚡ Zelle"}
                </button>
              ))}
            </div>
          </div>
          <InputField label="Date Paid" type="date" value={payForm.paidOn || ""} onChange={(e) => setPayForm(p => ({ ...p, paidOn: e.target.value }))} />
          <InputField label="Reference / Confirmation #" value={payForm.reference || ""} onChange={(e) => setPayForm(p => ({ ...p, reference: e.target.value }))} placeholder="e.g. Square txn ID or Zelle conf." />
        </div>
        <InputField label="Note" value={payForm.note || ""} onChange={(e) => setPayForm(p => ({ ...p, note: e.target.value }))} placeholder="Optional payment note" />

        {payForm.method === "zelle" && (
          <div style={{ padding: "12px 16px", background: G.amberBg, border: `1px solid ${G.amber}33`, borderRadius: 8, fontSize: 12, color: G.amber, marginBottom: 14 }}>
            ⚡ Zelle payment — verify you've received the funds before recording.
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" small onClick={() => { setView("list"); setActiveInvoice(null); }}>Cancel</Btn>
          <Btn small onClick={savePayment} disabled={!payForm.amount || Number(payForm.amount) <= 0}>Record Payment</Btn>
        </div>
      </Card>
    );
  }

  // ═══ CREATE / EDIT VIEW ═══
  if (view === "create" || view === "edit") {
    return (
      <Card>
        <div style={{ marginBottom: 16 }}><Btn variant="ghost" small onClick={() => { setView("list"); setForm({}); setActiveInvoice(null); }}>← Back</Btn></div>
        <SectionLabel>{view === "create" ? "New Invoice" : "Edit Invoice"}</SectionLabel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField label="Invoice Number" value={form.invoiceNumber || ""} onChange={(e) => setForm(p => ({ ...p, invoiceNumber: e.target.value }))} />
          <InputField label="Title" value={form.title || ""} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Retainer (50%)" />
        </div>

        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: G.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".04em" }}>Client Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Client Name" value={form.clientName || ""} onChange={(e) => setForm(p => ({ ...p, clientName: e.target.value }))} />
            <InputField label="Client Email" value={form.clientEmail || ""} onChange={(e) => setForm(p => ({ ...p, clientEmail: e.target.value }))} />
            <InputField label="Session Type" value={form.sessionType || ""} onChange={(e) => setForm(p => ({ ...p, sessionType: e.target.value }))} />
            <InputField label="Session Date" type="date" value={form.sessionDate || ""} onChange={(e) => setForm(p => ({ ...p, sessionDate: e.target.value }))} />
            <InputField label="Package Name" value={form.packageName || ""} onChange={(e) => setForm(p => ({ ...p, packageName: e.target.value }))} />
          </div>
        </div>

        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: G.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".04em" }}>Billing</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <InputField label="Subtotal" type="number" value={form.subtotal || ""} onChange={(e) => {
              const sub = Number(e.target.value) || 0;
              const total = Math.max(0, sub - (form.discountAmount || 0));
              setForm(p => ({ ...p, subtotal: sub, totalAmount: total, balanceDue: Math.max(0, total - (p.amountPaid || 0)) }));
            }} />
            <InputField label="Discount" type="number" value={form.discountAmount || ""} onChange={(e) => {
              const disc = Number(e.target.value) || 0;
              const total = Math.max(0, (form.subtotal || 0) - disc);
              setForm(p => ({ ...p, discountAmount: disc, totalAmount: total, balanceDue: Math.max(0, total - (p.amountPaid || 0)) }));
            }} />
            <InputField label="Total Amount" type="number" value={form.totalAmount || ""} onChange={(e) => {
              const total = Number(e.target.value) || 0;
              setForm(p => ({ ...p, totalAmount: total, balanceDue: Math.max(0, total - (p.amountPaid || 0)) }));
            }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 5 }}>Invoice Type</label>
              <div style={{ display: "flex", gap: 0 }}>
                {[{ k: "retainer", l: "50% Retainer" }, { k: "balance", l: "Balance Due" }, { k: "full", l: "Full Amount" }].map((t, i) => (
                  <button key={t.k} onClick={() => {
                    let amt = form.subtotal || 0;
                    if (t.k === "retainer") amt = Math.round(amt * 0.5 * 100) / 100;
                    if (t.k === "balance") amt = Math.max(0, (form.subtotal || 0) - (form.amountPaid || 0));
                    setForm(p => ({ ...p, invoiceType: t.k, totalAmount: amt, balanceDue: Math.max(0, amt - (p.amountPaid || 0)), title: t.k === "retainer" ? "Retainer (50%)" : t.k === "balance" ? "Balance Due" : "Full Payment" }));
                  }}
                  style={{
                    flex: 1, padding: "8px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: form.invoiceType === t.k ? G.gold : G.surface,
                    color: form.invoiceType === t.k ? "#0e0f11" : G.textDim,
                    border: `1px solid ${form.invoiceType === t.k ? G.gold : G.border}`,
                    borderRadius: i === 0 ? "6px 0 0 6px" : i === 2 ? "0 6px 6px 0" : 0,
                  }}>{t.l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 5 }}>Payment Method</label>
              <div style={{ display: "flex", gap: 0 }}>
                {["square", "zelle"].map((m, i) => (
                  <button key={m} onClick={() => setForm(p => ({ ...p, paymentMethod: m }))}
                    style={{
                      flex: 1, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      background: form.paymentMethod === m ? G.gold : G.surface,
                      color: form.paymentMethod === m ? "#0e0f11" : G.textDim,
                      border: `1px solid ${form.paymentMethod === m ? G.gold : G.border}`,
                      borderRadius: i === 0 ? "6px 0 0 6px" : "0 6px 6px 0",
                    }}>
                    {m === "square" ? "◼ Square" : "⚡ Zelle"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {form.paymentMethod === "square" && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <InputField label="Square Checkout Link" value={form.squareLink || ""} onChange={(e) => setForm(p => ({ ...p, squareLink: e.target.value }))} placeholder="Auto-generated or paste manually" />
              </div>
              {form.totalAmount > 0 && (
                <Btn small variant="secondary" onClick={async () => {
                  setSquareLoading("form");
                  try {
                    const res = await fetch("/api/square-checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        invoiceNumber: form.invoiceNumber,
                        title: form.title || `Invoice ${form.invoiceNumber}`,
                        clientName: form.clientName,
                        clientEmail: form.clientEmail,
                        amount: form.balanceDue || form.totalAmount,
                        description: form.sessionType || "",
                      }),
                    });
                    const data = await parseApiResponse(res, "Failed to generate Square link");
                    setForm(p => ({ ...p, squareLink: data.url }));
                    setToast({ type: "success", message: "Square pay link generated!" });
                  } catch (err) {
                    setToast({ type: "error", message: err.message });
                  }
                  setSquareLoading(null);
                }} disabled={squareLoading === "form"} style={{ marginBottom: 14 }}>
                  {squareLoading === "form" ? "..." : "◼ Generate"}
                </Btn>
              )}
            </div>
          )}
          {form.paymentMethod === "zelle" && (
            <div style={{ padding: "12px 16px", background: G.amberBg, border: `1px solid ${G.amber}33`, borderRadius: 8, fontSize: 12, color: G.amber }}>
              ⚡ Zelle — Client will see a message to text you to arrange payment.
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField label="Issued Date" type="date" value={form.issuedOn || ""} onChange={(e) => setForm(p => ({ ...p, issuedOn: e.target.value }))} />
          <InputField label="Due Date" type="date" value={form.dueDate || ""} onChange={(e) => setForm(p => ({ ...p, dueDate: e.target.value }))} />
        </div>
        <InputField label="Notes" value={form.notes || ""} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} multiline placeholder="Payment notes, terms, etc." />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" small onClick={() => { setView("list"); setForm({}); setActiveInvoice(null); }}>Cancel</Btn>
          <Btn small onClick={saveInvoice} disabled={!form.invoiceNumber?.trim()}>
            {view === "create" ? "Create Invoice" : "Save Changes"}
          </Btn>
        </div>
      </Card>
    );
  }

  // ═══ INVOICE LIST VIEW ═══
  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: toast.type === "success" ? G.greenBg : G.redBg,
          color: toast.type === "success" ? G.green : G.red,
          border: `1px solid ${toast.type === "success" ? G.green : G.red}33`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{toast.type === "success" ? "✓ " : "✕ "}{toast.message}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      )}
      <Card>
        <SubTabs />
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 4 }}>Total Invoiced</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: G.gold }}>{fmt$(totalInvoiced)}</div>
          </div>
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 4 }}>Collected</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: G.green }}>{fmt$(totalRevenue)}</div>
          </div>
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 4 }}>Outstanding</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: totalOutstanding > 0 ? G.red : G.green }}>{fmt$(totalOutstanding)}</div>
          </div>
        </div>

        <SectionLabel actions={
          <div style={{ display: "flex", gap: 6 }}>
            <Btn small onClick={() => startCreate("retainer")}>+ Retainer (50%)</Btn>
            <Btn small variant="secondary" onClick={() => startCreate("full")}>+ Full Invoice</Btn>
          </div>
        }>Invoices</SectionLabel>

        {invoices.length === 0 ? (
          <EmptyState icon="📃" text="No invoices yet — create a retainer or full invoice" />
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {invoices.map(inv => {
              const sc = invoiceStatusColor(inv.status);
              const invPayments = paymentRecords.filter(p => p.invoice_id === inv.id);
              return (
                <div key={inv.id} style={{
                  padding: "14px 16px", background: G.surface, borderRadius: 8, border: `1px solid ${G.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{inv.invoiceNumber}</span>
                        <span style={{ fontSize: 13, color: G.textDim }}>— {inv.title || "Invoice"}</span>
                        <Pill color={sc.color} bg={sc.bg}>{inv.status}</Pill>
                      </div>
                      <div style={{ fontSize: 12, color: G.textDim, marginTop: 4 }}>
                        {inv.clientName || "—"}{inv.sessionType ? ` · ${inv.sessionType}` : ""}
                        {inv.dueDate ? ` · Due ${fmtShort(inv.dueDate)}` : ""}
                      </div>
                      <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12 }}>
                        <span>Total: <span style={{ color: G.gold, fontWeight: 600 }}>{fmt$(inv.totalAmount)}</span></span>
                        <span>Paid: <span style={{ color: G.green, fontWeight: 600 }}>{fmt$(inv.amountPaid)}</span></span>
                        <span>Due: <span style={{ color: inv.balanceDue > 0 ? G.red : G.green, fontWeight: 600 }}>{fmt$(inv.balanceDue)}</span></span>
                        <span style={{ color: G.textMuted }}>
                          {inv.paymentMethod === "zelle" ? "⚡ Zelle" : "◼ Square"}
                        </span>
                      </div>
                      {invPayments.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          {invPayments.map(p => (
                            <div key={p.id} style={{ fontSize: 11, color: G.textMuted, padding: "2px 0" }}>
                              ✓ {fmtShort(p.paid_on)} — {fmt$(p.amount)} via {p.method === "zelle" ? "Zelle" : "Square"}{p.reference ? ` (${p.reference})` : ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {inv.paymentMethod === "square" && inv.balanceDue > 0 && !inv.squareLink && (
                        <Btn small variant="secondary" onClick={() => generateSquareLink(inv)} disabled={squareLoading === inv.id}>
                          {squareLoading === inv.id ? "..." : "◼ Pay Link"}
                        </Btn>
                      )}
                      {inv.squareLink && (
                        <Btn small variant="secondary" onClick={() => { navigator.clipboard.writeText(inv.squareLink); setToast({ type: "success", message: "Pay link copied!" }); }}>
                          📋 Copy Link
                        </Btn>
                      )}
                      {inv.clientEmail && (
                        <Btn small variant="secondary" onClick={() => emailInvoice(inv)} disabled={emailLoading === inv.id}>
                          {emailLoading === inv.id ? "..." : "✉ Email"}
                        </Btn>
                      )}
                      {inv.status === "Draft" && <Btn variant="ghost" small onClick={() => markSent(inv.id)}>Send</Btn>}
                      {inv.balanceDue > 0 && <Btn small onClick={() => startRecordPayment(inv)}>+ Payment</Btn>}
                      <Btn variant="ghost" small onClick={() => printInvoice(inv)}>PDF</Btn>
                      <Btn variant="ghost" small onClick={() => startEdit(inv)}>Edit</Btn>
                      <Btn variant="danger" small onClick={() => deleteInvoice(inv.id)}>✕</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CONTRACT & MODEL RELEASE TEMPLATES
   ═══════════════════════════════════════════════════════ */
const CONTRACT_TEMPLATES = [
  {
    id: "tpl-portrait", name: "Portrait / Branding Session Agreement", category: "Personal Branding",
    body: `PHOTOGRAPHY SERVICE AGREEMENT

This agreement is entered into between {{business_name}} ("Photographer") and {{client_name}} ("Client") on {{today_date}}.

1. SERVICES
Photographer agrees to provide {{session_type}} photography services on {{session_date}} at {{session_location}}.

Package: {{package_name}}
Total Investment: {{total_amount}}

2. PAYMENT TERMS
A non-refundable retainer of 50% is due upon signing this agreement to secure the date. The remaining balance is due no later than 7 days before the session date.

3. CANCELLATION & RESCHEDULING
Client may reschedule up to 14 days prior to the session date at no additional cost. Cancellations within 14 days forfeit the retainer. Photographer may reschedule due to weather or emergency with no penalty.

4. IMAGE DELIVERY
Edited images will be delivered via online gallery within 14 business days. Client will receive the number of images specified in the selected package.

5. IMAGE USAGE & COPYRIGHT
Photographer retains full copyright. Client receives a personal-use license. Commercial usage rights are included with Personal Branding packages. Photographer may use images for portfolio, social media, and marketing unless Client opts out in writing.

6. LIABILITY
Photographer is not liable for circumstances beyond their control. Maximum liability shall not exceed the total amount paid.

7. AGREEMENT
By signing below, both parties agree to the terms outlined above.


________________________          ________________________
{{client_name}}                   {{photographer_name}}
Client                            Photographer
Date: ________________            Date: ________________`,
  },
  {
    id: "tpl-event", name: "Event Coverage Agreement", category: "Events",
    body: `EVENT PHOTOGRAPHY AGREEMENT

This agreement is entered into between {{business_name}} ("Photographer") and {{client_name}} ("Client") on {{today_date}}.

1. EVENT DETAILS
Event Type: {{session_type}}
Date: {{session_date}}
Location: {{session_location}}
Package: {{package_name}}
Total Investment: {{total_amount}}

2. COVERAGE
Photographer will provide continuous coverage for the duration specified in the package. Additional hours at $250/hour, subject to availability.

3. PAYMENT TERMS
A non-refundable retainer of 50% is due upon signing. Remaining balance due 7 days before the event.

4. DELIVERABLES
Edited images delivered via online gallery within 21 business days. Raw/unedited files are not included.

5. CANCELLATION
More than 30 days before: retainer forfeited, no additional charges.
Within 30 days: full payment is due.
Photographer cancellation: full refund of all payments.

6. IMAGE RIGHTS
Photographer retains copyright. Client receives a personal and internal business use license. Images may not be altered without consent. Photographer may use images for portfolio and marketing.

7. FORCE MAJEURE
Neither party liable for failure to perform due to circumstances beyond reasonable control.

8. AGREEMENT
By signing below, both parties agree to these terms.


________________________          ________________________
{{client_name}}                   {{photographer_name}}
Client                            Photographer
Date: ________________            Date: ________________`,
  },
  {
    id: "tpl-headshot", name: "Headshot Session Agreement", category: "Headshot",
    body: `HEADSHOT PHOTOGRAPHY AGREEMENT

This agreement is entered into between {{business_name}} ("Photographer") and {{client_name}} ("Client") on {{today_date}}.

1. SESSION DETAILS
Session Type: {{session_type}}
Date: {{session_date}}
Location: {{session_location}}
Package: {{package_name}}
Total Investment: {{total_amount}}

2. PAYMENT
Full payment is due at the time of booking to secure your session time slot.

3. SESSION
Your session will last approximately 30–75 minutes depending on the selected package. Photographer will direct you through poses and expressions. Please arrive camera-ready with wardrobe selections.

4. RETOUCHING & DELIVERY
All purchased headshots receive professional retouching. Delivery within 5 business days via online gallery.

5. ADDITIONAL IMAGES
Additional retouched headshots beyond your package: $125 each.

6. CANCELLATION
Cancellations or rescheduling with less than 48 hours notice forfeit the session fee. No-shows forfeit full payment.

7. IMAGE USAGE
Client receives full copyright use of all purchased images. Photographer may use images for portfolio unless Client opts out in writing.

8. AGREEMENT
By signing below, both parties agree to these terms.


________________________          ________________________
{{client_name}}                   {{photographer_name}}
Client                            Photographer
Date: ________________            Date: ________________`,
  },
];

const RELEASE_TEMPLATES = [
  {
    id: "rel-adult", name: "Standard Model Release — Adult", category: "Standard",
    body: `MODEL RELEASE AGREEMENT

Date: {{today_date}}
Photographer: {{photographer_name}} / {{business_name}}

I, {{client_name}}, hereby grant {{business_name}} and its representatives the irrevocable right to use my likeness in photographs taken on {{session_date}} at {{session_location}} for the following purposes:

GRANTED USES:
• Portfolio display (website, social media, print)
• Marketing and advertising materials
• Editorial and publication use
• Exhibition and competition entry

I understand that:
• I will not receive additional compensation for these uses
• My name will not be used without separate written consent
• The Photographer retains full copyright of all images
• I may revoke this release for future uses with 30 days written notice

I am over 18 years of age and have the legal capacity to sign this release.


________________________          ________________________
Model / Client Signature          Date
{{client_name}}

________________________          ________________________
Photographer Signature            Date
{{photographer_name}}`,
  },
  {
    id: "rel-minor", name: "Model Release — Minor (Under 18)", category: "Minor",
    body: `MODEL RELEASE — MINOR

Date: {{today_date}}
Photographer: {{photographer_name}} / {{business_name}}

I, ________________________ (Parent/Legal Guardian), am the parent or legal guardian of {{client_name}} ("Minor"), and I hereby grant {{business_name}} permission to use the Minor's likeness in photographs taken on {{session_date}} at {{session_location}} for the following purposes:

GRANTED USES:
• Portfolio display (website, social media, print)
• Marketing and advertising materials

I understand that:
• No additional compensation will be provided for these uses
• The Minor's full name will not be used without separate written consent
• The Photographer retains full copyright of all images
• I may revoke this release for future uses with 30 days written notice

I confirm that I am the legal guardian of the Minor and have the authority to grant this release.


________________________          ________________________
Parent/Guardian Signature         Date
Printed Name: ________________

________________________          ________________________
Photographer Signature            Date
{{photographer_name}}`,
  },
  {
    id: "rel-property", name: "Property Release", category: "Property",
    body: `PROPERTY RELEASE

Date: {{today_date}}
Photographer: {{photographer_name}} / {{business_name}}

I, {{client_name}}, am the owner or authorized representative of the property located at:

{{session_location}}

I hereby grant {{business_name}} permission to use photographs of the above property taken on {{session_date}} for the following purposes:

• Portfolio and marketing materials
• Social media and website display
• Editorial use

I confirm I have the authority to grant this release and that no other permissions are required.


________________________          ________________________
Property Owner Signature          Date
{{client_name}}

________________________          ________________________
Photographer Signature            Date
{{photographer_name}}`,
  },
];

const MERGE_FIELDS = [
  { key: "{{client_name}}", label: "Client Name" },
  { key: "{{client_email}}", label: "Client Email" },
  { key: "{{session_date}}", label: "Session Date" },
  { key: "{{session_type}}", label: "Session Type" },
  { key: "{{session_location}}", label: "Location" },
  { key: "{{package_name}}", label: "Package Name" },
  { key: "{{total_amount}}", label: "Total Amount" },
  { key: "{{photographer_name}}", label: "Photographer" },
  { key: "{{business_name}}", label: "Business Name" },
  { key: "{{today_date}}", label: "Today's Date" },
];

function mergeVarsInBody(body, data) {
  let out = body || "";
  const todayFormatted = formatDateLocal(new Date().toISOString().split("T")[0], { month: "long", day: "numeric", year: "numeric" });
  const map = {
    "{{client_name}}": data.clientName || data.signer || "",
    "{{client_email}}": data.clientEmail || "",
    "{{session_date}}": data.sessionDate ? formatDateLocal(data.sessionDate, { month: "long", day: "numeric", year: "numeric" }) : "",
    "{{session_type}}": data.sessionType || "",
    "{{session_location}}": data.location || "",
    "{{package_name}}": data.packageName || "",
    "{{total_amount}}": data.totalAmount ? fmt$(data.totalAmount) : "",
    "{{photographer_name}}": "Nico Salgado",
    "{{business_name}}": "Nico Salgado Photography",
    "{{today_date}}": todayFormatted,
  };
  Object.entries(map).forEach(([k, v]) => { out = out.replaceAll(k, v); });
  return out;
}

function contractToPrintHtml(contract, templateBody, settings = {}) {
  const merged = mergeVarsInBody(templateBody, contract);
  const logoUrl = toAbsoluteAssetUrl(settings.logoUrl || "/nsp-logo.jpg");
  const businessName = settings.businessName || "Nico Salgado Photography";
  const businessEmail = settings.email || "nicosalgadophoto@gmail.com";
  const businessWebsite = settings.website || "nicosalgadophotography.com";
  const businessAddress = settings.address2 || "Farmington Hills, MI";
  return `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(contract.title || "Contract")}</title>
<style>body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;padding:40px 56px;line-height:1.8;font-size:14px;}
@media print{body{padding:0;}}
.header{text-align:center;border-bottom:2px solid #d4a853;padding-bottom:20px;margin-bottom:36px;}
.header h2{font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#999;margin:0 0 4px;}
.header p{font-size:10px;color:#aaa;margin:0;}
.footer{margin-top:48px;border-top:1px solid #e0e0e0;padding-top:14px;text-align:center;font-size:10px;color:#aaa;}
pre{white-space:pre-wrap;font-family:Georgia,'Times New Roman',serif;font-size:13.5px;line-height:1.85;color:#2a2a2a;margin:0;}
</style></head><body>
<div style="max-width:780px;margin:0 auto;">
<div class="header">${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(
    businessName
  )}" style="max-height:52px;width:auto;display:block;margin:0 auto 8px;" />` : ""}<h2>${escapeHtml(
    businessName
  )}</h2><p>${escapeHtml(businessAddress)} · ${escapeHtml(businessEmail)} · ${escapeHtml(
    businessWebsite
  )}</p></div>
<pre>${escapeHtml(merged)}</pre>
<div class="footer">${escapeHtml(contract.title || "Contract")} · ${escapeHtml(contract.version || "v1")} · ${escapeHtml(formatDateLocal(new Date().toISOString().split("T")[0], { month: "short", day: "numeric", year: "numeric" }))}</div>
</div></body></html>`;
}

/* ═══════════════════════════════════════════════════════
   CONTRACTS TAB — FULL VERSION
   ═══════════════════════════════════════════════════════ */
function ContractsTab({ contracts, setContracts, lead, settings }) {
  const [subTab, setSubTab] = useState("contracts"); // contracts | releases | templates
  const [view, setView] = useState("list"); // list | create | edit | preview | templateEdit
  const [form, setForm] = useState({});
  const [templateForm, setTemplateForm] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [releases, setReleases] = useState([]);
  const [cTemplates, setCTemplates] = useState(CONTRACT_TEMPLATES);
  const [rTemplates, setRTemplates] = useState(RELEASE_TEMPLATES);
  const [showMergePanel, setShowMergePanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const bodyRef = React.useRef(null);

  // ── Load from Supabase on mount ──
  useEffect(() => {
    async function load() {
      try {
        const [cTplRes, rTplRes, conRes, relRes] = await Promise.all([
          supabase.from("contract_templates").select("*").order("created_at"),
          supabase.from("release_templates").select("*").order("created_at"),
          supabase.from("contracts").select("*").order("created_at", { ascending: false }),
          supabase.from("model_releases").select("*").order("created_at", { ascending: false }),
        ]);
        if (cTplRes.data?.length) setCTemplates(cTplRes.data);
        if (rTplRes.data?.length) setRTemplates(rTplRes.data);
        if (conRes.data) setContracts(conRes.data.map(dbToContract));
        if (relRes.data) setReleases(relRes.data.map(dbToRelease));
      } catch (err) {
        console.error("Failed to load contracts data:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const isReleases = subTab === "releases";
  const isTemplates = subTab === "templates";
  const items = isReleases ? releases : contracts;
  const setItems = isReleases ? setReleases : setContracts;
  const templates = isReleases ? rTemplates : cTemplates;
  const setTemplatesState = isReleases ? setRTemplates : setCTemplates;
  const itemLabel = isReleases ? "Model Release" : "Contract";

  const getTemplateBody = (item) => {
    const allTpls = [...cTemplates, ...rTemplates];
    const tpl = allTpls.find(t => t.id === (item.templateId || item.template_id));
    return tpl ? tpl.body : item.body || "";
  };

  // ── Status helpers ──
  const statusColor = (s) => {
    if (s === "Signed") return { color: G.green, bg: G.greenBg };
    if (s === "Sent") return { color: G.blue, bg: G.blueBg };
    if (s === "Viewed") return { color: G.amber, bg: G.amberBg };
    if (s === "Declined") return { color: G.red, bg: G.redBg };
    return { color: G.textDim, bg: G.surface };
  };

  // ── DB <-> UI mappers ──
  function dbToContract(row) {
    return {
      id: row.id, templateId: row.template_id, title: row.title,
      clientName: row.client_name, clientEmail: row.client_email,
      sessionType: row.session_type, sessionDate: row.session_date,
      location: row.location, packageName: row.package_name,
      totalAmount: Number(row.total_amount) || 0,
      status: row.status, sentOn: row.sent_on, signedOn: row.signed_on,
      signer: row.signer, version: row.version, body: row.body,
      leadId: row.lead_id, type: "contract",
    };
  }
  function dbToRelease(row) {
    return {
      id: row.id, templateId: row.template_id, title: row.title,
      clientName: row.client_name, clientEmail: row.client_email,
      sessionType: row.session_type, sessionDate: row.session_date,
      location: row.location,
      status: row.status, sentOn: row.sent_on, signedOn: row.signed_on,
      signer: row.signer, version: row.version, body: row.body,
      leadId: row.lead_id, type: "release",
    };
  }
  function contractToDb(item) {
    return {
      id: item.id, template_id: item.templateId || null, title: item.title,
      client_name: item.clientName || item.signer || "", client_email: item.clientEmail || "",
      session_type: item.sessionType || "", session_date: item.sessionDate || null,
      location: item.location || "", package_name: item.packageName || "",
      total_amount: item.totalAmount || 0,
      status: item.status || "Draft", sent_on: item.sentOn || null,
      signed_on: item.signedOn || null, signer: item.signer || item.clientName || "",
      version: item.version || "v1", body: item.body || "",
      lead_id: item.leadId || null,
    };
  }
  function releaseToDb(item) {
    return {
      id: item.id, template_id: item.templateId || null, title: item.title,
      client_name: item.clientName || item.signer || "", client_email: item.clientEmail || "",
      session_type: item.sessionType || "", session_date: item.sessionDate || null,
      location: item.location || "",
      status: item.status || "Draft", sent_on: item.sentOn || null,
      signed_on: item.signedOn || null, signer: item.signer || item.clientName || "",
      version: item.version || "v1", body: item.body || "",
      lead_id: item.leadId || null,
    };
  }

  // ── CRUD ──
  const startCreate = (tplId) => {
    const tpl = [...cTemplates, ...rTemplates].find(t => t.id === tplId);
    setForm({
      id: genId("doc"), templateId: tplId, title: tpl?.name || "",
      clientName: lead?.name || "", clientEmail: lead?.email || "",
      sessionType: lead?.type || "", sessionDate: lead?.eventDate || "",
      location: lead?.location || "", packageName: "", totalAmount: "",
      status: "Draft", sentOn: "", signedOn: "", signer: lead?.name || "", version: "v1",
      type: isReleases ? "release" : "contract",
      body: tpl?.body || "",
    });
    setView("create");
  };

  const startEdit = (item) => {
    setForm({ ...item, body: item.body || getTemplateBody(item) });
    setActiveItem(item);
    setView("edit");
  };

  const startPreview = (item) => {
    setActiveItem(item);
    setView("preview");
  };

  const saveForm = async () => {
    const table = isReleases ? "model_releases" : "contracts";
    const toDb = isReleases ? releaseToDb : contractToDb;
    const existing = items.find(i => i.id === form.id);
    const dbRow = toDb(form);

    if (existing) {
      await supabase.from(table).update(dbRow).eq("id", form.id);
      setItems(prev => prev.map(i => i.id === form.id ? { ...form } : i));
    } else {
      const { data } = await supabase.from(table).insert(dbRow).select().single();
      const mapped = isReleases ? dbToRelease(data || dbRow) : dbToContract(data || dbRow);
      setItems(prev => [mapped, ...prev]);
    }
    setView("list"); setForm({}); setActiveItem(null);
  };

  const deleteItem = async (id) => {
    const table = isReleases ? "model_releases" : "contracts";
    await supabase.from(table).delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
    if (activeItem?.id === id) { setView("list"); setActiveItem(null); }
  };

  const updateStatus = async (id, status) => {
    const table = isReleases ? "model_releases" : "contracts";
    const updates = { status };
    if (status === "Sent") updates.sent_on = new Date().toISOString().split("T")[0];
    if (status === "Signed") updates.signed_on = new Date().toISOString().split("T")[0];
    await supabase.from(table).update(updates).eq("id", id);
    const uiUpdates = { status };
    if (status === "Sent") uiUpdates.sentOn = updates.sent_on;
    if (status === "Signed") uiUpdates.signedOn = updates.signed_on;
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...uiUpdates } : i));
  };

  const duplicateItem = async (item) => {
    const table = isReleases ? "model_releases" : "contracts";
    const toDb = isReleases ? releaseToDb : contractToDb;
    const dup = { ...item, id: genId("doc"), title: item.title + " (Copy)", status: "Draft", sentOn: "", signedOn: "" };
    const dbRow = toDb(dup);
    const { data } = await supabase.from(table).insert(dbRow).select().single();
    const mapped = isReleases ? dbToRelease(data || dbRow) : dbToContract(data || dbRow);
    setItems(prev => [mapped, ...prev]);
  };

  // ── Template CRUD ──
  const startTemplateEdit = (tpl) => {
    setTemplateForm({ ...tpl });
    setView("templateEdit");
  };

  const startTemplateCreate = () => {
    setTemplateForm({ id: genId("tpl"), name: "", category: isReleases ? "Standard" : "Personal Branding", body: "" });
    setView("templateEdit");
  };

  const saveTemplate = async () => {
    const table = isReleases ? "release_templates" : "contract_templates";
    const existing = templates.find(t => t.id === templateForm.id);
    if (existing) {
      await supabase.from(table).update({ name: templateForm.name, category: templateForm.category, body: templateForm.body, updated_at: new Date().toISOString() }).eq("id", templateForm.id);
      setTemplatesState(prev => prev.map(t => t.id === templateForm.id ? { ...templateForm } : t));
    } else {
      const { data } = await supabase.from(table).insert({ id: templateForm.id, name: templateForm.name, category: templateForm.category, body: templateForm.body }).select().single();
      setTemplatesState(prev => [data || templateForm, ...prev]);
    }
    setView("list"); setTemplateForm({});
  };

  const deleteTemplate = async (id) => {
    // Try both tables since templates tab shows all
    await supabase.from("contract_templates").delete().eq("id", id);
    await supabase.from("release_templates").delete().eq("id", id);
    setCTemplates(prev => prev.filter(t => t.id !== id));
    setRTemplates(prev => prev.filter(t => t.id !== id));
  };

  // ── Insert merge field ──
  const insertMerge = (key) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const isTemplate = view === "templateEdit";
    const current = isTemplate ? templateForm.body : form.body;
    const next = (current || "").slice(0, start) + key + (current || "").slice(end);
    if (isTemplate) setTemplateForm(p => ({ ...p, body: next }));
    else setForm(p => ({ ...p, body: next }));
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + key.length; }, 0);
  };

  // ── Print/PDF ──
  const handlePrint = (item) => {
    const body = item.body || getTemplateBody(item);
    openPrintWindow(contractToPrintHtml(item, body, settings));
  };

  // ── Email Contract/Release ──
  const [emailSending, setEmailSending] = useState(null);
  const [cToast, setCToast] = useState(null);

  const handleEmail = async (item) => {
    const email = item.clientEmail || lead?.email;
    if (!email) { setCToast({ type: "error", message: "No client email found" }); return; }
    setEmailSending(item.id);
    setCToast(null);
    try {
      const body = item.body || getTemplateBody(item);
      const merged = mergeVarsInBody(body, item);
      const isRel = subTab === "releases";
      const label = isRel ? "Model Release" : "Contract";

      const encoded = encodeClientPayload({
        type: isRel ? "release" : "contract",
        document: {
          title: item.title || "",
          clientName: item.clientName || "",
          sessionType: item.sessionType || "",
          version: item.version || "v1",
          body: merged || "",
        },
      });
      const signLink = encoded
        ? `${window.location.origin}/client?payload=${encodeURIComponent(encoded)}`
        : `${window.location.origin}`;

      const htmlBody = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;">
  <div style="background:#0e0f11;padding:24px 28px;border-radius:12px 12px 0 0;">
    <div style="font-size:18px;font-weight:800;color:#d4a853;">Nico Salgado Photography</div>
    <div style="font-size:12px;color:#9b9a97;margin-top:4px;">30317 Glenmuer · Farmington Hills, MI 48334</div>
  </div>
  <div style="background:#ffffff;padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 12px 12px;">
    <h2 style="margin:0 0 4px;font-size:18px;">${label}: ${item.title || ""}</h2>
    <p style="color:#666;font-size:13px;margin:0 0 20px;">${item.clientName || ""} · ${item.sessionType || ""}</p>
    <div style="white-space:pre-wrap;font-size:13px;line-height:1.7;color:#333;padding:20px;background:#f9f9f9;border-radius:8px;max-height:400px;overflow:hidden;">${merged.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
    <p style="text-align:center;margin:24px 0;"><a href="${signLink}" style="display:inline-block;padding:14px 36px;background:#d4a853;color:#0e0f11;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Review & Sign ${label}</a></p>
    <p style="font-size:12px;color:#999;text-align:center;">Click the button above to review the full ${label.toLowerCase()} and sign digitally.<br/>Questions? Reply to this email or text Nico directly.</p>
  </div>
</div>`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: `${label}: ${item.title || "Nico Salgado Photography"}`,
          htmlBody,
        }),
      });
      await parseApiResponse(res, "Failed to send");

      // Update status to Sent
      const table = isRel ? "model_releases" : "contracts";
      if (item.status === "Draft") {
        await supabase.from(table).update({ status: "Sent" }).eq("id", item.id);
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "Sent" } : i));
      }
      setCToast({ type: "success", message: `${label} emailed to ${email}` });
    } catch (err) {
      setCToast({ type: "error", message: err.message });
    }
    setEmailSending(null);
  };

  /* ═══ Sub-tab pills ═══ */
  const SubTabs = () => (
    <div style={{ display: "flex", gap: 4, background: G.surface, borderRadius: 8, padding: 3, marginBottom: 16 }}>
      {[
        { key: "contracts", label: "Contracts", count: contracts.length },
        { key: "releases", label: "Model Releases", count: releases.length },
        { key: "templates", label: "Templates", count: cTemplates.length + rTemplates.length },
      ].map(t => (
        <button key={t.key} onClick={() => { setSubTab(t.key); setView("list"); }}
          style={{
            padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
            background: subTab === t.key ? G.gold : "transparent",
            color: subTab === t.key ? "#0e0f11" : G.textDim,
            transition: "all .15s",
          }}>
          {t.label}
          <span style={{
            marginLeft: 5, fontSize: 10, padding: "1px 6px", borderRadius: 10,
            background: subTab === t.key ? "rgba(0,0,0,.15)" : G.border,
            color: subTab === t.key ? "#0e0f11" : G.textMuted,
          }}>{t.count}</span>
        </button>
      ))}
    </div>
  );

  /* ═══ Template picker dropdown ═══ */
  const TemplatePicker = ({ onSelect, onCreateNew }) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);
    useEffect(() => {
      const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
      <div ref={ref} style={{ position: "relative" }}>
        <Btn small onClick={() => setOpen(p => !p)}>+ Add {itemLabel}</Btn>
        {open && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 4px)", width: 300, zIndex: 100,
            background: G.card, border: `1px solid ${G.borderLight}`, borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,.5)", overflow: "hidden",
          }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${G.border}`, fontSize: 11, color: G.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>
              Choose Template
            </div>
            <div style={{ maxHeight: 240, overflowY: "auto" }}>
              {templates.map(tpl => (
                <button key={tpl.id} onClick={() => { onSelect(tpl.id); setOpen(false); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent",
                    border: "none", borderBottom: `1px solid ${G.border}`, cursor: "pointer", color: G.text,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = G.surface}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tpl.name}</div>
                  <div style={{ fontSize: 11, color: G.textMuted, marginTop: 2 }}>{tpl.category}</div>
                </button>
              ))}
            </div>
            <button onClick={() => { onCreateNew(); setOpen(false); }}
              style={{
                width: "100%", padding: "10px 14px", background: "transparent", border: "none",
                borderTop: `1px solid ${G.border}`, cursor: "pointer", color: G.gold,
                fontSize: 12, fontWeight: 600, textAlign: "center",
              }}
              onMouseEnter={e => e.currentTarget.style.background = G.goldBg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              + Create Blank {itemLabel}
            </button>
          </div>
        )}
      </div>
    );
  };

  /* ═══ Merge field panel ═══ */
  const MergePanel = () => (
    <div style={{
      position: "absolute", right: 0, top: 36, width: 260, background: G.card,
      border: `1px solid ${G.borderLight}`, borderRadius: 10, padding: 14, zIndex: 100,
      boxShadow: "0 8px 32px rgba(0,0,0,.5)",
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: G.gold, marginBottom: 8 }}>Insert Merge Field</div>
      <div style={{ fontSize: 10, color: G.textMuted, marginBottom: 10 }}>Click to insert at cursor</div>
      {MERGE_FIELDS.map(f => (
        <div key={f.key} onClick={() => { insertMerge(f.key); setShowMergePanel(false); }}
          style={{ padding: "6px 8px", borderRadius: 5, cursor: "pointer", fontSize: 11, color: G.text, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1, transition: "background .1s" }}
          onMouseEnter={e => e.currentTarget.style.background = G.surface}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontWeight: 500 }}>{f.label}</span>
          <code style={{ fontSize: 9, color: G.gold, background: G.goldBg, padding: "1px 5px", borderRadius: 3 }}>{f.key}</code>
        </div>
      ))}
    </div>
  );

  /* ═══ LOADING ═══ */
  if (loading) {
    return (
      <Card>
        <SubTabs />
        <div style={{ textAlign: "center", padding: "40px 20px", color: G.textMuted, fontSize: 13 }}>
          Loading contracts & releases...
        </div>
      </Card>
    );
  }

  /* ═══ LIST VIEW ═══ */
  if (view === "list") {
    if (isTemplates) {
      const allTpls = [...cTemplates, ...rTemplates];
      return (
        <Card>
          <SubTabs />
          <SectionLabel actions={<Btn small onClick={startTemplateCreate}>+ New Template</Btn>}>
            Templates
          </SectionLabel>
          {allTpls.length === 0 ? <EmptyState icon="📋" text="No templates yet" /> : (
            <div style={{ display: "grid", gap: 8 }}>
              {allTpls.map(tpl => {
                const isRel = rTemplates.some(r => r.id === tpl.id);
                return (
                  <div key={tpl.id} style={{
                    display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
                    padding: "14px 16px", background: G.surface, borderRadius: 8, border: `1px solid ${G.border}`, cursor: "pointer",
                  }} onClick={() => startTemplateEdit(tpl)}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{tpl.name}</span>
                        <Pill color={isRel ? "#a78bfa" : G.gold} bg={isRel ? "rgba(167,139,250,.08)" : G.goldBg}>
                          {isRel ? "Release" : "Contract"}
                        </Pill>
                      </div>
                      <div style={{ fontSize: 12, color: G.textMuted, marginTop: 3 }}>{tpl.category}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn variant="ghost" small onClick={(e) => { e.stopPropagation(); startTemplateEdit(tpl); }}>Edit</Btn>
                      <Btn variant="danger" small onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl.id); }}>✕</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      );
    }

    return (
      <div style={{ display: "grid", gap: 20 }}>
        {cToast && (
          <div style={{
            padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: cToast.type === "success" ? G.greenBg : G.redBg,
            color: cToast.type === "success" ? G.green : G.red,
            border: `1px solid ${cToast.type === "success" ? G.green : G.red}33`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>{cToast.type === "success" ? "✓ " : "✕ "}{cToast.message}</span>
            <button onClick={() => setCToast(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        )}
      <Card>
        <SubTabs />
        <SectionLabel actions={<TemplatePicker onSelect={startCreate} onCreateNew={() => startCreate(templates[0]?.id)} />}>
          {isReleases ? "Model Releases" : "Contracts"}
        </SectionLabel>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Draft", count: items.filter(i => i.status === "Draft").length, ...statusColor("Draft") },
            { label: "Sent", count: items.filter(i => i.status === "Sent").length, ...statusColor("Sent") },
            { label: "Signed", count: items.filter(i => i.status === "Signed").length, ...statusColor("Signed") },
          ].map((c, i) => (
            <div key={i} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.count}</div>
            </div>
          ))}
        </div>

        {items.length === 0 ? (
          <EmptyState icon={isReleases ? "📝" : "📄"} text={`No ${itemLabel.toLowerCase()}s yet`} />
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {items.map(c => {
              const sc = statusColor(c.status);
              return (
                <div key={c.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
                  padding: "14px 16px", background: G.surface, borderRadius: 8, border: `1px solid ${G.border}`,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: G.textDim, marginTop: 3 }}>
                      {c.signer || c.clientName || "—"}
                      {c.sessionType ? ` · ${c.sessionType}` : ""}
                      {c.totalAmount ? ` · ${fmt$(c.totalAmount)}` : ""}
                      {" · "}{c.version || "v1"}
                    </div>
                    <div style={{ fontSize: 11, color: G.textMuted, marginTop: 2 }}>
                      {c.sentOn ? `Sent ${fmtShort(c.sentOn)}` : "Not sent"}
                      {c.signedOn ? ` · Signed ${fmtShort(c.signedOn)}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Pill color={sc.color} bg={sc.bg}>{c.status}</Pill>
                    <Btn variant="ghost" small onClick={() => startPreview(c)}>Preview</Btn>
                    <Btn variant="ghost" small onClick={() => startEdit(c)}>Edit</Btn>
                    <Btn variant="ghost" small onClick={() => handlePrint(c)}>PDF</Btn>
                    <Btn variant="secondary" small onClick={() => handleEmail(c)} disabled={emailSending === c.id}>
                      {emailSending === c.id ? "..." : "✉ Email"}
                    </Btn>
                    <Btn variant="ghost" small onClick={() => duplicateItem(c)}>⊕</Btn>
                    <Btn variant="danger" small onClick={() => deleteItem(c.id)}>✕</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      </div>
    );
  }

  /* ═══ CREATE / EDIT VIEW ═══ */
  if (view === "create" || view === "edit") {
    return (
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Btn variant="ghost" small onClick={() => { setView("list"); setForm({}); setActiveItem(null); }}>
            ← Back to {itemLabel}s
          </Btn>
        </div>
        <SectionLabel>{view === "create" ? `New ${itemLabel}` : `Edit ${itemLabel}`}</SectionLabel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField label={`${itemLabel} Title`} value={form.title || ""} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 5 }}>Status</label>
            <select value={form.status || "Draft"} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
              style={{ width: "100%", background: G.surface, color: G.text, border: `1px solid ${G.border}`, borderRadius: 6, padding: "9px 12px", fontSize: 13 }}>
              <option>Draft</option><option>Sent</option><option>Viewed</option><option>Signed</option><option>Declined</option>
            </select>
          </div>
        </div>

        {/* Client details */}
        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: G.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".04em" }}>Client Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Client / Signer Name" value={form.clientName || form.signer || ""} onChange={(e) => setForm(p => ({ ...p, clientName: e.target.value, signer: e.target.value }))} />
            <InputField label="Client Email" value={form.clientEmail || ""} onChange={(e) => setForm(p => ({ ...p, clientEmail: e.target.value }))} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 5 }}>Session Type</label>
              <select value={form.sessionType || ""} onChange={(e) => setForm(p => ({ ...p, sessionType: e.target.value }))}
                style={{ width: "100%", background: G.surface, color: G.text, border: `1px solid ${G.border}`, borderRadius: 6, padding: "9px 12px", fontSize: 13 }}>
                <option value="">Select...</option><option>Headshots</option><option>Personal Branding</option><option>Events</option><option>Wedding</option>
              </select>
            </div>
            <InputField label="Session Date" type="date" value={form.sessionDate || ""} onChange={(e) => setForm(p => ({ ...p, sessionDate: e.target.value }))} />
            <InputField label="Location" value={form.location || ""} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Studio — Farmington Hills" />
            <InputField label="Package Name" value={form.packageName || ""} onChange={(e) => setForm(p => ({ ...p, packageName: e.target.value }))} placeholder="e.g. The Identity" />
            {!isReleases && (
              <InputField label="Total Amount" type="number" value={form.totalAmount || ""} onChange={(e) => setForm(p => ({ ...p, totalAmount: Number(e.target.value) || 0 }))} />
            )}
            <InputField label="Version" value={form.version || "v1"} onChange={(e) => setForm(p => ({ ...p, version: e.target.value }))} />
          </div>
        </div>

        {/* Body editor */}
        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, position: "relative" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: G.gold, textTransform: "uppercase", letterSpacing: ".04em" }}>{itemLabel} Body</div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="secondary" small onClick={() => setShowMergePanel(p => !p)}>{"{ }"} Merge</Btn>
              <Btn variant="secondary" small onClick={() => { setActiveItem({ ...form }); setView("preview"); }}>Preview</Btn>
            </div>
            {showMergePanel && <MergePanel />}
          </div>
          <textarea ref={bodyRef} value={form.body || ""} onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))}
            style={{
              width: "100%", minHeight: 360, background: G.bg, color: G.text, border: `1px solid ${G.border}`,
              borderRadius: 6, padding: 14, fontSize: 12, fontFamily: "'Courier New', monospace", lineHeight: 1.7,
              resize: "vertical", boxSizing: "border-box",
            }}
            placeholder={`Enter ${itemLabel.toLowerCase()} text. Use {{client_name}} etc. for dynamic fields.`} />
          <div style={{ fontSize: 10, color: G.textMuted, marginTop: 6 }}>
            Merge fields like {"{{client_name}}"} auto-replace with client details in preview/PDF.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" small onClick={() => { setView("list"); setForm({}); setActiveItem(null); }}>Cancel</Btn>
          <Btn small onClick={saveForm} disabled={!form.title?.trim()}>
            {view === "create" ? `Create ${itemLabel}` : "Save Changes"}
          </Btn>
        </div>
      </Card>
    );
  }

  /* ═══ PREVIEW VIEW ═══ */
  if (view === "preview") {
    const item = activeItem || form;
    const rawBody = item.body || getTemplateBody(item);
    const merged = mergeVarsInBody(rawBody, item);
    const sc = statusColor(item.status);

    return (
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Btn variant="ghost" small onClick={() => { setView("list"); setActiveItem(null); }}>← Back</Btn>
          <div style={{ display: "flex", gap: 6 }}>
            {item.status === "Draft" && item.id && (
              <Btn small onClick={() => { updateStatus(item.id, "Sent"); setView("list"); setActiveItem(null); }}>◈ Mark Sent</Btn>
            )}
            {item.status === "Sent" && item.id && (
              <Btn small onClick={() => { updateStatus(item.id, "Signed"); setView("list"); setActiveItem(null); }} style={{ background: G.green }}>✓ Mark Signed</Btn>
            )}
            <Btn variant="secondary" small onClick={() => startEdit(item)}>Edit</Btn>
            <Btn variant="secondary" small onClick={() => handlePrint(item)}>Print / PDF</Btn>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <Pill color={sc.color} bg={sc.bg}>{item.status || "Draft"}</Pill>
          <span style={{ fontSize: 12, color: G.textMuted }}>
            {item.clientName || item.signer || "—"} · {item.sessionType || "—"} · {item.version || "v1"}
          </span>
        </div>

        {/* White document preview */}
        <div style={{
          background: "#fff", borderRadius: 8, padding: "48px 56px", color: "#1a1a1a",
          fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, lineHeight: 1.8,
          maxWidth: 780, boxShadow: "0 2px 16px rgba(0,0,0,.3)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 32, borderBottom: "2px solid #d4a853", paddingBottom: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Nico Salgado Photography</div>
            <div style={{ fontSize: 10, color: "#aaa" }}>Farmington Hills, MI · nicosalgadophoto@gmail.com · nicosalgadophotography.com</div>
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.85, color: "#2a2a2a" }}>{merged}</div>
          <div style={{ marginTop: 40, borderTop: "1px solid #e0e0e0", paddingTop: 12, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#aaa" }}>{item.title || "Document"} · {item.version || "v1"} · {fmtShort(new Date().toISOString().split("T")[0])}</div>
          </div>
        </div>
      </Card>
    );
  }

  /* ═══ TEMPLATE EDIT VIEW ═══ */
  if (view === "templateEdit") {
    return (
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Btn variant="ghost" small onClick={() => { setView("list"); setTemplateForm({}); }}>← Back to Templates</Btn>
        </div>
        <SectionLabel>{templateForm.id && templates.find(t => t.id === templateForm.id) ? "Edit Template" : "New Template"}</SectionLabel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField label="Template Name" value={templateForm.name || ""} onChange={(e) => setTemplateForm(p => ({ ...p, name: e.target.value }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 5 }}>Category</label>
            <select value={templateForm.category || ""} onChange={(e) => setTemplateForm(p => ({ ...p, category: e.target.value }))}
              style={{ width: "100%", background: G.surface, color: G.text, border: `1px solid ${G.border}`, borderRadius: 6, padding: "9px 12px", fontSize: 13 }}>
              <option>Headshot</option><option>Personal Branding</option><option>Events</option><option>Wedding</option>
              <option>Standard</option><option>Minor</option><option>Property</option><option>Other</option>
            </select>
          </div>
        </div>

        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, position: "relative" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: G.gold, textTransform: "uppercase", letterSpacing: ".04em" }}>Template Body</div>
            <Btn variant="secondary" small onClick={() => setShowMergePanel(p => !p)}>{"{ }"} Merge</Btn>
            {showMergePanel && <MergePanel />}
          </div>
          <textarea ref={bodyRef} value={templateForm.body || ""} onChange={(e) => setTemplateForm(p => ({ ...p, body: e.target.value }))}
            style={{
              width: "100%", minHeight: 400, background: G.bg, color: G.text, border: `1px solid ${G.border}`,
              borderRadius: 6, padding: 14, fontSize: 12, fontFamily: "'Courier New', monospace", lineHeight: 1.7,
              resize: "vertical", boxSizing: "border-box",
            }}
            placeholder="Enter template text with merge fields like {{client_name}}..." />
          <div style={{ fontSize: 10, color: G.textMuted, marginTop: 6 }}>
            Use {"{{client_name}}"}, {"{{session_date}}"}, {"{{total_amount}}"} etc. for dynamic content.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" small onClick={() => { setView("list"); setTemplateForm({}); }}>Cancel</Btn>
          <Btn small onClick={saveTemplate} disabled={!templateForm.name?.trim()}>Save Template</Btn>
        </div>
      </Card>
    );
  }

  return null;
}

function TemplatesTab({ templates, setTemplates }) {
  const LT = {
    panel: "#f8f6f2",
    card: "#ffffff",
    border: "#e7e1d8",
    text: "#2e2a25",
    dim: "#70685f",
    muted: "#8a7f74",
    brand: "#a68b5b",
    brandBg: "rgba(166,139,91,.12)",
  };
  const [mode, setMode] = useState("file"); // file | email
  const [layout, setLayout] = useState("cards"); // cards | list
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const templateIcons = {
    "Booking Confirmation": "📸",
    "Client Onboarding": "🚀",
    "Testimonial Request": "⭐",
    "Discount Request Response": "💬",
    "Questionnaire Follow-Up": "📋",
    "New Client Questionnaire": "📝",
  };

  const folders = ["All", "Made for you", "My Templates"];
  const categories = [
    "All",
    "Contracts",
    "Invoices",
    "Proposals",
    "Quotes",
    "Questionnaires",
    "Headshots",
    "Personal Branding",
    "Events",
    "Booking",
    "Onboarding",
  ];

  const modeTemplates = templates.filter((t) => t.type === mode);
  const filtered = modeTemplates.filter((t) => {
    const folderOk = filter === "All" || t.folder === filter;
    const categoryOk = categoryFilter === "All" || t.category === categoryFilter;
    const queryOk =
      !query.trim() ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase()) ||
      (t.action || "").toLowerCase().includes(query.toLowerCase());
    return folderOk && categoryOk && queryOk;
  });

  const createTemplate = () => {
    setEditing({
      id: genId("tpl"),
      type: mode,
      action: mode === "file" ? "Contract" : "Send",
      name: "",
      category: mode === "file" ? "Contracts" : "Onboarding",
      folder: "My Templates",
      subject: mode === "email" ? "New message for {{client_name}}" : "",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const saveTemplate = () => {
    if (!editing?.name?.trim()) return;
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === editing.id);
      const next = { ...editing, updatedAt: new Date().toISOString() };
      if (exists) return prev.map((t) => (t.id === editing.id ? next : t));
      return [next, ...prev];
    });
    setEditing(null);
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  return (
    <div
      style={{
        background: LT.panel,
        border: `1px solid ${LT.border}`,
        borderRadius: 12,
        padding: 18,
        color: LT.text,
      }}
    >
      <SectionLabel
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant={layout === "cards" ? "secondary" : "ghost"} small onClick={() => setLayout("cards")}>
              Cards
            </Btn>
            <Btn variant={layout === "list" ? "secondary" : "ghost"} small onClick={() => setLayout("list")}>
              List
            </Btn>
            <Btn small onClick={createTemplate}>+ New Template</Btn>
          </div>
        }
      >
        My Templates
      </SectionLabel>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <Btn variant={mode === "file" ? "secondary" : "ghost"} small onClick={() => setMode("file")}>
          File templates
        </Btn>
        <Btn variant={mode === "email" ? "secondary" : "ghost"} small onClick={() => setMode("email")}>
          Email templates
        </Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14 }}>
        <div
          style={{
            background: LT.card,
            border: `1px solid ${LT.border}`,
            borderRadius: 8,
            padding: 12,
            height: "fit-content",
          }}
        >
          <div style={{ fontSize: 11, color: LT.muted, marginBottom: 8, letterSpacing: ".06em" }}>
            SMART FILES
          </div>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                width: "100%",
                background: filter === f ? LT.brandBg : "transparent",
                color: filter === f ? LT.brand : LT.dim,
                border: "none",
                textAlign: "left",
                padding: "8px 9px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 2,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates"
              style={{
                flex: 1,
                minWidth: 180,
                background: LT.card,
                color: LT.text,
                border: `1px solid ${LT.border}`,
                borderRadius: 7,
                padding: "9px 12px",
                fontSize: 12,
              }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: LT.card,
                color: LT.text,
                border: `1px solid ${LT.border}`,
                borderRadius: 7,
                padding: "9px 10px",
                fontSize: 12,
                minWidth: 140,
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              text={`No ${mode} templates yet`}
              action={
                <Btn small onClick={createTemplate}>
                  Create Template
                </Btn>
              }
            />
          ) : layout === "cards" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
              {filtered.map((tpl) => (
                <div
                  key={tpl.id}
                  style={{
                    background: LT.card,
                    border: `1px solid ${LT.border}`,
                    borderRadius: 8,
                    padding: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => setEditing({ ...tpl })}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    {templateIcons[tpl.name] ? `${templateIcons[tpl.name]} ` : ""}
                    {tpl.name}
                  </div>
                  <div style={{ fontSize: 11, color: LT.muted, marginBottom: 8 }}>
                    {tpl.category} · {tpl.folder}
                  </div>
                  {tpl.type === "email" && tpl.subject ? (
                    <div style={{ fontSize: 11, color: LT.dim, marginBottom: 8 }}>
                      Subject: {tpl.subject}
                    </div>
                  ) : null}
                  <Pill color={LT.brand} bg={LT.brandBg}>
                    {tpl.action || (mode === "file" ? "Contract" : "Send")}
                  </Pill>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.map((tpl) => (
                <div
                  key={tpl.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 1fr 1fr auto",
                    alignItems: "center",
                    gap: 10,
                    background: LT.card,
                    border: `1px solid ${LT.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {templateIcons[tpl.name] ? `${templateIcons[tpl.name]} ` : ""}
                    {tpl.name}
                  </div>
                  <div style={{ fontSize: 12, color: LT.dim }}>{tpl.action}</div>
                  <div style={{ fontSize: 12, color: LT.dim }}>
                    {tpl.type === "email" && tpl.subject ? tpl.subject : tpl.folder}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" small onClick={() => setEditing({ ...tpl })}>
                      Edit
                    </Btn>
                    <Btn variant="danger" small onClick={() => deleteTemplate(tpl.id)}>
                      ×
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div
          style={{
            marginTop: 16,
            background: LT.card,
            border: `1px solid ${LT.border}`,
            borderRadius: 8,
            padding: 14,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <InputField
              label="Template Name"
              value={editing.name || ""}
              onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
            />
            <InputField
              label="Action"
              value={editing.action || ""}
              onChange={(e) => setEditing((p) => ({ ...p, action: e.target.value }))}
            />
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: LT.text,
                  marginBottom: 5,
                }}
              >
                Folder
              </label>
              <select
                value={editing.folder || "My Templates"}
                onChange={(e) => setEditing((p) => ({ ...p, folder: e.target.value }))}
                style={{
                  width: "100%",
                  background: LT.card,
                  color: LT.text,
                  border: `1px solid ${LT.border}`,
                  borderRadius: 6,
                  padding: "9px 12px",
                  fontSize: 13,
                }}
              >
                {folders.filter((f) => f !== "All").map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {editing.type === "email" && (
            <InputField
              label="Email Subject"
              value={editing.subject || ""}
              onChange={(e) => setEditing((p) => ({ ...p, subject: e.target.value }))}
            />
          )}
          <InputField
            label="Template Body"
            value={editing.content || ""}
            onChange={(e) => setEditing((p) => ({ ...p, content: e.target.value }))}
            multiline
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn variant="ghost" small onClick={() => setEditing(null)}>
              Cancel
            </Btn>
            <Btn small onClick={saveTemplate} disabled={!editing.name?.trim()}>
              Save Template
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardView({ lead, quotes, schedule, notes, emailActivity, onNavigate }) {
  const totalQuoted = quotes.reduce((sum, q) => sum + calcQuoteTotals(q).total, 0);
  const acceptedCount = quotes.filter((q) => q.status === "Accepted").length;
  const openQuotes = quotes.filter((q) => q.status !== "Declined").length;
  const totalEmailOpens = quotes.reduce((sum, q) => sum + (Number(q.pageViews) || 0), 0);
  const lastOpenIso = quotes
    .map((q) => q.lastViewed)
    .filter(Boolean)
    .sort()
    .slice(-1)[0];

  const monthKeys = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const monthLabel = (key) => {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  const monthly = monthKeys.reduce((acc, k) => {
    acc[k] = { receipts: 0, invoiced: 0, pastDue: 0 };
    return acc;
  }, {});
  const getMonthKey = (isoLike) => {
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  quotes.forEach((q) => {
    const amount = calcQuoteTotals(q).total;
    const invKey = getMonthKey(q.createdAt || q.updatedAt);
    if (invKey && monthly[invKey]) monthly[invKey].invoiced += amount;
    if (q.status === "Accepted") {
      const recKey = getMonthKey(q.updatedAt || q.createdAt);
      if (recKey && monthly[recKey]) monthly[recKey].receipts += amount;
    }
    if (q.status === "Sent" && q.expiration) {
      const exp = new Date(q.expiration);
      if (!Number.isNaN(exp.getTime()) && exp < new Date()) {
        const pastDueKey = getMonthKey(q.expiration);
        if (pastDueKey && monthly[pastDueKey]) monthly[pastDueKey].pastDue += amount;
      }
    }
  });

  const financeSeries = monthKeys.map((k) => ({
    key: k,
    label: monthLabel(k),
    receipts: monthly[k].receipts,
    invoiced: monthly[k].invoiced,
    pastDue: monthly[k].pastDue,
  }));
  let runningCash = 0;
  const cashFlowSeries = financeSeries.map((m) => {
    runningCash += m.receipts - m.pastDue;
    return runningCash;
  });
  const barMax = Math.max(
    1,
    ...financeSeries.map((m) => Math.max(m.receipts, m.invoiced, m.pastDue)),
    ...cashFlowSeries.map((v) => Math.abs(v))
  );
  const chartH = 180;
  const linePoints = cashFlowSeries
    .map((v, i) => {
      const x = (i / Math.max(1, cashFlowSeries.length - 1)) * 100;
      const y = 100 - ((v + barMax) / (barMax * 2)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s.key] = lead.stage === s.key ? 1 : 0;
    return acc;
  }, {});

  const bookingByType = {};
  const bookingBySource = {};
  bookingByType[lead.type || "Unspecified"] = 1;
  bookingBySource[lead.referralSource || "Unspecified"] = 1;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionLabel>Leads Dashboard</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "Lead Name", value: lead.name || "—", accent: G.gold },
            { label: "Open Quotes", value: String(openQuotes), accent: G.blue, tab: "quotes" },
            { label: "Accepted Quotes", value: String(acceptedCount), accent: G.green, tab: "quotes" },
            { label: "Pipeline Value", value: fmt$(totalQuoted), accent: G.amber, tab: "financials" },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => item.tab && onNavigate?.(item.tab)}
              style={{
                background: G.surface,
                border: `1px solid ${G.border}`,
                borderRadius: 8,
                padding: 12,
                cursor: item.tab ? "pointer" : "default",
              }}
            >
              <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.accent }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ cursor: "pointer" }} onClick={() => onNavigate?.("financials")}>
        <SectionLabel>Financial Outlook</SectionLabel>
        <div style={{ position: "relative", height: chartH, border: `1px solid ${G.border}`, borderRadius: 8, padding: "14px 10px 26px" }}>
          <div style={{ position: "absolute", inset: "14px 10px 26px", display: "flex", alignItems: "flex-end", gap: 6 }}>
            {financeSeries.map((m) => (
              <div key={m.key} style={{ flex: 1, display: "flex", gap: 2, alignItems: "flex-end", height: "100%" }} title={`${m.label} · Receipts ${fmt$(m.receipts)} · Invoiced ${fmt$(m.invoiced)} · Past Due ${fmt$(m.pastDue)}`}>
                <div style={{ width: "33%", height: `${Math.max(2, (m.receipts / barMax) * 100)}%`, background: "#16a085", borderRadius: "4px 4px 0 0" }} />
                <div style={{ width: "33%", height: `${Math.max(2, (m.invoiced / barMax) * 100)}%`, background: "#4fd1b8", borderRadius: "4px 4px 0 0" }} />
                <div style={{ width: "33%", height: `${Math.max(2, (m.pastDue / barMax) * 100)}%`, background: "#d14343", borderRadius: "4px 4px 0 0" }} />
              </div>
            ))}
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: "14px 10px 26px", width: "calc(100% - 20px)", height: `calc(100% - 40px)` }}>
            <polyline fill="none" stroke="#6b46c1" strokeWidth="1.3" points={linePoints} />
          </svg>
          <div style={{ position: "absolute", left: 10, right: 10, bottom: 6, display: "flex", justifyContent: "space-between" }}>
            {financeSeries.map((m) => (
              <div key={m.key} style={{ flex: 1, fontSize: 10, color: G.textMuted, textAlign: "center", whiteSpace: "nowrap" }}>
                {m.label.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10, fontSize: 12, color: G.textDim }}>
          <span>■ Receipts</span>
          <span>■ Invoiced</span>
          <span>■ Past Due</span>
          <span style={{ color: "#6b46c1" }}>━ Cash Flow</span>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ cursor: "pointer" }} onClick={() => onNavigate?.("financials")}>
          <SectionLabel>Accounting</SectionLabel>
          <div style={{ display: "grid", gap: 7 }}>
            <div style={{ fontSize: 13, color: G.text }}>
              Accounts Receivable: <span style={{ color: G.blue }}>Ledger, Aging</span>
            </div>
            <div style={{ fontSize: 13, color: G.text }}>
              Revenue Pipeline: <span style={{ color: G.blue }}>{fmt$(totalQuoted)}</span>
            </div>
            <div style={{ fontSize: 13, color: G.text }}>
              Past Due Exposure: <span style={{ color: G.red }}>{fmt$(financeSeries.reduce((s, m) => s + m.pastDue, 0))}</span>
            </div>
            <div style={{ fontSize: 12, color: G.textMuted }}>Click to open Financials tab</div>
          </div>
        </Card>

        <Card style={{ cursor: "pointer" }} onClick={() => onNavigate?.("schedule")}>
          <SectionLabel>Progress Reports</SectionLabel>
          <div style={{ display: "grid", gap: 7 }}>
            <div style={{ fontSize: 13, color: G.text }}>
              Lead & Job Progress by stage
            </div>
            {STAGES.map((s) => (
              <div key={s.key} style={{ fontSize: 13, color: G.textDim }}>
                • {s.key}: <span style={{ color: s.color }}>{stageCounts[s.key]}</span>
              </div>
            ))}
            <div style={{ fontSize: 12, color: G.textMuted }}>Click to open Schedule tab</div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ cursor: "pointer" }} onClick={() => onNavigate?.("quotes")}>
          <SectionLabel>Booking Trends</SectionLabel>
          <div style={{ display: "grid", gap: 7 }}>
            <div style={{ fontSize: 13, color: G.text }}>
              By Type:
              {Object.entries(bookingByType).map(([k, v]) => (
                <span key={k} style={{ marginLeft: 8, color: G.blue }}>
                  {k} ({v})
                </span>
              ))}
            </div>
            <div style={{ fontSize: 13, color: G.text }}>
              By Source:
              {Object.entries(bookingBySource).map(([k, v]) => (
                <span key={k} style={{ marginLeft: 8, color: G.blue }}>
                  {k} ({v})
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: G.textMuted }}>Click to open Quotes tab</div>
          </div>
        </Card>

        <Card style={{ cursor: "pointer" }} onClick={() => onNavigate?.("notes")}>
          <SectionLabel>Client Email Opens</SectionLabel>
          <InfoRow label="Total Email Opens" value={String(totalEmailOpens)} accent={G.blue} />
          <InfoRow label="Last Opened" value={lastOpenIso ? `${fmtShort(lastOpenIso)} ${fmtTime(lastOpenIso)}` : "No opens yet"} />
          <InfoRow label="Emails Sent" value={String((emailActivity || []).length)} />
          <div style={{ marginTop: 10, fontSize: 12, color: G.textDim }}>
            Tracks quote-link opens plus sent-email history per client.
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ cursor: schedule.length ? "pointer" : "default" }} onClick={() => schedule.length && onNavigate?.("schedule")}>
          <SectionLabel>Upcoming Schedule</SectionLabel>
          {schedule.length === 0 ? (
            <EmptyState icon="📅" text="No events scheduled" />
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {schedule.slice(0, 5).map((ev) => (
                <div key={ev.id} style={{ padding: "10px 12px", border: `1px solid ${G.border}`, borderRadius: 8, background: G.surface }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: G.textDim }}>{fmtShort(ev.date)} · {ev.time || "—"} · {ev.location || "—"}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card style={{ cursor: notes.length ? "pointer" : "default" }} onClick={() => notes.length && onNavigate?.("notes")}>
          <SectionLabel>Recent Notes</SectionLabel>
          {notes.length === 0 ? (
            <EmptyState icon="📝" text="No notes yet" />
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {notes.slice(0, 4).map((n) => (
                <div key={n.id} style={{ padding: "10px 12px", border: `1px solid ${G.border}`, borderRadius: 8, background: G.surface }}>
                  <div style={{ fontSize: 12, color: G.text }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: G.textMuted, marginTop: 4 }}>{fmtShort(n.date)} · {fmtTime(n.date)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function NotesTab({ notes, setNotes, emailActivity }) {
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

      <div
        style={{
          background: G.surface,
          border: `1px solid ${G.border}`,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: G.gold, marginBottom: 8 }}>
          Email Activity
        </div>
        {(!emailActivity || emailActivity.length === 0) ? (
          <div style={{ fontSize: 12, color: G.textMuted }}>No emails logged yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {emailActivity.slice(0, 8).map((e) => (
              <div
                key={e.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${G.border}`,
                  background: G.card,
                }}
              >
                <div style={{ fontSize: 12, color: G.text }}>
                  ✉ {e.kind || "Email"} to <span style={{ color: G.blue }}>{e.to}</span>
                </div>
                <div style={{ fontSize: 12, color: G.textDim, marginTop: 4 }}>
                  Subject: {e.subject || "—"}
                  {e.templateName ? ` · Template: ${e.templateName}` : ""}
                </div>
                <div style={{ fontSize: 11, color: G.textMuted, marginTop: 4 }}>
                  {fmtShort(e.date)} · {fmtTime(e.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
  const [screen, setScreen] = useState("lead"); // lead | dashboard
  const [activeTab, setActiveTab] = useState("overview");
  const [quotes, setQuotes] = useState(initial.quotes);
  const [recipients, setRecipients] = useState(initial.recipients);
  const [schedule, setSchedule] = useState(initial.schedule);
  const [payments, setPayments] = useState(initial.payments);
  const [contracts, setContracts] = useState(initial.contracts);
  const [files, setFiles] = useState(initial.files);
  const [templates, setTemplates] = useState(initial.templates || []);
  const [notes, setNotes] = useState(initial.notes);
  const [emailActivity, setEmailActivity] = useState(initial.emailActivity || []);
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
        templates,
        notes,
        emailActivity,
        settings,
        counters,
      })
    );
  }, [lead, quotes, recipients, schedule, payments, contracts, files, templates, notes, emailActivity, settings, counters]);

  useEffect(() => {
    const applyApprovedQuote = (row) => {
      if (!row || row.status !== "approved") return;
      const quoteId = String(row.quote_id || "");
      const quoteNumber = String(row.quote_number_label || "");

      setQuotes((prev) => {
        let changed = false;
        const next = prev.map((q) => {
          const byId = quoteId && String(q.id) === quoteId;
          const byNumber = quoteNumber && String(q.quoteNumberLabel) === quoteNumber;
          if ((byId || byNumber) && q.status !== "Accepted") {
            changed = true;
            return { ...q, status: "Accepted", updatedAt: new Date().toISOString() };
          }
          return q;
        });
        if (!changed) return prev;

        const acceptedRevenue = next
          .filter((q) => q.status === "Accepted")
          .reduce((sum, q) => sum + calcQuoteTotals(q).total, 0);
        const latestAccepted = next.find((q) => q.status === "Accepted");
        setLead((curr) => ({
          ...curr,
          revenue: acceptedRevenue,
          balance: latestAccepted ? calcQuoteTotals(latestAccepted).total : curr.balance,
        }));
        return next;
      });
    };

    const loadExistingApprovals = async () => {
      const { data, error } = await supabase
        .from("quote_approvals")
        .select("quote_id, quote_number_label, status")
        .eq("status", "approved")
        .order("updated_at", { ascending: false });
      if (error || !data) return;
      data.forEach(applyApprovedQuote);
    };

    loadExistingApprovals();
    const channel = supabase
      .channel("quote-approvals-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "quote_approvals" },
        (payload) => applyApprovedQuote(payload.new)
      )
      .subscribe();

    return () => {
      if (supabase.removeChannel) supabase.removeChannel(channel);
    };
  }, []);

  const quoteBadge = quotes.length;

  const [sidebarEmailLoading, setSidebarEmailLoading] = useState(false);
  const [sidebarToast, setSidebarToast] = useState(null);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [composer, setComposer] = useState({
    templateId: "",
    to: "",
    subject: "",
    body: "",
  });
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
    eventDate: "",
    location: "",
    referralSource: "",
    inquiredOn: new Date().toISOString().slice(0, 10),
    notes: "",
    scheduleTitle: "",
    scheduleDate: "",
    scheduleTime: "",
    scheduleLocation: "",
    scheduleStatus: "Tentative",
  });
  const emailTemplates = useMemo(
    () => (templates || []).filter((t) => t.type === "email"),
    [templates]
  );
  const firstQuote = quotes[0];

  const mergeEmailTemplate = (text = "") => {
    const quoteTotals = firstQuote ? calcQuoteTotals(firstQuote) : { total: lead.balance || 0 };
    const total = Number(quoteTotals.total || 0);
    const retainer = total > 0 ? total * 0.5 : 0;
    const map = {
      "{{client_name}}": lead.name || "",
      "{{service_type}}": lead.type || "",
      "{{package_name}}": firstQuote?.sections?.[0]?.packageName || lead.type || "",
      "{{package_tier}}": firstQuote?.eventName || "",
      "{{session_date}}": lead.eventDate ? fmtLong(lead.eventDate) : "",
      "{{session_time}}": firstQuote?.eventTime || "",
      "{{location}}": lead.location || "",
      "{{total_price}}": fmt$(total),
      "{{retainer_amount}}": fmt$(retainer),
      "{{balance_due}}": fmt$(Math.max(0, lead.balance || total - retainer)),
      "{{google_review_link}}": "https://g.page/r/CfYOURREVIEWLINK",
      "{{testimonial_incentive}}": "$50 credit",
      "{{current_package}}": firstQuote?.sections?.[0]?.packageName || "",
      "{{alternative_package}}": "Essential Collection",
      "{{alternative_price}}": "$2,800",
      "{{questionnaire_link}}":
        typeof window !== "undefined" ? `${window.location.origin}/client` : "",
      "{{client_email}}": lead.email || "",
      "{{session_type}}": lead.type || "",
      "{{total_amount}}": fmt$(Math.max(0, lead.balance || total)),
      "{{photographer_name}}": "Nico Salgado",
      "{{business_name}}": settings.businessName || "Nico Salgado Photography",
      "{{today_date}}": fmtLong(new Date().toISOString().slice(0, 10)),
    };

    let out = String(text || "");
    Object.entries(map).forEach(([k, v]) => {
      out = out.replaceAll(k, v ?? "");
    });
    return out;
  };

  const addEmailActivity = ({ to, subject, templateName, kind }) => {
    setEmailActivity((prev) => [
      {
        id: genId("email-log"),
        to: to || "",
        subject: subject || "",
        templateName: templateName || "",
        kind: kind || "Email",
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const applyTemplateToComposer = (tpl) => {
    if (!tpl) return;
    setComposer((prev) => ({
      ...prev,
      templateId: tpl.id,
      to: lead.email || prev.to || "",
      subject: mergeEmailTemplate(tpl.subject || `Message from ${settings.businessName || "Nico Salgado Photography"}`),
      body: mergeEmailTemplate(tpl.content || ""),
    }));
  };

  const openNewEmailComposer = () => {
    setEmailComposerOpen(true);
    if (emailTemplates.length) applyTemplateToComposer(emailTemplates[0]);
    else {
      setComposer({
        templateId: "",
        to: lead.email || "",
        subject: `Message from ${settings.businessName || "Nico Salgado Photography"}`,
        body: "",
      });
    }
  };

  const sendComposerEmail = async () => {
    if (!composer.to.trim() || !composer.subject.trim() || !composer.body.trim()) {
      setSidebarToast({ type: "error", message: "Email needs To, Subject, and Body." });
      return;
    }
    setEmailSending(true);
    setSidebarToast(null);
    try {
      const htmlBody = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#1f2937;">${escapeHtml(
        composer.body
      ).replace(/\n/g, "<br/>")}</div>`;
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composer.to.trim(),
          subject: composer.subject.trim(),
          htmlBody,
        }),
      });
      await parseApiResponse(res, "Failed to send email");
      const selectedTemplate = emailTemplates.find((t) => t.id === composer.templateId);
      addEmailActivity({
        to: composer.to.trim(),
        subject: composer.subject.trim(),
        templateName: selectedTemplate?.name || "",
        kind: "Template Email",
      });
      setSidebarToast({ type: "success", message: `Email sent to ${composer.to.trim()}` });
      setEmailComposerOpen(false);
    } catch (err) {
      setSidebarToast({ type: "error", message: err.message || "Failed to send email" });
    } finally {
      setEmailSending(false);
    }
  };

  const handleEmailQuote = async () => {
    if (!firstQuote || !lead.email) return;
    setSidebarEmailLoading(true);
    setSidebarToast(null);
    try {
      const totals = calcQuoteTotals(firstQuote);
      const sectionsHtml = (firstQuote.sections || [])
        .map((s) => {
          const itemsHtml = (s.lineItems || [])
            .map((item) => {
              const qty = toQty(item.qty);
              const price = toMoney(item.price);
              const lineTotal = price * qty;
              return `<tr>
                <td style="padding:6px 0;font-size:13px;">${escapeHtml(item.name || "")}</td>
                <td style="padding:6px 0;text-align:right;font-size:13px;">${escapeHtml(fmt$(price))} × ${qty}</td>
                <td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px;">${escapeHtml(fmt$(lineTotal))}</td>
              </tr>`;
            })
            .join("");
          const includesHtml = cleanIncludes(s.includes)
            .map((inc) => `<li style="margin:2px 0;">${escapeHtml(inc)}</li>`)
            .join("");
          return `<div style="margin-bottom:16px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px;">${escapeHtml(
              s.packageName || "Package"
            )}</div>
            ${
              includesHtml
                ? `<ul style="margin:6px 0 10px 18px;padding:0;font-size:12px;color:#555;">${includesHtml}</ul>`
                : ""
            }
            <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
          </div>`;
        })
        .join("");

      const htmlBody = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;">
  <div style="background:#0e0f11;padding:24px 28px;border-radius:12px 12px 0 0;">
    <div style="font-size:18px;font-weight:800;color:#d4a853;">Nico Salgado Photography</div>
    <div style="font-size:12px;color:#9b9a97;margin-top:4px;">30317 Glenmuer · Farmington Hills, MI 48334</div>
  </div>
  <div style="background:#ffffff;padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 12px 12px;">
    <h2 style="margin:0 0 4px;font-size:18px;">Quote ${escapeHtml(firstQuote.quoteNumberLabel || "")}</h2>
    <p style="color:#666;font-size:13px;margin:0 0 20px;">Prepared for ${escapeHtml(firstQuote.clientName || lead.name || "you")}</p>
    ${firstQuote.introduction ? `<p style="font-size:13px;color:#444;line-height:1.6;margin-bottom:20px;">${escapeHtml(firstQuote.introduction)}</p>` : ""}
    ${sectionsHtml}
    <div style="border-top:2px solid #1a1a1a;padding-top:12px;margin-top:16px;">
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;"><span>Total</span><span>${escapeHtml(fmt$(totals.total))}</span></div>
    </div>
    ${firstQuote.notes ? `<p style="margin-top:16px;font-size:12px;color:#666;border-top:1px solid #eee;padding-top:12px;">${escapeHtml(firstQuote.notes)}</p>` : ""}
    ${firstQuote.expiration ? `<p style="margin-top:12px;font-size:12px;color:#999;">This quote expires on ${escapeHtml(fmtShort(firstQuote.expiration))}.</p>` : ""}
    <p style="margin-top:24px;font-size:12px;color:#999;text-align:center;">Questions? Reply to this email or text Nico directly.</p>
  </div>
</div>`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead.email,
          subject: `Quote ${firstQuote.quoteNumberLabel || ""} - Nico Salgado Photography`.trim(),
          htmlBody,
        }),
      });
      await parseApiResponse(res, "Failed to send");

      // Update quote status to Sent
      if (firstQuote.status === "Draft") {
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === firstQuote.id
              ? { ...q, status: "Sent", updatedAt: new Date().toISOString() }
              : q
          )
        );
      }
      addEmailActivity({
        to: lead.email,
        subject: `Quote ${firstQuote.quoteNumberLabel || ""} - Nico Salgado Photography`.trim(),
        templateName: "Latest Quote Email",
        kind: "Quote Email",
      });
      setSidebarToast({ type: "success", message: `Quote emailed to ${lead.email}` });
    } catch (err) {
      setSidebarToast({ type: "error", message: err.message });
    }
    setSidebarEmailLoading(false);
  };

  const handlePdf = () => {
    if (quotes[0]) openPrintWindow(quoteToPrintableHtml(quotes[0], settings));
  };

  const handleResetActivity = () => {
    setQuotes((prev) => prev.map((q) => ({ ...q, lastViewed: null, pageViews: 0 })));
  };

  const handleNewClient = () => {
    setNewClientForm({
      name: "",
      email: "",
      phone: "",
      type: "",
      eventDate: "",
      location: "",
      referralSource: "",
      inquiredOn: new Date().toISOString().slice(0, 10),
      notes: "",
      scheduleTitle: "",
      scheduleDate: "",
      scheduleTime: "",
      scheduleLocation: "",
      scheduleStatus: "Tentative",
    });
    setNewClientOpen(true);
  };

  const handleCreateClientAndContinue = () => {
    if (!newClientForm.name.trim()) {
      setSidebarToast({ type: "error", message: "Client name is required." });
      return;
    }
    const createdLead = {
      id: Date.now(),
      name: newClientForm.name.trim(),
      email: newClientForm.email.trim(),
      phone: newClientForm.phone.trim(),
      type: newClientForm.type.trim(),
      stage: newClientForm.scheduleStatus === "Booked" ? "Booked" : "Lead",
      revenue: 0,
      balance: 0,
      eventDate: newClientForm.eventDate || "",
      location: newClientForm.location.trim(),
      referralSource: newClientForm.referralSource.trim(),
      inquiredOn: newClientForm.inquiredOn || new Date().toISOString().slice(0, 10),
      notes: newClientForm.notes || "",
    };

    const initialSchedule = newClientForm.scheduleTitle.trim()
      ? [
          {
            id: Date.now() + 1,
            title: newClientForm.scheduleTitle.trim(),
            date: newClientForm.scheduleDate || newClientForm.eventDate || "",
            time: newClientForm.scheduleTime || "",
            endTime: "",
            location: newClientForm.scheduleLocation.trim() || newClientForm.location.trim(),
            status: newClientForm.scheduleStatus || "Tentative",
            notes: "",
          },
        ]
      : [];

    setLead(createdLead);
    setQuotes([]);
    setRecipients([]);
    setSchedule(initialSchedule);
    setPayments([]);
    setContracts([]);
    setFiles([]);
    setNotes([]);
    setEmailActivity([]);
    setScreen("lead");
    setActiveTab("quotes");
    setNewClientOpen(false);
    setSidebarToast({
      type: "success",
      message: `Created client: ${createdLead.name}. Continue in Quotes & Orders.`,
    });
  };

  const handleDeleteLead = () => {
    if (!window.confirm("Delete local lead data for this page?")) return;
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const goToTab = (tabKey) => {
    setActiveTab(tabKey);
    setScreen("lead");
  };

  const SIDEBAR_ACTIONS = [
    { label: "+ New Client", variant: "secondary", onClick: handleNewClient },
    {
      label: screen === "dashboard" ? "→ Open Lead Workspace" : "← Return to Leads Dashboard",
      variant: "primary",
      onClick: () => setScreen((prev) => (prev === "dashboard" ? "lead" : "dashboard")),
    },
    { label: "✉ New Email", variant: "secondary", onClick: openNewEmailComposer },
    { label: sidebarEmailLoading ? "Sending..." : "✉ Email Latest Quote", variant: "secondary", onClick: handleEmailQuote, disabled: sidebarEmailLoading },
    { label: "View / Print PDF", variant: "secondary", onClick: handlePdf },
    { label: "Reset Client Activity", variant: "secondary", onClick: handleResetActivity },
    { label: "Revision History", variant: "secondary", onClick: () => goToTab("notes") },
    { label: "Delete", variant: "danger", onClick: handleDeleteLead },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab lead={lead} setLead={setLead} quotes={quotes} />;
      case "schedule":
        return <ScheduleTab schedule={schedule} setSchedule={setSchedule} lead={lead} />;
      case "quotes":
        return (
          <QuotesTab
            lead={lead}
            setLead={setLead}
            quotes={quotes}
            setQuotes={setQuotes}
            recipients={recipients}
            setRecipients={setRecipients}
            templates={templates}
            settings={settings}
            counters={counters}
            setCounters={setCounters}
          />
        );
      case "financials":
        return (
          <FinancialsTab
            payments={payments}
            setPayments={setPayments}
            quotes={quotes}
            lead={lead}
            settings={settings}
          />
        );
      case "contracts":
        return (
          <ContractsTab
            contracts={contracts}
            setContracts={setContracts}
            lead={lead}
            settings={settings}
          />
        );
      case "templates":
        return <TemplatesTab templates={templates} setTemplates={setTemplates} />;
      case "notes":
        return <NotesTab notes={notes} setNotes={setNotes} emailActivity={emailActivity} />;
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
          <div style={{ marginBottom: 12 }}>
            <img
              src={settings.logoUrl || "/nsp-logo.jpg"}
              alt={settings.businessName || "Nico Salgado Photography"}
              style={{
                maxHeight: 56,
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
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
              onClick={() => goToTab(t.key)}
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
          minHeight: "calc(100vh - 126px)",
        }}
      >
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          {screen === "dashboard" ? (
            <DashboardView
              lead={lead}
              quotes={quotes}
              schedule={schedule}
              notes={notes}
              emailActivity={emailActivity}
              onNavigate={goToTab}
            />
          ) : (
            renderTab()
          )}
        </div>

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
            <Btn key={i} variant={a.variant} full small onClick={a.onClick} disabled={a.disabled}>
              {a.label}
            </Btn>
          ))}
        </div>
      </div>

      {newClientOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 5100,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(960px, 96vw)",
              background: G.card,
              border: `1px solid ${G.borderLight}`,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <SectionLabel
              actions={
                <Btn variant="ghost" small onClick={() => setNewClientOpen(false)}>
                  Cancel
                </Btn>
              }
            >
              New Client Intake
            </SectionLabel>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              <div>
                <Card style={{ padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Job Profile</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <InputField
                      label="Client Name"
                      value={newClientForm.name}
                      onChange={(e) => setNewClientForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <InputField
                      label="Email"
                      value={newClientForm.email}
                      onChange={(e) => setNewClientForm((p) => ({ ...p, email: e.target.value }))}
                    />
                    <InputField
                      label="Phone"
                      value={newClientForm.phone}
                      onChange={(e) => setNewClientForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                    <InputField
                      label="Job Type"
                      value={newClientForm.type}
                      onChange={(e) => setNewClientForm((p) => ({ ...p, type: e.target.value }))}
                    />
                    <InputField
                      label="Job Date"
                      type="date"
                      value={newClientForm.eventDate}
                      onChange={(e) => setNewClientForm((p) => ({ ...p, eventDate: e.target.value }))}
                    />
                    <InputField
                      label="Lead Inquired On"
                      type="date"
                      value={newClientForm.inquiredOn}
                      onChange={(e) => setNewClientForm((p) => ({ ...p, inquiredOn: e.target.value }))}
                    />
                    <InputField
                      label="Source"
                      value={newClientForm.referralSource}
                      onChange={(e) =>
                        setNewClientForm((p) => ({ ...p, referralSource: e.target.value }))
                      }
                    />
                    <InputField
                      label="Location"
                      value={newClientForm.location}
                      onChange={(e) => setNewClientForm((p) => ({ ...p, location: e.target.value }))}
                    />
                  </div>
                  <InputField
                    label="Lead Notes"
                    value={newClientForm.notes}
                    onChange={(e) => setNewClientForm((p) => ({ ...p, notes: e.target.value }))}
                    multiline
                  />
                </Card>

                <Card style={{ padding: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Schedule</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 10 }}>
                    <InputField
                      label="Event Title"
                      value={newClientForm.scheduleTitle}
                      onChange={(e) =>
                        setNewClientForm((p) => ({ ...p, scheduleTitle: e.target.value }))
                      }
                    />
                    <InputField
                      label="Date"
                      type="date"
                      value={newClientForm.scheduleDate}
                      onChange={(e) =>
                        setNewClientForm((p) => ({ ...p, scheduleDate: e.target.value }))
                      }
                    />
                    <InputField
                      label="Time"
                      value={newClientForm.scheduleTime}
                      onChange={(e) =>
                        setNewClientForm((p) => ({ ...p, scheduleTime: e.target.value }))
                      }
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
                        value={newClientForm.scheduleStatus}
                        onChange={(e) =>
                          setNewClientForm((p) => ({ ...p, scheduleStatus: e.target.value }))
                        }
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
                        <option value="Tentative">Tentative</option>
                        <option value="Booked">Booked</option>
                        <option value="Confirmed">Confirmed</option>
                      </select>
                    </div>
                  </div>
                  <InputField
                    label="Event Location (optional)"
                    value={newClientForm.scheduleLocation}
                    onChange={(e) =>
                      setNewClientForm((p) => ({ ...p, scheduleLocation: e.target.value }))
                    }
                  />
                </Card>
              </div>

              <Card style={{ padding: 14, height: "fit-content" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Workflow</div>
                <div style={{ fontSize: 12, color: G.textDim, lineHeight: 1.6, marginBottom: 12 }}>
                  Fill client details and schedule first, then continue directly into Quotes &
                  Orders to build and send approval.
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <Btn variant="ghost" small onClick={() => setNewClientOpen(false)} full>
                    Cancel
                  </Btn>
                  <Btn small onClick={handleCreateClientAndContinue} full>
                    Save & Continue to Quotes
                  </Btn>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {emailComposerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            zIndex: 5000,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(840px, 95vw)",
              background: G.card,
              border: `1px solid ${G.borderLight}`,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <SectionLabel
              actions={
                <Btn variant="ghost" small onClick={() => setEmailComposerOpen(false)}>
                  Close
                </Btn>
              }
            >
              New Email for {lead.name}
            </SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                  Template
                </label>
                <select
                  value={composer.templateId}
                  onChange={(e) => {
                    const tpl = emailTemplates.find((t) => t.id === e.target.value);
                    if (tpl) applyTemplateToComposer(tpl);
                  }}
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
                  {emailTemplates.length === 0 ? (
                    <option value="">No email templates found</option>
                  ) : (
                    emailTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <InputField
                label="To"
                value={composer.to}
                onChange={(e) => setComposer((p) => ({ ...p, to: e.target.value }))}
                placeholder="client@email.com"
              />
            </div>
            <InputField
              label="Subject"
              value={composer.subject}
              onChange={(e) => setComposer((p) => ({ ...p, subject: e.target.value }))}
            />
            <InputField
              label="Body"
              value={composer.body}
              onChange={(e) => setComposer((p) => ({ ...p, body: e.target.value }))}
              multiline
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 11, color: G.textMuted }}>
                Merge tags in templates auto-fill from this client profile.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="ghost" small onClick={() => setEmailComposerOpen(false)}>
                  Cancel
                </Btn>
                <Btn small onClick={sendComposerEmail} disabled={emailSending}>
                  {emailSending ? "Sending..." : "Send Email"}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
