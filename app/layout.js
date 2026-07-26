import "./globals.css";

const siteUrl = "https://www.nicosalgadophotography.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nico Salgado Photography",
    template: "%s | Nico Salgado Photography",
  },
  description:
    "Nico Salgado Photography, based in Farmington Hills, Michigan — wedding, event, and portrait photography with online proposals, contracts, and invoicing for clients.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Nico Salgado Photography",
    title: "Nico Salgado Photography",
    description:
      "Wedding, event, and portrait photography based in Farmington Hills, Michigan.",
    images: [{ url: "/nsp-logo.jpg" }],
  },
  twitter: {
    card: "summary",
    title: "Nico Salgado Photography",
    description:
      "Wedding, event, and portrait photography based in Farmington Hills, Michigan.",
    images: ["/nsp-logo.jpg"],
  },
  icons: {
    icon: "/nsp-logo.jpg",
    apple: "/nsp-logo.jpg",
  },
};

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Nico Salgado Photography",
  image: `${siteUrl}/nsp-logo.jpg`,
  url: siteUrl,
  email: "nicosalgadophoto@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "30317 Glenmuer",
    addressLocality: "Farmington Hills",
    addressRegion: "MI",
    postalCode: "48334",
    addressCountry: "US",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
