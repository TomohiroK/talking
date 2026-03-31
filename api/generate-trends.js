import { Redis } from "@upstash/redis";

const TREND_PROMPT = `あなたはトレンドリサーチャーです。日本で今話題になっているトピックを、年齢層別にそれぞれ3つずつ生成してください。英会話の話題スターターとして使います。

年齢層:
- toddler（6歳未満）: 幼児が今ハマっているもの（人気キャラクター、歌、遊び、アニメ）
- teen（7-15歳）: 小中学生の間で流行っているもの（ゲーム、YouTube、学校の話題、スポーツ、アニメ）
- young（16-25歳）: 若者が今関心を持っているもの（SNSトレンド、就活・キャリア、音楽、テクノロジー）
- adult（25歳以上）: 大人が話題にしていること（時事ニュース、ライフスタイル、仕事、旅行、健康）

要件:
- 各トピックは英語で1文（短く）。日本のトレンドを英語で表現する
- 今週〜今月の日本のリアルなトレンドを反映する
- 楽しい話題と学びになる話題を混ぜる
- JSON形式で出力: { "toddler": ["...", "...", "..."], "teen": [...], "young": [...], "adult": [...] }
- JSONのみ、マークダウンのフェンスなし`;

const TRENDS_KEY = "echotalk:trends";
const TRENDS_TTL_SECONDS = 90000; // 25 hours

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  const apiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: TREND_PROMPT }] }],
        generationConfig: { temperature: 0.9 },
      }),
    }
  );

  if (!apiRes.ok) {
    const errText = await apiRes.text();
    return res.status(500).json({ error: "Gemini API error", detail: errText });
  }

  const json = await apiRes.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const trends = JSON.parse(text.replace(/```json?\n?|\n?```/g, ""));

  await redis.set(TRENDS_KEY, trends, { ex: TRENDS_TTL_SECONDS });

  return res.json({ ok: true, trends });
}
