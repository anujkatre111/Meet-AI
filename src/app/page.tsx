import Link from "next/link"
import { auth, signOut } from "@/auth"

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          Meet
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/meetings/new"
                className="text-sm font-medium text-white bg-black px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
              >
                New meeting
              </Link>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
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

      <main className="max-w-2xl mx-auto px-6 pt-20 pb-24 text-center">
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
      </main>
    </div>
  )
}
