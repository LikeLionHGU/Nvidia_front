export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Vary': 'Origin',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const incoming = new URL(req.url);
    const target = new URL('https://openapi.naver.com/v1/search/local.json');
    incoming.searchParams.forEach((v, k) => target.searchParams.set(k, v));

    const id = process.env.NAVER_SEARCH_CLIENT_ID;
    const secret = process.env.NAVER_SEARCH_CLIENT_SECRET;
    if (!id || !secret) {
      return new Response(
        JSON.stringify({ message: 'Missing NAVER_SEARCH_CLIENT_ID/SECRET' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': id,
        'X-Naver-Client-Secret': secret,
        'Accept': 'application/json',
      },
    });

    const bodyText = await upstream.text(); // ← 바디를 텍스트로 읽음
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...cors,
    });

    // 성공/실패 상관없이 Naver 응답 바디 그대로 넘김
    return new Response(bodyText, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ message: 'Proxy error (naver-local)', error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...cors } }
    );
  }
}