const COLORS = {
  primary: "#7C3AED",
  secondary: "#EC4899",
  blue: "#2563EB",
  cyan: "#0891B2",
  green: "#16A34A",
  yellow: "#CA8A04",
  orange: "#EA580C",
  red: "#DC2626",

  dark: "#0F172A",
  text: "#334155",
  muted: "#64748B",
  white: "#FFFFFF",

  purpleBackground: "#F5F3FF",
  blueBackground: "#EFF6FF",
  greenBackground: "#F0FDF4",
  yellowBackground: "#FEFCE8",
  orangeBackground: "#FFF7ED",
  redBackground: "#FFF1F2",

  border: "#E2E8F0"
};

function safeText(
  value,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}

function normalizeLevel(value) {
  return safeText(value, "normal")
    .replaceAll("_", " ")
    .trim()
    .toLowerCase();
}

function formatLevel(value) {
  return normalizeLevel(value)
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getPageContentWidth(doc) {
  return (
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right
  );
}

function ensureSpace(
  doc,
  requiredHeight
) {
  const availableBottom =
    doc.page.height -
    doc.page.margins.bottom -
    65;

  if (
    doc.y + requiredHeight >
    availableBottom
  ) {
    doc.addPage();

    return true;
  }

  return false;
}

function drawRoundedCard(
  doc,
  {
    x,
    y,
    width,
    height,
    backgroundColor = COLORS.white,
    borderColor = COLORS.border,
    radius = 14
  }
) {
  doc
    .save()
    .roundedRect(
      x,
      y,
      width,
      height,
      radius
    )
    .fillColor(backgroundColor)
    .fill()
    .strokeColor(borderColor)
    .lineWidth(1)
    .stroke()
    .restore();
}

function drawSectionHeading(
  doc,
  title,
  subtitle
) {
  const x =
    doc.page.margins.left;

  const width =
    getPageContentWidth(doc);

  doc
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(
      title,
      x,
      doc.y,
      {
        width
      }
    );

  doc.moveDown(0.3);

  if (subtitle) {
    doc
      .fillColor(COLORS.muted)
      .font("Helvetica")
      .fontSize(9)
      .text(
        subtitle,
        x,
        doc.y,
        {
          width,
          lineGap: 3
        }
      );
  }

  doc.moveDown(1);
}

function getSeverityPriority(level) {
  const priorities = {
    normal: 0,
    mild: 1,
    moderate: 2,
    severe: 3,
    "extremely severe": 4
  };

  return (
    priorities[
      normalizeLevel(level)
    ] ?? 0
  );
}

function getHighestSeverity(result) {
  const categories = [
    {
      key: "depression",
      label: "Depression",
      level:
        result?.depression_level
    },
    {
      key: "anxiety",
      label: "Anxiety",
      level:
        result?.anxiety_level
    },
    {
      key: "stress",
      label: "Stress",
      level:
        result?.stress_level
    }
  ];

  return categories.reduce(
    (highest, category) => {
      const priority =
        getSeverityPriority(
          category.level
        );

      if (
        priority >
        highest.priority
      ) {
        return {
          ...category,
          priority
        };
      }

      return highest;
    },
    {
      key: "none",
      label: "Overall",
      level: "normal",
      priority: 0
    }
  );
}

function getGuidanceForLevel(level) {
  const normalized =
    normalizeLevel(level);

  const guidance = {
    normal: {
      title:
        "Continue supportive routines",
      color: COLORS.green,
      background:
        COLORS.greenBackground,
      description:
        "Your responses currently fall within the normal range for this category. Continue habits that support emotional balance and monitor any meaningful changes.",
      actions: [
        "Maintain a regular sleep and wake schedule.",
        "Continue physical activity and balanced meals.",
        "Use relaxation, journaling or breathing exercises when needed.",
        "Repeat the assessment later if your emotional state changes."
      ]
    },

    mild: {
      title:
        "Notice patterns early",
      color: "#65A30D",
      background: "#F7FEE7",
      description:
        "Your responses indicate mild symptoms in this category. These may improve with early support, routine adjustments and regular self-monitoring.",
      actions: [
        "Identify situations that appear to increase difficult feelings.",
        "Use short daily stress-management or grounding exercises.",
        "Discuss persistent concerns with someone you trust.",
        "Consider professional support if symptoms continue or interfere with daily life."
      ]
    },

    moderate: {
      title:
        "Consider structured support",
      color: COLORS.yellow,
      background:
        COLORS.yellowBackground,
      description:
        "Your responses indicate a moderate level of symptoms. It may be useful to seek structured support and observe how symptoms affect sleep, study, work and relationships.",
      actions: [
        "Consider speaking with a counsellor, psychologist or qualified mental-health professional.",
        "Track symptoms, triggers and changes in daily functioning.",
        "Reduce avoidable stressors where practical.",
        "Use consistent sleep, movement and relaxation routines."
      ]
    },

    severe: {
      title:
        "Professional support is recommended",
      color: COLORS.orange,
      background:
        COLORS.orangeBackground,
      description:
        "Your responses indicate a severe level of symptoms. A qualified mental-health professional can provide a fuller assessment and appropriate support.",
      actions: [
        "Arrange an appointment with a counsellor, psychologist, psychiatrist or doctor.",
        "Share the report with the professional if you are comfortable doing so.",
        "Tell a trusted person that you may need additional support.",
        "Avoid making major decisions while feeling highly distressed when possible."
      ]
    },

    "extremely severe": {
      title:
        "Seek timely professional support",
      color: COLORS.red,
      background:
        COLORS.redBackground,
      description:
        "Your responses indicate an extremely severe level of symptoms. This screening result should be taken seriously and discussed with a qualified professional as soon as reasonably possible.",
      actions: [
        "Contact a qualified mental-health professional or doctor promptly.",
        "Ask a trusted person to help you arrange or attend the appointment.",
        "Stay connected with supportive people rather than managing intense distress alone.",
        "If you feel at immediate risk of harming yourself or someone else, contact local emergency services or go to the nearest emergency department."
      ]
    }
  };

  return (
    guidance[normalized] ??
    guidance.normal
  );
}

function drawOverviewCard(
  doc,
  result
) {
  const highest =
    getHighestSeverity(result);

  const guidance =
    getGuidanceForLevel(
      highest.level
    );

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getPageContentWidth(doc);

  const height = 132;

  drawRoundedCard(doc, {
    x,
    y,
    width,
    height,
    backgroundColor:
      guidance.background,
    borderColor:
      guidance.color
  });

  doc
    .save()
    .circle(
      x + 35,
      y + 35,
      18
    )
    .fillColor(
      guidance.color
    )
    .fill()
    .restore();

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "!",
      x + 26,
      y + 27,
      {
        width: 18,
        align: "center"
      }
    );

  doc
    .fillColor(
      guidance.color
    )
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "Recommended next step",
      x + 66,
      y + 18
    );

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      guidance.title,
      x + 66,
      y + 40,
      {
        width:
          width - 86
      }
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      guidance.description,
      x + 66,
      y + 61,
      {
        width:
          width - 86,
        lineGap: 3
      }
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text(
      `Highest recorded category level: ${highest.label} — ${formatLevel(
        highest.level
      )}`,
      x + 66,
      y + 105,
      {
        width:
          width - 86
      }
    );

  doc.y =
    y + height + 18;
}

