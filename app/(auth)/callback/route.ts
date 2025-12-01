import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user profile exists, if not redirect to create one
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        // If no profile exists, create one
        if (!profile) {
          const metadata = user.user_metadata;
          const username = metadata.user_name || metadata.preferred_username || user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`;

          await supabase.from("users").insert({
            id: user.id,
            username: username,
            display_name: metadata.full_name || metadata.name || null,
            avatar_url: metadata.avatar_url || null,
            github_username: metadata.user_name || null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Auth error, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
