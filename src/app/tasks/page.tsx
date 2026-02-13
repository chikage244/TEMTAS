import Link from "next/link";
import TaskList from "@/components/TaskList";

export default function TasksPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-indigo-500 text-white px-4 py-3 flex items-center gap-3 shadow-md z-10">
        <Link href="/" className="text-2xl leading-none">
          ←
        </Link>
        <h1 className="text-lg font-bold">タスク一覧</h1>
      </header>
      <main className="p-4 max-w-lg mx-auto">
        <TaskList />
      </main>
    </div>
  );
}
