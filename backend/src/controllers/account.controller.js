import { validateDeleteAccount } from "../validators/account.validator.js";
import { deleteAccount } from "../services/account.service.js";

export async function deleteAccountController(
  req,
  res,
  next
) {
  try {
    const { password } = validateDeleteAccount(req.body);

    await deleteAccount({
      userId: req.user.user_id,
      password
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}