import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface DeletionRequestPayload {
  email: string;
  scope: 'delete_account' | 'export_data' | 'anonymize_profile';
  reason?: string;
  acknowledgement: boolean;
}

// In-memory registry for pending privacy requests in demo/prototype environment
const privacyRequestsStore: Array<{
  requestId: string;
  email: string;
  scope: string;
  reason: string;
  status: string;
  createdAt: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body: DeletionRequestPayload = await req.json();

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: 'A valid email address is required to locate and verify your account.' },
        { status: 400 }
      );
    }

    if (!body.acknowledgement) {
      return NextResponse.json(
        { error: 'You must acknowledge the legal data retention terms to submit a deletion request.' },
        { status: 400 }
      );
    }

    const requestId = `DEL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const record = {
      requestId,
      email: body.email.toLowerCase().trim(),
      scope: body.scope || 'delete_account',
      reason: body.reason || 'User requested account deletion',
      status: 'pending_review',
      createdAt: timestamp,
    };

    privacyRequestsStore.push(record);

    return NextResponse.json({
      success: true,
      requestId,
      status: 'pending_review',
      message:
        'Your privacy request has been received and registered for administrative verification.',
      legalRetentionNotice:
        'Statutory payment records, verified tamper-evident credentials already registered on the public registry, and security audit logs are retained under applicable financial and legal regulations and will not be erased.',
      timeline: 'Identity verification and processing takes up to 30 business days.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process privacy request', details: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('id');

  if (!requestId) {
    return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
  }

  const found = privacyRequestsStore.find((r) => r.requestId === requestId);
  if (!found) {
    return NextResponse.json(
      { error: 'No matching privacy request found for the specified ID.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    requestId: found.requestId,
    scope: found.scope,
    status: found.status,
    createdAt: found.createdAt,
  });
}