function drawCategoryGuidanceCard(
  doc,
  {
    title,
    level,
    score,
    color,
    background
  }
) {
  const guidance =
    getGuidanceForLevel(level);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getPageContentWidth(doc);

  const actionHeight =
    guidance.actions.length *
    22;

  const height =
    112 + actionHeight;

  ensureSpace(doc, height + 20);

  const resolvedY = doc.y;

  drawRoundedCard(doc, {
    x,
    y: resolvedY,
    width,
    height,
    backgroundColor:
      background,
    borderColor: color
  });

  doc
    .save()
    .roundedRect(
      x,
      resolvedY,
      9,
      height,
      5
    )
    .fillColor(color)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      title,
      x + 24,
      resolvedY + 17
    );

  doc
    .fillColor(color)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(
      `${safeText(
        score,
        "0"
      )}/42 • ${formatLevel(
        level
      )}`,
      x + 24,
      resolvedY + 39
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.3)
    .text(
      guidance.description,
      x + 24,
      resolvedY + 59,
      {
        width:
          width - 46,
        lineGap: 3
      }
    );

  const listStartY =
    resolvedY + 104;

  guidance.actions.forEach(
    (action, index) => {
      const itemY =
        listStartY +
        index * 22;

      doc
        .save()
        .circle(
          x + 30,
          itemY + 5,
          3
        )
        .fillColor(color)
        .fill()
        .restore();

      doc
        .fillColor(COLORS.text)
        .font("Helvetica")
        .fontSize(8)
        .text(
          action,
          x + 42,
          itemY,
          {
            width:
              width - 64,
            lineGap: 2
          }
        );
    }
  );

  doc.y =
    resolvedY +
    height +
    16;
}

