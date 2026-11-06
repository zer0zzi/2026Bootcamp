import { NextResponse } from "next/server";

export const badRequest = (message = "입력값이 올바르지 않습니다.") =>
  NextResponse.json({ error: message }, { status: 400 });

export const notFound = () =>
  NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });

/** 요청 본문을 JSON으로 읽는다. 형식이 잘못됐으면 undefined. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/** 경로의 id를 양의 정수로 읽는다. 아니면 null. */
export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
