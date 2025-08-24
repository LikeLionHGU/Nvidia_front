// api/naver-local.js
export const config = { runtime: 'edge' };

// 공통 CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Always allow all origins
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Vary': 'Origin',
};

export default async function handler(req) {
  // const origin = req.headers.get('origin') || '*'; // No longer needed as we always allow '*'

  // 1) OPTIONS 프리플라이트 응답
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 2) 쿼리 그대로 전달
    const incoming = new URL(req.url);
    // /api/naver-local?query=...&display=...&start=...&sort=...

    const target = new URL('https://openapi.naver.com/v1/search/local.json');
    incoming.searchParams.forEach((v, k) => target.searchParams.set(k, v));
    console.log('Naver API Query Parameter:', incoming.searchParams.get('query'));
    console.log('Naver API Target URL:', target.toString());

    // 3) 인증 헤더 환경변수에서 주입 (절대 클라이언트로 노출 X)
    const id = process.env.NAVER_SEARCH_CLIENT_ID;
    const secret = process.env.NAVER_SEARCH_CLIENT_SECRET;
    if (!id || !secret) {
      return new Response(
        JSON.stringify({ message: 'Missing NAVER search env vars' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 4) Naver API 호출
    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': id,
        'X-Naver-Client-Secret': secret,
        'Accept': 'application/json',
      },
    });

    // 5) 응답 전달 + CORS 덮어쓰기
    const headers = new Headers(upstream.headers);
    // headers.set('Access-Control-Allow-Origin', origin); // Replaced with '*'
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    headers.set('Vary', 'Origin');
    headers.set('Content-Type', 'application/json'); // Ensure Content-Type is set for JSON responses

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ message: 'Proxy error (naver-local)', error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}