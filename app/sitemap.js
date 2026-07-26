export default function sitemap() {
  const siteUrl = "https://www.nicosalgadophotography.com";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
