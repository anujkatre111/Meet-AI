import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { generateRoomCode } from "@/lib/utils"
import { z } from "zod"

const createMeetingSchema = z.object({
  title: z.string().min(1).max(200),
  agenda: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const meetings = await prisma.meeting.findMany({
    where: { hostId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { participants: true } },
    },
  })

  return NextResponse.json(meetings)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, agenda, scheduledAt } = createMeetingSchema.parse(body)

    let roomCode = generateRoomCode()
    while (await prisma.meeting.findUnique({ where: { roomCode } })) {
      roomCode = generateRoomCode()
    }

    const meeting = await prisma.meeting.create({
      data: {
        hostId: session.user.id,
        title,
        agenda: agenda ?? null,
        roomCode,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: "SCHEDULED",
      },
    })

    return NextResponse.json(meeting)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
