const DEFAULT_COLORS = {
  depression: "#8B5CF6",
  anxiety: "#F97316",
  stress: "#06B6D4",

  green: "#22C55E",
  yellow: "#EAB308",
  orange: "#F97316",
  red: "#EF4444",

  text: "#0F172A",
  muted: "#64748B",
  grid: "#CBD5E1",
  background: "#F8FAFC"
};

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(Number(value) || 0, minimum),
    maximum
  );
}

function drawCard(
  doc,
  x,
  y,
  width,
  height,
  options = {}
) {
  const {
    backgroundColor = "#FFFFFF",
    borderColor = "#E2E8F0",
    radius = 12
  } = options;

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

function drawChartTitle(
  doc,
  title,
  subtitle,
  x,
  y,
  width
) {
  doc
    .fillColor(DEFAULT_COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(title, x, y, {
      width
    });

  if (subtitle) {
    doc
      .fillColor(DEFAULT_COLORS.muted)
      .font("Helvetica")
      .fontSize(8)
      .text(subtitle, x, y + 20, {
        width,
        lineGap: 2
      });
  }
}

function polarPoint(
  centerX,
  centerY,
  radius,
  angle
) {
  return {
    x:
      centerX +
      Math.cos(angle) * radius,

    y:
      centerY +
      Math.sin(angle) * radius
  };
}

function drawPieSlice(
  doc,
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle,
  color
) {
  const steps = Math.max(
    8,
    Math.ceil(
      Math.abs(endAngle - startAngle) * 18
    )
  );

  doc
    .save()
    .fillColor(color)
    .moveTo(centerX, centerY);

  for (
    let index = 0;
    index <= steps;
    index += 1
  ) {
    const angle =
      startAngle +
      ((endAngle - startAngle) * index) /
        steps;

    const point = polarPoint(
      centerX,
      centerY,
      radius,
      angle
    );

    doc.lineTo(point.x, point.y);
  }

  doc
    .lineTo(centerX, centerY)
    .fill()
    .restore();
}

/*
  BAR CHART
  Compares Depression, Anxiety and Stress scores.
*/
export function drawScoreBarChart(
  doc,
  result,
  options = {}
) {
  const {
    x = doc.page.margins.left,
    y = doc.y,
    width =
      doc.page.width -
      doc.page.margins.left -
      doc.page.margins.right,
    height = 240
  } = options;

  drawCard(doc, x, y, width, height, {
    backgroundColor: "#FAF5FF",
    borderColor: "#DDD6FE"
  });

  drawChartTitle(
    doc,
    "Category Score Comparison",
    "Each category is scored independently from 0 to 42.",
    x + 18,
    y + 16,
    width - 36
  );

  const categories = [
    {
      name: "Depression",
      score: clamp(
        result?.depression_score,
        0,
        42
      ),
      level:
        result?.depression_level ??
        "Not available",
      color: DEFAULT_COLORS.depression
    },
    {
      name: "Anxiety",
      score: clamp(
        result?.anxiety_score,
        0,
        42
      ),
      level:
        result?.anxiety_level ??
        "Not available",
      color: DEFAULT_COLORS.anxiety
    },
    {
      name: "Stress",
      score: clamp(
        result?.stress_score,
        0,
        42
      ),
      level:
        result?.stress_level ??
        "Not available",
      color: DEFAULT_COLORS.stress
    }
  ];

  const labelWidth = 90;
  const chartX = x + labelWidth + 20;
  const chartWidth = width - labelWidth - 48;
  const firstRowY = y + 78;
  const rowGap = 49;
  const barHeight = 23;

  categories.forEach(
    (category, index) => {
      const rowY =
        firstRowY + index * rowGap;

      doc
        .fillColor(DEFAULT_COLORS.text)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          category.name,
          x + 18,
          rowY + 5,
          {
            width: labelWidth
          }
        );

      doc
        .save()
        .roundedRect(
          chartX,
          rowY,
          chartWidth,
          barHeight,
          7
        )
        .fillColor("#E2E8F0")
        .fill()
        .restore();

      const filledWidth =
        chartWidth *
        (category.score / 42);

      if (filledWidth > 0) {
        doc
          .save()
          .roundedRect(
            chartX,
            rowY,
            filledWidth,
            barHeight,
            7
          )
          .fillColor(category.color)
          .fill()
          .restore();
      }

      doc
        .fillColor(
          filledWidth > 52
            ? "#FFFFFF"
            : DEFAULT_COLORS.text
        )
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
          `${category.score}/42`,
          filledWidth > 52
            ? chartX + 8
            : chartX + filledWidth + 7,
          rowY + 7
        );

      doc
        .fillColor(category.color)
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .text(
          String(category.level)
            .replaceAll("_", " ")
            .toUpperCase(),
          chartX,
          rowY + 28,
          {
            width: chartWidth,
            align: "right"
          }
        );
    }
  );

  doc.y = y + height + 15;

  return {
    x,
    y,
    width,
    height
  };
}

