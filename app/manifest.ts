import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DTF Acabamentos",
    short_name: "DTF",
    description: "Sistema Comercial DTF Acabamentos",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#18181B",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
