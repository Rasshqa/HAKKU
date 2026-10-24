import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HAKKU: Digital Legal Companion",
    short_name: "HAKKU",
    description:
      "Platform pendamping hukum digital untuk masyarakat Indonesia. Ceritakan masalah dengan bahasa sehari-hari, dapatkan klarifikasi terstruktur, ringkasan fakta, informasi hukum berbasis sumber, dan checklist persiapan.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F9FA",
    theme_color: "#1B365D",
    icons: [
      {
        src: "/HakkuIcon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
