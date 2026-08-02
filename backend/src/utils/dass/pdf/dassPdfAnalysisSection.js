import {
  DASS_PDF_THEME
} from "./dassPdfTheme.js";

import {
  safeText,
  formatLevel
} from "./dassPdfHelpers.js";

/*
  DASS-21 category question mappings
*/
const CATEGORY_QUESTIONS = {
  depression: [3, 5, 10, 13, 16, 17, 21],
  anxiety: [2, 4, 7, 9, 15, 19, 20],
  stress: [1, 6, 8, 11, 12, 14, 18]
};

const CATEGORY_COLORS = {
  depression: "#8B5CF6",
  anxiety: "#F97316",
  stress: "#06B6D4"
};

const RESPONSE_COLORS = [
  "#22C55E",
  "#FACC15",
  "#FB923C",
  "#EF4444"
];

function getPageWidth(doc) {
  return (
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right
  );
}

function getAnswerValue(response) {
  return Number(
    response?.answer_value ??
    response?.answerValue ??
    response?.value ??
    0
  );
}

function getQuestionNumber(response) {
  return Number(
    response?.question_number ??
    response?.questionNumber ??
    response?.question_id ??
    response?.questionId ??
    0
  );
}

function drawRoundedBox(
  doc,
  x,
  y,
  width,
  height,
  {
    fillColor = "#FFFFFF",
    borderColor = "#E2E8F0",
    radius = 12
  } = {}
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
    .fillColor(fillColor)
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
  const x = doc.page.margins.left;
  const width = getPageWidth(doc);

  doc
    .fillColor(
      DASS_PDF_THEME?.colors?.primary ??
      "#7C3AED"
    )
    .fontSize(19)
    .font("Helvetica-Bold")
    .text(title, x, doc.y);

  doc.moveDown(0.25);

  if (subtitle) {
    doc
      .fillColor("#64748B")
      .fontSize(9.5)
      .font("Helvetica")
      .text(
        subtitle,
        x,
        doc.y,
        {
          width,
          lineGap: 2
        }
      );
  }

  doc.moveDown(0.9);
}

function drawScoreBarChart(
  doc,
  result
) {
  const x = doc.page.margins.left;
  const y = doc.y;
  const width = getPageWidth(doc);
  const height = 235;

  drawRoundedBox(
    doc,
    x,
    y,
    width,
    height,
    {
      fillColor: "#FAFAFF",
      borderColor: "#DDD6FE"
    }
  );

  doc
    .fillColor("#1E293B")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "Category Score Comparison",
      x + 18,
      y + 15
    );

  doc
    .fillColor("#64748B")
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      "Each category is displayed on the DASS-21 scale from 0 to 42.",
      x + 18,
      y + 34
    );

  const data = [
    {
      label: "Depression",
      score: Number(
        result?.depression_score ?? 0
      ),
      level:
        result?.depression_level,
      color:
        CATEGORY_COLORS.depression
    },
    {
      label: "Anxiety",
      score: Number(
        result?.anxiety_score ?? 0
      ),
      level:
        result?.anxiety_level,
      color:
        CATEGORY_COLORS.anxiety
    },
    {
      label: "Stress",
      score: Number(
        result?.stress_score ?? 0
      ),
      level:
        result?.stress_level,
      color:
        CATEGORY_COLORS.stress
    }
  ];

  const chartX = x + 105;
  const chartWidth = width - 145;
  const firstBarY = y + 75;
  const barHeight = 24;
  const rowGap = 50;

  data.forEach(
    (item, index) => {
      const rowY =
        firstBarY +
        index * rowGap;

      doc
        .fillColor("#334155")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          item.label,
          x + 18,
          rowY + 3,
          {
            width: 80
          }
        );

      doc
        .save()
        .roundedRect(
          chartX,
          rowY,
          chartWidth,
          barHeight,
          8
        )
        .fillColor("#E2E8F0")
        .fill()
        .restore();

      const percentage =
        Math.max(
          0,
          Math.min(
            item.score / 42,
            1
          )
        );

      const filledWidth =
        chartWidth * percentage;

      if (filledWidth > 0) {
        doc
          .save()
          .roundedRect(
            chartX,
            rowY,
            filledWidth,
            barHeight,
            8
          )
          .fillColor(item.color)
          .fill()
          .restore();
      }

      doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          `${item.score}/42`,
          chartX + 8,
          rowY + 7
        );

      doc
        .fillColor(item.color)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
          formatLevel(
            item.level
          ),
          chartX,
          rowY + 29,
          {
            width: chartWidth,
            align: "right"
          }
        );
    }
  );

  doc.y = y + height + 16;
}

