import { checkAuth, sendUnauthorized } from "../lib/auth.js";

export default function handler(req, res) {
  if (!checkAuth(req)) return sendUnauthorized(res);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  const wsUrl =
    "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent" +
    `?key=${apiKey}`;
  const model = process.env.GEMINI_MODEL || "models/gemini-3.1-flash-live-preview";

  return res.status(200).json({ wsUrl, model });
}
