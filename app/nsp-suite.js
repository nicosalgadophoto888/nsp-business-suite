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
  { key: "clients", label: "Clients" },
  { key: "schedule", label: "Schedule" },
  { key: "quotes", label: "Quotes & Orders" },
  { key: "financials", label: "Financials" },
  { key: "contracts", label: "Contracts" },
  { key: "templates", label: "Templates" },
  { key: "notes", label: "Notes" },
  { key: "files", label: "Files" },
  { key: "reports", label: "Reports" },
];

const WORKSPACE_TABLE = "crm_workspaces";
const CLIENTS_TABLE = "clients";
const QUOTES_TABLE = "quotes";
const SESSIONS_TABLE = "sessions";
const TEMPLATES_TABLE = "templates";

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
