// api/spaceon/[...path].js
export const config = { runtime: "edge" };

export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/spaceon/, ""); // /api/spaceon/xxx → /xxx
  const targetUrl = `http://janghong.asia${path}${url.search}`;

  // 원본 헤더에서 백엔드에 문제될 수 있는 hop-by-hop/host 헤더 제거
  const fwdHeaders = new Headers(req.headers);
  fwdHeaders.delete("host");
  fwdHeaders.delete("connection");
  fwdHeaders.delete("keep-alive");
  fwdHeaders.delete("proxy-authenticate");
  fwdHeaders.delete("proxy-authorization");
  fwdHeaders.delete("te");
  fwdHeaders.delete("trailer");
  fwdHeaders.delete("transfer-encoding");
  fwdHeaders.delete("upgrade");

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: fwdHeaders,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? req.body
          : undefined,
      // Vercel Edge는 fetch 표준 구현이라 duplex 지정 불필요
    });

    // 그대로 스트리밍으로 전달
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  } catch (e) {
    console.error("Edge proxy error:", e);
    return new Response("Proxy error", { status: 500 });
  }
}