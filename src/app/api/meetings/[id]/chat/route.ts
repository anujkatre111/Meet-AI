import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
  senderName: z.string().min(1).max(100),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params
  const messages = await prisma.chatMessage.findMany({
    where: { meetingId },
    orderBy: { sentAt: "asc" },
  })
  return NextResponse.json(messages)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id: meetingId } = await params

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  })
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { message, senderName } = messageSchema.parse(body)

    const chatMessage = await prisma.chatMessage.create({
      data: {
        meetingId,
        senderId: session?.user?.id ?? null,
        senderName,
        message,
      },
    })

    return NextResponse.json(chatMessage)
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
