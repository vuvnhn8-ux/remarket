/**
 * Re:Market — Server-side Auth & RBAC (AGENTS.md mục 3)
 *
 * Demo auth: in-memory session + signed httpOnly cookie + role-based guard.
 * KHÔNG dùng cho production thật — khi go-live hãy thay bằng giải pháp chuẩn
 * (NextAuth / JWT + cookie httpOnly / session store) nhưng giữ NGUYÊN luật:
 * mọi /staff/* và /admin/* đều bị chặn ở server nếu role sai.
 */

import { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import { getStore } from './store';
import { isEmailPending } from './auth-register';
import { PublicUser, UserRole } from '../src/types';
import { verifyPassword } from '../lib/security/hash';

// ---------- In-memory session store ----------
const sessions = new Map<string, { user: PublicUser; createdAt: string; maxAgeMs: number }>();
const COOKIE_NAME = 'rm_session';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8h

export function login(email: string, password: string): { token: string; user: PublicUser } | null {
  const store = getStore();
  const user = store.getUserByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  // Email vừa đăng ký nhưng chưa xác thực qua magic link -> chặn đăng nhập
  // (AGENTS.md mục 8, quy tắc "không chuyển thẳng vào trang chính sau đăng ký").
  if (isEmailPending(email)) return null;

  const pub = store.toPublicUser(user);
  return issueSession(pub);
}

/** Tạo session cho một PublicUser đã xác thực (dùng cho auto-login sau verify-link). */
export function issueSession(pub: PublicUser): { token: string; user: PublicUser } {
  const token = generateToken();
  sessions.set(token, { user: pub, createdAt: new Date().toISOString(), maxAgeMs: SESSION_MAX_AGE_MS });
  return { token, user: pub };
}

export function getUserByToken(token: string): PublicUser | undefined {
  const sess = sessions.get(token);
  if (!sess) return undefined;
  const age = Date.now() - new Date(sess.createdAt).getTime();
  if (age > sess.maxAgeMs) {
    sessions.delete(token);
    return undefined;
  }
  return sess.user;
}

export function logout(token: string): void {
  sessions.delete(token);
}

// ---------- Cookie helpers ----------
export function getTokenFromReq(req: Request): string | undefined {
  const c = req.headers.cookie || '';
  for (const part of c.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === COOKIE_NAME) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

export function setSessionCookie(res: Response, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_MS / 1000}`
  );
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

// ---------- Middleware ----------
export function currentUser(req: Request): PublicUser | undefined {
  const token = getTokenFromReq(req);
  if (!token) return undefined;
  return getUserByToken(token);
}

/** Chặn request nếu chưa đăng nhập. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json({ error: '認証が必要です。ログインしてください。' });
    return;
  }
  (req as any).user = user;
  next();
}

const ROLE_HIERARCHY: Record<UserRole, number> = { customer: 1, staff: 2, admin: 3 };

/** Chặn request nếu chưa đăng nhập hoặc role không đủ. */
export function requireRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = currentUser(req);
    if (!user) {
      res.status(401).json({ error: '認証が必要です。ログインしてください。' });
      return;
    }
    if ((ROLE_HIERARCHY[user.role] || 0) < ROLE_HIERARCHY[minRole]) {
      res.status(403).json({ error: `アクセス権限がありません（必要な権限: ${minRole}以上）。` });
      return;
    }
    (req as any).user = user;
    next();
  };
}

function generateToken(): string {
  // token đủ ngẫu nhiên cho demo (crypto.randomUUID có sẵn trong Node 14.17+)
  return crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
}
