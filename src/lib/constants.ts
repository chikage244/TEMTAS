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
  未着手: "bg-gray-200 text-gray-700",
  進行中: "bg-blue-100 text-blue-700",
  完了: "bg-green-100 text-green-700",
};

export const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  未着手: "進行中",
  進行中: "完了",
  完了: "未着手",
};
