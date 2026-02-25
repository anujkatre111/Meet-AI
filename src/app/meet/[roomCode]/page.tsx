"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react"
import "@livekit/components-styles"

function MeetingRoomContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const roomCode = params.roomCode as string
  const displayName = searchParams.get("name")
  const participantId = searchParams.get("participantId")

  useEffect(() => {
    if (!displayName) {
      router.replace(`/meet/${roomCode}/lobby`)
    }
  }, [displayName, roomCode, router])
  const [credentials, setCredentials] = useState<{
    serverUrl: string
    token: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_name: roomCode,
            participant_identity: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            participant_name: displayName || "Guest",
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Failed to get token")
        setCredentials({
          serverUrl: data.server_url,
          token: data.participant_token,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to connect")
      }
    }
    getToken()
  }, [roomCode, displayName])

  if (!displayName) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Redirecting to lobby…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-neutral-500">
          Make sure LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET are set in .env.local
        </p>
        <Link href="/" className="text-neutral-900 font-medium hover:underline">
          Go home
        </Link>
      </div>
    )
  }

  if (!credentials) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Connecting…</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-neutral-100" data-lk-theme="default">
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.serverUrl}
        connect={true}
        audio={true}
        video={true}
        onDisconnected={() => {
          if (participantId) {
            fetch("/api/meetings/leave", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomCode, participantId }),
            }).catch(() => {})
          }
          window.location.href = session ? "/dashboard" : "/"
        }}
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-white">
            <Link href="/" className="text-lg font-semibold text-neutral-900">
              meet.ai
            </Link>
            <span className="text-sm text-neutral-500">Room: {roomCode}</span>
          </header>
          <main className="flex-1 min-h-0">
            <VideoConference />
          </main>
          <RoomAudioRenderer />
        </div>
      </LiveKitRoom>
    </div>
  )
}

export default function MeetingRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading…</div>
      </div>
    }>
      <MeetingRoomContent />
    </Suspense>
  )
}
