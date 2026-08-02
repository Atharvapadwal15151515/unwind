import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(
  import.meta.url
);

const __dirname = path.dirname(
  __filename
);

const COLORS = {
  purple: "#7C3AED",
  violet: "#8B5CF6",
  pink: "#EC4899",
  rose: "#F43F5E",
  orange: "#F97316",
  yellow: "#FACC15",
  cyan: "#06B6D4",
  teal: "#14B8A6",
  blue: "#3B82F6",

  dark: "#0F172A",
  text: "#1E293B",
  muted: "#64748B",
  lightText: "#F8FAFC",
  white: "#FFFFFF",

  lightPurple: "#F5F3FF",
  lightPink: "#FDF2F8",
  lightBlue: "#EFF6FF",
  lightCyan: "#ECFEFF",
  lightOrange: "#FFF7ED",
  border: "#E2E8F0"
};

function safeText(value, fallback = "Not available") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return safeText(value);
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}

function formatLevel(value) {
  return safeText(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getPageDimensions(doc) {
  return {
    width: doc.page.width,
    height: doc.page.height
  };
}

function drawBackground(doc) {
  const { width, height } =
    getPageDimensions(doc);

  doc
    .save()
    .rect(0, 0, width, height)
    .fillColor("#FCFAFF")
    .fill()
    .restore();

  /*
    Large decorative background circles
  */
  doc
    .save()
    .fillOpacity(0.13)
    .circle(
      width - 35,
      50,
      150
    )
    .fillColor(COLORS.pink)
    .fill()
    .circle(
      20,
      height - 20,
      145
    )
    .fillColor(COLORS.cyan)
    .fill()
    .restore();

  /*
    Smaller decorative bubbles
  */
  const bubbles = [
    {
      x: 60,
      y: 130,
      radius: 9,
      color: COLORS.yellow
    },
    {
      x: width - 72,
      y: 180,
      radius: 13,
      color: COLORS.orange
    },
    {
      x: 85,
      y: height - 170,
      radius: 14,
      color: COLORS.purple
    },
    {
      x: width - 98,
      y: height - 130,
      radius: 8,
      color: COLORS.teal
    }
  ];

  bubbles.forEach((bubble) => {
    doc
      .save()
      .fillOpacity(0.8)
      .circle(
        bubble.x,
        bubble.y,
        bubble.radius
      )
      .fillColor(bubble.color)
      .fill()
      .restore();
  });
}

function drawGradientHeader(doc) {
  const { width } =
    getPageDimensions(doc);

  /*
    PDFKit does not support CSS gradients.
    These overlapping color blocks create
    a gradient-like vibrant header.
  */
  const segments = [
    COLORS.purple,
    COLORS.violet,
    COLORS.pink,
    COLORS.rose,
    COLORS.orange
  ];

  const segmentWidth =
    width / segments.length;

  segments.forEach(
    (color, index) => {
      doc
        .save()
        .rect(
          index * segmentWidth,
          0,
          segmentWidth + 1,
          210
        )
        .fillColor(color)
        .fill()
        .restore();
    }
  );

  /*
    Transparent overlay for a smoother look
  */
  doc
    .save()
    .fillOpacity(0.13)
    .circle(
      width - 60,
      55,
      145
    )
    .fillColor(COLORS.white)
    .fill()
    .circle(
      60,
      195,
      95
    )
    .fillColor(COLORS.white)
    .fill()
    .restore();

  /*
    Wave-like lower edge
  */
  doc
    .save()
    .moveTo(0, 175)
    .bezierCurveTo(
      width * 0.25,
      230,
      width * 0.65,
      180,
      width,
      218
    )
    .lineTo(width, 240)
    .lineTo(0, 240)
    .closePath()
    .fillColor("#FCFAFF")
    .fill()
    .restore();
}

function getLogoPath() {
  return path.join(
    __dirname,
    "assets",
    "unwind-logo.png"
  );
}

function drawLogo(doc) {
  const { width } =
    getPageDimensions(doc);

  const logoPath =
    getLogoPath();

  if (fs.existsSync(logoPath)) {
    doc.image(
      logoPath,
      width / 2 - 37,
      24,
      {
        fit: [74, 74],
        align: "center"
      }
    );

    return;
  }

  /*
    Fallback logo when no image exists
  */
  const centerX = width / 2;
  const centerY = 58;

  doc
    .save()
    .circle(
      centerX,
      centerY,
      34
    )
    .fillColor(COLORS.white)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.purple)
    .font("Helvetica-Bold")
    .fontSize(29)
    .text(
      "U",
      centerX - 20,
      centerY - 17,
      {
        width: 40,
        align: "center"
      }
    );
}

function drawTitle(doc) {
  const { width } =
    getPageDimensions(doc);

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(
      "UNWIND",
      45,
      100,
      {
        width: width - 90,
        align: "center",
        characterSpacing: 2
      }
    );

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(
      "DASS-21 Assessment Report",
      45,
      136,
      {
        width: width - 90,
        align: "center"
      }
    );

  doc
    .fillColor("#FDF4FF")
    .font("Helvetica")
    .fontSize(9.5)
    .text(
      "A visual summary of depression, anxiety and stress screening results",
      70,
      166,
      {
        width: width - 140,
        align: "center",
        lineGap: 2
      }
    );
}

function drawInformationCard(
  doc,
  assessment,
  report
) {
  const { width } =
    getPageDimensions(doc);

  const cardX = 48;
  const cardY = 246;
  const cardWidth = width - 96;
  const cardHeight = 118;

  doc
    .save()
    .roundedRect(
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      18
    )
    .fillColor(COLORS.white)
    .fill()
    .strokeColor("#E9D5FF")
    .lineWidth(1.2)
    .stroke()
    .restore();

  doc
    .fillColor(COLORS.purple)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "Assessment Information",
      cardX + 20,
      cardY + 17
    );

  const completedAt =
    assessment?.completed_at ??
    assessment?.submitted_at ??
    report?.generated_at;

  const reportReference =
    report?.report_id ??
    assessment?.assessment_id;

  const details = [
    {
      label: "Completed",
      value: formatDate(completedAt)
    },
    {
      label: "Assessment type",
      value: "DASS-21"
    },
    {
      label: "Report reference",
      value: safeText(
        reportReference,
        "Generated report"
      )
    }
  ];

  details.forEach(
    (detail, index) => {
      const rowY =
        cardY + 48 + index * 20;

      doc
        .fillColor(COLORS.muted)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
          `${detail.label}:`,
          cardX + 20,
          rowY,
          {
            width: 105
          }
        );

      doc
        .fillColor(COLORS.text)
        .font("Helvetica")
        .fontSize(8)
        .text(
          detail.value,
          cardX + 127,
          rowY,
          {
            width:
              cardWidth - 150,
            ellipsis: true
          }
        );
    }
  );
}

