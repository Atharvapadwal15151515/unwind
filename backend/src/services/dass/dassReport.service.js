import { getAssessmentById } from "../../models/dass/dassAssessment.model.js";
import { getResultByAssessmentId } from "../../models/dass/dassResult.model.js";
import { getReportByAssessmentId } from "../../models/dass/dassReport.model.js";
import { getResponsesByAssessmentId } from "../../models/dass/dassResponse.model.js";

import { generateDassPdf } from "../../utils/dass/pdf/generateDassPdf.js";

export async function getDassReport(
  userId,
  assessmentId
) {
  const assessment = await getAssessmentById(
    assessmentId
  );

  if (!assessment) {
    const error = new Error("Assessment not found");
    error.statusCode = 404;
    throw error;
  }

  if (assessment.user_id !== userId) {
    const error = new Error(
      "You are not authorized to access this report"
    );
    error.statusCode = 403;
    throw error;
  }

  const result = await getResultByAssessmentId(
    assessmentId
  );

  const report = await getReportByAssessmentId(
    assessmentId
  );

  return {
    assessment,
    result,
    report,
  };
}

export async function downloadDassReportPdf(
  userId,
  assessmentId
) {
  const assessment = await getAssessmentById(
    assessmentId
  );

  if (!assessment) {
    const error = new Error("Assessment not found");
    error.statusCode = 404;
    throw error;
  }

  if (assessment.user_id !== userId) {
    const error = new Error(
      "You are not authorized to download this report"
    );
    error.statusCode = 403;
    throw error;
  }

  const result = await getResultByAssessmentId(
    assessmentId
  );

  const report = await getReportByAssessmentId(
    assessmentId
  );

  const responses =
    await getResponsesByAssessmentId(
      assessmentId
    );

  const interpretation = JSON.parse(
    report.interpretation_text
  );

  const pdfBuffer =
    await generateDassPdf({
      assessment,
      result,
      report,
      responses,
      interpretation,
    });

  return pdfBuffer;
}