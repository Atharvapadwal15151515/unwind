import pool from "../config/database.js";

export async function findUserByEmail(email) {
  const query = `
    SELECT *
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [email]);
  return rows[0] || null;
}

export async function findUserByUsername(username) {
  const query = `
    SELECT *
    FROM users
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [username]);
  return rows[0] || null;
}

export async function findUserByEmailOrUsername(identifier) {
  const query = `
    SELECT *
    FROM users
    WHERE LOWER(email) = LOWER($1)
       OR LOWER(username) = LOWER($1)
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [identifier]);
  return rows[0] || null;
}

export async function findUserById(userId) {
  const query = `
    SELECT
      user_id,
      email,
      username,
      password_hash,
      role,
      account_status,
      email_verified,
      two_factor_enabled,
      two_factor_method,
      last_login_at,
      created_at,
      updated_at
    FROM users
    WHERE user_id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

export async function createUser({
  email,
  username,
  passwordHash,
  role = "user"
}) {
  const query = `
    INSERT INTO users (
      email,
      username,
      password_hash,
      role
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      user_id,
      email,
      username,
      role,
      account_status,
      email_verified,
      two_factor_enabled,
      two_factor_method,
      created_at,
      updated_at
  `;

  const values = [
    email.toLowerCase().trim(),
    username.trim(),
    passwordHash,
    role
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function markEmailAsVerified(userId) {
  const query = `
    UPDATE users
    SET
      email_verified = TRUE,
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING
      user_id,
      email,
      username,
      role,
      account_status,
      email_verified,
      two_factor_enabled,
      two_factor_method,
      last_login_at,
      created_at,
      updated_at
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

export async function updatePassword(userId, passwordHash) {
  const query = `
    UPDATE users
    SET
      password_hash = $2,
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING user_id
  `;

  const { rows } = await pool.query(query, [
    userId,
    passwordHash
  ]);

  return rows[0] || null;
}

export async function updateLastLogin(userId) {
  const query = `
    UPDATE users
    SET
      last_login_at = NOW(),
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING last_login_at
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

export async function updateTwoFactorSettings(
  userId,
  enabled,
  method = null
) {
  const query = `
    UPDATE users
    SET
      two_factor_enabled = $2,
      two_factor_method = $3,
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING
      user_id,
      two_factor_enabled,
      two_factor_method,
      updated_at
  `;

  const { rows } = await pool.query(query, [
    userId,
    enabled,
    enabled ? method : null
  ]);

  return rows[0] || null;
}