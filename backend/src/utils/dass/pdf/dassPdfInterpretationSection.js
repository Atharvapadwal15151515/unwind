import {
  safeText,
  formatLevel,
  getContentWidth,
  ensureSpace,
  drawRoundedBox,
  drawSectionHeading,
  getSeverityStyle,
  getHighestSeverity
} from "./dassPdfHelpers.js";

const COLORS = {
  primary: "#7C3AED",
  depression: "#8B5CF6",
  anxiety: "#F97316",
  stress: "#06B6D4",

  dark: "#0F172A",
  text: "#334155",
  muted: "#64748B",
  white: "#FFFFFF",

  purpleBackground: "#F5F3FF",
  orangeBackground: "#FFF7ED",
  cyanBackground: "#ECFEFF",
  blueBackground: "#EFF6FF",
  neutralBackground: "#F8FAFC",

  border: "#E2E8F0"
};

function getInterpretationForLevel(
  category,
  level
) {
  const normalized = safeText(
    level,
    "normal"
  )
    .replaceAll("_", " ")
    .trim()
    .toLowerCase();

  const content = {
    depression: {
      normal: {
        summary:
          "Your responses do not currently indicate elevated depressive symptoms within the DASS-21 screening range.",
        meaning:
          "This does not mean that difficult emotions are absent. Temporary sadness, tiredness or reduced motivation can still occur without producing an elevated screening score.",
        note:
          "Continue monitoring meaningful changes in mood, motivation, enjoyment and daily functioning."
      },

      mild: {
        summary:
          "Your responses indicate mild depressive symptoms.",
        meaning:
          "You may be experiencing some reduction in motivation, enjoyment or emotional energy. These symptoms may be noticeable but may not yet strongly disrupt daily functioning.",
        note:
          "Early support, routine adjustments and symptom monitoring may be useful."
      },

      moderate: {
        summary:
          "Your responses indicate moderate depressive symptoms.",
        meaning:
          "Symptoms such as low mood, reduced interest, low motivation or negative thinking may be affecting parts of daily life.",
        note:
          "Consider discussing these symptoms with a qualified mental-health professional, especially if they persist or interfere with study, work, sleep or relationships."
      },

      severe: {
        summary:
          "Your responses indicate severe depressive symptoms.",
        meaning:
          "The reported symptoms may be causing substantial emotional distress or difficulty with daily functioning.",
        note:
          "Professional assessment is recommended. Consider contacting a counsellor, psychologist, psychiatrist or doctor."
      },

      "extremely severe": {
        summary:
          "Your responses indicate extremely severe depressive symptoms.",
        meaning:
          "The reported symptoms suggest a high level of distress and may be significantly affecting daily functioning.",
        note:
          "Timely professional support is strongly recommended. Seek urgent help if you feel unable to remain safe."
      }
    },

    anxiety: {
      normal: {
        summary:
          "Your responses do not currently indicate elevated anxiety symptoms within the DASS-21 screening range.",
        meaning:
          "Occasional worry, nervousness or physical tension can still occur without producing an elevated score.",
        note:
          "Continue monitoring changes in worry, fear, physical tension and avoidance."
      },

      mild: {
        summary:
          "Your responses indicate mild anxiety symptoms.",
        meaning:
          "You may be noticing occasional nervousness, worry, physical tension or discomfort in stressful situations.",
        note:
          "Breathing exercises, grounding techniques and routine monitoring may help."
      },

      moderate: {
        summary:
          "Your responses indicate moderate anxiety symptoms.",
        meaning:
          "Anxiety symptoms may be occurring often enough to affect concentration, comfort, sleep or participation in daily activities.",
        note:
          "Structured support from a counsellor or qualified professional may be useful."
      },

      severe: {
        summary:
          "Your responses indicate severe anxiety symptoms.",
        meaning:
          "The reported symptoms may involve significant fear, tension, physical discomfort or avoidance.",
        note:
          "Professional assessment is recommended, particularly if symptoms interfere with normal activities."
      },

      "extremely severe": {
        summary:
          "Your responses indicate extremely severe anxiety symptoms.",
        meaning:
          "The reported symptoms suggest intense anxiety-related distress that may be affecting your ability to function comfortably or safely.",
        note:
          "Seek timely professional support. Urgent help may be appropriate if symptoms feel unmanageable."
      }
    },

    stress: {
      normal: {
        summary:
          "Your responses do not currently indicate elevated stress symptoms within the DASS-21 screening range.",
        meaning:
          "Normal-range stress does not mean that life is completely free from pressure. Short-term stress responses can still occur.",
        note:
          "Continue maintaining routines that support rest, recovery and emotional regulation."
      },

      mild: {
        summary:
          "Your responses indicate mild stress symptoms.",
        meaning:
          "You may be noticing some difficulty relaxing, irritability, restlessness or increased sensitivity to pressure.",
        note:
          "Short breaks, sleep consistency and stress-management practices may help."
      },

      moderate: {
        summary:
          "Your responses indicate moderate stress symptoms.",
        meaning:
          "Stress may be affecting concentration, patience, sleep or your ability to relax.",
        note:
          "Review current stressors and consider additional support if symptoms continue."
      },

      severe: {
        summary:
          "Your responses indicate severe stress symptoms.",
        meaning:
          "The reported symptoms may reflect substantial tension, irritability, overload or difficulty recovering from pressure.",
        note:
          "Professional support is recommended if stress is persistent or significantly affecting daily life."
      },

      "extremely severe": {
        summary:
          "Your responses indicate extremely severe stress symptoms.",
        meaning:
          "The reported symptoms suggest a very high level of strain that may be affecting emotional regulation and daily functioning.",
        note:
          "Timely professional support is strongly recommended."
      }
    }
  };

  return (
    content?.[category]?.[
      normalized
    ] ??
    content?.[category]?.normal
  );
}

