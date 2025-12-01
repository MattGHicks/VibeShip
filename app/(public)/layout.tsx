import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Github } from "lucide-react";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Logo mark */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm group-hover:bg-primary/30 transition-colors" />
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="relative w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 4L20 10V20L16 26L12 20V10L16 4Z"
                  className="fill-primary"
                />
                <path
                  d="M12 14L8 18V22L12 18V14Z"
                  className="fill-primary/60"
                />
                <path
                  d="M20 14L24 18V22L20 18V14Z"
                  className="fill-primary/60"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight">VibeShip</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/discover"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Discover
            </Link>
            {user ? (
              <Button asChild size="sm" className="h-9">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="h-9">
                <Link href="/login">
                  <Github className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo and tagline */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <Link href="/" className="flex items-center gap-2">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 4L20 10V20L16 26L12 20V10L16 4Z"
                    className="fill-primary"
                  />
                  <path
                    d="M12 14L8 18V22L12 18V14Z"
                    className="fill-primary/60"
                  />
                  <path
                    d="M20 14L24 18V22L20 18V14Z"
                    className="fill-primary/60"
                  />
                </svg>
                <span className="font-medium">VibeShip</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Built for vibe coders, by vibe coders.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/discover" className="hover:text-foreground transition-colors">
                Discover
              </Link>
              <a
                href="https://github.com/MattGHicks/VibeShip"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-border/30 text-center md:text-left">
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} VibeShip. Ship your vibes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
