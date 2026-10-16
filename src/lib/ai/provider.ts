// ==============================================================================
// SEVA SKILL PASSPORT — AI TUTOR PROVIDER ABSTRACTION
// Server-side LLM provider implementation with real Gemini/OpenAI integration,
// curriculum grounding, token budgeting, and strict assessment anti-cheat protection.
// ==============================================================================

import { FULL_STACK_MODULES } from '@/data/curriculum';
import { PROJECT_CATALOGUE } from '@/data/projects';

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiTutorRequest {
  prompt: string;
  history?: AiChatMessage[];
  contextType?: 'lesson' | 'course' | 'lab' | 'project' | 'dashboard' | 'practice' | 'assessment' | 'general';
  contextId?: string;
  activeAssessmentId?: string;
  userRole?: string;
  userId?: string;
}

export interface AiTutorResponse {
  success: boolean;
  message: string;
  model: string;
  groundingSources?: { title: string; reference: string }[];
  isBlocked?: boolean;
  blockReason?: string;
  error?: string;
  statusCode?: number;
  configInstructions?: string;
}

// In-memory rate limiting: 20 requests per minute per user/IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(clientId, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Loads authentic lesson spoken transcripts or WebVTT captions from disk.
 * Prioritizes lesson-specific transcripts over module-level transcripts.
 */
function loadLessonTranscript(moduleId?: string, lessonId?: string): { transcript: string; source: string } | null {
  if (!lessonId && !moduleId) return null;
  try {
    // Dynamic require so Next.js bundling does not break client-side imports
    const fs = require('fs');
    const path = require('path');
    const cwd = process.cwd();

    // 1. Direct lesson narration transcript
    if (lessonId) {
      const lessonPath = path.join(cwd, 'public', 'transcripts', 'lessons', `${lessonId}.txt`);
      if (fs.existsSync(lessonPath)) {
        const text = fs.readFileSync(lessonPath, 'utf8').trim();
        if (text) {
          return {
            transcript: text,
            source: `Lesson Narration Transcript (${lessonId})`
          };
        }
      }
    }

    // 2. Module video narration transcript
    if (moduleId) {
      const modulePath = path.join(cwd, 'public', 'transcripts', 'modules', `${moduleId}.txt`);
      if (fs.existsSync(modulePath)) {
        const text = fs.readFileSync(modulePath, 'utf8').trim();
        if (text) {
          return {
            transcript: text,
            source: `Module Video Narration Transcript (${moduleId})`
          };
        }
      }
    }

    // 3. WebVTT closed captions fallback
    if (lessonId) {
      const lessonVtt = path.join(cwd, 'public', 'captions', 'lessons', `${lessonId}.vtt`);
      if (fs.existsSync(lessonVtt)) {
        const rawVtt = fs.readFileSync(lessonVtt, 'utf8');
        const text = rawVtt
          .split(/\r?\n/)
          .map((l: string) => l.trim())
          .filter((l: string) => l && !l.includes('-->') && !l.startsWith('WEBVTT') && !l.startsWith('NOTE') && !/^\d+$/.test(l))
          .join(' ');
        if (text) {
          return {
            transcript: text,
            source: `Lesson Subtitles/Captions (${lessonId})`
          };
        }
      }
    }

    if (moduleId) {
      const moduleVtt = path.join(cwd, 'public', 'captions', 'modules', `${moduleId}.vtt`);
      if (fs.existsSync(moduleVtt)) {
        const rawVtt = fs.readFileSync(moduleVtt, 'utf8');
        const text = rawVtt
          .split(/\r?\n/)
          .map((l: string) => l.trim())
          .filter((l: string) => l && !l.includes('-->') && !l.startsWith('WEBVTT') && !l.startsWith('NOTE') && !/^\d+$/.test(l))
          .join(' ');
        if (text) {
          return {
            transcript: text,
            source: `Module Subtitles/Captions (${moduleId})`
          };
        }
      }
    }
  } catch (err) {
    // Non-fatal if filesystem access fails in serverless environments
  }
  return null;
}

