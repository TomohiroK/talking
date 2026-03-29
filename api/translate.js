import { checkAuth, sendUnauthorized } from "../lib/auth.js";

const LANG_NAMES = { en: "English", id: "Indonesian", ja: "Japanese" };

export default async function handler(req, res) {
  if (!checkAuth(req)) return sendUnauthorized(res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { text, sourceLang } = req.body;
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  const model = process.env.GEMINI_TRANSLATE_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const langName = LANG_NAMES[sourceLang] || "English";

  try {
    const apiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following ${langName} text to natural Japanese. Return ONLY the translation, nothing else.\n\n${text}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      console.error("[translate] api error:", apiRes.status, data.error?.message);
      return res.status(502).json({ error: "Translation service unavailable" });
    }

    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ translation: translated.trim() });
  } catch (e) {
    console.error("[translate] error:", e.message);
    return res.status(500).json({ error: "Translation service unavailable" });
  }
}
