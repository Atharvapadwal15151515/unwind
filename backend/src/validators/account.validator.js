import { z } from "zod";

export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long")
});

export function validateDeleteAccount(data) {
  return deleteAccountSchema.parse(data);
}