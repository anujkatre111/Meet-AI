import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const meetings = await prisma.meeting.findMany({
    where: { hostId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } } },
  })

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          meet.ai
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">{session.user.email}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-xl font-semibold text-neutral-900">Your meetings</h1>
          <div className="flex gap-3">
            <Link
              href="/join"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Join meeting
            </Link>
            <Link
              href="/meetings/new"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              New meeting
            </Link>
          </div>
        </div>

        {meetings.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 py-16 text-center">
            <p className="text-neutral-500 mb-4">No meetings yet</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/join"
                className="rounded-md border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                Join a meeting
              </Link>
              <Link
                href="/meetings/new"
                className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
              >
                Start a meeting
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.map((m) => (
              <Link
                key={m.id}
                href={`/meet/${m.roomCode}/lobby`}
                className="block rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-neutral-900">{m.title}</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {m._count.participants} participants · {m.roomCode}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      m.status === "ACTIVE"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
