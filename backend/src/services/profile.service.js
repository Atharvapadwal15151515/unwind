import {
  findProfileByUserId,
  updateProfile
} from "../models/profile.model.js";

import AppError from "../utils/AppError.js";

export async function updateUserProfile({
  userId,
  fullName,
  displayName,
  dateOfBirth,
  gender,
  occupationType
}) {
  const existingProfile = await findProfileByUserId(userId);

  if (!existingProfile) {
    throw new AppError(
      "Profile not found",
      404
    );
  }

  const updatedProfile = await updateProfile(userId, {
    fullName,
    displayName,
    dateOfBirth,
    gender,
    occupationType
  });

  return updatedProfile;
}

export async function getUserProfile(userId) {
  const profile = await findProfileByUserId(userId);

  if (!profile) {
    throw new AppError(
      "Profile not found",
      404
    );
  }

  return profile;
}