import type { ThemePack } from "@/lib/themes/schema";

export const defaultTheme: ThemePack = {
  schemaVersion: "0.1",
  name: "Moonlit Archive",
  slug: "moonlit-archive",
  tokens: {
    color: {
      background: "#101014",
      surface: "#181820",
      surfaceAlt: "#1e1e28",
      text: "#F3F0E8",
      muted: "#A5A0B5",
      accent: "#D6B86A",
      border: "#2a2a35"
    },
    radius: {
      sm: "6px",
      md: "8px",
      lg: "12px"
    },
    typography: {
      display: "serif",
      body: "sans"
    }
  },
  chat: {
    bubbleStyle: "soft_panel",
    avatarFrame: "ornament",
    messageDensity: "comfortable"
  },
  assets: {
    background: null,
    ambient: null
  },
  variants: {
    calm: {
      color: {
        background: "#101014",
        surface: "#181820",
        text: "#F3F0E8",
        muted: "#A5A0B5",
        accent: "#D6B86A"
      },
      radius: {},
      typography: {}
    },
    mystery: {
      color: {
        background: "#0e0e16",
        surface: "#16162a",
        text: "#E8E0F0",
        muted: "#8A80A0",
        accent: "#9B7FD4"
      },
      radius: {},
      typography: {}
    },
    night: {
      color: {
        background: "#0a0a10",
        surface: "#12121c",
        text: "#E0DDD5",
        muted: "#7A7590",
        accent: "#C4A850"
      },
      radius: {},
      typography: {}
    }
  },
  metadata: {
    source: "original_development_fixture",
    license: "MIT",
    tags: ["dark", "archive", "default"],
    language: "en"
  }
};
