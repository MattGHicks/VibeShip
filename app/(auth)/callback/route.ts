import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_param = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  // Log incoming request details
  console.log("[Auth Callback] Request received:", {
    origin,
    hasCode: !!code,
    error_param,
    error_description,
    redirectTo,
  });

  // If OAuth provider returned an error
  if (error_param) {
    console.error("[Auth Callback] OAuth error:", error_param, error_description);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_param)}&message=${encodeURIComponent(error_description || "")}`
    );
  }

  if (code) {
    const supabase = await createClient();

    console.log("[Auth Callback] Attempting code exchange with code:", code.substring(0, 8) + "...");

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("[Auth Callback] Code exchange result:", {
      hasSession: !!sessionData?.session,
      hasUser: !!sessionData?.user,
      error: error ? { message: error.message, status: error.status, name: error.name } : null,
    });

    if (error) {
      console.error("[Auth Callback] Exchange error details:", JSON.stringify(error, null, 2));
      return NextResponse.redirect(
        `${origin}/login?error=exchange_failed&message=${encodeURIComponent(error.message || "Unknown exchange error")}`
      );
    }

    if (!error && sessionData.session) {
      const { user } = sessionData.session;
      const providerToken = sessionData.session.provider_token;

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        const metadata = user.user_metadata;
        const username = metadata.user_name || metadata.preferred_username || user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`;

        if (!profile) {
          // Create new profile with GitHub token
          await supabase.from("users").insert({
            id: user.id,
            username: username,
            display_name: metadata.full_name || metadata.name || null,
            avatar_url: metadata.avatar_url || null,
            github_username: metadata.user_name || null,
            github_access_token: providerToken || null,
          });
        } else {
          // Update existing profile with latest GitHub token
          await supabase
            .from("users")
            .update({
              github_access_token: providerToken || null,
              github_username: metadata.user_name || null,
              avatar_url: metadata.avatar_url || null,
            })
            .eq("id", user.id);
        }
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Auth error, redirect to login with error
  console.error("[Auth Callback] No code provided or exchange failed");
  return NextResponse.redirect(`${origin}/login?error=auth_error&message=no_code_or_exchange_failed`);
}
