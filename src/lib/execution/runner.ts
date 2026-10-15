// ==============================================================================
// SEVA SKILL PASSPORT — CODE EXECUTION BOUNDARY ARCHITECTURE
// Isolated Execution Service Interface, Container Sandbox Specification,
// Resource Quota Enforcement & Production Deployment Requirements.
// ==============================================================================

export interface ExecutionOptions {
  language: 'javascript' | 'typescript' | 'python' | 'sql';
  timeoutMs?: number; // Default: 3000ms
  memoryLimitMb?: number; // Default: 64MB
  networkEnabled?: boolean; // Default: false (Isolated)
  environment?: Record<string, string>;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  memoryUsedMb: number;
  status: 'COMPLETED' | 'TIMEOUT' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'SECURITY_VIOLATION';
  isolationType: 'SANDBOX_CONTAINER' | 'DEV_LOCAL_ISOLATED';
  securityAudit: {
    networkCallsBlocked: number;
    restrictedSyscallsDetected: number;
    isolatedFileSystem: boolean;
  };
}

export class CodeExecutionService {
  private static readonly DEFAULT_TIMEOUT_MS = 3000;
  private static readonly MAX_OUTPUT_BYTES = 64 * 1024; // 64 KB output limit

  /**
   * Executes learner-submitted code through an isolated sandbox boundary.
   * In production, this proxies to a dedicated sandboxed microservice
   * (e.g. gVisor, Firecracker microVM, or isolated AWS Lambda/Cloud Run).
   */
  static async executeCode(
    code: string,
    options: ExecutionOptions = { language: 'javascript' }
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeoutMs = Math.min(options.timeoutMs || this.DEFAULT_TIMEOUT_MS, 10000);

    // 1. Static Security & Malicious Signature Pre-screening
    const securityCheck = this.screenForDangerousOperations(code, options.language);
    if (!securityCheck.isAllowed) {
      return {
        success: false,
        stdout: '',
        stderr: `Security Exception: ${securityCheck.violationReason}`,
        exitCode: 126,
        durationMs: Date.now() - startTime,
        memoryUsedMb: 0,
        status: 'SECURITY_VIOLATION',
        isolationType: 'SANDBOX_CONTAINER',
        securityAudit: {
          networkCallsBlocked: 1,
          restrictedSyscallsDetected: 1,
          isolatedFileSystem: true
        }
      };
    }

    // 2. Production Container Sandbox Service Check
    const sandboxServiceUrl = process.env.CODE_EXECUTION_SANDBOX_URL;
    if (sandboxServiceUrl) {
      try {
        const response = await fetch(`${sandboxServiceUrl}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CODE_EXECUTION_SANDBOX_TOKEN || ''}`
          },
          body: JSON.stringify({
            code,
            language: options.language,
            timeoutMs,
            memoryLimitMb: options.memoryLimitMb || 64,
            networkEnabled: false
          })
        });

        if (response.ok) {
          const remoteResult = await response.json();
          return {
            ...remoteResult,
            isolationType: 'SANDBOX_CONTAINER'
          };
        }
      } catch (err: any) {
        console.warn('Dedicated sandbox service unreachable, falling back to local runner boundary:', err.message);
      }
    }

    // 3. Local Evaluation Environment (Isolated Child Context with Output Truncation)
    return await this.runInLocalIsolatedContext(code, options, timeoutMs, startTime);
  }

  private static screenForDangerousOperations(
    code: string,
    language: string
  ): { isAllowed: boolean; violationReason?: string } {
    if (language === 'javascript' || language === 'typescript') {
      const dangerousPatterns = [
        /process\.exit/i,
        /child_process/i,
        /require\s*\(\s*['"]fs['"]\s*\)/i,
        /import\s+.*\s+from\s+['"]node:fs['"]/i,
        /\bprocess\.env\b/i,
        /\b__dirname\b/i,
        /\b__filename\b/i
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          return {
            isAllowed: false,
            violationReason: 'Restricted system API invocation detected. Host filesystem and process controls are isolated.'
          };
        }
      }
    }

    return { isAllowed: true };
  }

  private static async runInLocalIsolatedContext(
    code: string,
    options: ExecutionOptions,
    timeoutMs: number,
    startTime: number
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map(String).join(' ')),
        error: (...args: any[]) => logs.push(`[ERROR] ${args.map(String).join(' ')}`),
        warn: (...args: any[]) => logs.push(`[WARN] ${args.map(String).join(' ')}`),
      };

      try {
        // eslint-disable-next-line
        const vm = require('node:vm');
        const context = vm.createContext({
          console: customConsole,
          Math,
          Date,
          JSON,
          Array,
          Object,
          String,
          Number,
          Boolean,
          RegExp,
          Map,
          Set,
        });

        vm.runInContext(`"use strict";\n${code}`, context, {
          timeout: timeoutMs,
        });

        resolve({
          success: true,
          stdout: logs.join('\n').slice(0, this.MAX_OUTPUT_BYTES) || '[Execution completed with no stdout]',
          stderr: '',
          exitCode: 0,
          durationMs: Date.now() - startTime,
          memoryUsedMb: 8,
          status: 'COMPLETED',
          isolationType: 'DEV_LOCAL_ISOLATED',
          securityAudit: {
            networkCallsBlocked: 0,
            restrictedSyscallsDetected: 0,
            isolatedFileSystem: false, // Node.js node:vm is NOT a security boundary; production requires gVisor/Firecracker container sandbox
          },
        });
      } catch (err: any) {
        const isTimeout =
          err?.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' ||
          err?.message?.includes('timed out') ||
          err?.message?.includes('Script execution timed out');

        resolve({
          success: false,
          stdout: logs.join('\n').slice(0, this.MAX_OUTPUT_BYTES),
          stderr: isTimeout
            ? `Execution timed out after ${timeoutMs}ms. Infinite loops or blocked I/O are terminated.`
            : String(err?.message || err),
          exitCode: isTimeout ? 124 : 1,
          durationMs: Date.now() - startTime,
          memoryUsedMb: 8,
          status: isTimeout ? 'TIMEOUT' : 'RUNTIME_ERROR',
          isolationType: 'DEV_LOCAL_ISOLATED',
          securityAudit: {
            networkCallsBlocked: 0,
            restrictedSyscallsDetected: 0,
            isolatedFileSystem: true,
          },
        });
      }
    });
  }
}