// Grounding RAG Context Retriever
function retrieveCurriculumContext(
  contextType?: string,
  contextId?: string,
  query?: string,
  contextTitle?: string
): string {
  const contextParts: string[] = [];

  if (contextType === 'lesson' || contextType === 'course' || contextType === 'lab' || !contextType) {
    const targetId = contextId || 'les-01-01';
    let foundModule = FULL_STACK_MODULES.find(
      (m) => m.id === targetId || m.slug === targetId || m.lessons.some((l) => l.id === targetId)
    );

    if (!foundModule) {
      foundModule = FULL_STACK_MODULES[0];
    }

    if (foundModule) {
      contextParts.push(`ACTIVE MODULE: Module ${foundModule.number}: ${foundModule.title} (ID: ${foundModule.id})`);
      contextParts.push(`PRIMARY SKILL / DOMAIN: ${foundModule.primarySkill}`);
      contextParts.push(`MODULE SYLLABUS OVERVIEW: ${foundModule.description}`);

      const foundLesson = foundModule.lessons.find((l) => l.id === targetId) || foundModule.lessons[0];
      if (foundLesson) {
        contextParts.push(`\nACTIVE LESSON: "${foundLesson.title}" (ID: ${foundLesson.id}, Lesson #${foundLesson.number} of ${foundModule.lessons.length})`);
        contextParts.push(`DURATION: ${foundLesson.duration}`);
        contextParts.push(`SHORT SUMMARY: ${foundLesson.shortDescription}`);
        contextParts.push(`LEARNING OBJECTIVES:\n${foundLesson.learningObjectives.map((o) => `* ${o}`).join('\n')}`);
        contextParts.push(`\nCORE CONCEPT EXPLANATION:\n${foundLesson.conceptExplanation}`);
        
        if (foundLesson.keyTakeaways && foundLesson.keyTakeaways.length > 0) {
          contextParts.push(`KEY TAKEAWAYS:\n${foundLesson.keyTakeaways.map((k) => `* ${k}`).join('\n')}`);
        }
        
        if (foundLesson.codeExample?.code) {
          contextParts.push(`LESSON CODE EXAMPLE (${foundLesson.codeExample.language} - ${foundLesson.codeExample.caption}):\n\`\`\`${foundLesson.codeExample.language}\n${foundLesson.codeExample.code}\n\`\`\``);
        }

        // Attach verified video transcript
        const transcriptInfo = loadLessonTranscript(foundModule.id, foundLesson.id);
        if (transcriptInfo) {
          contextParts.push(`\n--- VERIFIED LESSON VIDEO TRANSCRIPT (${transcriptInfo.source}) ---\n${transcriptInfo.transcript}\n-------------------------------------------------------------`);
        } else {
          contextParts.push(`\n[VIDEO TRANSCRIPT NOTICE: No audio transcript file is present for this lesson. Use the verified concept explanation and learning objectives above as authoritative lesson content.]`);
        }
      }

      if (foundModule.lab) {
        contextParts.push(`\nHANDS-ON LAB FOR THIS MODULE: "${foundModule.lab.title}" - ${foundModule.lab.objective}`);
      }
    }
  }

  if (contextType === 'project') {
    const foundProj = PROJECT_CATALOGUE.find((p) => p.id === contextId);
    if (foundProj) {
      contextParts.push(`ACTIVE PROJECT: ${foundProj.title}`);
      contextParts.push(`DIFFICULTY: ${foundProj.difficulty}`);
      contextParts.push(`LEARNING OBJECTIVES: ${foundProj.learningObjectives.join('; ')}`);
      contextParts.push(`TECH STACK: ${foundProj.techStack.join(', ')}`);
    }
  }

  // Generic keyword grounding across curriculum if query matches specific topic
  if (query) {
    const lowerQuery = query.toLowerCase();
    for (const mod of FULL_STACK_MODULES) {
      if (
        lowerQuery.includes(mod.title.toLowerCase()) ||
        mod.skills.some((s) => lowerQuery.includes(s.toLowerCase()))
      ) {
        if (!contextParts.some((p) => p.includes(mod.title))) {
          contextParts.push(`ADDITIONAL TOPIC REFERENCE: Module ${mod.number} (${mod.title}) - ${mod.description}`);
        }
        break;
      }
    }
  }

  return contextParts.length > 0
    ? `\n--- AUTHORITATIVE SEVA COURSEWARE GROUNDING ---\n${contextParts.join('\n')}\n-----------------------------------------------\n`
    : '';
}

