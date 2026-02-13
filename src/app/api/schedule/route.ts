import { NextResponse } from "next/server";
import { getScheduleEvents } from "@/lib/notion";

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
