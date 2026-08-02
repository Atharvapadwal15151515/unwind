export function safeText(
  value,
  fallback = "Not available"
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

export function safeNumber(
  value,
  fallback = 0
) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return fallback;
  }

  return number;
}

export function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    Math.max(
      safeNumber(value, minimum),
      minimum
    ),
    maximum
  );
}

export function formatLevel(value) {
  return safeText(value)
    .replaceAll("_", " ")
    .trim()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export function normalizeLevel(value) {
  return safeText(value, "normal")
    .replaceAll("_", " ")
    .trim()
    .toLowerCase();
}

export function formatDate(
  value,
  fallback = "Not available"
) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return safeText(value, fallback);
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

export function formatDateTime(
  value,
  fallback = "Not available"
) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return safeText(value, fallback);
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);
}

export function getContentWidth(doc) {
  return (
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right
  );
}

export function getContentBottom(
  doc,
  footerSpace = 70
) {
  return (
    doc.page.height -
    doc.page.margins.bottom -
    footerSpace
  );
}

export function ensureSpace(
  doc,
  requiredHeight,
  options = {}
) {
  const {
    footerSpace = 70,
    onNewPage
  } = options;

  const contentBottom =
    getContentBottom(
      doc,
      footerSpace
    );

  if (
    doc.y + requiredHeight >
    contentBottom
  ) {
    doc.addPage();

    if (
      typeof onNewPage ===
      "function"
    ) {
      onNewPage(doc);
    }

    return true;
  }

  return false;
}

