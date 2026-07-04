import { BrevoClient } from "@getbrevo/brevo";

console.log("BREVO KEY loaded:", process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.slice(0, 12) + "..." : "UNDEFINED");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export default brevo;