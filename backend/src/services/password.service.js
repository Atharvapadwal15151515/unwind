import {
  hashPassword,
  comparePassword
} from "../utils/hashPassword.js";

export async function createPasswordHash(password) {
  return hashPassword(password);
}

export async function verifyPassword(password, passwordHash) {
  return comparePassword(password, passwordHash);
}