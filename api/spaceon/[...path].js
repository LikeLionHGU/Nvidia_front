export const config = {
    runtime: "edge",
  };
  
  export default async function handler(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api\/spaceon/, ""); // /api/spaceon/xxx → /xxx
    const targetUrl = `http://janghong.asia${path}${url.search}`;
  
    try {
      const res = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      });
  
      return new Response(res.body, {
        status: res.status,
        headers: res.headers,
      });
    } catch (e) {
      console.error("Edge proxy error:", e);
      return new Response("Proxy error", { status: 500 });
    }
  }