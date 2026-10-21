// POST /api/v1/events — aggregate counters only (14 §2). Never receives identities or helper progress (D-053).
// The spec's D1 store is Cloudflare-only; on Vercel the counter store is an open question, so events are validated and logged.
const ALLOWED = /^[a-z][a-z0-9_]{2,40}$/;

export async function POST(request: Request): Promise<Response> {
  try {
    const b = (await request.json()) as { event?: string; props?: Record<string, string> };
    if (b.event && ALLOWED.test(b.event)) console.log("event", b.event, JSON.stringify(b.props ?? {}).slice(0, 200));
  } catch {
    /* ignore malformed beacons */
  }
  return new Response(null, { status: 204 });
}
