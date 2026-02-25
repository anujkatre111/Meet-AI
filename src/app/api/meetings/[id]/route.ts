import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      host: { select: { name: true, email: true } },
      _count: { select: { participants: true } },
    },
  })
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
  }
  return NextResponse.json(meeting)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const meeting = await prisma.meeting.findUnique({
    where: { id },
  })
  if (!meeting || meeting.hostId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { title, agenda, scheduledAt, isRecorded } = body

  const updated = await prisma.meeting.update({
    where: { id },
    data: {
      ...(title != null && { title }),
      ...(agenda != null && { agenda }),
      ...(scheduledAt != null && { scheduledAt: new Date(scheduledAt) }),
      ...(isRecorded != null && { isRecorded }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const meeting = await prisma.meeting.findUnique({
    where: { id },
  })
  if (!meeting || meeting.hostId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.meeting.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