function drawResultSummaryCard(
  doc,
  {
    title,
    score,
    level,
    color,
    background
  }
) {
  const x =
    doc.page.margins.left;

  const width =
    getContentWidth(doc);

  const y = doc.y;

  const style =
    getSeverityStyle(level);

  const height = 82;

  drawRoundedBox(doc, {
    x,
    y,
    width,
    height,
    radius: 14,
    backgroundColor: background,
    borderColor: color
  });

  doc
    .save()
    .roundedRect(
      x,
      y,
      8,
      height,
      4
    )
    .fillColor(color)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(
      title,
      x + 22,
      y + 17
    );

  doc
    .fillColor(color)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(
      `${safeText(score, "0")}/42`,
      x + 22,
      y + 39
    );

  const badgeWidth = 118;

  doc
    .save()
    .roundedRect(
      x + width - badgeWidth - 20,
      y + 28,
      badgeWidth,
      26,
      13
    )
    .fillColor(
      style.backgroundColor
    )
    .fill()
    .strokeColor(
      style.borderColor
    )
    .lineWidth(0.8)
    .stroke()
    .restore();

  doc
    .fillColor(style.textColor)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      formatLevel(level),
      x + width - badgeWidth - 15,
      y + 37,
      {
        width:
          badgeWidth - 10,
        align: "center"
      }
    );

  doc.y =
    y + height + 14;
}

function drawInterpretationCard(
  doc,
  {
    category,
    title,
    level,
    color,
    background
  }
) {
  const interpretation =
    getInterpretationForLevel(
      category,
      level
    );

  ensureSpace(doc, 205);

  const x =
    doc.page.margins.left;

  const width =
    getContentWidth(doc);

  const y = doc.y;

  const contentWidth =
    width - 44;

  const summaryHeight =
    doc.heightOfString(
      interpretation.summary,
      {
        width: contentWidth,
        lineGap: 3
      }
    );

  const meaningHeight =
    doc.heightOfString(
      interpretation.meaning,
      {
        width: contentWidth,
        lineGap: 3
      }
    );

  const noteHeight =
    doc.heightOfString(
      interpretation.note,
      {
        width: contentWidth - 18,
        lineGap: 3
      }
    );

  const height =
    88 +
    summaryHeight +
    meaningHeight +
    noteHeight;

  drawRoundedBox(doc, {
    x,
    y,
    width,
    height,
    radius: 15,
    backgroundColor: background,
    borderColor: color
  });

  doc
    .save()
    .circle(
      x + 28,
      y + 29,
      13
    )
    .fillColor(color)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(
      title.charAt(0),
      x + 21,
      y + 23,
      {
        width: 14,
        align: "center"
      }
    );

  doc
    .fillColor(color)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(
      `${title} interpretation`,
      x + 50,
      y + 18
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text(
      `Recorded level: ${formatLevel(
        level
      )}`,
      x + 50,
      y + 38
    );

  let currentY = y + 66;

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(
      "What the result suggests",
      x + 22,
      currentY
    );

  currentY += 17;

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.3)
    .text(
      interpretation.summary,
      x + 22,
      currentY,
      {
        width: contentWidth,
        lineGap: 3
      }
    );

  currentY +=
    summaryHeight + 15;

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(
      "Possible meaning",
      x + 22,
      currentY
    );

  currentY += 17;

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.3)
    .text(
      interpretation.meaning,
      x + 22,
      currentY,
      {
        width: contentWidth,
        lineGap: 3
      }
    );

  currentY +=
    meaningHeight + 14;

  doc
    .save()
    .roundedRect(
      x + 22,
      currentY,
      width - 44,
      noteHeight + 23,
      10
    )
    .fillColor(COLORS.white)
    .fill()
    .strokeColor(color)
    .lineWidth(0.7)
    .stroke()
    .restore();

  doc
    .fillColor(color)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      "Key consideration",
      x + 34,
      currentY + 9
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(7.8)
    .text(
      interpretation.note,
      x + 34,
      currentY + 23,
      {
        width:
          width - 68,
        lineGap: 3
      }
    );

  doc.y =
    y + height + 16;
}

