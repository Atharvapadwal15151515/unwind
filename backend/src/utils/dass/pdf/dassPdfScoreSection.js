import {
  safeNumber,
  safeText,
  formatLevel,
  getContentWidth,
  ensureSpace,
  drawRoundedBox,
  drawSectionHeading,
  getSeverityStyle,
  getHighestSeverity,
  clamp
} from "./dassPdfHelpers.js";

import {
  drawScoreBarChart,
  drawScoreDonutChart,
  drawSeverityRangeChart,
  drawScoreRadarChart
} from "./dassPdfCharts.js";

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

function getScorePercentage(score) {
  return clamp(
    (safeNumber(score) / 42) * 100,
    0,
    100
  );
}

function drawScoreProgressBar(
  doc,
  {
    x,
    y,
    width,
    score,
    color
  }
) {
  const height = 8;

  const percentage =
    getScorePercentage(score);

  doc
    .save()
    .roundedRect(
      x,
      y,
      width,
      height,
      height / 2
    )
    .fillColor("#E2E8F0")
    .fill()
    .restore();

  if (percentage > 0) {
    doc
      .save()
      .roundedRect(
        x,
        y,
        width *
          (percentage / 100),
        height,
        height / 2
      )
      .fillColor(color)
      .fill()
      .restore();
  }
}

function drawScoreCard(
  doc,
  {
    x,
    y,
    width,
    title,
    score,
    rawScore,
    level,
    color,
    background
  }
) {
  const height = 150;

  const severityStyle =
    getSeverityStyle(level);

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
    .roundedRect(
      x,
      y,
      width,
      10,
      5
    )
    .fillColor(color)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      title,
      x + 14,
      y + 24,
      {
        width: width - 28,
        align: "center"
      }
    );

  doc
    .fillColor(color)
    .font("Helvetica-Bold")
    .fontSize(27)
    .text(
      safeText(score, "0"),
      x + 14,
      y + 48,
      {
        width: width - 28,
        align: "center"
      }
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "Final score out of 42",
      x + 14,
      y + 79,
      {
        width: width - 28,
        align: "center"
      }
    );

  drawScoreProgressBar(doc, {
    x: x + 17,
    y: y + 98,
    width: width - 34,
    score,
    color
  });

  const badgeX = x + 18;
  const badgeY = y + 116;
  const badgeWidth = width - 36;
  const badgeHeight = 22;

  doc
    .save()
    .roundedRect(
      badgeX,
      badgeY,
      badgeWidth,
      badgeHeight,
      badgeHeight / 2
    )
    .fillColor(
      severityStyle.backgroundColor
    )
    .fill()
    .strokeColor(
      severityStyle.borderColor
    )
    .lineWidth(0.8)
    .stroke()
    .restore();

  doc
    .fillColor(
      severityStyle.textColor
    )
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text(
      formatLevel(level),
      badgeX + 5,
      badgeY + 7,
      {
        width: badgeWidth - 10,
        align: "center",
        ellipsis: true
      }
    );

  if (
    rawScore !== undefined &&
    rawScore !== null
  ) {
    doc
      .fillColor(COLORS.muted)
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        `Raw score: ${safeNumber(
          rawScore
        )}`,
        x + 14,
        y + 141,
        {
          width: width - 28,
          align: "center"
        }
      );
  }

  return height;
}

function drawScoreCards(
  doc,
  result
) {
  ensureSpace(doc, 190);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getContentWidth(doc);

  const gap = 12;

  const cardWidth =
    (width - gap * 2) / 3;

  const cards = [
    {
      title: "Depression",
      score:
        result?.depression_score,
      rawScore:
        result?.depression_raw_score,
      level:
        result?.depression_level,
      color: COLORS.depression,
      background:
        COLORS.purpleBackground
    },
    {
      title: "Anxiety",
      score:
        result?.anxiety_score,
      rawScore:
        result?.anxiety_raw_score,
      level:
        result?.anxiety_level,
      color: COLORS.anxiety,
      background:
        COLORS.orangeBackground
    },
    {
      title: "Stress",
      score:
        result?.stress_score,
      rawScore:
        result?.stress_raw_score,
      level:
        result?.stress_level,
      color: COLORS.stress,
      background:
        COLORS.cyanBackground
    }
  ];

  cards.forEach(
    (card, index) => {
      drawScoreCard(doc, {
        ...card,
        x:
          x +
          index *
            (cardWidth + gap),
        y,
        width: cardWidth
      });
    }
  );

  doc.y = y + 172;
}

