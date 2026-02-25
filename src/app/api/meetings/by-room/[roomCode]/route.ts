import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params
  const meeting = await prisma.meeting.findUnique({
    where: { roomCode },
    include: {
      host: { select: { name: true } },
      _count: { select: { participants: true } },
    },
  })
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
  }
  return NextResponse.json(meeting)
}
