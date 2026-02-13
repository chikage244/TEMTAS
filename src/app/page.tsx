import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-green-50 to-emerald-50">
      {/* Logo area */}
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl text-white font-black">T</span>
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">
          TEMTAS
        </h1>
        <p className="text-sm text-gray-400 mt-1">PTAタスク管理</p>
      </div>

      {/* Menu cards */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link
          href="/tasks"
          className="group flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-green-100 active:scale-[0.98] transition-all"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-sm group-active:shadow-none">
            <span>&#9744;</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800">タスク一覧</h2>
            <p className="text-xs text-gray-400">担当タスクを確認・更新</p>
          </div>
          <span className="ml-auto text-gray-300 text-xl">&#8250;</span>
        </Link>

        <Link
          href="/schedule"
          className="group flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-teal-100 active:scale-[0.98] transition-all"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl shadow-sm group-active:shadow-none">
            <span>&#128197;</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800">スケジュール</h2>
            <p className="text-xs text-gray-400">イベント・行事予定</p>
          </div>
          <span className="ml-auto text-gray-300 text-xl">&#8250;</span>
        </Link>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-gray-300 mt-16">PTA 2026</p>
    </div>
  );
}
