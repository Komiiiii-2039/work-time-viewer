import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * SSRF prevention: block private/loopback addresses and non-HTTPS.
 * The iCal URL is passed in the POST body (not query param) to avoid
 * appearing in access logs.
 */
function isBlockedUrl(urlStr: string): boolean {
  try {
    const { hostname, protocol } = new URL(urlStr);
    if (protocol !== 'https:') return true;
    if (hostname === 'localhost' || hostname === '::1') return true;
    if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(hostname)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
    if (hostname === 'metadata.google.internal') return true;
    return false;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  let url: string;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  if (isBlockedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WorkTimeViewer/1.0)',
        Accept: 'text/calendar',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: response.status }
      );
    }

    const text = await response.text();

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
