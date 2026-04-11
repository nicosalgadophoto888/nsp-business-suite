import { Suspense } from "react";
import PortalClientPage from "./portal-client";

function PortalFallback() {
  return (
    <div style={{ background: "#f7f5f0", minHeight: "100vh", padding: "24px 20px" }}>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          borderRadius: 12,
          overflow: "hidden",
          background: "#ffffff",
          border: "1px solid #e4ddd2",
        }}
      >
        <div
          style={{
            background: "#1f2937",
            color: "#b48a3a",
            padding: "22px 28px",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          Nico Salgado Photography
        </div>
        <div style={{ padding: "28px", color: "#7f8794", fontSize: 16 }}>Loading your portal...</div>
      </div>
    </div>
  );
}

export default function PortalPage({ params }) {
  // Pass the ID to the client component
  return (
    <Suspense fallback={<PortalFallback />}>
      <PortalClientPage id={params.id} />
    </Suspense>
  );
}
