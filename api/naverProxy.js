export const config = { runtime: "edge" };

const ORIGIN = "https://nvidia-front-dun.vercel.app/"; // 배포 도메인으로 제한

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

  const query  = url.searchParams.get("query");
  const display = url.searchParams.get("display") ?? "5";
  const start   = url.searchParams.get("start") ?? "1";
  const sort    = url.searchParams.get("sort") ?? "random";

  if (!query) {
    return new Response(JSON.stringify({ error: "query is required" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders() }
    });
  }

  const target = new URL("https://openapi.naver.com/v1/search/local.json");
  target.searchParams.set("query", query);
  target.searchParams.set("display", display);
  target.searchParams.set("start", start);
  target.searchParams.set("sort", sort);

  const r = await fetch(target.toString(), {
    headers: {
      "X-Naver-Client-Id":   process.env.NAVER_SEARCH_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_SEARCH_CLIENT_SECRET
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