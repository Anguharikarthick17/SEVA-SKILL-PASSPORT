import { NextRequest, NextResponse } from 'next/server';
import { AssessmentService } from '@/lib/assessments/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attemptId, userId, eventType, metadata } = body;

    if (!attemptId || !userId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required parameters: attemptId, userId, or eventType' },
        { status: 400 }
      );
    }

    const result = await AssessmentService.recordSecurityEvent({
      attemptId,
      userId,
      eventType,
      metadata
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Assessment event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record assessment event' },
      { status: 500 }
    );
  }
}