function drawDailySupportTools(
  doc
) {
  ensureSpace(doc, 260);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getPageContentWidth(doc);

  doc
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .fontSize(15)
    .text(
      "Daily Support Tools",
      x,
      y
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      "These strategies may support general wellbeing but do not replace professional treatment.",
      x,
      y + 23,
      {
        width
      }
    );

  const cardY = y + 52;
  const gap = 12;
  const cardWidth =
    (width - gap) / 2;
  const cardHeight = 91;

  const tools = [
    {
      title: "Breathing pause",
      description:
        "Slow your breathing for one to three minutes. Use a comfortable rhythm rather than forcing deep breaths.",
      color: COLORS.blue,
      background:
        COLORS.blueBackground
    },
    {
      title: "Grounding exercise",
      description:
        "Notice five things you can see, four you can feel, three you can hear, two you can smell and one you can taste.",
      color: COLORS.cyan,
      background: "#ECFEFF"
    },
    {
      title: "Routine check",
      description:
        "Review sleep, meals, movement, hydration and breaks. Small disruptions can increase emotional strain.",
      color: COLORS.green,
      background:
        COLORS.greenBackground
    },
    {
      title: "Reach out",
      description:
        "Send a message or speak with a trusted person. Clear, direct communication can reduce isolation.",
      color: COLORS.primary,
      background:
        COLORS.purpleBackground
    }
  ];

  tools.forEach(
    (tool, index) => {
      const column =
        index % 2;

      const row =
        Math.floor(index / 2);

      const cardX =
        x +
        column *
          (cardWidth + gap);

      const currentY =
        cardY +
        row *
          (cardHeight + gap);

      drawRoundedCard(doc, {
        x: cardX,
        y: currentY,
        width: cardWidth,
        height: cardHeight,
        backgroundColor:
          tool.background,
        borderColor:
          tool.color
      });

      doc
        .save()
        .circle(
          cardX + 23,
          currentY + 25,
          10
        )
        .fillColor(tool.color)
        .fill()
        .restore();

      doc
        .fillColor(COLORS.white)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
          String(index + 1),
          cardX + 17,
          currentY + 20,
          {
            width: 12,
            align: "center"
          }
        );

      doc
        .fillColor(tool.color)
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .text(
          tool.title,
          cardX + 42,
          currentY + 17,
          {
            width:
              cardWidth - 56
          }
        );

      doc
        .fillColor(COLORS.text)
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          tool.description,
          cardX + 16,
          currentY + 44,
          {
            width:
              cardWidth - 32,
            lineGap: 2
          }
        );
    }
  );

  doc.y =
    cardY +
    cardHeight * 2 +
    gap +
    20;
}

