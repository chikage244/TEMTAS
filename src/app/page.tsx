import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-[#fdf8f0] to-[#f5ede0]">
      {/* Logo area */}
      <div className="mb-10 text-center">
        <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-4 shadow-lg border-2 border-white/60">
          <Image
            src="/icon-512.png"
            alt="TEMTAS"
            width={96}
            height={96}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <h1 className="text-2xl font-black text-[#3d2e1e] tracking-tight">
          TEMTAS
        </h1>
        <p className="text-xs text-[#a0845c] mt-1 tracking-wide">
          PTA タスク管理
        </p>
      </div>

      {/* Menu cards */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link
          href="/tasks"
          className="group flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-[#e8dcc8] active:scale-[0.98] transition-all"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#c4a87a] to-[#a0845c] rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
            &#9745;
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-[#3d2e1e]">タスク一覧</h2>
            <p className="text-[11px] text-[#a0845c]">
              担当タスクを確認・更新
            </p>
          </div>
          <span className="text-[#d4c4a8] text-xl">&#8250;</span>
        </Link>

        <Link
          href="/schedule"
          className="group flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-[#e8dcc8] active:scale-[0.98] transition-all"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#c28b6e] to-[#a07060] rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
            &#128197;
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-[#3d2e1e]">スケジュール</h2>
            <p className="text-[11px] text-[#a0845c]">
              イベント・行事予定
            </p>
          </div>
          <span className="text-[#d4c4a8] text-xl">&#8250;</span>
        </Link>
      </div>

      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-12">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-300/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-red-300/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-sky-300/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-300/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-lime-300/50" />
      </div>
      <p className="text-[9px] text-[#c4b89a] mt-3">PTA 2026</p>
    </div>
  );
}
