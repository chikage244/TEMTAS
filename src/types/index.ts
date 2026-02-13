export type Member = "chikage" | "natashia" | "misa" | "yuki" | "yasuka";

export type TaskStatus = "未着手" | "進行中" | "完了";

export type Project =
  | "運動会"
  | "校内清掃"
  | "ベルマーク"
  | "土曜除草"
  | "読み聞かせ"
  | "園芸"
  | "平日除草"
  | "給食試食会"
  | "秋イベント"
  | "その他";

export type TaskCategory =
  | "準備・手配"
  | "書類・印刷"
  | "連絡・調整"
  | "買い出し"
  | "当日対応"
  | "その他";

export interface Task {
  id: string;
  name: string;
  assignee: Member;
  dueDate: string | null;
  status: TaskStatus;
  project: Project;
  category: TaskCategory;
  memo: string;
  relatedEventIds: string[];
}

export interface ScheduleEvent {
  id: string;
  name: string;
  date: string | null;
  time: string;
  location: string;
  project: Project;
  memo: string;
  relatedTaskIds: string[];
}