function getSeverityStyle(level) {
  const normalized = safeText(
    level,
    ""
  )
    .replaceAll("_", " ")
    .toLowerCase();

  const styles = {
    normal: {
      color: "#16A34A",
      background: "#DCFCE7"
    },
    mild: {
      color: "#65A30D",
      background: "#ECFCCB"
    },
    moderate: {
      color: "#CA8A04",
      background: "#FEF9C3"
    },
    severe: {
      color: "#EA580C",
      background: "#FFEDD5"
    },
    "extremely severe": {
      color: "#DC2626",
      background: "#FEE2E2"
    }
  };

  return (
    styles[normalized] ?? {
      color: COLORS.muted,
      background: "#F1F5F9"
    }
  );
}

function drawScoreCard(
  doc,
  {
    x,
    y,
    width,
    height,
    title,
    score,
    level,
    color,
    background
  }
) {
  doc
    .save()
    .roundedRect(
      x,
      y,
      width,
      height,
      16
    )
    .fillColor(background)
    .fill()
    .strokeColor(color)
    .lineWidth(1)
    .stroke()
    .restore();

  /*
    Colored top accent
  */
  doc
    .save()
    .roundedRect(
      x,
      y,
      width,
      13,
      8
    )
    .fillColor(color)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      title,
      x + 12,
      y + 25,
      {
        width: width - 24,
        align: "center"
      }
    );

  doc
    .fillColor(color)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(
      safeText(score, "0"),
      x + 10,
      y + 49,
      {
        width: width - 20,
        align: "center"
      }
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(7)
    .text(
      "out of 42",
      x + 10,
      y + 77,
      {
        width: width - 20,
        align: "center"
      }
    );

  const style =
    getSeverityStyle(level);

  const badgeWidth =
    width - 28;
  const badgeX =
    x + 14;
  const badgeY =
    y + height - 34;

  doc
    .save()
    .roundedRect(
      badgeX,
      badgeY,
      badgeWidth,
      20,
      10
    )
    .fillColor(
      style.background
    )
    .fill()
    .restore();

  doc
    .fillColor(style.color)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(
      formatLevel(level),
      badgeX + 4,
      badgeY + 6,
      {
        width:
          badgeWidth - 8,
        align: "center"
      }
    );
}