export class AiTutorService {
  // Test hook for deterministic automated unit testing
  private static testMockHandler: ((prompt: string, history?: AiChatMessage[], systemPrompt?: string) => Promise<string | null>) | null = null;

  public static setTestMockHandler(
    handler: ((prompt: string, history?: AiChatMessage[], systemPrompt?: string) => Promise<string | null>) | null
  ) {
    AiTutorService.testMockHandler = handler;
  }

  /**
   * Process a student inquiry through a real configured LLM provider.
   * Strictly enforces Anti-Cheat policy during active graded assessments.
   */
  static async queryTutor(req: AiTutorRequest, clientIdentifier = 'anonymous'): Promise<AiTutorResponse> {
    // 1. Enforce Rate Limiting
    if (!checkRateLimit(clientIdentifier)) {
      return {
        success: false,
        message: 'Rate limit exceeded. Please wait a moment before sending another query.',
        model: 'none',
        error: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429
      };
    }

    // 2. Validate Input Size & Sanitization
    const trimmedPrompt = (req.prompt || '').trim();
    if (!trimmedPrompt) {
      return {
        success: false,
        message: 'Prompt cannot be empty.',
        model: 'none',
        error: 'EMPTY_PROMPT',
        statusCode: 400
      };
    }
    if (trimmedPrompt.length > 2000) {
      return {
        success: false,
        message: 'Prompt exceeds maximum allowable length of 2,000 characters.',
        model: 'none',
        error: 'PROMPT_TOO_LARGE',
        statusCode: 400
      };
    }

    // 3. SERVER-SIDE ASSESSMENT ANTI-CHEAT GUARD
    let isAssessmentActive = req.activeAssessmentId || req.contextType === 'assessment';
    
    if (!isAssessmentActive && req.userId) {
      try {
        const { AssessmentService } = require('@/lib/assessments/service');
        const userAttempts = AssessmentService.getUserAttempts(req.userId);
        const now = Date.now();
        const active = userAttempts.find(
          (a: any) => a.status === 'in_progress' && new Date(a.expiresAt).getTime() > now
        );
        if (active) {
          isAssessmentActive = true;
        }
      } catch {
        // Fallback safely to request flags
      }
    }

    if (isAssessmentActive) {
      return {
        success: false,
        message:
          'AI Tutor is locked during active graded assessments to protect academic integrity. The SEVA Skill Passport reflects demonstrated individual ability. Please consult your courseware after submitting your assessment attempt.',
        model: 'guard-rule-enforcer',
        isBlocked: true,
        blockReason: 'ASSESSMENT_ANTI_CHEAT_ACTIVE',
        statusCode: 403
      };
    }

    // 4. Build Grounded System Instructions
    const curriculumGrounding = retrieveCurriculumContext(req.contextType, req.contextId, trimmedPrompt);

    const systemPrompt = `You are the SEVA Skill Passport Academic AI Tutor, an expert, encouraging, and highly competent full-stack technical instructor.

Core Behavioral Directives:
1. Relevance & Precision: Always answer the student's actual question directly first.
2. Pure Greetings: If the user sends ONLY a greeting (such as "hi", "hello", "hey", or "good morning"), respond with a warm, friendly greeting and ask how you can help them with their learning or current topic. NEVER start an unsolicited lecture or lesson breakdown for a simple greeting alone.
3. Greeting + Question: If the user combines a greeting with a question (e.g. "hi can you explain me about this video"), acknowledge the greeting warmly in one brief sentence, and immediately proceed to answer their question.
4. "Explain This Video" & "Summarize This Lesson":
   When asked to explain the video, summarize the lesson, or explain what they just watched:
   - Short Overview: Provide a concise 2-3 sentence overview of what the video covers, grounded in the active lesson and module.
   - Core Concepts: Break down the 2-3 main concepts taught at a beginner-friendly level (explain WHY it works, not just how).
   - Practical Example / Code: Provide a practical real-world analogy or code snippet directly illustrating the lesson topic.
   - Concise Recap: Highlight the key takeaway in 1-2 bullet points.
   - Interactive Follow-up: Ask the learner if they would like to explore any part in greater depth, see another code sample, or try the hands-on lab.
5. Video Player & Visual Frame Limitations:
   You analyze the verified lesson audio narration transcript, syllabus, and courseware curriculum. If the user explicitly asks about specific visual pixel frames (e.g., visual colors or on-screen styling in the video player), politely clarify that you reference the spoken narration transcript and courseware rather than analyzing live video pixels, and provide the relevant conceptual knowledge.
6. Follow-up Context:
   Maintain natural conversational continuity across turns. When the user asks "give me an example" or asks follow-up questions, ground your response directly in the concepts discussed in the recent conversation.
7. Tone & Clarity:
   Encouraging, clear, structured, and beginner-accessible without sacrificing technical accuracy.

${curriculumGrounding}`;

    // 5. Sanitize conversation history
    const sanitizedHistory = this.prepareHistory(req.history, trimmedPrompt);

    // 6. Test Mock Handler (for unit/integration testing)
    if (AiTutorService.testMockHandler) {
      try {
        const mockResult = await AiTutorService.testMockHandler(trimmedPrompt, sanitizedHistory, systemPrompt);
        if (mockResult !== null) {
          return {
            success: true,
            message: mockResult,
            model: 'test-mock-provider',
            groundingSources: [{ title: 'SEVA Full Stack Curriculum', reference: 'Official Module Courseware' }]
          };
        }
      } catch (mockErr: any) {
        return {
          success: false,
          message: `Provider test failure: ${mockErr.message}`,
          model: 'test-mock-provider',
          error: mockErr.message
        };
      }
    }

    // 7. Retrieve Configured Server-Side API Keys
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      return {
        success: false,
        message:
          'AI Tutor Provider is currently not configured on this server. To enable real AI assistance, configure a valid GEMINI_API_KEY (or OPENAI_API_KEY) in your environment variables.',
        model: 'unconfigured',
        error: 'MISSING_API_CREDENTIALS',
        statusCode: 200,
        configInstructions:
          '1. Obtain a Gemini API key from https://aistudio.google.com/app/apikey\n2. In Vercel, go to Project Settings -> Environment Variables\n3. Add GEMINI_API_KEY and redeploy the deployment.'
      };
    }

