import { z } from "zod";

const genders = [
  "male",
  "female",
  "non_binary",
  "prefer_not_to_say"
];

const occupations = [
  "student",
  "working_professional",
  "self_employed",
  "business_owner",
  "homemaker",
  "retired",
  "unemployed",
  "other"
];

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters")
      .optional(),

    displayName: z
      .string()
      .trim()
      .min(2, "Display name must be at least 2 characters")
      .max(50, "Display name cannot exceed 50 characters")
      .optional(),

    dateOfBirth: z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Date must be in YYYY-MM-DD format"
  )
  .optional(),

    gender: z
      .enum(genders)
      .optional(),

    occupationType: z
      .enum(occupations)
      .optional()
  }),

  params: z.object({}),

  query: z.object({})
});