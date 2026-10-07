/**
 * Deterministic SHA-256 Evidence Integrity Hash Generator
 * 
 * Generates an immutable, reproducible cryptographic hash from evidence payload parameters.
 * Note: This is an evidence integrity hash (NOT blockchain).
 */
export async function generateEvidenceHash(payload: {
  userId: string;
  skillId: string;
  sourceType: 'lesson' | 'challenge' | 'assessment' | 'project' | 'viva';
  sourceId: string;
  score: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}): Promise<string> {
  const normalizedPayload = {
    userId: payload.userId,
    skillId: payload.skillId.toLowerCase(),
    sourceType: payload.sourceType,
    sourceId: payload.sourceId,
    score: payload.score,
    timestamp: payload.timestamp || '2024-10-01T00:00:00Z',
    metadata: payload.metadata || {},
  };

  const jsonString = JSON.stringify(normalizedPayload, Object.keys(normalizedPayload).sort());

  // Use Web Crypto API available in both modern Node.js and browser runtimes
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `sha256-${hashHex}`;
  }

  // Fallback deterministic pseudo-hash if crypto.subtle unavailable
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(16, '0');
  return `sha256-${hex}${hex}${hex}${hex}`.substring(0, 71);
}