export function drawRoundedBox(
  doc,
  {
    x,
    y,
    width,
    height,
    radius = 12,
    backgroundColor = "#FFFFFF",
    borderColor = "#E2E8F0",
    borderWidth = 1
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
    .lineWidth(borderWidth)
    .stroke()
    .restore();
}

export function drawDivider(
  doc,
  {
    x = doc.page.margins.left,
    y = doc.y,
    width = getContentWidth(doc),
    color = "#E2E8F0",
    lineWidth = 1
  } = {}
) {
  doc
    .save()
    .strokeColor(color)
    .lineWidth(lineWidth)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke()
    .restore();
}

export function drawSectionHeading(
  doc,
  {
    title,
    subtitle = "",
    color = "#7C3AED",
    textColor = "#64748B",
    spacingAfter = 14
  }
) {
  const x =
    doc.page.margins.left;

  const width =
    getContentWidth(doc);

  doc
    .fillColor(color)
    .font("Helvetica-Bold")
    .fontSize(19)
    .text(
      safeText(title, ""),
      x,
      doc.y,
      {
        width
      }
    );

  if (subtitle) {
    doc.moveDown(0.35);

    doc
      .fillColor(textColor)
      .font("Helvetica")
      .fontSize(8.5)
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

  doc.y += spacingAfter;
}

export function getSeverityPriority(
  level
) {
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

export function getSeverityStyle(
  level
) {
  const styles = {
    normal: {
      textColor: "#15803D",
      backgroundColor: "#DCFCE7",
      borderColor: "#86EFAC"
    },

    mild: {
      textColor: "#4D7C0F",
      backgroundColor: "#ECFCCB",
      borderColor: "#BEF264"
    },

    moderate: {
      textColor: "#A16207",
      backgroundColor: "#FEF9C3",
      borderColor: "#FDE047"
    },

    severe: {
      textColor: "#C2410C",
      backgroundColor: "#FFEDD5",
      borderColor: "#FDBA74"
    },

    "extremely severe": {
      textColor: "#B91C1C",
      backgroundColor: "#FEE2E2",
      borderColor: "#FCA5A5"
    }
  };

  return (
    styles[normalizeLevel(level)] ?? {
      textColor: "#475569",
      backgroundColor: "#F1F5F9",
      borderColor: "#CBD5E1"
    }
  );
}

export function getHighestSeverity(
  result = {}
) {
  const categories = [
    {
      key: "depression",
      label: "Depression",
      level:
        result.depression_level,
      score:
        safeNumber(
          result.depression_score
        )
    },
    {
      key: "anxiety",
      label: "Anxiety",
      level:
        result.anxiety_level,
      score:
        safeNumber(
          result.anxiety_score
        )
    },
    {
      key: "stress",
      label: "Stress",
      level:
        result.stress_level,
      score:
        safeNumber(
          result.stress_score
        )
    }
  ];

  return categories.reduce(
    (highest, current) => {
      const currentPriority =
        getSeverityPriority(
          current.level
        );

      const highestPriority =
        getSeverityPriority(
          highest.level
        );

      if (
        currentPriority >
        highestPriority
      ) {
        return current;
      }

      if (
        currentPriority ===
          highestPriority &&
        current.score >
          highest.score
      ) {
        return current;
      }

      return highest;
    },
    {
      key: "overall",
      label: "Overall",
      level: "normal",
      score: 0
    }
  );
}

export function drawSeverityBadge(
  doc,
  {
    level,
    x,
    y,
    width = 100,
    height = 22
  }
) {
  const style =
    getSeverityStyle(level);

  doc
    .save()
    .roundedRect(
      x,
      y,
      width,
      height,
      height / 2
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
    .fillColor(
      style.textColor
    )
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text(
      formatLevel(level),
      x + 5,
      y + 7,
      {
        width: width - 10,
        align: "center",
        ellipsis: true
      }
    );
}

export function drawBulletList(
  doc,
  items = [],
  options = {}
) {
  const {
    x = doc.page.margins.left,
    width = getContentWidth(doc),
    bulletColor = "#7C3AED",
    textColor = "#334155",
    fontSize = 8,
    itemGap = 8,
    lineGap = 2
  } = options;

  items.forEach((item) => {
    const estimatedHeight =
      doc.heightOfString(
        safeText(item, ""),
        {
          width: width - 22,
          lineGap
        }
      );

    ensureSpace(
      doc,
      estimatedHeight +
        itemGap +
        5
    );

    const itemY = doc.y;

    doc
      .save()
      .circle(
        x + 4,
        itemY + 5,
        2.8
      )
      .fillColor(bulletColor)
      .fill()
      .restore();

    doc
      .fillColor(textColor)
      .font("Helvetica")
      .fontSize(fontSize)
      .text(
        safeText(item, ""),
        x + 16,
        itemY,
        {
          width: width - 22,
          lineGap
        }
      );

    doc.y += itemGap;
  });
}

export function getQuestionCategory(
  questionNumber
) {
  const number =
    safeNumber(questionNumber);

  const depressionQuestions = [
    3, 5, 10, 13, 16, 17, 21
  ];

  const anxietyQuestions = [
    2, 4, 7, 9, 15, 19, 20
  ];

  const stressQuestions = [
    1, 6, 8, 11, 12, 14, 18
  ];

  if (
    depressionQuestions.includes(
      number
    )
  ) {
    return "depression";
  }

  if (
    anxietyQuestions.includes(
      number
    )
  ) {
    return "anxiety";
  }

  if (
    stressQuestions.includes(
      number
    )
  ) {
    return "stress";
  }

  return "unknown";
}

export function getCategoryColor(
  category
) {
  const colors = {
    depression: "#8B5CF6",
    anxiety: "#F97316",
    stress: "#06B6D4",
    unknown: "#64748B"
  };

  return (
    colors[
      safeText(
        category,
        "unknown"
      ).toLowerCase()
    ] ?? colors.unknown
  );
}

export function createArcPath(
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle,
  steps = 30
) {
  const points = [];

  const safeSteps =
    Math.max(3, steps);

  for (
    let index = 0;
    index <= safeSteps;
    index += 1
  ) {
    const progress =
      index / safeSteps;

    const angle =
      startAngle +
      (endAngle -
        startAngle) *
        progress;

    points.push({
      x:
        centerX +
        Math.cos(angle) *
          radius,

      y:
        centerY +
        Math.sin(angle) *
          radius
    });
  }

  return points;
}

export function getResponseValue(
  response
) {
  return clamp(
    response?.answer_value ??
      response?.answerValue ??
      response?.response_value ??
      response?.responseValue ??
      0,
    0,
    3
  );
}

export function getQuestionNumber(
  response
) {
  return safeNumber(
    response?.question_number ??
      response?.questionNumber ??
      response?.question_id ??
      response?.questionId ??
      0
  );
}