    // 8. Call Real LLM Provider (Gemini prioritized, OpenAI as fallback)
    if (geminiKey) {
      return await this.callGemini(geminiKey, systemPrompt, trimmedPrompt, sanitizedHistory);
    } else {
      return await this.callOpenAI(openaiKey!, systemPrompt, trimmedPrompt, sanitizedHistory);
    }
  }

  /**
   * Prepares conversation history so that:
   * - The current prompt is not duplicated.
   * - Initial greeting messages are not sent as bare first-turn assistant messages.
   * - Turns properly alternate between user and assistant.
   */
  private static prepareHistory(history?: AiChatMessage[], currentPrompt?: string): AiChatMessage[] {
    if (!history || history.length === 0) return [];

    const clean: AiChatMessage[] = [];
    const trimmedCurrent = (currentPrompt || '').trim().toLowerCase();

    for (const msg of history) {
      const content = (msg.content || '').trim();
      if (!content) continue;

      if (msg.role === 'user' && content.toLowerCase() === trimmedCurrent) {
        continue;
      }

      clean.push({ role: msg.role, content });
    }

    while (clean.length > 0 && clean[0].role === 'assistant') {
      clean.shift();
    }

    return clean.slice(-6);
  }

  /**
   * Robust Gemini invocation engine featuring:
   * - Primary model with graceful automatic fallback to verified available models
   * - Bounded exponential backoff with jitter for transient 503 / 429 / 5xx errors
   * - Inspection and enforcement of Retry-After headers
   * - Strict request deadline to prevent hanging server connections
   * - Immediate fail-fast on non-retryable 4xx client errors (400, 401, 403)
   * - Sanitized logging that never leaks API keys or internal URLs
   */
  private static async callGemini(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    history: AiChatMessage[]
  ): Promise<AiTutorResponse> {
    const configuredPrimary = (process.env.GEMINI_MODEL || 'gemini-3.5-flash').replace(/^models\//, '');
    const configuredFallback = (process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite').replace(/^models\//, '');

    // Model fallback chain: primary (3.5-flash) -> verified fast fallback (3.5-flash-lite) -> lightweight preview (3.1-flash-lite) -> latest (3.8-flash)
    const modelsToTry: string[] = [configuredPrimary];
    if (configuredFallback !== configuredPrimary) {
      modelsToTry.push(configuredFallback);
    }
    if (!modelsToTry.includes('gemini-3.5-flash-lite')) {
      modelsToTry.push('gemini-3.5-flash-lite');
    }
    if (!modelsToTry.includes('gemini-3.1-flash-lite')) {
      modelsToTry.push('gemini-3.1-flash-lite');
    }
    if (!modelsToTry.includes('gemini-3.8-flash')) {
      modelsToTry.push('gemini-3.8-flash');
    }

    const contents: any[] = [];
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const requestBody = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024
      }
    });

    const totalDeadlineMs = 30000;
    const deadlineTime = Date.now() + totalDeadlineMs;
    let lastStatusCode = 500;
    let lastErrorMessage = '';
    let lastAttemptedModel = configuredPrimary;

    for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
      const model = modelsToTry[mIdx];
      lastAttemptedModel = model;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const isLastModel = mIdx === modelsToTry.length - 1;

      // Primary model gets 1 attempt with immediate failover on 503/429; last model gets bounded retry
      const maxAttempts = isLastModel ? 2 : 1;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const remainingBudget = deadlineTime - Date.now();
        if (remainingBudget < 2000) {
          // Insufficient budget remaining
          break;
        }

        try {
          const timeoutMs = Math.min(15000, remainingBudget);
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: requestBody,
            signal: AbortSignal.timeout(timeoutMs)
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return {
                success: true,
                message: text,
                model,
                statusCode: 200,
                groundingSources: [
                  { title: 'SEVA Full Stack Curriculum', reference: 'Official Module Courseware & Transcripts' }
                ]
              };
            }
          }

          // Error handling
          lastStatusCode = response.status;
          let parsedMessage = '';
          try {
            const errText = await response.text();
            const parsed = JSON.parse(errText);
            parsedMessage = parsed?.error?.message || errText;
          } catch {
            parsedMessage = response.statusText || `HTTP ${response.status}`;
          }
          lastErrorMessage = parsedMessage;

          // Non-retryable 4xx client errors (bad request, invalid auth, forbidden)
          if (response.status >= 400 && response.status < 500 && response.status !== 429 && response.status !== 404) {
            const isAuthError =
              response.status === 401 ||
              response.status === 403 ||
              (response.status === 400 && /api[ _-]?key|invalid|credential/i.test(parsedMessage));
            console.error(`[GEMINI_API_ERROR] model=${model} status=${response.status} authError=${isAuthError} (non-retryable client error)`);
            return {
              success: false,
              message: isAuthError
                ? 'AI Provider authentication failed: The configured GEMINI_API_KEY is invalid or unauthorized.'
                : 'AI Provider request error: The model could not process this request format.',
              model,
              error: isAuthError ? 'INVALID_API_CREDENTIALS' : 'CLIENT_REQUEST_ERROR',
              statusCode: response.status
            };
          }

          // Model not found (404) -> skip directly to fallback model without retrying
          if (response.status === 404) {
            console.warn(`[GEMINI_API_WARN] model=${model} returned 404 Not Found. Skipping to next fallback model.`);
            break;
          }

          // If model returned 503 high demand or 429 and we have fallback models, break to next model immediately!
          if (!isLastModel && (response.status === 503 || response.status === 429)) {
            console.warn(`[GEMINI_API_HIGH_DEMAND] model=${model} experiencing high demand (status=${response.status}). Triggering immediate failover.`);
            break;
          }

          // Retryable error on last model
          console.warn(`[GEMINI_API_RETRYABLE] model=${model} status=${response.status} attempt=${attempt + 1}/${maxAttempts} error="${parsedMessage}"`);

          if (attempt < maxAttempts - 1) {
            const retryAfter = response.headers.get('retry-after');
            let delayMs = 500 * Math.pow(1.8, attempt) + Math.floor(Math.random() * 200);
            if (retryAfter) {
              const sec = parseInt(retryAfter, 10);
              if (!isNaN(sec) && sec > 0 && sec <= 3) {
                delayMs = sec * 1000;
              }
            }
            await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, remainingBudget - 800)));
          }
        } catch (fetchErr: any) {
          lastErrorMessage = fetchErr.message || 'Fetch timeout/network error';
          console.warn(`[GEMINI_API_NETWORK_ERR] model=${model} attempt=${attempt + 1}: ${lastErrorMessage}`);
          if (!isLastModel) {
            // Immediately failover to fallback model
            break;
          }
          if (attempt < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        }
      }

      if (!isLastModel) {
        console.warn(`[GEMINI_API_FALLBACK] Switching from ${model} to ${modelsToTry[mIdx + 1]} due to transient failure (${lastStatusCode}).`);
      }
    }

    console.error(`[GEMINI_API_EXHAUSTED] All candidate models exhausted. Last model=${lastAttemptedModel} status=${lastStatusCode} error="${lastErrorMessage}"`);
    const isRateLimited = lastStatusCode === 429;
    return {
      success: false,
      message: isRateLimited
        ? 'AI Provider rate limit reached. Please wait a moment before sending another query.'
        : 'The AI Tutor is currently experiencing high demand. Please try asking again in a few moments.',
      model: lastAttemptedModel,
      error: isRateLimited ? 'RATE_LIMIT_EXCEEDED' : 'PROVIDER_TEMPORARILY_UNAVAILABLE',
      statusCode: isRateLimited ? 429 : 503
    };
  }

  private static async callOpenAI(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    history: AiChatMessage[]
  ): Promise<AiTutorResponse> {
    try {
      const messages: any[] = [{ role: 'system', content: systemPrompt }];

      for (const msg of history) {
        messages.push({ role: msg.role, content: msg.content });
      }

      messages.push({ role: 'user', content: userPrompt });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.3,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          success: false,
          message: `OpenAI API returned status ${response.status}`,
          model: 'gpt-4o-mini',
          error: errText
        };
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;

      return {
        success: true,
        message: reply || 'Empty response from OpenAI.',
        model: 'gpt-4o-mini'
      };
    } catch (err: any) {
      return {
        success: false,
        message: `OpenAI connection failed: ${err.message}`,
        model: 'gpt-4o-mini',
        error: err.message
      };
    }
  }
}
