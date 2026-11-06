import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, readJson } from "@/lib/api";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  passwordMatches,
  readAuthConfig,
} from "@/lib/auth";

const loginSchema = z.object({ password: z.string().min(1).max(200) });

/** 비밀번호를 무작위로 대입하는 공격을 늦추기 위해 틀렸을 때 잠깐 기다린다. */
const WRONG_PASSWORD_DELAY_MS = 800;

/** POST /api/login - 비밀번호가 맞으면 세션 쿠키를 심는다. */
export async function POST(request: Request) {
  const auth = readAuthConfig();
  if (auth.state !== "enabled") {
    return NextResponse.json({ error: "로그인이 설정되어 있지 않습니다." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("비밀번호를 입력해 주세요.");

  if (!(await passwordMatches(parsed.data.password, auth.password, auth.secret))) {
    await new Promise((resolve) => setTimeout(resolve, WRONG_PASSWORD_DELAY_MS));
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(auth.secret), {
    httpOnly: true, // 자바스크립트에서 읽을 수 없게 한다
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // 다른 사이트에서 시작된 POST에는 쿠키를 보내지 않는다
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