function drawDonutChart(
  doc,
  result
) {
  const x = doc.page.margins.left;
  const y = doc.y;
  const width = 245;
  const height = 250;

  drawRoundedBox(
    doc,
    x,
    y,
    width,
    height,
    {
      fillColor: "#FFF7ED",
      borderColor: "#FED7AA"
    }
  );

  doc
    .fillColor("#1E293B")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(
      "Relative Score Distribution",
      x + 15,
      y + 14,
      {
        width: width - 30,
        align: "center"
      }
    );

  const values = [
    Number(
      result?.depression_score ?? 0
    ),
    Number(
      result?.anxiety_score ?? 0
    ),
    Number(
      result?.stress_score ?? 0
    )
  ];

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) || 1;

  const centerX = x + width / 2;
  const centerY = y + 116;
  const outerRadius = 60;
  const innerRadius = 31;

  let currentAngle = -Math.PI / 2;

  values.forEach(
    (value, index) => {
      const angle =
        (value / total) *
        Math.PI *
        2;

      const endAngle =
        currentAngle + angle;

      doc
        .save()
        .moveTo(
          centerX,
          centerY
        )
        .fillColor(
          [
            CATEGORY_COLORS.depression,
            CATEGORY_COLORS.anxiety,
            CATEGORY_COLORS.stress
          ][index]
        )
        .path(
          createArcPath(
            centerX,
            centerY,
            outerRadius,
            currentAngle,
            endAngle
          )
        )
        .fill()
        .restore();

      currentAngle = endAngle;
    }
  );

  doc
    .save()
    .circle(
      centerX,
      centerY,
      innerRadius
    )
    .fillColor("#FFFFFF")
    .fill()
    .restore();

  doc
    .fillColor("#0F172A")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(
      String(
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        )
      ),
      centerX - 25,
      centerY - 9,
      {
        width: 50,
        align: "center"
      }
    );

  doc
    .fillColor("#64748B")
    .font("Helvetica")
    .fontSize(7)
    .text(
      "combined display",
      centerX - 40,
      centerY + 7,
      {
        width: 80,
        align: "center"
      }
    );

  const legendY = y + 188;

  const legends = [
    {
      label: "Depression",
      color:
        CATEGORY_COLORS.depression
    },
    {
      label: "Anxiety",
      color:
        CATEGORY_COLORS.anxiety
    },
    {
      label: "Stress",
      color:
        CATEGORY_COLORS.stress
    }
  ];

  legends.forEach(
    (legend, index) => {
      const legendX =
        x + 22 +
        index * 73;

      doc
        .circle(
          legendX,
          legendY,
          4
        )
        .fillColor(
          legend.color
        )
        .fill();

      doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(7)
        .text(
          legend.label,
          legendX + 7,
          legendY - 3
        );
    }
  );

  doc
    .fillColor("#64748B")
    .fontSize(7)
    .text(
      "This visual compares the three categories. It is not an overall mental-health score.",
      x + 15,
      y + 218,
      {
        width: width - 30,
        align: "center",
        lineGap: 1
      }
    );

  return {
    x,
    y,
    width,
    height
  };
}

function createArcPath(
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle
) {
  const steps = 40;

  let path = `M ${centerX} ${centerY} `;

  for (
    let index = 0;
    index <= steps;
    index += 1
  ) {
    const angle =
      startAngle +
      (
        (endAngle -
          startAngle) *
        index
      ) /
        steps;

    const pointX =
      centerX +
      Math.cos(angle) *
        radius;

    const pointY =
      centerY +
      Math.sin(angle) *
        radius;

    path +=
      `L ${pointX} ${pointY} `;
  }

  path += "Z";

  return path;
}

