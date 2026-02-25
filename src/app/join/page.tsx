"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function JoinPage() {
  const router = useRouter()
  const [input, setInput] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    let code = trimmed
    if (trimmed.includes("/meet/")) {
      const match = trimmed.match(/\/meet\/([a-z0-9-]+)/i)
      code = match?.[1] ?? trimmed
    }
    code = code.replace(/\s/g, "")
    router.push(`/meet/${code}/lobby`)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-lg font-semibold text-neutral-900 mb-8">
        meet.ai
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-neutral-900 mb-1">Join a meeting</h1>
        <p className="text-neutral-500 text-sm mb-6">
          Enter the meeting link or room code
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. abc-xyz-123"
            className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-black py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  )
}
