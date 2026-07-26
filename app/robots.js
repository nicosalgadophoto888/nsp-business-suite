export default function robots() {
  const siteUrl = "https://www.nicosalgadophotography.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/client", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
