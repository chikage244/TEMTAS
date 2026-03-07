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
  "子ども110番",
  "書記",
  "会計",
  "地区",
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
  未着手: "bg-stone-100 text-stone-500 border border-stone-200",
  進行中: "bg-amber-50 text-amber-700 border border-amber-200",
  完了: "bg-stone-50 text-stone-400 border border-stone-200 line-through",
};

export const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  未着手: "進行中",
  進行中: "完了",
  完了: "未着手",
};

export const MEMBER_COLORS: Record<Member, { bg: string; text: string }> = {
  chikage:  { bg: "#C9D0EA", text: "#5B6BA8" },
  natashia: { bg: "#EABABC", text: "#A83A3A" },
  misa:     { bg: "#BCDAED", text: "#4A7FA0" },
  yuki:     { bg: "#E8E698", text: "#797400" },
  yasuka:   { bg: "#C5E5D3", text: "#2E6647" },
};

export const PROJECT_ASSIGNEES: Partial<Record<Project, Member[]>> = {
  運動会:     ["misa"],
  校内清掃:   ["misa", "yuki"],
  ベルマーク: ["natashia", "yasuka"],
  土曜除草:   ["chikage"],
  読み聞かせ: ["chikage"],
  園芸:       ["yasuka"],
  平日除草:   ["yasuka"],
  給食試食会: ["chikage", "yuki"],
  秋イベント: ["yuki", "chikage"],
  子ども110番: ["natashia"],
  書記:       ["chikage"],
  会計:       ["yuki", "yasuka"],
  地区:       ["misa", "natashia"],
};

export const MEMBER_DISPLAY: Record<Member, string> = {
  chikage: "chikage",
  natashia: "natashia",
  misa: "misa",
  yuki: "yuki",
  yasuka: "yasuka",
};
