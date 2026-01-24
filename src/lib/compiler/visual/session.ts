/**
 * Session State 管理
 *
 * 管理视觉引擎的会话状态，确保：
 * - 同一 session 内 Tokens 一致
 * - 支持会话恢复
 * - 支持增量更新
 */

import type { SessionState, DesignTokens, SynthesizerOptions } from './types';
import { generateDesignTokens } from './synthesizer';

// ============================================
// Session 存储
// ============================================

/** 内存中的 Session 缓存 */
const sessionCache = new Map<string, SessionState>();

/**
 * 简单的字符串哈希函数
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// ============================================
// Session 管理函数
// ============================================

/**
 * 创建新的 Session
 */
export function createSession(context: string, sessionId?: string): SessionState {
  const id = sessionId || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const seed = hashString(`${context}:${id}`);
  const now = new Date().toISOString();

  const session: SessionState = {
    sessionId: id,
    context,
    seed,
    createdAt: now,
    updatedAt: now,
  };

  sessionCache.set(id, session);
  return session;
}

/**
 * 获取 Session
 */
export function getSession(sessionId: string): SessionState | undefined {
  return sessionCache.get(sessionId);
}

/**
 * 获取或创建 Session
 */
export function getOrCreateSession(context: string, sessionId?: string): SessionState {
  if (sessionId) {
    const existing = sessionCache.get(sessionId);
    if (existing) {
      return existing;
    }
  }
  return createSession(context, sessionId);
}

/**
 * 更新 Session 的 context
 */
export function updateSessionContext(sessionId: string, context: string): SessionState | undefined {
  const session = sessionCache.get(sessionId);
  if (!session) {
    return undefined;
  }

  // 更新 context 会重新计算 seed
  session.context = context;
  session.seed = hashString(`${context}:${sessionId}`);
  session.updatedAt = new Date().toISOString();
  session.tokens = undefined; // 清除缓存的 tokens

  return session;
}

/**
 * 删除 Session
 */
export function deleteSession(sessionId: string): boolean {
  return sessionCache.delete(sessionId);
}

/**
 * 清除所有 Session
 */
export function clearAllSessions(): void {
  sessionCache.clear();
}

/**
 * 列出所有 Session
 */
export function listSessions(): SessionState[] {
  return Array.from(sessionCache.values());
}

// ============================================
// Session Tokens 管理
// ============================================

/**
 * 获取 Session 的 Design Tokens
 * 如果已缓存则返回缓存，否则生成新的
 */
export function getSessionTokens(sessionId: string): DesignTokens | undefined {
  const session = sessionCache.get(sessionId);
  if (!session) {
    return undefined;
  }

  // 如果有缓存，直接返回
  if (session.tokens) {
    return session.tokens;
  }

  // 否则生成并缓存
  const tokens = generateDesignTokens({
    context: session.context,
    sessionId: session.sessionId,
    seed: session.seed,
  });

  session.tokens = tokens;
  session.updatedAt = new Date().toISOString();

  return tokens;
}

/**
 * 强制刷新 Session 的 Design Tokens
 */
export function refreshSessionTokens(sessionId: string): DesignTokens | undefined {
  const session = sessionCache.get(sessionId);
  if (!session) {
    return undefined;
  }

  const tokens = generateDesignTokens({
    context: session.context,
    sessionId: session.sessionId,
    seed: session.seed,
  });

  session.tokens = tokens;
  session.updatedAt = new Date().toISOString();

  return tokens;
}

/**
 * 覆盖 Session 的部分 Tokens
 */
export function overrideSessionTokens(
  sessionId: string,
  overrides: Partial<DesignTokens>
): DesignTokens | undefined {
  const session = sessionCache.get(sessionId);
  if (!session) {
    return undefined;
  }

  // 先获取基础 tokens
  const baseTokens = getSessionTokens(sessionId);
  if (!baseTokens) {
    return undefined;
  }

  // 应用覆盖
  const tokens = { ...baseTokens, ...overrides };
  session.tokens = tokens;
  session.updatedAt = new Date().toISOString();

  return tokens;
}

// ============================================
// Session 持久化（可选扩展）
// ============================================

/**
 * 导出 Session 为 JSON
 */
export function exportSession(sessionId: string): string | undefined {
  const session = sessionCache.get(sessionId);
  if (!session) {
    return undefined;
  }
  return JSON.stringify(session, null, 2);
}

/**
 * 从 JSON 导入 Session
 */
export function importSession(json: string): SessionState {
  const session = JSON.parse(json) as SessionState;
  sessionCache.set(session.sessionId, session);
  return session;
}

// ============================================
// 便捷函数
// ============================================

/**
 * 一站式获取 Tokens
 * 自动处理 Session 创建和 Tokens 生成
 */
export function getTokens(options: SynthesizerOptions): DesignTokens {
  const { context, sessionId } = options;

  // 获取或创建 session
  const session = getOrCreateSession(context, sessionId);

  // 获取 tokens
  let tokens = getSessionTokens(session.sessionId);
  if (!tokens) {
    tokens = generateDesignTokens({
      ...options,
      sessionId: session.sessionId,
      seed: session.seed,
    });
    session.tokens = tokens;
  }

  // 应用覆盖
  if (options.overrides) {
    tokens = { ...tokens, ...options.overrides };
    session.tokens = tokens;
  }

  return tokens;
}
