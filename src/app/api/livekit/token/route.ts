import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const url = process.env.LIVEKIT_URL
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!url || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "LiveKit is not configured" },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const {
      room_name,
      participant_identity,
      participant_name,
    } = body as {
      room_name?: string
      participant_identity?: string
      participant_name?: string
    }

    const roomName = room_name ?? "meet-room"
    const identity = participant_identity ?? `user-${Date.now()}`
    const name = participant_name ?? "Participant"

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name,
      ttl: "2h",
    })
    at.addGrant({ roomJoin: true, room: roomName })

    const token = await at.toJwt()

    return NextResponse.json({
      server_url: url,
      participant_token: token,
    })
  } catch (error) {
    console.error("LiveKit token error:", error)
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    )
  }
}
