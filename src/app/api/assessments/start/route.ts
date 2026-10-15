import { NextRequest, NextResponse } from 'next/server';
import { AssessmentService } from '@/lib/assessments/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, assessmentId } = body;

    if (!userId || !assessmentId) {
      return NextResponse.json({ error: 'Missing userId or assessmentId' }, { status: 400 });
    }

    const result = await AssessmentService.startOrResumeAttempt({ userId, assessmentId });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to start assessment' }, { status: 400 });
  }
}
