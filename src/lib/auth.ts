/**
 * 비밀번호 한 개로 앱 전체를 보호하는 간단한 인증.
 *
 * 로그인에 성공하면 서명된 토큰을 httpOnly 쿠키에 담아 주고, 미들웨어가 모든 요청에서 이 토큰을 검사한다.
 * 미들웨어는 Edge 런타임에서 돌기 때문에 Node 전용 API 대신 Web Crypto만 쓴다.
 */

import { isDemoMode } from "./demo";

export const SESSION_COOKIE = "sw_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30일

const encoder = new TextEncoder();

type Env = Record<string, string | undefined>;

export type AuthConfig =
  | { state: "disabled" }
  /** 누구나 볼 수 있는 읽기 전용 데모 (샘플 데이터) */
  | { state: "demo" }
  | { state: "misconfigured" }
  | { state: "enabled"; password: string; secret: string };

/**
 * 환경 변수로 인증 상태를 정한다.
 * - DEMO_MODE=true면 로그인 없는 읽기 전용 데모다. 이때 비밀번호 설정이 함께 있으면 "보호된 실제 가계부"와
 *   "공개 데모" 중 어느 쪽인지 알 수 없으므로, 공개되는 쪽으로 열지 않고 설정 오류로 막는다.
 * - APP_PASSWORD와 AUTH_SECRET이 모두 있으면 인증을 켠다.
 * - 둘 다 없으면 로컬 개발에서만 인증을 끈다. 배포 환경에서 빠뜨리면 "열어 두는" 대신
 *   "막는" 쪽(misconfigured)으로 실패해, 설정 실수로 가계부가 공개되지 않게 한다.
 */
export function readAuthConfig(env: Env = process.env): AuthConfig {
  const { APP_PASSWORD: password, AUTH_SECRET: secret } = env;
  if (isDemoMode(env)) return password || secret ? { state: "misconfigured" } : { state: "demo" };
  if (password && secret) return { state: "enabled", password, secret };
  if (!password && !secret && env.NODE_ENV !== "production") return { state: "disabled" };
  return { state: "misconfigured" };
}

async function hmacKey(secret: string, usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

function fromHex(hex: string): Uint8Array<ArrayBuffer> | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

/** 만료 시각과 그 서명을 이어 붙인 세션 토큰: "<만료ms>.<hex 서명>" */
export async function createSessionToken(secret: string, now: number = Date.now()): Promise<string> {
  const expires = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret, "sign"), encoder.encode(expires));
  return `${expires}.${toHex(signature)}`;
}

/** 서명이 맞고 아직 만료되지 않은 토큰인지 검사한다. 서명 비교는 Web Crypto가 상수 시간으로 한다. */
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expires, signatureHex] = parts;
  if (!/^\d+$/.test(expires) || Number(expires) <= now) return false;

  const signature = fromHex(signatureHex);
  if (!signature) return false;

  return crypto.subtle.verify("HMAC", await hmacKey(secret, "verify"), signature, encoder.encode(expires));
}

/**
 * 입력한 비밀번호가 맞는지 비교한다.
 * 둘 다 같은 길이(32바이트)의 HMAC으로 바꿔 비교하므로, 비밀번호 길이나 일치하는 앞부분이
 * 응답 시간으로 드러나지 않는다.
 */
export async function passwordMatches(input: string, expected: string, secret: string): Promise<boolean> {
  const key = await hmacKey(secret, "sign");
  const [a, b] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(input)),
    crypto.subtle.sign("HMAC", key, encoder.encode(expected)),
  ]);

  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

/**
 * 로그인 후 돌아갈 경로를 정한다. 같은 사이트 안의 경로만 허용해서
 * "?next=https://evil.example" 같은 값으로 다른 사이트로 보내는 공격(open redirect)을 막는다.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
