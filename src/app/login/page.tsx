import { Suspense } from "react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  const googleEnabled = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  )

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading…</div>
      </div>
    }>
      <LoginForm googleEnabled={googleEnabled} />
    </Suspense>
  )
}
