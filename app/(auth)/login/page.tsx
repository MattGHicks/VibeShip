"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const handleGitHubLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        scopes: "read:user user:email repo",
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-2xl">🚀</span>
          </div>
          <CardTitle className="text-2xl">Welcome to VibeShip</CardTitle>
          <CardDescription>
            Track your vibe coding projects, pick up where you left off, and share what you&apos;ve shipped.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGitHubLogin}
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            We&apos;ll use your GitHub account to sync your repositories and track activity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
