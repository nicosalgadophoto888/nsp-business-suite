"use client";

import { useRouter } from "next/navigation";

const leads = [
  {
    id: 1,
    name: "Camila & David",
    type: "Wedding",
    eventDate: "2026-06-14",
    stage: "Booked",
  },
  {
    id: 2,
    name: "Aaliyah Fontaine",
    type: "Personal Branding",
    eventDate: "2026-05-18",
    stage: "Lead",
  },
  {
    id: 3,
    name: "Detroit Metro Hospital",
    type: "Corporate Headshots",
    eventDate: "2026-04-22",
    stage: "Fulfillment",
  },
];

export default function Page() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0c0d0f",
        color: "#e8e6e3",
        padding: 32,
        fontFamily: "DM Sans, Segoe UI, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>
              NSP Business Suite
            </h1>
            <div style={{ color: "#9b9a97", marginTop: 6 }}>
              Main leads page
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => router.push(`/leads/${lead.id}`)}
              style={{
                textAlign: "left",
                width: "100%",
                background: "#191b1e",
                color: "#e8e6e3",
                border: "1px solid #2a2d31",
                borderRadius: 12,
                padding: 18,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {lead.name}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      color: "#9b9a97",
                      fontSize: 13,
                    }}
                  >
                    {lead.type} · {lead.eventDate}
                  </div>
                </div>
                <div style={{ color: "#d4a853", fontWeight: 700 }}>
                  {lead.stage}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
