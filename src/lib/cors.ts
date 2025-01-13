import { NextRequest, NextResponse } from 'next/server';

export async function corsMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  // Add CORS headers
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Origin', '*'); // Configure this appropriately
  headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}