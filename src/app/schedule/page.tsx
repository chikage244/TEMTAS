import Link from "next/link";
import ScheduleView from "@/components/ScheduleView";

export default function SchedulePage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-amber-500 text-white px-4 py-3 flex items-center gap-3 shadow-md z-10">
        <Link href="/" className="text-2xl leading-none">
          ←
        </Link>
        <h1 className="text-lg font-bold">スケジュール</h1>
      </header>
      <main className="p-4 max-w-lg mx-auto">
        <ScheduleView />
      </main>
    </div>
  );
}
