import { NextRequest, NextResponse } from 'next/server';
import { AssessmentService } from '@/lib/assessments/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, attemptId, answers } = body;

    if (!userId || !attemptId || !answers) {
      return NextResponse.json({ error: 'Missing userId, attemptId, or answers' }, { status: 400 });
    }

    const result = await AssessmentService.submitAndEvaluateAttempt({ userId, attemptId, answers });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit assessment' }, { status: 400 });
  }
}
