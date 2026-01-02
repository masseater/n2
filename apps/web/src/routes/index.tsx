/**
 * ルートページ（ランディングページ）
 * 未ログイン: LP を表示
 * ログイン済み: /daily へリダイレクト
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signInWithGoogle, useSession } from "@/features/auth/auth-client";
import { getTodayString } from "@/lib/date";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isPending && session?.user) {
      navigate({
        to: "/daily/$date",
        params: { date: getTodayString() },
      });
    }
  }, [isMounted, isPending, session, navigate]);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  if (!isMounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-500 text-sm tracking-widest animate-pulse">...</div>
      </div>
    );
  }

  if (session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 背景のグラデーション */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent)",
        }}
      />

      {/* メインコンテンツ */}
      <main className="relative z-10 text-center max-w-lg">
        {/* ロゴ */}
        <div className="mb-12">
          <h1
            className="text-6xl font-light tracking-tight text-white mb-2"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            N<span className="text-gray-500">2</span>
          </h1>
          <div className="text-[10px] tracking-[0.4em] text-gray-600 uppercase">NippoNikki</div>
        </div>

        {/* タグライン */}
        <p className="text-gray-400 text-sm leading-relaxed mb-16 tracking-wide">
          日報粒度とタスク粒度を切り替え可能な
          <br />
          個人向けタスク管理ツール
        </p>

        {/* ログインボタン */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="group inline-flex items-center gap-3 bg-white/5 text-gray-300 text-sm py-3 px-6 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
        >
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" role="img" aria-label="Google">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="tracking-wide">Google でログイン</span>
          <span className="text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
        </button>
      </main>

      {/* フッター */}
      <footer className="absolute bottom-8 text-[10px] text-gray-700 tracking-widest">
        © 2026
      </footer>
    </div>
  );
}
