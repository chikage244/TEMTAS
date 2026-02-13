import TaskList from "@/components/TaskList";
import BottomNav from "@/components/BottomNav";

export default function TasksPage() {
  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#e8dcc8] px-4 py-3 z-10">
        <h1 className="text-base font-black text-[#3d2e1e] text-center tracking-wide">
          タスク一覧
        </h1>
      </header>
      <main className="p-4 max-w-lg mx-auto">
        <TaskList />
      </main>
      <BottomNav />
    </div>
  );
}
