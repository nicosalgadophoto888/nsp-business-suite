import { Suspense } from "react";
import ClientPageContent from "./page-content";

export const metadata = {
  title: "Client Document",
  robots: { index: false, follow: false },
};

function ClientFallback() {
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
        <div style={{ padding: "28px", color: "#6b7280", fontSize: 16 }}>Loading document...</div>
      </div>
    </div>
  );
}

export default function ClientPage() {
  return (
    <Suspense fallback={<ClientFallback />}>
      <ClientPageContent />
    </Suspense>
  );
}

