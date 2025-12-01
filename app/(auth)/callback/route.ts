import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

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
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
