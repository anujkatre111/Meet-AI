"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.roomCode as string
  const [meeting, setMeeting] = useState<{
    id: string
    title: string
    roomCode: string
    host?: { name: string | null }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState("")
  const [joining, setJoining] = useState(false)
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[]
    mics: MediaDeviceInfo[]
    speakers: MediaDeviceInfo[]
  }>({ cameras: [], mics: [], speakers: [] })
  const [selectedCamera, setSelectedCamera] = useState("")
  const [selectedMic, setSelectedMic] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState("")
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/meetings/by-room/${roomCode}`)
        if (!res.ok) throw new Error("Meeting not found")
        const data = await res.json()
        setMeeting(data)
      } catch {
        setMeeting(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [roomCode])

  useEffect(() => {
    async function getDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream

        const all = await navigator.mediaDevices.enumerateDevices()
        const cameras = all.filter((d) => d.kind === "videoinput")
        const mics = all.filter((d) => d.kind === "audioinput")
        const speakers = all.filter((d) => d.kind === "audiooutput")

        setDevices({ cameras, mics, speakers })
        if (cameras[0]) setSelectedCamera(cameras[0].deviceId)
        if (mics[0]) setSelectedMic(mics[0].deviceId)
        if (speakers[0]) setSelectedSpeaker(speakers[0].deviceId)
      } catch (err) {
        console.error("Device access error:", err)
      }
    }
    getDevices()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!streamRef.current) return
    const videoTrack = streamRef.current.getVideoTracks()[0]
    const audioTrack = streamRef.current.getAudioTracks()[0]
    if (videoTrack) videoTrack.enabled = videoEnabled
    if (audioTrack) audioTrack.enabled = audioEnabled
  }, [videoEnabled, audioEnabled])

  async function handleJoin() {
    const name = displayName.trim() || "Guest"
    if (!meeting) return
    setJoining(true)
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      })
      const participant = await res.json()
      if (!res.ok) throw new Error(participant.error)
      const params = new URLSearchParams({
        name,
        participantId: participant.id,
        camera: selectedCamera,
        mic: selectedMic,
        speaker: selectedSpeaker,
        video: String(videoEnabled),
        audio: String(audioEnabled),
      })
      router.push(`/meet/${roomCode}?${params}`)
    } catch (err) {
      console.error(err)
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading…</div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">Meeting not found</p>
        <Link href="/" className="text-neutral-900 font-medium hover:underline">
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          meet.ai
        </Link>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-1">{meeting.title}</h1>
        <p className="text-neutral-500 text-sm mb-8">
          Room: {meeting.roomCode}
          {meeting.host?.name && ` · Host: ${meeting.host.name}`}
        </p>

        <div className="rounded-xl border border-neutral-200 overflow-hidden mb-8 shadow-sm">
          <div className="aspect-video bg-neutral-100 flex flex-col items-center justify-center relative">
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
              {displayName.trim() || "Guest"}
            </span>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!videoEnabled ? "hidden" : ""}`}
            />
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-neutral-300 flex items-center justify-center text-xl font-medium text-neutral-600">
                  {(displayName.trim() || "Guest").slice(0, 2).toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              <button
                type="button"
                onClick={() => setVideoEnabled((v) => !v)}
                className={`p-3 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  videoEnabled
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-white/90 text-red-500 hover:bg-white"
                }`}
                title={videoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {videoEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => setAudioEnabled((a) => !a)}
                className={`p-3 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  audioEnabled
                    ? "bg-sky-500 text-white hover:bg-sky-600"
                    : "bg-white/90 text-red-500 hover:bg-white"
                }`}
                title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {audioEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          {devices.cameras.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Camera
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              >
                {devices.cameras.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${devices.cameras.indexOf(d) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {devices.mics.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Microphone
              </label>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              >
                {devices.mics.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Mic ${devices.mics.indexOf(d) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full rounded-md bg-black py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {joining ? "Joining…" : "Join meeting"}
        </button>
      </main>
    </div>
  )
}
