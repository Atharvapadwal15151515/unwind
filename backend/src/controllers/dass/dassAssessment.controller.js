import {
  getQuestions,
  startAssessment,
  saveAssessmentResponse,
  submitAssessment,
  exitAssessment,
} from "../../services/dass/dassAssessment.service.js";

export async function getDassQuestions(req, res, next) {
  try {
    const questions = await getQuestions();

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
}

export async function startDassAssessment(req, res, next) {
  try {
    const assessment = await startAssessment(
      req.user.user_id
    );

    res.status(201).json({
      success: true,
      message: "Assessment started successfully",
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveDassResponse(req, res, next) {
  try {
    const { assessmentId } = req.params;
    const { questionId, answerValue } = req.body;

    const result = await saveAssessmentResponse(
      assessmentId,
      questionId,
      answerValue
    );

    res.status(200).json({
      success: true,
      message: "Response saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitDassAssessment(
  req,
  res,
  next
) {
  try {
    const userId =
      req.user.user_id;

    const assessmentId =
      req.params.assessmentId;

    const result =
      await submitAssessment(
        userId,
        assessmentId
      );

    return res.status(200).json({
      success: true,
      message:
        "Assessment submitted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}
export async function abandonDassAssessment(req, res, next) {
  try {
    const { assessmentId } = req.params;

    const assessment = await exitAssessment(assessmentId);

    res.status(200).json({
      success: true,
      message: "Assessment abandoned successfully",
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}