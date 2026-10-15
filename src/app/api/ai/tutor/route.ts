import { NextRequest, NextResponse } from 'next/server';
import { AiTutorService, AiTutorRequest } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    let body: AiTutorRequest;
    try {
      body = (await req.json()) as AiTutorRequest;
    } catch {
      console.warn(`[AI_TUTOR_DIAGNOSTIC] outcome=MALFORMED_JSON ip=${ip} latency=${Date.now() - startTime}ms`);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    if (!body || typeof body.prompt !== 'string') {
      console.warn(`[AI_TUTOR_DIAGNOSTIC] outcome=INVALID_PAYLOAD ip=${ip} latency=${Date.now() - startTime}ms`);
      return NextResponse.json(
        { success: false, message: 'Invalid payload. Prompt string is required.' },
        { status: 400 }
      );
    }

    const result = await AiTutorService.queryTutor(body, ip);
    const latency = Date.now() - startTime;

    if (result.isBlocked) {
      console.info(`[AI_TUTOR_DIAGNOSTIC] outcome=BLOCKED_ANTI_CHEAT reason=${result.blockReason} ip=${ip} latency=${latency}ms`);
      return NextResponse.json(result, { status: 403 });
    }

    if (!result.success && result.error === 'RATE_LIMIT_EXCEEDED') {
      console.warn(`[AI_TUTOR_DIAGNOSTIC] outcome=RATE_LIMITED ip=${ip} latency=${latency}ms`);
      return NextResponse.json(result, { status: 429 });
    }

    if (!result.success && result.error === 'MISSING_API_CREDENTIALS') {
      console.info(`[AI_TUTOR_DIAGNOSTIC] outcome=UNCONFIGURED_CREDENTIALS ip=${ip} latency=${latency}ms`);
      return NextResponse.json(result, { status: 200 });
    }

    if (!result.success) {
      const httpStatus = result.statusCode || (result.error === 'PROVIDER_TEMPORARILY_UNAVAILABLE' ? 503 : 500);
      console.error(`[AI_TUTOR_DIAGNOSTIC] outcome=PROVIDER_ERROR status=${httpStatus} model=${result.model} error=${result.error} ip=${ip} latency=${latency}ms`);
      return NextResponse.json(result, { status: httpStatus });
    }

    console.info(`[AI_TUTOR_DIAGNOSTIC] outcome=SUCCESS model=${result.model} ip=${ip} latency=${latency}ms`);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[AI_TUTOR_DIAGNOSTIC] outcome=UNHANDLED_EXCEPTION ip=${ip} latency=${latency}ms error=${error.message}`);
    return NextResponse.json(
      { success: false, message: 'Internal server error while querying AI Tutor.', error: error.message },
      { status: 500 }
    );
  }
}
