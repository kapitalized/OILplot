export const BRAND = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Oilplot",
  logo: "/logo.png",
  retroReferenceImage: "/branding-retro-reference.webp",
  colors: {
    paleBlue: "#A5C2D0",
    cream: "#F2EBD4",
    ink: "#3E322D",
    yellow: "#F8C43F",
    amber: "#F2A83A",
    burnt: "#F27D3B",
    coral: "#F14A42",
    primary: "#F14A42",
    secondary: "#3E322D",
  },
  slogan: "Large oil datasets for visual analysis. Run your own insights.",
  tagline: "Open Energy Intelligence",
} as const;
