import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const leaveSchema = z.object({
  roomCode: z.string().min(1),
  participantId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { roomCode, participantId } = leaveSchema.parse(body)

    const meeting = await prisma.meeting.findUnique({
      where: { roomCode },
      include: { participants: true },
    })
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    const participant = await prisma.participant.findFirst({
      where: { id: participantId, meetingId: meeting.id },
    })
    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }

    await prisma.participant.update({
      where: { id: participantId },
      data: { leftAt: new Date() },
    })

    const isHost = participant.role === "HOST" || participant.userId === meeting.hostId
    if (isHost) {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          status: "ENDED",
          endedAt: new Date(),
          duration: meeting.startedAt
            ? Math.floor((Date.now() - meeting.startedAt.getTime()) / 1000)
            : null,
        },
      })
    }

    return NextResponse.json({ success: true })
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
