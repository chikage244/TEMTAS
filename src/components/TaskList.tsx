"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus, Member, Project, TaskCategory } from "@/types";
import {
  MEMBERS,
  PROJECTS,
  STATUSES,
  CATEGORIES,
  STATUS_COLORS,
  STATUS_NEXT,
  MEMBER_COLORS,
  MEMBER_DISPLAY,
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
  期限超過: { badge: "bg-red-50 text-red-400 border-red-200", line: "border-red-100" },
  今日: { badge: "bg-amber-50 text-amber-600 border-amber-200", line: "border-amber-100" },
  今週: { badge: "bg-[#f5ede0] text-[#8b6b3d] border-[#e0d0b8]", line: "border-[#e8dcc8]" },
  来週: { badge: "bg-stone-50 text-stone-500 border-stone-200", line: "border-stone-100" },
  それ以降: { badge: "bg-stone-50 text-stone-400 border-stone-200", line: "border-stone-100" },
  期限なし: { badge: "bg-stone-50 text-stone-300 border-stone-200", line: "border-stone-100" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${month}/${day}(${weekday})`;
}

interface TaskFormData {
  name: string;
  assignee: Member;
  dueDate: string;
  status: TaskStatus;
  project: Project;
  category: TaskCategory;
  memo: string;
}

const EMPTY_FORM: TaskFormData = {
  name: "",
  assignee: "chikage",
  dueDate: "",
  status: "未着手",
  project: "その他",
  category: "その他",
  memo: "",
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<Member | "all">("all");
  const [filterProject, setFilterProject] = useState<Project | "all">("all");
  const [hideCompleted, setHideCompleted] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
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

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchTasks();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
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

  const openNewForm = () => {
    setEditingTask(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      assignee: task.assignee,
      dueDate: task.dueDate ?? "",
      status: task.status,
      project: task.project,
      category: task.category,
      memo: task.memo,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingTask) {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: editingTask.id,
            ...formData,
            dueDate: formData.dueDate || null,
          }),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            dueDate: formData.dueDate || null,
          }),
        });
        if (!res.ok) throw new Error();
      }
      setShowForm(false);
      setEditingTask(null);
      await fetchTasks();
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      if (!res.ok) throw new Error();
      setConfirmDelete(null);
      setShowForm(false);
      setEditingTask(null);
      await fetchTasks();
    } catch {
      alert("削除に失敗しました");
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
        <div className="animate-spin h-8 w-8 border-[3px] border-[#c4a87a] border-t-transparent rounded-full" />
        <p className="text-sm text-[#c4b89a]">読み込み中...</p>
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
          className="bg-[#a0845c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:bg-[#8b7355]"
        >
          再読み込み
        </button>
      </div>
    );
  }

  const selectClass = "w-full border border-[#e0d0b8] rounded-xl px-3 py-2.5 text-sm bg-white/80 text-[#3d2e1e] focus:outline-none focus:ring-2 focus:ring-[#d4c4a8]";
  const inputClass = selectClass;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value as Member | "all")}
          className="border border-[#e0d0b8] rounded-xl px-3 py-2.5 text-sm bg-white/80 text-[#3d2e1e] focus:outline-none focus:ring-2 focus:ring-[#d4c4a8]"
        >
          <option value="all">全メンバー</option>
          {MEMBERS.map((m) => (
            <option key={m} value={m}>
              {MEMBER_DISPLAY[m]}
            </option>
          ))}
        </select>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value as Project | "all")}
          className="border border-[#e0d0b8] rounded-xl px-3 py-2.5 text-sm bg-white/80 text-[#3d2e1e] focus:outline-none focus:ring-2 focus:ring-[#d4c4a8]"
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
              ? "bg-white/80 text-[#a0845c] border border-[#e0d0b8]"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {hideCompleted ? "完了を非表示" : "完了を表示中"}
        </button>
      </div>

      {/* Task count + add button */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-[#c4b89a]">
          {filteredTasks.length}件のタスク
        </p>
        <button
          onClick={openNewForm}
          className="bg-[#a0845c] text-white px-4 py-2 rounded-xl text-xs font-bold active:bg-[#8b7355] transition-all"
        >
          + 新規タスク
        </button>
      </div>

      {/* Grouped tasks */}
      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 opacity-20">&#127807;</div>
          <p className="text-[#c4b89a] text-sm">タスクがありません</p>
        </div>
      ) : (
        grouped.map((group) => {
          const style = GROUP_STYLES[group.label] || GROUP_STYLES["期限なし"];
          return (
            <div key={group.label} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}
                >
                  {group.label}
                </span>
                <div className={`flex-1 border-t ${style.line}`} />
                <span className="text-[11px] text-[#d4c4a8]">
                  {group.tasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openEditForm(task)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-[#ece2d0] active:bg-[#faf5ec] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[15px] text-[#3d2e1e] leading-snug">
                          {task.name}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              MEMBER_COLORS[task.assignee] ||
                              "bg-stone-50 text-stone-500"
                            }`}
                          >
                            {MEMBER_DISPLAY[task.assignee] || task.assignee}
                          </span>
                          {task.project && (
                            <span className="text-[10px] bg-[#f5ede0] text-[#8b7355] px-2 py-0.5 rounded-full">
                              {task.project}
                            </span>
                          )}
                          {task.category && (
                            <span className="text-[10px] bg-stone-50 text-stone-400 px-2 py-0.5 rounded-full">
                              {task.category}
                            </span>
                          )}
                        </div>
                        {task.dueDate && (
                          <p className="text-[11px] text-[#c4b89a] mt-1.5">
                            {formatDate(task.dueDate)}
                          </p>
                        )}
                        {task.memo && (
                          <p className="text-[11px] text-[#c4b89a] mt-1 truncate">
                            {task.memo}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task);
                        }}
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

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/25 z-20 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#fdf8f0] rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#d4c4a8] rounded-full mx-auto mb-5" />
            <h3 className="text-base font-black text-[#3d2e1e] mb-4">
              {editingTask ? "タスクを編集" : "新規タスク"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#8b7355] mb-1 block">タスク名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="タスク名を入力"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#8b7355] mb-1 block">担当者</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value as Member })}
                    className={selectClass}
                  >
                    {MEMBERS.map((m) => (
                      <option key={m} value={m}>{MEMBER_DISPLAY[m]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#8b7355] mb-1 block">ステータス</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className={selectClass}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#8b7355] mb-1 block">期限</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#8b7355] mb-1 block">プロジェクト</label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value as Project })}
                    className={selectClass}
                  >
                    {PROJECTS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#8b7355] mb-1 block">カテゴリ</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className={selectClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#8b7355] mb-1 block">メモ</label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="メモを入力"
                />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
                className="w-full bg-[#a0845c] text-white py-3 rounded-xl font-semibold text-sm active:bg-[#8b7355] disabled:opacity-50 transition-all"
              >
                {saving ? "保存中..." : editingTask ? "保存" : "作成"}
              </button>

              {editingTask && (
                confirmDelete === editingTask.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(editingTask.id)}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold text-sm"
                    >
                      本当に削除
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 bg-[#f5ede0] text-[#8b7355] py-3 rounded-xl font-semibold text-sm"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(editingTask.id)}
                    className="w-full bg-red-50 text-red-400 py-3 rounded-xl font-semibold text-sm border border-red-200"
                  >
                    削除
                  </button>
                )
              )}

              <button
                onClick={() => setShowForm(false)}
                className="w-full bg-[#f5ede0] text-[#8b7355] py-3 rounded-xl font-semibold text-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