function drawSeverityDiagram(
  doc,
  result,
  startX,
  startY
) {
  const width = 280;
  const height = 250;

  drawRoundedBox(
    doc,
    startX,
    startY,
    width,
    height,
    {
      fillColor: "#F0FDFA",
      borderColor: "#99F6E4"
    }
  );

  doc
    .fillColor("#1E293B")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(
      "Severity Position",
      startX + 16,
      startY + 14
    );

  doc
    .fillColor("#64748B")
    .font("Helvetica")
    .fontSize(8)
    .text(
      "A visual placement of each category result.",
      startX + 16,
      startY + 32
    );

  const rows = [
    {
      label: "Depression",
      level:
        result?.depression_level,
      color:
        CATEGORY_COLORS.depression
    },
    {
      label: "Anxiety",
      level:
        result?.anxiety_level,
      color:
        CATEGORY_COLORS.anxiety
    },
    {
      label: "Stress",
      level:
        result?.stress_level,
      color:
        CATEGORY_COLORS.stress
    }
  ];

  const levels = [
    "normal",
    "mild",
    "moderate",
    "severe",
    "extremely_severe"
  ];

  rows.forEach(
    (row, rowIndex) => {
      const rowY =
        startY +
        70 +
        rowIndex * 52;

      doc
        .fillColor("#334155")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
          row.label,
          startX + 16,
          rowY
        );

      const trackX =
        startX + 16;
      const trackY =
        rowY + 17;
      const trackWidth =
        width - 32;
      const segmentWidth =
        trackWidth /
        levels.length;

      levels.forEach(
        (level, index) => {
          const active =
            safeText(row.level)
              .toLowerCase() ===
            level;

          doc
            .save()
            .roundedRect(
              trackX +
                index *
                  segmentWidth,
              trackY,
              segmentWidth - 2,
              15,
              4
            )
            .fillColor(
              active
                ? row.color
                : "#E2E8F0"
            )
            .fill()
            .restore();
        }
      );

      doc
        .fillColor(row.color)
        .font("Helvetica-Bold")
        .fontSize(7)
        .text(
          formatLevel(
            row.level
          ),
          trackX,
          trackY + 19,
          {
            width:
              trackWidth,
            align: "right"
          }
        );
    }
  );

  return {
    width,
    height
  };
}

function drawResponseFrequencyChart(
  doc,
  responses = []
) {
  const x = doc.page.margins.left;
  const y = doc.y;
  const width = getPageWidth(doc);
  const height = 245;

  drawRoundedBox(
    doc,
    x,
    y,
    width,
    height,
    {
      fillColor: "#FFF1F2",
      borderColor: "#FECDD3"
    }
  );

  doc
    .fillColor("#1E293B")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "Response Frequency",
      x + 18,
      y + 15
    );

  doc
    .fillColor("#64748B")
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      "Number of responses recorded at each answer intensity.",
      x + 18,
      y + 34
    );

  const counts = [0, 0, 0, 0];

  responses.forEach(
    (response) => {
      const value =
        getAnswerValue(
          response
        );

      if (
        value >= 0 &&
        value <= 3
      ) {
        counts[value] += 1;
      }
    }
  );

  const labels = [
    "Did not apply",
    "Applied sometimes",
    "Applied often",
    "Applied very much"
  ];

  const chartBottom =
    y + height - 48;
  const chartTop = y + 72;
  const chartHeight =
    chartBottom - chartTop;
  const maxCount =
    Math.max(
      ...counts,
      1
    );

  const barWidth = 62;
  const totalBarsWidth =
    barWidth * 4;
  const gap =
    (
      width -
      55 -
      totalBarsWidth
    ) / 5;

  counts.forEach(
    (count, index) => {
      const barHeight =
        chartHeight *
        (count / maxCount);

      const barX =
        x +
        gap +
        index *
          (
            barWidth +
            gap
          );

      const barY =
        chartBottom -
        barHeight;

      doc
        .save()
        .roundedRect(
          barX,
          barY,
          barWidth,
          Math.max(
            barHeight,
            3
          ),
          7
        )
        .fillColor(
          RESPONSE_COLORS[
            index
          ]
        )
        .fill()
        .restore();

      doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          String(count),
          barX,
          barY - 15,
          {
            width:
              barWidth,
            align:
              "center"
          }
        );

      doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(6.7)
        .text(
          labels[index],
          barX - 5,
          chartBottom + 8,
          {
            width:
              barWidth + 10,
            align:
              "center"
          }
        );
    }
  );

  doc.y = y + height + 16;
}

