import Link from "next/link"
import { auth } from "@/auth"

export default async function HomePage() {
  const session = await auth()

  const emojis: { char: string; top: string; left?: string; right?: string; delay: string }[] = [
    { char: "😊", top: "10%", left: "6%", delay: "0s" },
    { char: "🤗", top: "15%", right: "8%", delay: "0.5s" },
    { char: "😄", top: "42%", left: "4%", delay: "1s" },
    { char: "😌", top: "48%", right: "5%", delay: "0.3s" },
    { char: "🙂", top: "72%", left: "10%", delay: "0.8s" },
    { char: "👋", top: "78%", right: "6%", delay: "0.2s" },
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {emojis.map((e, i) => (
        <span
          key={i}
          className="absolute text-5xl sm:text-6xl md:text-7xl opacity-70 pointer-events-none"
          style={{
            top: e.top,
            left: e.left,
            right: e.right,
            animation: "float 4s ease-in-out infinite",
            animationDelay: e.delay,
          }}
        >
          {e.char}
        </span>
      ))}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 relative z-10">
        <Link
          href={session ? "/dashboard" : "/"}
          className="text-lg font-semibold text-neutral-900"
        >
          meet.ai
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/meetings/new"
              className="text-sm font-medium text-white bg-black px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
            >
              New meeting
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-white bg-black px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
            AI-powered meeting summaries, instantly
          </h1>
          <p className="mt-4 text-neutral-600">
            Join video meetings in your browser. Get structured summaries with key points and action items.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={session ? "/meetings/new" : "/login"}
            className="rounded-md bg-black px-8 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Start a meeting
          </Link>
          <Link
            href="/join"
            className="rounded-md border border-neutral-300 px-8 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            Join a meeting
          </Link>
        </div>
        </div>
      </main>
    </div>
  )
}
