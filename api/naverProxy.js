// Vercel Edge Function
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const rewrittenUrl = request.headers.get('x-vercel-rewritten-url');
  // rewrittenUrl will be `/api/v1/search/local.json?query=...`
  const pathAndQuery = rewrittenUrl.replace('/api', '');

  const targetUrl = `https://openapi.naver.com${pathAndQuery}`;

  // Create new headers for the target API
  const headers = new Headers();
  headers.set('X-Naver-Client-Id', process.env.VITE_SEARCH_CLIENT_ID);
  headers.set('X-Naver-Client-Secret', process.env.VITE_SEARCH_CLIENT_SECRET);
  
  // Pass through relevant headers from the original request
  if (request.headers.get('content-type')) {
    headers.set('content-type', request.headers.get('content-type'));
  }
   if (request.headers.get('accept')) {
    headers.set('accept', request.headers.get('accept'));
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      duplex: 'half' // Required for streaming body in Edge Functions
    });

    // Return the response from the target API to the client
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Error proxying to Naver API', { status: 500 });
  }
}