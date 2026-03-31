import { Redis } from "@upstash/redis";
import { checkAuth, sendUnauthorized } from "../lib/auth.js";

const TRENDS_KEY = "echotalk:trends";

export default async function handler(req, res) {
  if (!checkAuth(req)) return sendUnauthorized(res);

  const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  const trends = await redis.get(TRENDS_KEY);
  if (!trends) {
    return res.status(204).end();
  }

  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.json(trends);
}
