import PDFDocument from "pdfkit";

import {
  DASS_PDF_THEME
} from "./dassPdfTheme.js";

import {
  safeText,
  formatDate,
  formatDateTime,
  getContentWidth,
  drawRoundedBox
} from "./dassPdfHelpers.js";

import {
  drawDassPdfHeader
} from "./dassPdfHeader.js";

import {
  drawDassPdfFooter
} from "./dassPdfFooter.js";

import {
  drawDassScoreSection
} from "./dassPdfScoreSection.js";

import {
  drawDassInterpretationSection
} from "./dassPdfInterpretationSection.js";

import {
  drawDassGuidanceSection
} from "./dassPdfGuidanceSection.js";

function parseInterpretation(
  interpretation
) {
  if (!interpretation) {
    return {};
  }

  if (
    typeof interpretation ===
    "object"
  ) {
    return interpretation;
  }

  try {
    return JSON.parse(
      interpretation
    );
  } catch {
    return {
      summary: safeText(
        interpretation,
        ""
      )
    };
  }
}

function buildInterpretationText(
  interpretation
) {
  const parsed =
    parseInterpretation(
      interpretation
    );

  const sections = [];

  if (
    parsed?.depression?.message
  ) {
    sections.push(
      `Depression: ${parsed.depression.message}`
    );
  }

  if (
    parsed?.anxiety?.message
  ) {
    sections.push(
      `Anxiety: ${parsed.anxiety.message}`
    );
  }

  if (
    parsed?.stress?.message
  ) {
    sections.push(
      `Stress: ${parsed.stress.message}`
    );
  }

  if (parsed?.summary) {
    sections.push(
      `Summary: ${parsed.summary}`
    );
  }

  return sections.join(
    "\n\n"
  );
}

function drawCoverPage({
  doc,
  assessment,
  result,
  report
}) {
  const theme =
    DASS_PDF_THEME;

  const pageWidth =
    doc.page.width;

  const pageHeight =
    doc.page.height;

  const margin =
    doc.page.margins.left;

  const contentWidth =
    getContentWidth(doc);

  doc
    .save()
    .rect(
      0,
      0,
      pageWidth,
      pageHeight
    )
    .fillColor(
      theme.colors.background
    )
    .fill()
    .restore();

  doc
    .save()
    .rect(
      0,
      0,
      pageWidth,
      225
    )
    .fillColor(
      theme.colors.primary
    )
    .fill()
    .restore();

  const logoCenterX =
    pageWidth / 2;

  doc
    .save()
    .circle(
      logoCenterX,
      67,
      27
    )
    .fillColor(
      theme.colors.white
    )
    .fill()
    .restore();

  doc
    .fillColor(
      theme.colors.primary
    )
    .font(
      theme.fonts.title
    )
    .fontSize(22)
    .text(
      "U",
      logoCenterX - 18,
      54,
      {
        width: 36,
        align: "center"
      }
    );

  doc
    .fillColor(
      theme.colors.white
    )
    .font(
      theme.fonts.title
    )
    .fontSize(26)
    .text(
      theme.app.name,
      margin,
      108,
      {
        width: contentWidth,
        align: "center"
      }
    );

  doc
    .font(
      theme.fonts.body
    )
    .fontSize(10)
    .text(
      "Mental Wellness Support Platform",
      margin,
      145,
      {
        width: contentWidth,
        align: "center"
      }
    );

  doc
    .fillColor(
      theme.colors.dark
    )
    .font(
      theme.fonts.title
    )
    .fontSize(23)
    .text(
      "DASS-21 Assessment Report",
      margin,
      258,
      {
        width: contentWidth,
        align: "center"
      }
    );

  doc
    .fillColor(
      theme.colors.muted
    )
    .font(
      theme.fonts.body
    )
    .fontSize(10)
    .text(
      "Depression, Anxiety and Stress Scale",
      margin,
      295,
      {
        width: contentWidth,
        align: "center"
      }
    );

  const cardX = margin;
  const cardY = 345;
  const cardWidth =
    contentWidth;
  const cardHeight = 210;

  drawRoundedBox(doc, {
    x: cardX,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    radius:
      theme.radius.lg,
    backgroundColor:
      theme.colors.white,
    borderColor:
      theme.colors.border
  });

  doc
    .fillColor(
      theme.colors.primary
    )
    .font(
      theme.fonts.heading
    )
    .fontSize(14)
    .text(
      "Assessment Information",
      cardX + 22,
      cardY + 21
    );

  const rows = [
    {
      label:
        "Assessment ID",
      value:
        assessment?.assessment_id ??
        result?.assessment_id
    },
    {
      label: "Status",
      value:
        assessment?.status
    },
    {
      label: "Started",
      value:
        formatDateTime(
          assessment?.started_at
        )
    },
    {
      label: "Completed",
      value:
        formatDateTime(
          assessment?.completed_at
        )
    },
    {
      label:
        "Report generated",
      value:
        formatDateTime(
          report?.generated_at ??
          new Date()
        )
    }
  ];

  let currentY =
    cardY + 61;

  rows.forEach(
    ({ label, value }) => {
      doc
        .fillColor(
          theme.colors.muted
        )
        .font(
          theme.fonts.bodyBold
        )
        .fontSize(7.5)
        .text(
          label.toUpperCase(),
          cardX + 22,
          currentY,
          {
            width: 140
          }
        );

      doc
        .fillColor(
          theme.colors.text
        )
        .font(
          theme.fonts.body
        )
        .fontSize(8.5)
        .text(
          safeText(value),
          cardX + 165,
          currentY - 1,
          {
            width:
              cardWidth - 188,
            ellipsis: true
          }
        );

      currentY += 28;
    }
  );

  const noticeY = 595;

  drawRoundedBox(doc, {
    x: margin,
    y: noticeY,
    width: contentWidth,
    height: 96,
    radius:
      theme.radius.md,
    backgroundColor:
      theme.colors.lightBlue,
    borderColor: "#93C5FD"
  });

  doc
    .fillColor(
      theme.colors.blue
    )
    .font(
      theme.fonts.bodyBold
    )
    .fontSize(9)
    .text(
      "About this report",
      margin + 17,
      noticeY + 15
    );

  doc
    .fillColor(
      theme.colors.text
    )
    .font(
      theme.fonts.body
    )
    .fontSize(8)
    .text(
      "This report presents the results of a DASS-21 self-report screening assessment. It supports mental-health awareness but does not provide a medical or psychological diagnosis.",
      margin + 17,
      noticeY + 37,
      {
        width:
          contentWidth - 34,
        lineGap: 3,
        align: "justify"
      }
    );

  doc
    .fillColor(
      theme.colors.muted
    )
    .font(
      theme.fonts.body
    )
    .fontSize(7.5)
    .text(
      `Prepared on ${formatDate(
        report?.generated_at ??
        new Date()
      )}`,
      margin,
      pageHeight - 58,
      {
        width: contentWidth,
        align: "center"
      }
    );
}

