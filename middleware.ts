import { NextResponse } from "next/server"
import { shouldGate } from "@/utils/organizations"
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  /^(\/(sign-in|sign-up|authorization-playground)\/*).*$/,
])

const isApiRoute = createRouteMatcher(["/(api|trpc)(.*)"])

export default clerkMiddleware((auth, request) => {
  if (isPublicRoute(request)) {
    return
  }

  const { userId, orgId } = auth().protect()

  if (shouldGate && request.nextUrl.pathname === "/") {
    const orgSelection = new URL("/discover", request.url)
    return NextResponse.redirect(orgSelection)
  }

  if (
    shouldGate &&
    userId &&
    !orgId &&
    isApiRoute(request) &&
    request.nextUrl.pathname !== "/discover"
  ) {
    const orgSelection = new URL("/discover", request.url)
    return NextResponse.redirect(orgSelection)
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
