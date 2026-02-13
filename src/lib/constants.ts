import { Member, Project, TaskStatus, TaskCategory } from "@/types";

export const MEMBERS: Member[] = [
  "chikage",
  "natashia",
  "misa",
  "yuki",
  "yasuka",
];

export const PROJECTS: Project[] = [
  "運動会",
  "校内清掃",
  "ベルマーク",
  "土曜除草",
  "読み聞かせ",
  "園芸",
  "平日除草",
  "給食試食会",
  "秋イベント",
  "その他",
];

export const STATUSES: TaskStatus[] = ["未着手", "進行中", "完了"];

export const CATEGORIES: TaskCategory[] = [
  "準備・手配",
  "書類・印刷",
  "連絡・調整",
  "買い出し",
  "当日対応",
  "その他",
];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  未着手: "bg-gray-100 text-gray-600 border border-gray-200",
  進行中: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  完了: "bg-teal-50 text-teal-600 border border-teal-200",
};

export const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  未着手: "進行中",
  進行中: "完了",
  完了: "未着手",
};

export const MEMBER_COLORS: Record<Member, string> = {
  chikage: "bg-pink-50 text-pink-600",
  natashia: "bg-violet-50 text-violet-600",
  misa: "bg-sky-50 text-sky-600",
  yuki: "bg-amber-50 text-amber-600",
  yasuka: "bg-lime-50 text-lime-600",
};
