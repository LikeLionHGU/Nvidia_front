// api/spaceon/[...path].js
export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export default async function handler(req) {
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // /api/spaceon/enrollment/confirmation -> /enrollment/confirmation
    const path = url.pathname.replace(/^\/api\/spaceon/, '');
    const target = `http://janghong.asia${path}${url.search}`;

    console.log(`Proxying to: ${target}`);

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    // 원본 헤더에서 필요한 것만 복사
    const authHeader = req.headers.get('authorization');
    if (authHeader) headers.set('authorization', authHeader);

    const response = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
    });

    // 응답 헤더에 CORS 추가
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
}