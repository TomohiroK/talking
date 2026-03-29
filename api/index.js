import { readFileSync } from "fs";
import { join } from "path";
import { checkAuth, sendUnauthorized } from "../lib/auth.js";

const html = readFileSync(join(process.cwd(), "static", "index.html"), "utf8");

export default function handler(req, res) {
  if (!checkAuth(req)) return sendUnauthorized(res);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(html);
}
