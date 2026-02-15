import { NextResponse } from "next/server";
import {
  getScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
} from "@/lib/notion";

export async function GET() {
  try {
    const events = await getScheduleEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return NextResponse.json(
      { error: "スケジュールの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await createScheduleEvent(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "イベントの作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { eventId, ...data } = await request.json();
    await updateScheduleEvent(eventId, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "イベントの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { eventId } = await request.json();
    await deleteScheduleEvent(eventId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: "イベントの削除に失敗しました" },
      { status: 500 }
    );
  }
}
