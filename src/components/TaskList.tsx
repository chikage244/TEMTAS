"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus, Member, Project } from "@/types";
import {
  MEMBERS,
  PROJECTS,
  STATUS_COLORS,
  STATUS_NEXT,
  MEMBER_COLORS,
} from "@/lib/constants";

function getTimeGroup(dateStr: string | null): string {
  if (!dateStr) return "期限なし";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dateStr);

  const diffDays = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "期限超過";
  if (diffDays === 0) return "今日";
  if (diffDays <= 7 - today.getDay()) return "今週";
  if (diffDays <= 14 - today.getDay()) return "来週";
  return "それ以降";
}

const GROUP_ORDER = ["期限超過", "今日", "今週", "来週", "それ以降", "期限なし"];

const GROUP_STYLES: Record<string, { badge: string; line: string }> = {
  期限超過: { badge: "bg-red-50 text-red-500 border-red-200", line: "border-red-200" },
  今日: { badge: "bg-amber-50 text-amber-600 border-amber-200", line: "border-amber-200" },
  今週: { badge: "bg-green-50 text-green-600 border-green-200", line: "border-green-200" },
  来週: { badge: "bg-teal-50 text-teal-600 border-teal-200", line: "border-teal-200" },
  それ以降: { badge: "bg-gray-50 text-gray-500 border-gray-200", line: "border-gray-200" },
  期限なし: { badge: "bg-gray-50 text-gray-400 border-gray-200", line: "border-gray-100" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${month}/${day}(${weekday})`;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<Member | "all">("all");
  const [filterProject, setFilterProject] = useState<Project | "all">("all");
  const [hideCompleted, setHideCompleted] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("取得失敗");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch {
      setError("タスクの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (task: Task) => {
    const newStatus: TaskStatus = STATUS_NEXT[task.status];

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t
        )
      );
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterMember !== "all" && t.assignee !== filterMember) return false;
    if (filterProject !== "all" && t.project !== filterProject) return false;
    if (hideCompleted && t.status === "完了") return false;
    return true;
  });

  const grouped = GROUP_ORDER.reduce(
    (acc, group) => {
      const groupTasks = filteredTasks.filter(
        (t) => getTimeGroup(t.dueDate) === group
      );
      if (groupTasks.length > 0) {
        acc.push({ label: group, tasks: groupTasks });
      }
      return acc;
    },
    [] as { label: string; tasks: Task[] }[]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin h-8 w-8 border-[3px] border-green-400 border-t-transparent rounded-full" />
        <p className="text-sm text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4 text-sm">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchTasks();
          }}
          className="bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:bg-green-600"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value as Member | "all")}
          className="border border-green-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          <option value="all">全メンバー</option>
          {MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value as Project | "all")}
          className="border border-green-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          <option value="all">全プロジェクト</option>
          {PROJECTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            hideCompleted
              ? "bg-white text-gray-500 border border-gray-200"
              : "bg-teal-50 text-teal-600 border border-teal-200"
          }`}
        >
          {hideCompleted ? "完了を非表示" : "完了を表示中"}
        </button>
      </div>

      {/* Task count */}
      <p className="text-xs text-gray-400 mb-3">
        {filteredTasks.length}件のタスク
      </p>

      {/* Grouped tasks */}
      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 opacity-30">&#9744;</div>
          <p className="text-gray-400 text-sm">タスクがありません</p>
        </div>
      ) : (
        grouped.map((group) => {
          const style = GROUP_STYLES[group.label] || GROUP_STYLES["期限なし"];
          return (
            <div key={group.label} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}
                >
                  {group.label}
                </span>
                <div className={`flex-1 border-t ${style.line}`} />
                <span className="text-[11px] text-gray-300">
                  {group.tasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 active:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[15px] text-gray-800 leading-snug">
                          {task.name}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                              MEMBER_COLORS[task.assignee] ||
                              "bg-gray-50 text-gray-500"
                            }`}
                          >
                            {task.assignee}
                          </span>
                          {task.project && (
                            <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                              {task.project}
                            </span>
                          )}
                          {task.category && (
                            <span className="text-[11px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">
                              {task.category}
                            </span>
                          )}
                        </div>
                        {task.dueDate && (
                          <p className="text-[11px] text-gray-400 mt-1.5">
                            {formatDate(task.dueDate)}
                          </p>
                        )}
                        {task.memo && (
                          <p className="text-[11px] text-gray-400 mt-1 truncate">
                            {task.memo}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleStatusChange(task)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${STATUS_COLORS[task.status]}`}
                      >
                        {task.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
