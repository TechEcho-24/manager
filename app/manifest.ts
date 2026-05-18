import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pinglly CRM",
    short_name: "Pinglly",
    description: "Pinglly - The smartest CRM for your business",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ff6b35",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
