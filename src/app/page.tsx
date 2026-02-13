import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold text-indigo-600 mb-2">TEMTAS</h1>
      <p className="text-gray-500 mb-10">PTAタスク管理</p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/tasks"
          className="flex items-center justify-center gap-2 bg-indigo-500 text-white rounded-xl py-4 px-6 text-lg font-semibold shadow-md active:bg-indigo-600 transition"
        >
          📋 タスク一覧
        </Link>
        <Link
          href="/schedule"
          className="flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl py-4 px-6 text-lg font-semibold shadow-md active:bg-amber-600 transition"
        >
          📅 スケジュール
        </Link>
      </div>
    </div>
  );
}
