import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (svg, png, jpg, jpeg, gif, webp, md, txt)
     * - callback (auth callback route - needs to process PKCE without interference)
     */
    "/((?!_next/static|_next/image|favicon.ico|callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|md|txt)$).*)",
  ],
};