/*
  DOUGHNUT CHART
  Displays the relative distribution of the three scores.
*/
export function drawScoreDonutChart(
  doc,
  result,
  options = {}
) {
  const {
    x = doc.page.margins.left,
    y = doc.y,
    width = 250,
    height = 255
  } = options;

  drawCard(doc, x, y, width, height, {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA"
  });

  drawChartTitle(
    doc,
    "Relative Distribution",
    "A visual comparison between the three category scores.",
    x + 15,
    y + 15,
    width - 30
  );

  const data = [
    {
      name: "Depression",
      value: clamp(
        result?.depression_score,
        0,
        42
      ),
      color: DEFAULT_COLORS.depression
    },
    {
      name: "Anxiety",
      value: clamp(
        result?.anxiety_score,
        0,
        42
      ),
      color: DEFAULT_COLORS.anxiety
    },
    {
      name: "Stress",
      value: clamp(
        result?.stress_score,
        0,
        42
      ),
      color: DEFAULT_COLORS.stress
    }
  ];

  const total =
    data.reduce(
      (sum, item) => sum + item.value,
      0
    ) || 1;

  const centerX = x + width / 2;
  const centerY = y + 128;
  const outerRadius = 62;
  const innerRadius = 33;

  let currentAngle = -Math.PI / 2;

  data.forEach((item) => {
    const sliceAngle =
      (item.value / total) *
      Math.PI *
      2;

    drawPieSlice(
      doc,
      centerX,
      centerY,
      outerRadius,
      currentAngle,
      currentAngle + sliceAngle,
      item.color
    );

    currentAngle += sliceAngle;
  });

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
    .fillColor(DEFAULT_COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(15)
    .text(
      String(
        data.reduce(
          (sum, item) =>
            sum + item.value,
          0
        )
      ),
      centerX - 30,
      centerY - 10,
      {
        width: 60,
        align: "center"
      }
    );

  doc
    .fillColor(DEFAULT_COLORS.muted)
    .font("Helvetica")
    .fontSize(6.5)
    .text(
      "display total",
      centerX - 35,
      centerY + 8,
      {
        width: 70,
        align: "center"
      }
    );

  const legendY = y + 204;

  data.forEach((item, index) => {
    const legendX =
      x + 18 + index * 74;

    doc
      .circle(
        legendX,
        legendY,
        4
      )
      .fillColor(item.color)
      .fill();

    doc
      .fillColor(DEFAULT_COLORS.muted)
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        item.name,
        legendX + 7,
        legendY - 3
      );
  });

  doc
    .fillColor(DEFAULT_COLORS.muted)
    .fontSize(6.5)
    .text(
      "The categories remain separate measures and are not combined into one clinical score.",
      x + 15,
      y + 226,
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

/*
  SEVERITY RANGE DIAGRAM
*/
export function drawSeverityRangeChart(
  doc,
  result,
  options = {}
) {
  const {
    x = doc.page.margins.left,
    y = doc.y,
    width = 280,
    height = 255
  } = options;

  drawCard(doc, x, y, width, height, {
    backgroundColor: "#ECFEFF",
    borderColor: "#A5F3FC"
  });

  drawChartTitle(
    doc,
    "Severity Position",
    "Shows where each result falls within its labelled range.",
    x + 16,
    y + 15,
    width - 32
  );

  const levels = [
    "normal",
    "mild",
    "moderate",
    "severe",
    "extremely severe"
  ];

  const levelColors = [
    "#22C55E",
    "#84CC16",
    "#EAB308",
    "#F97316",
    "#EF4444"
  ];

  const categories = [
    {
      name: "Depression",
      level:
        result?.depression_level,
      color: DEFAULT_COLORS.depression
    },
    {
      name: "Anxiety",
      level:
        result?.anxiety_level,
      color: DEFAULT_COLORS.anxiety
    },
    {
      name: "Stress",
      level:
        result?.stress_level,
      color: DEFAULT_COLORS.stress
    }
  ];

  categories.forEach(
    (category, categoryIndex) => {
      const rowY =
        y + 76 + categoryIndex * 52;

      doc
        .fillColor(DEFAULT_COLORS.text)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
          category.name,
          x + 16,
          rowY
        );

      const chartX = x + 16;
      const chartY = rowY + 17;
      const chartWidth = width - 32;
      const gap = 2;
      const segmentWidth =
        (chartWidth - gap * 4) / 5;

      const currentLevel =
        String(category.level ?? "")
          .replaceAll("_", " ")
          .toLowerCase();

      levels.forEach(
        (level, index) => {
          const segmentX =
            chartX +
            index *
              (segmentWidth + gap);

          const active =
            currentLevel === level;

          doc
            .save()
            .roundedRect(
              segmentX,
              chartY,
              segmentWidth,
              15,
              4
            )
            .fillColor(
              active
                ? levelColors[index]
                : "#E2E8F0"
            )
            .fill()
            .restore();
        }
      );

      doc
        .fillColor(category.color)
        .font("Helvetica-Bold")
        .fontSize(7)
        .text(
          currentLevel
            ? currentLevel.toUpperCase()
            : "NOT AVAILABLE",
          chartX,
          chartY + 20,
          {
            width: chartWidth,
            align: "right"
          }
        );
    }
  );

  return {
    x,
    y,
    width,
    height
  };
}

/*
  RESPONSE FREQUENCY BAR CHART
*/
export function drawResponseFrequencyChart(
  doc,
  responses = [],
  options = {}
) {
  const {
    x = doc.page.margins.left,
    y = doc.y,
    width =
      doc.page.width -
      doc.page.margins.left -
      doc.page.margins.right,
    height = 250
  } = options;

  drawCard(doc, x, y, width, height, {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3"
  });

  drawChartTitle(
    doc,
    "Response Frequency",
    "The number of answers recorded at each response intensity.",
    x + 18,
    y + 15,
    width - 36
  );

  const counts = [0, 0, 0, 0];

  responses.forEach((response) => {
    const value = Number(
      response?.answer_value ??
      response?.answerValue ??
      0
    );

    if (value >= 0 && value <= 3) {
      counts[value] += 1;
    }
  });

  const labels = [
    "Did not apply",
    "Applied sometimes",
    "Applied often",
    "Applied very much"
  ];

  const colors = [
    "#22C55E",
    "#EAB308",
    "#F97316",
    "#EF4444"
  ];

  const chartTop = y + 76;
  const chartBottom = y + height - 49;
  const chartHeight =
    chartBottom - chartTop;

  const maximumCount = Math.max(
    ...counts,
    1
  );

  const barWidth = 64;
  const availableWidth =
    width - 40;

  const gap =
    (availableWidth -
      barWidth * 4) /
    5;

  counts.forEach((count, index) => {
    const barHeight =
      chartHeight *
      (count / maximumCount);

    const barX =
      x +
      20 +
      gap +
      index * (barWidth + gap);

    const barY =
      chartBottom - barHeight;

    doc
      .save()
      .roundedRect(
        barX,
        barY,
        barWidth,
        Math.max(barHeight, 3),
        7
      )
      .fillColor(colors[index])
      .fill()
      .restore();

    doc
      .fillColor(DEFAULT_COLORS.text)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        String(count),
        barX,
        barY - 16,
        {
          width: barWidth,
          align: "center"
        }
      );

    doc
      .fillColor(DEFAULT_COLORS.muted)
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        labels[index],
        barX - 5,
        chartBottom + 8,
        {
          width: barWidth + 10,
          align: "center"
        }
      );
  });

  doc.y = y + height + 15;

  return {
    x,
    y,
    width,
    height
  };
}

