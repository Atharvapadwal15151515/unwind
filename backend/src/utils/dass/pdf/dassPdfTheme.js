export const DASS_PDF_THEME = {
  app: {
    name: "UNWIND",
    reportTitle: "DASS-21 Assessment Report",
    version: "1.0"
  },

  page: {
    size: "A4",
    margin: 45,

    headerHeight: 95,
    footerHeight: 55,

    contentTop: 105,
    contentBottomPadding: 70
  },

  fonts: {
    title: "Helvetica-Bold",
    heading: "Helvetica-Bold",
    subHeading: "Helvetica-Bold",
    body: "Helvetica",
    bodyBold: "Helvetica-Bold",
    italic: "Helvetica-Oblique"
  },

  fontSizes: {
    coverTitle: 28,
    pageTitle: 20,
    heading: 17,
    subHeading: 13,

    largeNumber: 28,
    score: 24,

    body: 9,
    small: 8,
    tiny: 7
  },

  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 36
  },

  colors: {
    primary: "#7C3AED",
    secondary: "#EC4899",

    depression: "#8B5CF6",
    anxiety: "#F97316",
    stress: "#06B6D4",

    success: "#16A34A",
    warning: "#CA8A04",
    danger: "#DC2626",

    blue: "#2563EB",
    cyan: "#0891B2",
    teal: "#0F766E",
    orange: "#EA580C",

    dark: "#0F172A",
    heading: "#1E293B",
    text: "#334155",
    muted: "#64748B",

    white: "#FFFFFF",

    background: "#F8FAFC",
    border: "#E2E8F0",

    lightPurple: "#F5F3FF",
    lightPink: "#FDF2F8",
    lightOrange: "#FFF7ED",
    lightBlue: "#EFF6FF",
    lightCyan: "#ECFEFF",
    lightGreen: "#F0FDF4",
    lightYellow: "#FEFCE8",
    lightRed: "#FFF1F2"
  },

  severity: {
    normal: {
      text: "#15803D",
      background: "#DCFCE7",
      border: "#86EFAC"
    },

    mild: {
      text: "#4D7C0F",
      background: "#ECFCCB",
      border: "#BEF264"
    },

    moderate: {
      text: "#A16207",
      background: "#FEF9C3",
      border: "#FDE047"
    },

    severe: {
      text: "#C2410C",
      background: "#FFEDD5",
      border: "#FDBA74"
    },

    extremelySevere: {
      text: "#B91C1C",
      background: "#FEE2E2",
      border: "#FCA5A5"
    }
  },

  cards: {
    shadowOpacity: 0.05,

    default: {
      radius: 14,
      borderWidth: 1
    },

    score: {
      width: 160,
      height: 150
    },

    chart: {
      radius: 16
    }
  },

  charts: {
    scoreMax: 42,

    radar: {
      radius: 90
    },

    donut: {
      outerRadius: 70,
      innerRadius: 38
    },

    lineChart: {
      height: 220
    },

    barChart: {
      height: 220
    }
  },

  icons: {
    size: 18,
    circleRadius: 16
  }
};

export default DASS_PDF_THEME;