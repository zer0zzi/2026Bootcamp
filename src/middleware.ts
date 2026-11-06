import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readAuthConfig, verifySessionToken } from "@/lib/auth";

/** 로그인 없이 접근할 수 있는 경로 */
const PUBLIC_PATHS = new Set(["/login", "/api/login", "/api/logout"]);

/** 모든 요청(화면과 API)에서 로그인 여부를 검사한다. */
export async function middleware(request: NextRequest) {
  const auth = readAuthConfig();

  if (auth.state === "disabled") return NextResponse.next();

  if (auth.state === "misconfigured") {
    return new NextResponse(
      "서버 설정 오류: APP_PASSWORD와 AUTH_SECRET 환경 변수를 모두 설정해 주세요.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, auth.secret)) {
    return NextResponse.next();
  }

  // API는 리다이렉트 대신 401을 돌려줘야 호출한 쪽이 상태를 알 수 있다.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  if (pathname !== "/") loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // 정적 파일은 검사하지 않는다.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
