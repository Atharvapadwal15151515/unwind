import { z } from "zod";

export const selectIdentitySchema = z.object({
  identity_mode: z.enum(["username", "anonymous"], {
    message: "Identity mode must be either username or anonymous",
  }),
});