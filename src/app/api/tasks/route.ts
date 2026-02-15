import { NextResponse } from "next/server";
import {
  getTasks,
  updateTaskStatus,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/notion";
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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await createTask(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "タスクの作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    // Status-only update (existing behavior)
    if (body.taskId && body.status && !body.name) {
      await updateTaskStatus(body.taskId, body.status as TaskStatus);
      return NextResponse.json({ success: true });
    }

    // Full update
    const { taskId, ...data } = body;
    await updateTask(taskId, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { taskId } = await request.json();
    await deleteTask(taskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "タスクの削除に失敗しました" },
      { status: 500 }
    );
  }
}