function drawCombinedInterpretation(
  doc,
  result
) {
  ensureSpace(doc, 170);

  const highest =
    getHighestSeverity(result);

  const x =
    doc.page.margins.left;

  const width =
    getContentWidth(doc);

  const y = doc.y;

  const height = 148;

  drawRoundedBox(doc, {
    x,
    y,
    width,
    height,
    radius: 15,
    backgroundColor:
      COLORS.blueBackground,
    borderColor: "#93C5FD"
  });

  doc
    .fillColor("#2563EB")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "Combined result overview",
      x + 20,
      y + 18
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.4)
    .text(
      "The three DASS-21 categories are interpreted separately. A higher score in one category does not automatically mean the same level is present in the other categories.",
      x + 20,
      y + 44,
      {
        width:
          width - 40,
        lineGap: 3
      }
    );

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(
      "Most elevated recorded category",
      x + 20,
      y + 88
    );

  doc
    .fillColor("#2563EB")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      `${highest.label}: ${formatLevel(
        highest.level
      )}`,
      x + 20,
      y + 107
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(7.7)
    .text(
      "This comparison is included to guide attention. It does not represent an overall diagnosis or a combined clinical score.",
      x + 220,
      y + 98,
      {
        width:
          width - 240,
        lineGap: 2
      }
    );

  doc.y =
    y + height + 16;
}

function drawStoredInterpretation(
  doc,
  report
) {
  const interpretationText =
    safeText(
      report?.interpretation_text,
      ""
    );

  if (!interpretationText) {
    return;
  }

  const x =
    doc.page.margins.left;

  const width =
    getContentWidth(doc);

  const textHeight =
    doc.heightOfString(
      interpretationText,
      {
        width: width - 40,
        lineGap: 4
      }
    );

  const height =
    textHeight + 88;

  ensureSpace(
    doc,
    height + 18
  );

  const y = doc.y;

  drawRoundedBox(doc, {
    x,
    y,
    width,
    height,
    radius: 15,
    backgroundColor:
      COLORS.neutralBackground,
    borderColor:
      COLORS.border
  });

  doc
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "Generated interpretation",
      x + 20,
      y + 18
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `Source: ${safeText(
        report?.interpretation_source,
        "Application"
      )} • Version: ${safeText(
        report?.interpretation_version,
        "1.0"
      )}`,
      x + 20,
      y + 40,
      {
        width:
          width - 40
      }
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.4)
    .text(
      interpretationText,
      x + 20,
      y + 65,
      {
        width:
          width - 40,
        lineGap: 4,
        align: "justify"
      }
    );

  doc.y =
    y + height + 16;
}

function drawInterpretationDisclaimer(
  doc
) {
  ensureSpace(doc, 110);

  const x =
    doc.page.margins.left;

  const width =
    getContentWidth(doc);

  const y = doc.y;

  const height = 92;

  drawRoundedBox(doc, {
    x,
    y,
    width,
    height,
    radius: 13,
    backgroundColor: "#FFF1F2",
    borderColor: "#FDA4AF"
  });

  doc
    .fillColor("#BE123C")
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(
      "Important interpretation notice",
      x + 18,
      y + 15
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(7.8)
    .text(
      "DASS-21 scores indicate the severity of self-reported symptoms during the assessed period. They do not establish a diagnosis, identify the cause of symptoms or replace assessment by a qualified professional. Results should be considered alongside personal circumstances, symptom duration and daily functioning.",
      x + 18,
      y + 35,
      {
        width:
          width - 36,
        lineGap: 3,
        align: "justify"
      }
    );

  doc.y =
    y + height + 12;
}

export function drawDassInterpretationSection({
  doc,
  result = {},
  report = {}
}) {
  if (!doc) {
    throw new Error(
      "PDF document instance is required"
    );
  }

  drawSectionHeading(doc, {
    title:
      "Result Interpretation",
    subtitle:
      "The following explanation describes what the recorded DASS-21 screening levels may suggest. Each category is interpreted independently."
  });

  drawResultSummaryCard(doc, {
    title: "Depression",
    score:
      result?.depression_score,
    level:
      result?.depression_level,
    color: COLORS.depression,
    background:
      COLORS.purpleBackground
  });

  drawResultSummaryCard(doc, {
    title: "Anxiety",
    score:
      result?.anxiety_score,
    level:
      result?.anxiety_level,
    color: COLORS.anxiety,
    background:
      COLORS.orangeBackground
  });

  drawResultSummaryCard(doc, {
    title: "Stress",
    score:
      result?.stress_score,
    level:
      result?.stress_level,
    color: COLORS.stress,
    background:
      COLORS.cyanBackground
  });

  drawCombinedInterpretation(
    doc,
    result
  );

  drawInterpretationCard(doc, {
    category: "depression",
    title: "Depression",
    level:
      result?.depression_level,
    color: COLORS.depression,
    background:
      COLORS.purpleBackground
  });

  drawInterpretationCard(doc, {
    category: "anxiety",
    title: "Anxiety",
    level:
      result?.anxiety_level,
    color: COLORS.anxiety,
    background:
      COLORS.orangeBackground
  });

  drawInterpretationCard(doc, {
    category: "stress",
    title: "Stress",
    level:
      result?.stress_level,
    color: COLORS.stress,
    background:
      COLORS.cyanBackground
  });

  drawStoredInterpretation(
    doc,
    report
  );

  drawInterpretationDisclaimer(
    doc
  );
}