import { NextResponse } from "next/server";
import { getTasks, updateTaskStatus } from "@/lib/notion";
import { TaskStatus } from "@/types";

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "タスクの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { taskId, status } = (await request.json()) as {
      taskId: string;
      status: TaskStatus;
    };
    await updateTaskStatus(taskId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}
