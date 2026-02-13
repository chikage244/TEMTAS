"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus, Member, Project } from "@/types";
import {
  MEMBERS,
  PROJECTS,
  STATUS_COLORS,
  STATUS_NEXT,
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

    // Optimistic update
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
      // Revert on error
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

  // Group by time period
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchTasks();
          }}
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg"
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
          className="border rounded-lg px-3 py-2 text-sm bg-white"
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
          className="border rounded-lg px-3 py-2 text-sm bg-white"
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
          className={`px-3 py-2 rounded-lg text-sm border ${
            hideCompleted
              ? "bg-gray-100 text-gray-600"
              : "bg-green-100 text-green-700 border-green-300"
          }`}
        >
          {hideCompleted ? "完了を非表示" : "完了を表示中"}
        </button>
      </div>

      {/* Task count */}
      <p className="text-sm text-gray-500 mb-3">
        {filteredTasks.length}件のタスク
      </p>

      {/* Grouped tasks */}
      {grouped.length === 0 ? (
        <p className="text-center text-gray-400 py-10">
          タスクがありません
        </p>
      ) : (
        grouped.map((group) => (
          <div key={group.label} className="mb-6">
            <h3
              className={`text-sm font-bold mb-2 px-1 ${
                group.label === "期限超過"
                  ? "text-red-500"
                  : group.label === "今日"
                  ? "text-orange-500"
                  : "text-gray-500"
              }`}
            >
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base truncate">
                        {task.name}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                          {task.assignee}
                        </span>
                        {task.project && (
                          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded">
                            {task.project}
                          </span>
                        )}
                        {task.category && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            {task.category}
                          </span>
                        )}
                      </div>
                      {task.dueDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          期限: {formatDate(task.dueDate)}
                        </p>
                      )}
                      {task.memo && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {task.memo}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleStatusChange(task)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${STATUS_COLORS[task.status]}`}
                    >
                      {task.status}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