function drawProfessionalSupportSection(
  doc
) {
  ensureSpace(doc, 185);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getPageContentWidth(doc);

  const height = 165;

  drawRoundedCard(doc, {
    x,
    y,
    width,
    height,
    backgroundColor:
      COLORS.blueBackground,
    borderColor:
      "#93C5FD"
  });

  doc
    .fillColor(COLORS.blue)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "Preparing to speak with a professional",
      x + 20,
      y + 18
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.2)
    .text(
      "You may find it useful to share the following information during an appointment:",
      x + 20,
      y + 42,
      {
        width:
          width - 40
      }
    );

  const items = [
    "How long the symptoms have been present.",
    "How they affect sleep, appetite, study, work or relationships.",
    "Any recent major changes, losses, illness or ongoing stress.",
    "Medicines, substances or health conditions that may be relevant.",
    "Whether symptoms are becoming more frequent or intense."
  ];

  items.forEach(
    (item, index) => {
      const itemY =
        y + 68 +
        index * 17;

      doc
        .fillColor(COLORS.blue)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
          "•",
          x + 24,
          itemY
        );

      doc
        .fillColor(COLORS.text)
        .font("Helvetica")
        .fontSize(7.8)
        .text(
          item,
          x + 37,
          itemY,
          {
            width:
              width - 58
          }
        );
    }
  );

  doc.y =
    y + height + 18;
}

function drawUrgentSupportNotice(
  doc
) {
  ensureSpace(doc, 125);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getPageContentWidth(doc);

  const height = 108;

  drawRoundedCard(doc, {
    x,
    y,
    width,
    height,
    backgroundColor:
      COLORS.redBackground,
    borderColor:
      "#FDA4AF"
  });

  doc
    .save()
    .circle(
      x + 35,
      y + 35,
      17
    )
    .fillColor(COLORS.red)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "!",
      x + 26,
      y + 27,
      {
        width: 18,
        align: "center"
      }
    );

  doc
    .fillColor(COLORS.red)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(
      "Urgent safety support",
      x + 64,
      y + 17
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8.2)
    .text(
      "If you feel that you may harm yourself or someone else, cannot remain safe, or are experiencing an immediate mental-health emergency, contact local emergency services or go to the nearest emergency department. Stay with a trusted person when possible.",
      x + 64,
      y + 41,
      {
        width:
          width - 86,
        lineGap: 3
      }
    );

  doc.y =
    y + height + 16;
}

function drawFinalDisclaimer(
  doc
) {
  ensureSpace(doc, 105);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getPageContentWidth(doc);

  const height = 86;

  drawRoundedCard(doc, {
    x,
    y,
    width,
    height,
    backgroundColor:
      "#F8FAFC",
    borderColor:
      COLORS.border
  });

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text(
      "Important notice",
      x + 18,
      y + 15
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "The DASS-21 is a screening instrument and does not provide a medical or psychological diagnosis. Results can be influenced by temporary circumstances and should be interpreted in context. Only an appropriately qualified professional can assess, diagnose or treat a mental-health condition.",
      x + 18,
      y + 34,
      {
        width:
          width - 36,
        align: "justify",
        lineGap: 2
      }
    );

  doc.y =
    y + height + 10;
}

export function drawDassGuidanceSection({
  doc,
  result = {}
}) {
  if (!doc) {
    throw new Error(
      "PDF document instance is required"
    );
  }

  drawSectionHeading(
    doc,
    "Guidance and Next Steps",
    "The suggestions below are based on the recorded screening levels. They are general support options and are not personalised medical advice."
  );

  drawOverviewCard(
    doc,
    result
  );

  drawCategoryGuidanceCard(
    doc,
    {
      title:
        "Depression Guidance",
      score:
        result?.depression_score,
      level:
        result?.depression_level,
      color: "#8B5CF6",
      background:
        COLORS.purpleBackground
    }
  );

  drawCategoryGuidanceCard(
    doc,
    {
      title:
        "Anxiety Guidance",
      score:
        result?.anxiety_score,
      level:
        result?.anxiety_level,
      color: "#F97316",
      background:
        COLORS.orangeBackground
    }
  );

  drawCategoryGuidanceCard(
    doc,
    {
      title:
        "Stress Guidance",
      score:
        result?.stress_score,
      level:
        result?.stress_level,
      color: "#06B6D4",
      background: "#ECFEFF"
    }
  );

  drawDailySupportTools(doc);

  drawProfessionalSupportSection(
    doc
  );

  drawUrgentSupportNotice(doc);

  drawFinalDisclaimer(doc);
}