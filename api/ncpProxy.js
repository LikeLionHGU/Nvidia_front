// Vercel Edge Function
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const rewrittenUrl = request.headers.get('x-vercel-rewritten-url');
  const targetUrl = `https://naveropenapi.apigw.ntruss.com${rewrittenUrl}`;

  // Create new headers for the target API
  const headers = new Headers();
  headers.set('X-NCP-APIGW-API-KEY-ID', process.env.VITE_MAP_CLIENT_ID);
  headers.set('X-NCP-APIGW-API-KEY', process.env.VITE_MAP_CLIENT_SECRET);

  if (request.headers.get('accept')) {
    headers.set('accept', request.headers.get('accept'));
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      // This API uses GET, so no body
    });

    // Return the response from the target API to the client
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Error proxying to NCP API', { status: 500 });
  }
}