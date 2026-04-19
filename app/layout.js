import "./globals.css";
export const metadata = {
  title: "NSP Business Suite — NSP Suite",
  description: "Lead tracking, proposals, contracts, invoicing, scheduling, and financial reporting for NSP Suite.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
