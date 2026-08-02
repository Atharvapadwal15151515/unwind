const COLORS = {
  primary: "#7C3AED",
  secondary: "#EC4899",
  blue: "#3B82F6",

  dark: "#0F172A",
  text: "#334155",
  muted: "#64748B",

  white: "#FFFFFF",
  border: "#E2E8F0",
  background: "#FAFAFC"
};

function getContentWidth(doc) {
  return (
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right
  );
}

function drawBrandLogo(
  doc,
  x,
  y
) {
  /*
    Simple logo so no external image is required.
  */

  doc
    .save()
    .circle(x + 18, y + 18, 18)
    .fillColor(COLORS.primary)
    .fill()
    .restore();

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(
      "U",
      x + 9,
      y + 10,
      {
        width: 18,
        align: "center"
      }
    );
}

function drawTopLine(
  doc,
  y
) {
  doc
    .save()
    .moveTo(0, y)
    .lineTo(doc.page.width, y)
    .lineWidth(5)
    .strokeColor(COLORS.primary)
    .stroke()
    .restore();
}

export function drawDassPdfHeader({
  doc,
  title = "DASS-21 REPORT",
  subtitle = "",
  section = "",
  reportId = "",
  showDivider = true
}) {
  if (!doc) {
    throw new Error(
      "PDF document instance is required."
    );
  }

  const x =
    doc.page.margins.left;

  const y = 28;

  const width =
    getContentWidth(doc);

  drawTopLine(doc, 0);

  drawBrandLogo(doc, x, y);

  /*
      Application Name
  */

  doc
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(
      "UNWIND",
      x + 50,
      y + 1
    );

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      title,
      x + 50,
      y + 23
    );

  if (subtitle) {
    doc
      .fillColor(COLORS.muted)
      .font("Helvetica")
      .fontSize(8)
      .text(
        subtitle,
        x + 50,
        y + 41,
        {
          width: 260
        }
      );
  }

  /*
      Right Side Information
  */

  const rightX =
    x + width - 175;

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(
      "SECTION",
      rightX,
      y + 3
    );

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      section || "Overview",
      rightX,
      y + 15
    );

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(
      "REPORT ID",
      rightX,
      y + 35
    );

  doc
    .fillColor(COLORS.dark)
    .font("Helvetica")
    .fontSize(8)
    .text(
      reportId || "N/A",
      rightX,
      y + 47,
      {
        width: 160,
        ellipsis: true
      }
    );

  if (showDivider) {
    doc
      .save()
      .moveTo(
        x,
        92
      )
      .lineTo(
        x + width,
        92
      )
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke()
      .restore();
  }

  /*
      Reset cursor so body starts below header
  */

  doc.y = 105;
}