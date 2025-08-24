export const config = { runtime: "edge" };

const ORIGIN = "https://nvidia-front-dun.vercel.app/";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ORIGIN,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export default async function handler(request) {
  const url = new URL(request.url);

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders() });
  }

  const coords = url.searchParams.get("coords");
  const orders = url.searchParams.get("orders") ?? "roadaddr,admcode";

  if (!coords) {
    return new Response(JSON.stringify({ error: "coords is required (e.g. 127.1054328,37.3595963)" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders() }
    });
  }

  const target = new URL("https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc");
  target.searchParams.set("coords", coords);
  target.searchParams.set("orders", orders);
  target.searchParams.set("output", "json");

  const r = await fetch(target.toString(), {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_MAP_CLIENT_ID,
      "X-NCP-APIGW-API-KEY":    process.env.NAVER_MAP_CLIENT_SECRET
    }
  });

  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") ?? "application/json; charset=utf-8",
      ...corsHeaders()
    }
  });
}