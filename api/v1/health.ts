// GET /api/v1/health — for the uptime monitor (D-018).
export function GET(): Response {
  return Response.json({ status: "ok", time: new Date().toISOString(), commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null });
}
