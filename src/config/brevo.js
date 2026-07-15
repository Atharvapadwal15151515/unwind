import "dotenv/config";
import { BrevoClient } from "@getbrevo/brevo";

if (!process.env.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is missing");
}

const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
  timeoutInSeconds: 30,
  maxRetries: 3
});

export default brevoClient;