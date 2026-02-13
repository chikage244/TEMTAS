import { Client } from "@notionhq/client";
import { Task, ScheduleEvent, TaskStatus } from "@/types";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const TASK_DB_ID = process.env.NOTION_TASK_DB_ID!;
const SCHEDULE_DB_ID = process.env.NOTION_SCHEDULE_DB_ID!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageProperties = Record<string, any>;

function getTitle(props: PageProperties): string {
  const prop = props["タスク名"] || props["イベント名"];
  return prop?.title?.[0]?.plain_text ?? "";
}

function getSelect(props: PageProperties, name: string): string {
  return props[name]?.select?.name ?? "";
}

function getDate(props: PageProperties, name: string): string | null {
  return props[name]?.date?.start ?? null;
}

function getText(props: PageProperties, name: string): string {
  const prop = props[name];
  if (prop?.type === "rich_text") {
    return prop.rich_text?.[0]?.plain_text ?? "";
  }
  return "";
}

function getRelation(
  props: PageProperties,
  name: string
): string[] {
  return (props[name]?.relation ?? []).map(
    (r: { id: string }) => r.id
  );
}

// Fetch all tasks
export async function getTasks(): Promise<Task[]> {
  const response = await notion.databases.query({
    database_id: TASK_DB_ID,
    sorts: [{ property: "期限", direction: "ascending" }],
  });

  return response.results.map((page) => {
    const props = (page as { properties: PageProperties }).properties;
    return {
      id: page.id,
      name: getTitle(props),
      assignee: getSelect(props, "担当者") as Task["assignee"],
      dueDate: getDate(props, "期限"),
      status: getSelect(props, "ステータス") as TaskStatus,
      project: getSelect(props, "プロジェクト") as Task["project"],
      category: getSelect(props, "カテゴリ") as Task["category"],
      memo: getText(props, "メモ"),
      relatedEventIds: getRelation(props, "関連イベント"),
    };
  });
}

// Fetch all schedule events
export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  const response = await notion.databases.query({
    database_id: SCHEDULE_DB_ID,
    sorts: [{ property: "日付", direction: "ascending" }],
  });

  return response.results.map((page) => {
    const props = (page as { properties: PageProperties }).properties;
    return {
      id: page.id,
      name: getTitle(props),
      date: getDate(props, "日付"),
      time: getText(props, "時間"),
      location: getText(props, "場所"),
      project: getSelect(props, "プロジェクト") as ScheduleEvent["project"],
      memo: getText(props, "メモ"),
      relatedTaskIds: getRelation(props, "関連タスク"),
    };
  });
}

// Update task status
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  await notion.pages.update({
    page_id: taskId,
    properties: {
      ステータス: {
        select: { name: status },
      },
    },
  });
}
