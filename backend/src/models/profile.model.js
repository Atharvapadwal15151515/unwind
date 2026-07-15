import pool from "../config/database.js";

export async function createProfile({
  userId,
  fullName,
  displayName = null,
  dateOfBirth = null,
  gender = null,
  occupationType = null,
  profileImageUrl = null,
  profileImagePublicId = null
}) {
  const query = `
    INSERT INTO user_profiles (
      user_id,
      full_name,
      display_name,
      date_of_birth,
      gender,
      occupation_type,
      profile_image_url,
      profile_image_public_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    userId,
    fullName,
    displayName,
    dateOfBirth,
    gender,
    occupationType,
    profileImageUrl,
    profileImagePublicId
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function findProfileByUserId(userId) {
  const query = `
    SELECT *
    FROM user_profiles
    WHERE user_id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

export async function updateProfile(userId, updates) {
  const {
    fullName,
    displayName,
    dateOfBirth,
    gender,
    occupationType,
    profileImageUrl,
    profileImagePublicId
  } = updates;

  const query = `
    UPDATE user_profiles
    SET
      full_name = COALESCE($2, full_name),
      display_name = COALESCE($3, display_name),
      date_of_birth = COALESCE($4, date_of_birth),
      gender = COALESCE($5, gender),
      occupation_type = COALESCE($6, occupation_type),
      profile_image_url = COALESCE($7, profile_image_url),
      profile_image_public_id = COALESCE($8, profile_image_public_id),
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING *
  `;

  const values = [
    userId,
    fullName ?? null,
    displayName ?? null,
    dateOfBirth ?? null,
    gender ?? null,
    occupationType ?? null,
    profileImageUrl ?? null,
    profileImagePublicId ?? null
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}