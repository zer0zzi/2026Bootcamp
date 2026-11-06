import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  passwordMatches,
  readAuthConfig,
  safeNextPath,
  verifySessionToken,
} from "./auth";

const SECRET = "test-secret";
const NOW = 1_800_000_000_000;

describe("readAuthConfig", () => {
  it("비밀번호와 시크릿이 모두 있으면 인증을 켠다", () => {
    expect(readAuthConfig({ APP_PASSWORD: "pw", AUTH_SECRET: "s", NODE_ENV: "production" })).toEqual({
      state: "enabled",
      password: "pw",
      secret: "s",
    });
  });

  it("개발 환경에서 둘 다 없으면 인증을 끈다", () => {
    expect(readAuthConfig({ NODE_ENV: "development" })).toEqual({ state: "disabled" });
  });

  it("배포 환경에서 설정이 없으면 열어 두지 않고 막는다", () => {
    expect(readAuthConfig({ NODE_ENV: "production" })).toEqual({ state: "misconfigured" });
  });

  it("하나만 설정돼 있으면 어느 환경이든 설정 오류로 본다", () => {
    expect(readAuthConfig({ APP_PASSWORD: "pw", NODE_ENV: "development" })).toEqual({ state: "misconfigured" });
    expect(readAuthConfig({ AUTH_SECRET: "s", NODE_ENV: "development" })).toEqual({ state: "misconfigured" });
  });
});

describe("세션 토큰", () => {
  it("만든 토큰은 검증을 통과한다", async () => {
    const token = await createSessionToken(SECRET, NOW);
    expect(await verifySessionToken(token, SECRET, NOW + 1000)).toBe(true);
  });

  it("다른 시크릿으로는 통과하지 못한다", async () => {
    const token = await createSessionToken(SECRET, NOW);
    expect(await verifySessionToken(token, "other-secret", NOW)).toBe(false);
  });

  it("만료 시각이 지나면 통과하지 못한다", async () => {
    const token = await createSessionToken(SECRET, NOW);
    const justAfter = NOW + SESSION_MAX_AGE_SECONDS * 1000 + 1;
    expect(await verifySessionToken(token, SECRET, justAfter)).toBe(false);
  });

  it("만료 시각을 늘려 고치면 서명이 맞지 않아 거절된다", async () => {
    const token = await createSessionToken(SECRET, NOW);
    const [expires, signature] = token.split(".");
    const forged = `${Number(expires) + 10_000_000}.${signature}`;
    expect(await verifySessionToken(forged, SECRET, NOW)).toBe(false);
  });

  it.each([undefined, "", "abc", "123.", ".abc", "1.2.3", "123.zz", "123.abc", "abc.abcd"])(
    "형식이 잘못된 토큰은 거절한다: %s",
    async (token) => {
      expect(await verifySessionToken(token, SECRET, NOW)).toBe(false);
    },
  );
});

describe("passwordMatches", () => {
  it("같은 비밀번호만 통과한다", async () => {
    expect(await passwordMatches("correct horse", "correct horse", SECRET)).toBe(true);
    expect(await passwordMatches("correct horsE", "correct horse", SECRET)).toBe(false);
    expect(await passwordMatches("", "correct horse", SECRET)).toBe(false);
    expect(await passwordMatches("correct horse!", "correct horse", SECRET)).toBe(false);
  });

  it("한글 비밀번호도 비교한다", async () => {
    expect(await passwordMatches("비밀번호123", "비밀번호123", SECRET)).toBe(true);
    expect(await passwordMatches("비밀번호124", "비밀번호123", SECRET)).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("같은 사이트 안의 경로는 그대로 쓴다", () => {
    expect(safeNextPath("/transactions?type=EXPENSE")).toBe("/transactions?type=EXPENSE");
    expect(safeNextPath("/")).toBe("/");
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "transactions",
  ])("바깥으로 나가는 값은 메인으로 돌린다: %s", (value) => {
    expect(safeNextPath(value)).toBe("/");
  });
});
