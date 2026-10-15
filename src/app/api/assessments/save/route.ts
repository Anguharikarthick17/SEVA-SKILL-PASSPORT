import { NextRequest, NextResponse } from 'next/server';
import { AssessmentService } from '@/lib/assessments/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, attemptId, answers, markedForReview } = body;

    if (!userId || !attemptId || !answers) {
      return NextResponse.json({ error: 'Missing userId, attemptId, or answers' }, { status: 400 });
    }

    const result = AssessmentService.saveAnswerProgress({ userId, attemptId, answers, markedForReview });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save progress' }, { status: 400 });
  }
}