function drawQuestionResponseLine(
  doc,
  responses = []
) {
  const x = doc.page.margins.left;
  const y = doc.y;
  const width = getPageWidth(doc);
  const height = 265;

  drawRoundedBox(
    doc,
    x,
    y,
    width,
    height,
    {
      fillColor: "#EFF6FF",
      borderColor: "#BFDBFE"
    }
  );

  doc
    .fillColor("#1E293B")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      "Question-by-Question Response Pattern",
      x + 18,
      y + 15
    );

  doc
    .fillColor("#64748B")
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      "Answer intensity for Questions 1–21. This chart shows response pattern only.",
      x + 18,
      y + 34
    );

  const chartX = x + 42;
  const chartY = y + 68;
  const chartWidth =
    width - 66;
  const chartHeight = 145;

  for (
    let value = 0;
    value <= 3;
    value += 1
  ) {
    const gridY =
      chartY +
      chartHeight -
      (
        value / 3
      ) *
        chartHeight;

    doc
      .strokeColor("#CBD5E1")
      .lineWidth(0.5)
      .moveTo(
        chartX,
        gridY
      )
      .lineTo(
        chartX +
          chartWidth,
        gridY
      )
      .stroke();

    doc
      .fillColor("#64748B")
      .font("Helvetica")
      .fontSize(7)
      .text(
        String(value),
        chartX - 18,
        gridY - 3
      );
  }

  const responseMap =
    new Map();

  responses.forEach(
    (response) => {
      responseMap.set(
        getQuestionNumber(
          response
        ),
        getAnswerValue(
          response
        )
      );
    }
  );

  const points = [];

  for (
    let question = 1;
    question <= 21;
    question += 1
  ) {
    const value =
      Number(
        responseMap.get(
          question
        ) ?? 0
      );

    const pointX =
      chartX +
      (
        (question - 1) /
        20
      ) *
        chartWidth;

    const pointY =
      chartY +
      chartHeight -
      (
        value / 3
      ) *
        chartHeight;

    points.push({
      x: pointX,
      y: pointY,
      value,
      question
    });
  }

  doc
    .save()
    .strokeColor("#2563EB")
    .lineWidth(2);

  points.forEach(
    (point, index) => {
      if (index === 0) {
        doc.moveTo(
          point.x,
          point.y
        );
      } else {
        doc.lineTo(
          point.x,
          point.y
        );
      }
    }
  );

  doc.stroke().restore();

  points.forEach(
    (point) => {
      const category =
        getCategoryForQuestion(
          point.question
        );

      doc
        .circle(
          point.x,
          point.y,
          3.2
        )
        .fillColor(
          CATEGORY_COLORS[
            category
          ]
        )
        .fill();

      if (
        point.question === 1 ||
        point.question === 5 ||
        point.question === 10 ||
        point.question === 15 ||
        point.question === 21
      ) {
        doc
          .fillColor("#475569")
          .fontSize(6.5)
          .text(
            String(
              point.question
            ),
            point.x - 8,
            chartY +
              chartHeight +
              8,
            {
              width: 16,
              align:
                "center"
            }
          );
      }
    }
  );

  doc
    .fillColor("#64748B")
    .font("Helvetica")
    .fontSize(7)
    .text(
      "Question number",
      chartX,
      chartY +
        chartHeight +
        25,
      {
        width:
          chartWidth,
        align:
          "center"
      }
    );

  doc.y = y + height + 16;
}

function getCategoryForQuestion(
  questionNumber
) {
  if (
    CATEGORY_QUESTIONS.depression.includes(
      questionNumber
    )
  ) {
    return "depression";
  }

  if (
    CATEGORY_QUESTIONS.anxiety.includes(
      questionNumber
    )
  ) {
    return "anxiety";
  }

  return "stress";
}

