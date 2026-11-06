/**
 * 데모 모드: 로그인 없이 누구나 볼 수 있고, 샘플 데이터만 보여 주며, 쓰기는 모두 막는다.
 * 공개 포트폴리오 링크용이다. 실제 가계부(비밀번호 보호 배포)와는 다른 프로젝트로 배포한다.
 */
export function isDemoMode(env: Record<string, string | undefined> = process.env): boolean {
  return env.DEMO_MODE === "true";
}

export const DEMO_READ_ONLY_MESSAGE = "데모 모드에서는 읽기만 할 수 있어요.";

/** 쓰기 작업 앞에서 호출한다. 미들웨어가 막지 못한 경로가 있더라도 데이터가 바뀌지 않게 하는 이중 안전장치. */
export function assertWritable(): void {
  if (isDemoMode()) throw new Error(DEMO_READ_ONLY_MESSAGE);
}
