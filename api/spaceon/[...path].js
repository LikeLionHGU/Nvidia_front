export const config = { runtime: "edge" };

export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/spaceon/, "");
  const targetUrl = `http://janghong.asia${path}${url.search}`;

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      // credentials / keepalive 등 필요시 추가
    });

    // 응답을 그대로 스트림 전달
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers
    });
  } catch (e) {
    console.error("Edge proxy error:", e);
    return new Response("Proxy error", { status: 500 });
  }
}