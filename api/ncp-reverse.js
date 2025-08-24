// api/ncp-reverse.js
export const config = { runtime: 'edge' };

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Vary': 'Origin',
});

export default async function handler(req) {
  const origin = req.headers.get('origin') || '*';

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  try {
    const incoming = new URL(req.url);
    // 예: /api/ncp-reverse?coords=127.1054328,37.3595963&output=json&orders=roadaddr
    const target = new URL('https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc');
    incoming.searchParams.forEach((v, k) => target.searchParams.set(k, v));

    // 기본값 권장(없으면 세팅)
    if (!target.searchParams.get('output')) target.searchParams.set('output', 'json');
    if (!target.searchParams.get('orders')) target.searchParams.set('orders', 'roadaddr');
    if (!target.searchParams.get('sourcecrs')) target.searchParams.set('sourcecrs', 'epsg:4326'); // WGS84

    const keyId = process.env.NAVER_MAP_CLIENT_ID;
    const key = process.env.NAVER_MAP_CLIENT_SECRET;
    if (!keyId || !key) {
      return new Response(
        JSON.stringify({ message: 'Missing NAVER map env vars' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': keyId,
        'X-NCP-APIGW-API-KEY': key,
        'Accept': 'application/json',
      },
    });

    const headers = new Headers(upstream.headers);
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    headers.set('Vary', 'Origin');

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ message: 'Proxy error (ncp-reverse)', error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
    );
  }
}