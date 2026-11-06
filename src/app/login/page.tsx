import { LoginForm } from "@/components/LoginForm";
import { safeNextPath } from "@/lib/auth";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(Array.isArray(next) ? next[0] : next);

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">스마트가계부</h1>
        <p className="text-sm text-gray-600">비밀번호를 입력해야 들어갈 수 있어요.</p>
      </div>
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