/*
  QUESTION 1–21 LINE GRAPH
*/
export function drawQuestionResponseLineChart(
  doc,
  responses = [],
  options = {}
) {
  const {
    x = doc.page.margins.left,
    y = doc.y,
    width =
      doc.page.width -
      doc.page.margins.left -
      doc.page.margins.right,
    height = 270
  } = options;

  drawCard(doc, x, y, width, height, {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE"
  });

  drawChartTitle(
    doc,
    "Question Response Pattern",
    "Response intensity across Questions 1–21.",
    x + 18,
    y + 15,
    width - 36
  );

  const chartX = x + 46;
  const chartY = y + 72;
  const chartWidth = width - 70;
  const chartHeight = 145;

  for (
    let answerValue = 0;
    answerValue <= 3;
    answerValue += 1
  ) {
    const lineY =
      chartY +
      chartHeight -
      (answerValue / 3) *
        chartHeight;

    doc
      .strokeColor(DEFAULT_COLORS.grid)
      .lineWidth(0.5)
      .moveTo(chartX, lineY)
      .lineTo(
        chartX + chartWidth,
        lineY
      )
      .stroke();

    doc
      .fillColor(DEFAULT_COLORS.muted)
      .font("Helvetica")
      .fontSize(7)
      .text(
        String(answerValue),
        chartX - 20,
        lineY - 3,
        {
          width: 15,
          align: "right"
        }
      );
  }

  const responseMap = new Map();

  responses.forEach((response) => {
    const questionNumber = Number(
      response?.question_number ??
      response?.questionNumber ??
      response?.question_id ??
      response?.questionId ??
      0
    );

    const answerValue = clamp(
      response?.answer_value ??
      response?.answerValue,
      0,
      3
    );

    responseMap.set(
      questionNumber,
      answerValue
    );
  });

  const depressionQuestions = [
    3, 5, 10, 13, 16, 17, 21
  ];

  const anxietyQuestions = [
    2, 4, 7, 9, 15, 19, 20
  ];

  const points = [];

  for (
    let question = 1;
    question <= 21;
    question += 1
  ) {
    const answerValue =
      responseMap.get(question) ?? 0;

    const pointX =
      chartX +
      ((question - 1) / 20) *
        chartWidth;

    const pointY =
      chartY +
      chartHeight -
      (answerValue / 3) *
        chartHeight;

    let color = DEFAULT_COLORS.stress;

    if (
      depressionQuestions.includes(
        question
      )
    ) {
      color =
        DEFAULT_COLORS.depression;
    } else if (
      anxietyQuestions.includes(
        question
      )
    ) {
      color =
        DEFAULT_COLORS.anxiety;
    }

    points.push({
      question,
      answerValue,
      x: pointX,
      y: pointY,
      color
    });
  }

  doc
    .save()
    .strokeColor("#2563EB")
    .lineWidth(2);

  points.forEach((point, index) => {
    if (index === 0) {
      doc.moveTo(point.x, point.y);
    } else {
      doc.lineTo(point.x, point.y);
    }
  });

  doc.stroke().restore();

  points.forEach((point) => {
    doc
      .circle(
        point.x,
        point.y,
        3.2
      )
      .fillColor(point.color)
      .fill();

    if (
      [1, 5, 10, 15, 21].includes(
        point.question
      )
    ) {
      doc
        .fillColor(DEFAULT_COLORS.muted)
        .font("Helvetica")
        .fontSize(6.5)
        .text(
          String(point.question),
          point.x - 8,
          chartY + chartHeight + 9,
          {
            width: 16,
            align: "center"
          }
        );
    }
  });

  doc
    .fillColor(DEFAULT_COLORS.muted)
    .font("Helvetica")
    .fontSize(7)
    .text(
      "Question number",
      chartX,
      chartY + chartHeight + 27,
      {
        width: chartWidth,
        align: "center"
      }
    );

  doc.y = y + height + 15;

  return {
    x,
    y,
    width,
    height
  };
}

