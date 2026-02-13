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
  未着手: "bg-stone-100 text-stone-500 border border-stone-200",
  進行中: "bg-amber-50 text-amber-700 border border-amber-200",
  完了: "bg-stone-50 text-stone-400 border border-stone-200 line-through",
};

export const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  未着手: "進行中",
  進行中: "完了",
  完了: "未着手",
};

// chikage=ライラック natashia=朱色 misa=水色 yuki=ペールイエロー yasuka=ライム
export const MEMBER_COLORS: Record<Member, string> = {
  chikage: "bg-purple-50 text-purple-500 border border-purple-200",
  natashia: "bg-red-50 text-red-500 border border-red-200",
  misa: "bg-sky-50 text-sky-500 border border-sky-200",
  yuki: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  yasuka: "bg-lime-50 text-lime-600 border border-lime-200",
};

export const MEMBER_DISPLAY: Record<Member, string> = {
  chikage: "ちかげ",
  natashia: "なたしあ",
  misa: "みさ",
  yuki: "ゆき",
  yasuka: "やすか",
};
