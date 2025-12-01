import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Loader2 } from "lucide-react";
import { RepoList } from "./repo-list";

export default async function ImportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check if user has GitHub connected
  const { data: userData } = await supabase
    .from("users")
    .select("github_access_token, github_username")
    .eq("id", user.id)
    .single();

  const hasGitHub = !!userData?.github_access_token;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import from GitHub</h1>
        <p className="text-muted-foreground">
          Quickly import your existing repositories as projects
        </p>
      </div>

      {!hasGitHub ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Github className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">GitHub Not Connected</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Your GitHub account is not connected or the connection has expired.
              Please sign out and sign back in with GitHub to reconnect.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Your Repositories
              </CardTitle>
              <CardDescription>
                {userData.github_username && (
                  <span>Connected as <strong>@{userData.github_username}</strong> - </span>
                )}
                Select repositories to import as projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <RepoList />
              </Suspense>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
