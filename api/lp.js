import { readFileSync } from "fs";
import { join } from "path";
import { checkAuth, sendUnauthorized } from "../lib/auth.js";

const htmlJa = readFileSync(join(process.cwd(), "static", "lp.html"), "utf8");
const htmlEn = readFileSync(join(process.cwd(), "static", "lp-en.html"), "utf8");

export default function handler(req, res) {
  if (!checkAuth(req)) return sendUnauthorized(res);

  const lang = req.query.lang;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(lang === "en" ? htmlEn : htmlJa);
}
