import {
  findUserById,
  deleteUser
} from "../models/user.model.js";

import { findProfileByUserId } from "../models/profile.model.js";


import { comparePasswords } from "../utils/hashPassword.js";
import { deleteCloudinaryImage } from "./cloudinary.service.js";

import AppError from "../utils/AppError.js";

export async function deleteAccount({
  userId,
  password
}) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await comparePasswords(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new AppError("Incorrect password", 401);
  }

  const profile = await findProfileByUserId(userId);

  if (
    profile &&
    profile.profile_image_public_id
  ) {
    await deleteCloudinaryImage(
      profile.profile_image_public_id
    );
  }

  await deleteUser(userId);

  return true;
}