function drawCategoryContributionCards(
  doc,
  responses = []
) {
  const x = doc.page.margins.left;
  const y = doc.y;
  const pageWidth =
    getPageWidth(doc);

  const gap = 10;
  const cardWidth =
    (
      pageWidth -
      gap * 2
    ) / 3;
  const cardHeight = 150;

  const categories = [
    {
      key: "depression",
      title:
        "Depression Responses"
    },
    {
      key: "anxiety",
      title:
        "Anxiety Responses"
    },
    {
      key: "stress",
      title:
        "Stress Responses"
    }
  ];

  const responseMap =
    new Map();

  responses.forEach(
    (response) => {
      responseMap.set(
        getQuestionNumber(
          response
        ),
        getAnswerValue(
          response
        )
      );
    }
  );

  categories.forEach(
    (
      category,
      categoryIndex
    ) => {
      const cardX =
        x +
        categoryIndex *
          (
            cardWidth +
            gap
          );

      const color =
        CATEGORY_COLORS[
          category.key
        ];

      drawRoundedBox(
        doc,
        cardX,
        y,
        cardWidth,
        cardHeight,
        {
          fillColor: "#FFFFFF",
          borderColor: color
        }
      );

      doc
        .fillColor(color)
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .text(
          category.title,
          cardX + 10,
          y + 12,
          {
            width:
              cardWidth -
              20,
            align:
              "center"
          }
        );

      const questions =
        CATEGORY_QUESTIONS[
          category.key
        ];

      const values =
        questions.map(
          (question) =>
            Number(
              responseMap.get(
                question
              ) ?? 0
            )
        );

      const total =
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        );

      const maxRaw = 21;

      doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(19)
        .text(
          String(total),
          cardX,
          y + 43,
          {
            width:
              cardWidth,
            align:
              "center"
          }
        );

      doc
        .fillColor("#64748B")
        .font("Helvetica")
        .fontSize(7)
        .text(
          `raw contribution out of ${maxRaw}`,
          cardX,
          y + 67,
          {
            width:
              cardWidth,
            align:
              "center"
          }
        );

      const miniChartX =
        cardX + 14;
      const miniChartY =
        y + 92;
      const miniWidth =
        cardWidth - 28;
      const miniHeight = 38;

      values.forEach(
        (
          value,
          index
        ) => {
          const barGap = 3;
          const barWidth =
            (
              miniWidth -
              barGap * 6
            ) / 7;

          const currentHeight =
            (
              value / 3
            ) *
            miniHeight;

          const barX =
            miniChartX +
            index *
              (
                barWidth +
                barGap
              );

          const barY =
            miniChartY +
            miniHeight -
            currentHeight;

          doc
            .save()
            .roundedRect(
              barX,
              barY,
              barWidth,
              Math.max(
                currentHeight,
                2
              ),
              2
            )
            .fillColor(color)
            .fill()
            .restore();
        }
      );
    }
  );

  doc.y =
    y +
    cardHeight +
    16;
}

export function drawDassAnalysisSection({
  doc,
  result,
  responses = []
}) {
  if (!doc) {
    throw new Error(
      "PDF document instance is required"
    );
  }

  drawSectionHeading(
    doc,
    "Visual Analysis",
    "The charts below provide different ways to understand the recorded DASS-21 responses. They are educational visual summaries and do not represent a diagnosis."
  );

  drawScoreBarChart(
    doc,
    result
  );

  const donutPosition =
    drawDonutChart(
      doc,
      result
    );

  drawSeverityDiagram(
    doc,
    result,
    donutPosition.x +
      donutPosition.width +
      14,
    donutPosition.y
  );

  doc.y =
    donutPosition.y +
    donutPosition.height +
    18;

  doc.addPage();

  drawSectionHeading(
    doc,
    "Response Pattern Analysis",
    "These visualisations show how the participant responded across the 21 assessment questions."
  );

  drawResponseFrequencyChart(
    doc,
    responses
  );

  drawQuestionResponseLine(
    doc,
    responses
  );

  doc.addPage();

  drawSectionHeading(
    doc,
    "Category Contribution",
    "Each DASS-21 category contains seven questions. The mini charts show the response intensity recorded for those questions."
  );

  drawCategoryContributionCards(
    doc,
    responses
  );

  doc
    .moveDown(0.5)
    .fillColor("#475569")
    .font("Helvetica")
    .fontSize(9)
    .text(
      "Chart guidance",
      {
        underline: true
      }
    );

  doc.moveDown(0.4);

  doc
    .fillColor("#64748B")
    .fontSize(8.5)
    .text(
      "Higher bars or points represent higher response intensity for the relevant questions. Scores across depression, anxiety and stress are separate measures and should not be combined into a single clinical percentage.",
      {
        align: "justify",
        lineGap: 3
      }
    );
}