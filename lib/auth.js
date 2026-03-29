export function checkAuth(req) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) return true;

  const auth = req.headers.authorization;
  if (!auth) return false;

  const parts = auth.split(" ");
  if (parts[0] !== "Basic" || !parts[1]) return false;

  const decoded = Buffer.from(parts[1], "base64").toString();
  return decoded === `${user}:${pass}`;
}

export function sendUnauthorized(res) {
  res.setHeader("WWW-Authenticate", 'Basic realm="EchoTalk"');
  return res.status(401).send("Authentication required");
}