export function generateDassPdf({
  assessment = {},
  result = {},
  report = {}
}) {
  return new Promise(
    (resolve, reject) => {
      try {
        const theme =
          DASS_PDF_THEME;

        const doc =
          new PDFDocument({
            size:
              theme.page.size,

            bufferPages: true,

            margins: {
              top:
                theme.page.contentTop,

              bottom:
                theme.page
                  .contentBottomPadding,

              left:
                theme.page.margin,

              right:
                theme.page.margin
            },

            info: {
              Title:
                "Unwind DASS-21 Assessment Report",

              Author: "Unwind",

              Subject:
                "DASS-21 screening assessment report",

              Creator:
                "Unwind Mental Wellness Platform"
            }
          });

        const chunks = [];

        doc.on(
          "data",
          (chunk) => {
            chunks.push(chunk);
          }
        );

        doc.on(
          "end",
          () => {
            resolve(
              Buffer.concat(chunks)
            );
          }
        );

        doc.on(
          "error",
          reject
        );

        const pageSections = [
          {
            section: "Cover",
            subtitle: "",
            showHeader: false
          }
        ];

        let currentSection =
          pageSections[0];

        doc.on(
          "pageAdded",
          () => {
            pageSections.push({
              ...currentSection
            });
          }
        );

        const generatedAt =
          report?.generated_at ??
          new Date();

        const reportReference =
          report?.report_id ??
          assessment?.assessment_id ??
          result?.assessment_id ??
          "Not available";

        const normalizedReport = {
          ...report,

          interpretation_text:
            buildInterpretationText(
              report
                ?.interpretation_text
            )
        };

        /*
          PAGE 1 — COVER
        */

        drawCoverPage({
          doc,
          assessment,
          result,
          report:
            normalizedReport
        });

        /*
          PAGE 2 — SCORES
        */

        currentSection = {
          section: "Scores",
          subtitle:
            "Assessment score summary",
          showHeader: true
        };

        doc.addPage();

        drawDassScoreSection({
          doc,
          result,
          showCharts: false
        });

        /*
          PAGE 3 — INTERPRETATION
        */

        currentSection = {
          section:
            "Interpretation",
          subtitle:
            "Explanation of screening results",
          showHeader: true
        };

        doc.addPage();

        drawDassInterpretationSection({
          doc,
          result,
          report:
            normalizedReport
        });

        /*
          PAGE 4 — GUIDANCE
        */

        currentSection = {
          section: "Guidance",
          subtitle:
            "Supportive recommendations and next steps",
          showHeader: true
        };

        doc.addPage();

        drawDassGuidanceSection({
          doc,
          result
        });

        /*
          HEADERS AND FOOTERS
        */

        const pageRange =
          doc.bufferedPageRange();

        for (
          let pageIndex = 0;
          pageIndex <
          pageRange.count;
          pageIndex += 1
        ) {
          doc.switchToPage(
            pageIndex
          );

          const pageData =
            pageSections[
              pageIndex
            ] ?? {
              section: "Report",
              subtitle: "",
              showHeader:
                pageIndex !== 0
            };

          if (
            pageData.showHeader
          ) {
            drawDassPdfHeader({
              doc,

              title:
                theme.app
                  .reportTitle,

              subtitle:
                pageData.subtitle,

              section:
                pageData.section,

              reportId:
                reportReference
            });
          }

          if (pageIndex > 0) {
            drawDassPdfFooter({
              doc,

              pageNumber:
                pageIndex + 1,

              reportReference,

              generatedAt
            });
          }
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    }
  );
}