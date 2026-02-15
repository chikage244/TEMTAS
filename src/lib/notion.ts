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

// Create a new task
export async function createTask(data: {
  name: string;
  assignee: string;
  dueDate: string | null;
  status: string;
  project: string;
  category: string;
  memo: string;
}): Promise<void> {
  await notion.pages.create({
    parent: { database_id: TASK_DB_ID },
    properties: {
      タスク名: { title: [{ text: { content: data.name } }] },
      担当者: { select: { name: data.assignee } },
      ...(data.dueDate ? { 期限: { date: { start: data.dueDate } } } : {}),
      ステータス: { select: { name: data.status } },
      ...(data.project ? { プロジェクト: { select: { name: data.project } } } : {}),
      ...(data.category ? { カテゴリ: { select: { name: data.category } } } : {}),
      ...(data.memo ? { メモ: { rich_text: [{ text: { content: data.memo } }] } } : {}),
    },
  });
}

// Update a task
export async function updateTask(
  taskId: string,
  data: {
    name: string;
    assignee: string;
    dueDate: string | null;
    status: string;
    project: string;
    category: string;
    memo: string;
  }
): Promise<void> {
  await notion.pages.update({
    page_id: taskId,
    properties: {
      タスク名: { title: [{ text: { content: data.name } }] },
      担当者: { select: { name: data.assignee } },
      期限: data.dueDate ? { date: { start: data.dueDate } } : { date: null },
      ステータス: { select: { name: data.status } },
      ...(data.project ? { プロジェクト: { select: { name: data.project } } } : {}),
      ...(data.category ? { カテゴリ: { select: { name: data.category } } } : {}),
      メモ: data.memo
        ? { rich_text: [{ text: { content: data.memo } }] }
        : { rich_text: [] },
    },
  });
}

// Delete (archive) a task
export async function deleteTask(taskId: string): Promise<void> {
  await notion.pages.update({
    page_id: taskId,
    archived: true,
  });
}

// Create a new schedule event
export async function createScheduleEvent(data: {
  name: string;
  date: string | null;
  time: string;
  location: string;
  project: string;
  memo: string;
}): Promise<void> {
  await notion.pages.create({
    parent: { database_id: SCHEDULE_DB_ID },
    properties: {
      イベント名: { title: [{ text: { content: data.name } }] },
      ...(data.date ? { 日付: { date: { start: data.date } } } : {}),
      ...(data.time ? { 時間: { rich_text: [{ text: { content: data.time } }] } } : {}),
      ...(data.location ? { 場所: { rich_text: [{ text: { content: data.location } }] } } : {}),
      ...(data.project ? { プロジェクト: { select: { name: data.project } } } : {}),
      ...(data.memo ? { メモ: { rich_text: [{ text: { content: data.memo } }] } } : {}),
    },
  });
}

// Update a schedule event
export async function updateScheduleEvent(
  eventId: string,
  data: {
    name: string;
    date: string | null;
    time: string;
    location: string;
    project: string;
    memo: string;
  }
): Promise<void> {
  await notion.pages.update({
    page_id: eventId,
    properties: {
      イベント名: { title: [{ text: { content: data.name } }] },
      日付: data.date ? { date: { start: data.date } } : { date: null },
      時間: data.time
        ? { rich_text: [{ text: { content: data.time } }] }
        : { rich_text: [] },
      場所: data.location
        ? { rich_text: [{ text: { content: data.location } }] }
        : { rich_text: [] },
      ...(data.project ? { プロジェクト: { select: { name: data.project } } } : {}),
      メモ: data.memo
        ? { rich_text: [{ text: { content: data.memo } }] }
        : { rich_text: [] },
    },
  });
}

// Delete (archive) a schedule event
export async function deleteScheduleEvent(eventId: string): Promise<void> {
  await notion.pages.update({
    page_id: eventId,
    archived: true,
  });
}
