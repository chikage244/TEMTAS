import ScheduleView from "@/components/ScheduleView";
import BottomNav from "@/components/BottomNav";

export default function SchedulePage() {
  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#e8dcc8] px-4 py-3 z-10">
        <h1 className="text-base font-black text-[#3d2e1e] text-center tracking-wide">
          スケジュール
        </h1>
      </header>
      <main className="p-4 max-w-lg mx-auto">
        <ScheduleView />
      </main>
      <BottomNav />
    </div>
  );
}