function drawScoringExplanation(
  doc
) {
  ensureSpace(doc, 125);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getContentWidth(doc);

  const height = 106;

  drawRoundedBox(doc, {
    x,
    y,
    width,
    height,
    radius: 14,
    backgroundColor:
      COLORS.blueBackground,
    borderColor: "#93C5FD"
  });

  doc
    .fillColor("#2563EB")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      "How DASS-21 scoring works",
      x + 18,
      y + 16
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "Each category contains seven questions. Every response is scored from 0 to 3. The seven responses in each category are added together and then multiplied by two, producing a final category score from 0 to 42.",
      x + 18,
      y + 37,
      {
        width: width - 36,
        lineGap: 3
      }
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text(
      "Depression, anxiety and stress scores are interpreted separately and should not be added together.",
      x + 18,
      y + 81,
      {
        width: width - 36
      }
    );

  doc.y =
    y + height + 16;
}

function drawHighestScoreSummary(
  doc,
  result
) {
  ensureSpace(doc, 130);

  const highest =
    getHighestSeverity(result);

  const style =
    getSeverityStyle(
      highest.level
    );

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getContentWidth(doc);

  const height = 110;

  drawRoundedBox(doc, {
    x,
    y,
    width,
    height,
    radius: 14,
    backgroundColor:
      style.backgroundColor,
    borderColor:
      style.borderColor
  });

  doc
    .save()
    .circle(
      x + 35,
      y + 36,
      17
    )
    .fillColor(
      style.textColor
    )
    .fill()
    .restore();

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      "↑",
      x + 26,
      y + 28,
      {
        width: 18,
        align: "center"
      }
    );

  doc
    .fillColor(
      style.textColor
    )
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      "Most elevated category",
      x + 65,
      y + 17
    );

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(
      `${highest.label}: ${formatLevel(
        highest.level
      )}`,
      x + 65,
      y + 40
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Recorded score: ${safeNumber(
        highest.score
      )}/42. This comparison only identifies the highest recorded category and does not create a combined mental-health score.`,
      x + 65,
      y + 65,
      {
        width: width - 88,
        lineGap: 3
      }
    );

  doc.y =
    y + height + 16;
}

function drawScoreTable(
  doc,
  result
) {
  ensureSpace(doc, 190);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getContentWidth(doc);

  const rowHeight = 34;

  const columns = {
    category: width * 0.28,
    raw: width * 0.18,
    final: width * 0.18,
    level: width * 0.36
  };

  const rows = [
    {
      category: "Depression",
      raw:
        result?.depression_raw_score,
      final:
        result?.depression_score,
      level:
        result?.depression_level
    },
    {
      category: "Anxiety",
      raw:
        result?.anxiety_raw_score,
      final:
        result?.anxiety_score,
      level:
        result?.anxiety_level
    },
    {
      category: "Stress",
      raw:
        result?.stress_raw_score,
      final:
        result?.stress_score,
      level:
        result?.stress_level
    }
  ];

  const totalHeight =
    rowHeight * 4;

  drawRoundedBox(doc, {
    x,
    y,
    width,
    height: totalHeight,
    radius: 12,
    backgroundColor:
      COLORS.white,
    borderColor:
      COLORS.border
  });

  doc
    .save()
    .roundedRect(
      x,
      y,
      width,
      rowHeight,
      12
    )
    .fillColor(
      COLORS.primary
    )
    .fill()
    .restore();

  const headers = [
    {
      text: "Category",
      width: columns.category
    },
    {
      text: "Raw score",
      width: columns.raw
    },
    {
      text: "Final score",
      width: columns.final
    },
    {
      text: "Severity level",
      width: columns.level
    }
  ];

  let currentX = x;

  headers.forEach((header) => {
    doc
      .fillColor(COLORS.white)
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(
        header.text,
        currentX + 8,
        y + 13,
        {
          width:
            header.width - 16,
          align: "center"
        }
      );

    currentX += header.width;
  });

  rows.forEach(
    (row, rowIndex) => {
      const rowY =
        y +
        rowHeight *
          (rowIndex + 1);

      if (rowIndex % 2 === 1) {
        doc
          .save()
          .rect(
            x,
            rowY,
            width,
            rowHeight
          )
          .fillColor(
            COLORS.neutralBackground
          )
          .fill()
          .restore();
      }

      doc
        .save()
        .moveTo(x, rowY)
        .lineTo(
          x + width,
          rowY
        )
        .strokeColor(
          COLORS.border
        )
        .lineWidth(0.6)
        .stroke()
        .restore();

      let cellX = x;

      const values = [
        {
          text: row.category,
          width:
            columns.category,
          bold: true
        },
        {
          text: safeText(
            row.raw,
            "0"
          ),
          width:
            columns.raw
        },
        {
          text: `${safeText(
            row.final,
            "0"
          )}/42`,
          width:
            columns.final
        },
        {
          text: formatLevel(
            row.level
          ),
          width:
            columns.level,
          bold: true
        }
      ];

      values.forEach((cell) => {
        doc
          .fillColor(
            COLORS.text
          )
          .font(
            cell.bold
              ? "Helvetica-Bold"
              : "Helvetica"
          )
          .fontSize(7.5)
          .text(
            cell.text,
            cellX + 7,
            rowY + 13,
            {
              width:
                cell.width - 14,
              align: "center",
              ellipsis: true
            }
          );

        cellX += cell.width;
      });
    }
  );

  doc.y =
    y + totalHeight + 17;
}

function drawCharts(
  doc,
  result
) {
  ensureSpace(doc, 330);

  doc
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(
      "Visual Score Comparison",
      doc.page.margins.left,
      doc.y,
      {
        width:
          getContentWidth(doc)
      }
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "The charts below compare the three category scores and their position within the available score range.",
      doc.page.margins.left,
      doc.y + 21,
      {
        width:
          getContentWidth(doc)
      }
    );

  doc.y += 48;

  drawScoreBarChart(
    doc,
    result
  );

  ensureSpace(doc, 270);

  const donut =
    drawScoreDonutChart(
      doc,
      result
    );

  drawSeverityRangeChart(
    doc,
    result,
    {
      x:
        donut.x +
        donut.width +
        14,
      y: donut.y
    }
  );

  ensureSpace(doc, 300);

  drawScoreRadarChart(
    doc,
    result
  );
}

function drawScoreNotice(
  doc
) {
  ensureSpace(doc, 105);

  const x =
    doc.page.margins.left;

  const y = doc.y;

  const width =
    getContentWidth(doc);

  const height = 86;

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
      "Score interpretation notice",
      x + 18,
      y + 15
    );

  doc
    .fillColor(COLORS.text)
    .font("Helvetica")
    .fontSize(7.8)
    .text(
      "DASS-21 scores reflect self-reported symptoms during the assessed period. They do not establish a diagnosis and should not be used alone to make medical or treatment decisions. Temporary circumstances may influence the result.",
      x + 18,
      y + 35,
      {
        width: width - 36,
        lineGap: 3,
        align: "justify"
      }
    );

  doc.y =
    y + height + 12;
}

export function drawDassScoreSection({
  doc,
  result = {},
  showCharts = true
}) {
  if (!doc) {
    throw new Error(
      "PDF document instance is required"
    );
  }

  drawSectionHeading(doc, {
    title: "Assessment Scores",
    subtitle:
      "The DASS-21 produces separate scores for depression, anxiety and stress. Each final score ranges from 0 to 42."
  });

  drawScoreCards(
    doc,
    result
  );

  drawScoringExplanation(doc);

  drawHighestScoreSummary(
    doc,
    result
  );

  drawScoreTable(
    doc,
    result
  );

  if (showCharts) {
    drawCharts(
      doc,
      result
    );
  }

  drawScoreNotice(doc);
}