/*
  RADAR CHART
*/
export function drawScoreRadarChart(
  doc,
  result,
  options = {}
) {
  const {
    x = doc.page.margins.left,
    y = doc.y,
    width = 270,
    height = 275
  } = options;

  drawCard(doc, x, y, width, height, {
    backgroundColor: "#FDF4FF",
    borderColor: "#F5D0FE"
  });

  drawChartTitle(
    doc,
    "Score Profile",
    "Relative shape of the three category scores.",
    x + 16,
    y + 15,
    width - 32
  );

  const centerX = x + width / 2;
  const centerY = y + 153;
  const maximumRadius = 76;

  const axes = [
    {
      label: "Depression",
      score: clamp(
        result?.depression_score,
        0,
        42
      ),
      angle: -Math.PI / 2
    },
    {
      label: "Anxiety",
      score: clamp(
        result?.anxiety_score,
        0,
        42
      ),
      angle:
        -Math.PI / 2 +
        (Math.PI * 2) / 3
    },
    {
      label: "Stress",
      score: clamp(
        result?.stress_score,
        0,
        42
      ),
      angle:
        -Math.PI / 2 +
        (Math.PI * 4) / 3
    }
  ];

  for (
    let level = 1;
    level <= 4;
    level += 1
  ) {
    const radius =
      maximumRadius * (level / 4);

    const polygonPoints =
      axes.map((axis) =>
        polarPoint(
          centerX,
          centerY,
          radius,
          axis.angle
        )
      );

    doc
      .save()
      .strokeColor("#D8B4FE")
      .lineWidth(0.6)
      .moveTo(
        polygonPoints[0].x,
        polygonPoints[0].y
      )
      .lineTo(
        polygonPoints[1].x,
        polygonPoints[1].y
      )
      .lineTo(
        polygonPoints[2].x,
        polygonPoints[2].y
      )
      .closePath()
      .stroke()
      .restore();
  }

  axes.forEach((axis) => {
    const endpoint = polarPoint(
      centerX,
      centerY,
      maximumRadius,
      axis.angle
    );

    doc
      .strokeColor("#C084FC")
      .lineWidth(0.6)
      .moveTo(centerX, centerY)
      .lineTo(endpoint.x, endpoint.y)
      .stroke();
  });

  const scorePoints = axes.map(
    (axis) =>
      polarPoint(
        centerX,
        centerY,
        maximumRadius *
          (axis.score / 42),
        axis.angle
      )
  );

  doc
    .save()
    .fillOpacity(0.28)
    .fillColor("#A855F7")
    .strokeColor("#7E22CE")
    .lineWidth(2)
    .moveTo(
      scorePoints[0].x,
      scorePoints[0].y
    )
    .lineTo(
      scorePoints[1].x,
      scorePoints[1].y
    )
    .lineTo(
      scorePoints[2].x,
      scorePoints[2].y
    )
    .closePath()
    .fillAndStroke()
    .restore();

  scorePoints.forEach((point) => {
    doc
      .circle(point.x, point.y, 4)
      .fillColor("#7E22CE")
      .fill();
  });

  axes.forEach((axis) => {
    const labelPoint = polarPoint(
      centerX,
      centerY,
      maximumRadius + 24,
      axis.angle
    );

    doc
      .fillColor(DEFAULT_COLORS.text)
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(
        `${axis.label}\n${axis.score}/42`,
        labelPoint.x - 34,
        labelPoint.y - 8,
        {
          width: 68,
          align: "center"
        }
      );
  });

  return {
    x,
    y,
    width,
    height
  };
}