function drawScoreSummary(
  doc,
  result
) {
  const { width } =
    getPageDimensions(doc);

  const sectionY = 389;

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(
      "Your Score Snapshot",
      48,
      sectionY,
      {
        width: width - 96,
        align: "center"
      }
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      "Each category is measured separately and should not be combined into one diagnostic score.",
      70,
      sectionY + 24,
      {
        width: width - 140,
        align: "center"
      }
    );

  const cardsY = sectionY + 55;
  const gap = 12;
  const totalWidth = width - 96;
  const cardWidth =
    (totalWidth - gap * 2) / 3;
  const cardHeight = 130;

  const cards = [
    {
      title: "Depression",
      score:
        result?.depression_score,
      level:
        result?.depression_level,
      color: COLORS.purple,
      background:
        COLORS.lightPurple
    },
    {
      title: "Anxiety",
      score:
        result?.anxiety_score,
      level:
        result?.anxiety_level,
      color: COLORS.orange,
      background:
        COLORS.lightOrange
    },
    {
      title: "Stress",
      score:
        result?.stress_score,
      level:
        result?.stress_level,
      color: COLORS.cyan,
      background:
        COLORS.lightCyan
    }
  ];

  cards.forEach(
    (card, index) => {
      drawScoreCard(doc, {
        ...card,
        x:
          48 +
          index *
            (cardWidth + gap),
        y: cardsY,
        width: cardWidth,
        height: cardHeight
      });
    }
  );
}

function drawIntroduction(doc) {
  const { width } =
    getPageDimensions(doc);

  const x = 48;
  const y = 620;
  const boxWidth = width - 96;
  const boxHeight = 93;

  doc
    .save()
    .roundedRect(
      x,
      y,
      boxWidth,
      boxHeight,
      16
    )
    .fillColor("#EFF6FF")
    .fill()
    .strokeColor("#BFDBFE")
    .lineWidth(1)
    .stroke()
    .restore();

  doc
    .save()
    .circle(
      x + 29,
      y + 30,
      15
    )
    .fillColor(COLORS.blue)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "i",
      x + 21,
      y + 21,
      {
        width: 16,
        align: "center"
      }
    );

  doc
    .fillColor(COLORS.blue)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      "About this report",
      x + 54,
      y + 17
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.2)
    .text(
      "This report presents a visual summary of your DASS-21 screening responses. It is designed to help you understand patterns related to depression, anxiety and stress. The results are not a medical diagnosis and should be interpreted alongside professional guidance when appropriate.",
      x + 54,
      y + 37,
      {
        width:
          boxWidth - 73,
        align: "justify",
        lineGap: 2
      }
    );
}

function drawDisclaimer(doc) {
  const { width, height } =
    getPageDimensions(doc);

  const x = 48;
  const y = height - 88;
  const boxWidth = width - 96;
  const boxHeight = 45;

  doc
    .save()
    .roundedRect(
      x,
      y,
      boxWidth,
      boxHeight,
      12
    )
    .fillColor("#FFF1F2")
    .fill()
    .strokeColor("#FECDD3")
    .lineWidth(1)
    .stroke()
    .restore();

  doc
    .fillColor(COLORS.rose)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text(
      "SCREENING NOTICE",
      x + 14,
      y + 9
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(7.2)
    .text(
      "DASS-21 is a screening tool. It does not diagnose a mental-health condition or replace evaluation by a qualified professional.",
      x + 14,
      y + 23,
      {
        width:
          boxWidth - 28
      }
    );
}

/**
 * Draws the complete cover page.
 *
 * Expected data:
 *
 * assessment = {
 *   assessment_id,
 *   completed_at,
 *   submitted_at
 * }
 *
 * result = {
 *   depression_score,
 *   anxiety_score,
 *   stress_score,
 *   depression_level,
 *   anxiety_level,
 *   stress_level
 * }
 *
 * report = {
 *   report_id,
 *   generated_at
 * }
 */
export function drawDassPdfCover({
  doc,
  assessment = {},
  result = {},
  report = {}
}) {
  if (!doc) {
    throw new Error(
      "PDF document instance is required"
    );
  }

  drawBackground(doc);
  drawGradientHeader(doc);
  drawLogo(doc);
  drawTitle(doc);

  drawInformationCard(
    doc,
    assessment,
    report
  );

  drawScoreSummary(
    doc,
    result
  );

  drawIntroduction(doc);
  drawDisclaimer(doc);

  /*
    Set cursor near the bottom so the next
    section does not overwrite the cover.
  */
  doc.y =
    doc.page.height -
    doc.page.margins.bottom;
}