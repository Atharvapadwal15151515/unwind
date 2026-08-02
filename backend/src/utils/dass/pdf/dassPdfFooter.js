const FOOTER_COLORS = {
  primary: "#7C3AED",
  text: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  background: "#F8FAFC",
  white: "#FFFFFF"
};

function getPageNumber(doc) {
  return (
    doc.bufferedPageRange().start +
    doc.bufferedPageRange().count
  );
}

function drawFooterLine(
  doc,
  x,
  y,
  width
) {
  doc
    .save()
    .strokeColor(
      FOOTER_COLORS.border
    )
    .lineWidth(0.8)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke()
    .restore();
}

function drawFooterBackground(
  doc,
  x,
  y,
  width,
  height
) {
  doc
    .save()
    .roundedRect(
      x,
      y,
      width,
      height,
      10
    )
    .fillColor(
      FOOTER_COLORS.background
    )
    .fill()
    .restore();
}

function drawBrandMark(
  doc,
  x,
  y
) {
  doc
    .save()
    .circle(
      x + 8,
      y + 8,
      8
    )
    .fillColor(
      FOOTER_COLORS.primary
    )
    .fill()
    .restore();

  doc
    .fillColor(
      FOOTER_COLORS.white
    )
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(
      "U",
      x + 3,
      y + 4,
      {
        width: 10,
        align: "center"
      }
    );
}

/**
 * Draws a footer on the current PDF page.
 *
 * Call this after rendering the page content,
 * but before adding the next page.
 */
export function drawDassPdfFooter({
  doc,
  pageNumber,
  reportReference,
  generatedAt
}) {
  if (!doc) {
    throw new Error(
      "PDF document instance is required"
    );
  }

  const pageWidth =
    doc.page.width;

  const pageHeight =
    doc.page.height;

  const marginLeft =
    doc.page.margins.left;

  const marginRight =
    doc.page.margins.right;

  const footerWidth =
    pageWidth -
    marginLeft -
    marginRight;

  const footerHeight = 42;

  const footerX =
    marginLeft;

  const footerY =
    pageHeight -
    doc.page.margins.bottom -
    footerHeight +
    10;

  const resolvedPageNumber =
    pageNumber ??
    getPageNumber(doc);

  const reference =
    reportReference
      ? String(reportReference)
      : "DASS-21 report";

  const generatedDate =
    generatedAt
      ? new Date(
          generatedAt
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }
        )
      : new Date().toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }
        );

  drawFooterLine(
    doc,
    footerX,
    footerY - 6,
    footerWidth
  );

  drawFooterBackground(
    doc,
    footerX,
    footerY,
    footerWidth,
    footerHeight
  );

  drawBrandMark(
    doc,
    footerX + 10,
    footerY + 13
  );

  doc
    .fillColor(
      FOOTER_COLORS.text
    )
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      "Unwind",
      footerX + 34,
      footerY + 12
    );

  doc
    .fillColor(
      FOOTER_COLORS.muted
    )
    .font("Helvetica")
    .fontSize(6.5)
    .text(
      "Mental wellness support, not diagnosis",
      footerX + 34,
      footerY + 23
    );

  doc
    .fillColor(
      FOOTER_COLORS.muted
    )
    .font("Helvetica")
    .fontSize(6.5)
    .text(
      `Reference: ${reference}`,
      footerX + 190,
      footerY + 12,
      {
        width: 190,
        ellipsis: true,
        align: "center"
      }
    );

  doc
    .fillColor(
      FOOTER_COLORS.muted
    )
    .font("Helvetica")
    .fontSize(6.5)
    .text(
      `Generated: ${generatedDate}`,
      footerX + 190,
      footerY + 23,
      {
        width: 190,
        align: "center"
      }
    );

  doc
    .fillColor(
      FOOTER_COLORS.primary
    )
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      `Page ${resolvedPageNumber}`,
      footerX +
        footerWidth -
        76,
      footerY + 17,
      {
        width: 60,
        align: "right"
      }
    );
}