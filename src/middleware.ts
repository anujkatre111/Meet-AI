import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url))
  }

  const protectedPaths = ["/dashboard", "/meetings/new"]
  const isProtected = protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p))

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.url))
  }

  return undefined
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
