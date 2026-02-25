import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const joinSchema = z.object({
  displayName: z.string().min(1).max(100),
  role: z.enum(["HOST", "PARTICIPANT", "GUEST"]).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params
  const session = await auth()

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  })
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { displayName, role } = joinSchema.parse(body)

    const isHost = session?.user?.id === meeting.hostId
    const participantRole = role ?? (isHost ? "HOST" : "GUEST")

    const participant = await prisma.participant.create({
      data: {
        meetingId,
        userId: session?.user?.id ?? null,
        displayName,
        role: participantRole,
      },
    })

    if (meeting.status === "SCHEDULED") {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          status: "ACTIVE",
          startedAt: new Date(),
        },
      })
    }

    return NextResponse.json(participant)
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params
  const participants = await prisma.participant.findMany({
    where: { meetingId },
    orderBy: { joinedAt: "asc" },
  })
  return NextResponse.json(participants)
}
