import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">NippoNikki</h1>
        <p className="text-xl text-gray-300">
          日報粒度とタスク粒度を切り替え可能なタスク管理ツール
        </p>
      </section>
    </div>
  );
}
