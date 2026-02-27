import { NextResponse } from "next/server";
import { getPageContent } from "@/lib/notion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await getPageContent(id);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Failed to fetch task content:", error);
    return NextResponse.json(
      { error: "テンプレートの取得に失敗しました" },
      { status: 500 }
    );
  }
}
