import { NextRequest, NextResponse } from 'next/server';

// Store unsubscribed marketing emails (in-memory demonstration store)
const unsubscribedEmails = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required to process your unsubscribe request.' },
        { status: 400 }
      );
    }

    unsubscribedEmails.add(email);

    return NextResponse.json({
      success: true,
      email,
      message: 'You have been successfully unsubscribed from all optional SEVA marketing communications.',
      note: 'Essential transactional messages (such as course payment receipts, password resets, and critical account security notices) will continue to be delivered.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request', details: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
  }

  const isUnsubscribed = unsubscribedEmails.has(email);

  return NextResponse.json({
    email,
    marketingOptIn: !isUnsubscribed,
  });
}
