import {
  createCommunityProfile,
  findCommunityProfileByAlias,
  findCommunityProfileByUserId,
  updateIdentityMode
} from "../../models/community/communityProfile.model.js";

import { generateAnonymousAlias } from "../../utils/generateAnonymousAlias.js";

async function createUniqueAnonymousAlias() {
  let anonymousAlias;
  let aliasExists = true;
  let attempts = 0;

  while (aliasExists && attempts < 10) {
    anonymousAlias = generateAnonymousAlias();

    const existingProfile =
      await findCommunityProfileByAlias(anonymousAlias);

    aliasExists = Boolean(existingProfile);
    attempts += 1;
  }

  if (aliasExists) {
    throw new Error(
      "Could not generate a unique anonymous alias. Please try again."
    );
  }

  return anonymousAlias;
}

export async function selectCommunityIdentity({
  userId,
  username,
  identityMode
}) {
  if (!userId) {
    const error = new Error("Authenticated user ID is required");
    error.statusCode = 401;
    throw error;
  }

  if (!["username", "anonymous"].includes(identityMode)) {
    const error = new Error(
      "Identity mode must be either username or anonymous"
    );
    error.statusCode = 400;
    throw error;
  }

  const existingProfile =
    await findCommunityProfileByUserId(userId);

  if (existingProfile?.is_suspended) {
    const error = new Error(
      "Your community profile has been suspended"
    );
    error.statusCode = 403;
    throw error;
  }

  if (existingProfile) {
    let anonymousAlias = existingProfile.anonymous_alias;

    if (
      identityMode === "anonymous" &&
      !anonymousAlias
    ) {
      anonymousAlias =
        await createUniqueAnonymousAlias();
    }

    const updatedProfile = await updateIdentityMode({
      userId,
      identityMode,
      displayName: username,
      anonymousAlias
    });

    return {
      profile: updatedProfile,
      visibleName:
        identityMode === "anonymous"
          ? updatedProfile.anonymous_alias
          : updatedProfile.display_name
    };
  }

  const anonymousAlias =
    await createUniqueAnonymousAlias();

  const profile = await createCommunityProfile({
    userId,
    displayName: username,
    anonymousAlias,
    identityMode
  });

  return {
    profile,
    visibleName:
      identityMode === "anonymous"
        ? profile.anonymous_alias
        : profile.display_name
  };
}

export async function getCommunityProfile(userId) {
  if (!userId) {
    const error = new Error("Authenticated user ID is required");
    error.statusCode = 401;
    throw error;
  }

  const profile =
    await findCommunityProfileByUserId(userId);

  if (!profile) {
    const error = new Error(
      "Community profile not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return {
    profile,
    visibleName:
      profile.identity_mode === "anonymous"
        ? profile.anonymous_alias
        : profile.display_name
  };
}