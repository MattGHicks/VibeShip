import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Github,
  ArrowRight,
  Sparkles,
  FolderOpen,
  Zap,
  FileCode2,
  GitBranch,
  Download,
  Key,
  Copy,
  RefreshCw,
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="flex flex-col max-w-4xl mx-auto py-8 px-4">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            The optimal workflow
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-4">
          Ship More, <span className="italic text-gradient">Forget Less</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          How VibeShip becomes your AI coding companion. Set up once, stay in
          sync forever.
        </p>
      </section>

      {/* Getting Started Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Existing Project Path */}
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-status-active/10">
                <Github className="h-5 w-5 text-status-active" />
              </div>
              <h3 className="text-lg font-medium">Existing Project</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Most Common
              </span>
            </div>

            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span>
                  Already have a project on GitHub? Perfect.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span>
                  <Link href="/import" className="text-primary hover:underline">
                    Import from GitHub
                  </Link>{" "}
                  with one click
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span>Generate an API key on the project page</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  4
                </span>
                <span>Open your local project folder in your AI IDE</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  5
                </span>
                <span>
                  <strong className="text-foreground">
                    Paste the AI Context Prompt
                  </strong>{" "}
                  — AI creates the .vibe/ folder
                </span>
              </li>
            </ol>

            <Button className="mt-6 w-full" asChild>
              <Link href="/import">
                <Download className="mr-2 h-4 w-4" />
                Import from GitHub
              </Link>
            </Button>
          </div>

          {/* New Project Path */}
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-status-shipped/10">
                <Zap className="h-5 w-5 text-status-shipped" />
              </div>
              <h3 className="text-lg font-medium">New Project</h3>
            </div>

            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span>Start building with your AI tool (Claude Code, Cursor, etc.)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span>Push to GitHub when you have something working</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span>
                  <Link href="/import" className="text-primary hover:underline">
                    Import into VibeShip
                  </Link>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  4
                </span>
                <span>Generate API key and copy the AI Context Prompt</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  5
                </span>
                <span>
                  <strong className="text-foreground">Paste prompt</strong> — AI
                  sets up .vibe/ and syncs context
                </span>
              </li>
            </ol>

            <Button variant="outline" className="mt-6 w-full" asChild>
              <Link href="/projects/new">
                <Sparkles className="mr-2 h-4 w-4" />
                Create New Project
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What is .vibe Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">
          What is the .vibe/ folder?
        </h2>
        <p className="text-muted-foreground mb-6">
          Your project&apos;s memory — a local folder that keeps your AI tools in
          sync with VibeShip.
        </p>

        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm">.vibe/</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <FileCode2 className="h-4 w-4 text-status-shipped" />
                <span className="font-mono text-sm">vibeship.md</span>
                <span className="text-xs px-2 py-0.5 rounded bg-status-shipped/10 text-status-shipped">
                  Commit this
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Human-readable project context. Status, progress notes, tech
                stack. Travels with your code.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-status-active" />
                <span className="font-mono text-sm">.secrets</span>
                <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                  Gitignored
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                API credentials. Auto-added to .gitignore. Never committed.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/30 font-mono text-sm">
            <div className="text-muted-foreground mb-2">
              # Example .vibe/vibeship.md
            </div>
            <div className="text-foreground">
              <div>## Project: MyAwesomeApp</div>
              <div className="text-status-active">**Status:** active</div>
              <div className="mt-2">## Where I Left Off</div>
              <div className="text-muted-foreground">
                Implemented auth flow. Next: password reset...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Daily Flow Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-2">The Daily Flow</h2>
        <p className="text-muted-foreground mb-6">
          How your AI uses .vibe/ during coding sessions.
        </p>

        <div className="space-y-4">
          {[
            {
              icon: FolderOpen,
              title: "Session Start",
              description:
                "AI reads .vibe/vibeship.md to understand where you left off. Works instantly, even offline.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: RefreshCw,
              title: "During Development",
              description:
                "After completing features or fixing bugs, AI offers to update your progress notes.",
              color: "text-status-active",
              bg: "bg-status-active/10",
            },
            {
              icon: GitBranch,
              title: "After Git Push",
              description:
                '"Pushed to GitHub! Want me to update VibeShip?" — keeps everything in sync.',
              color: "text-status-paused",
              bg: "bg-status-paused/10",
            },
            {
              icon: Copy,
              title: "Session End",
              description:
                "AI saves your progress so the next session (or next AI) picks up seamlessly.",
              color: "text-status-shipped",
              bg: "bg-status-shipped/10",
            },
          ].map((step, i) => (
            <div
              key={step.title}
              className="flex gap-4 p-4 rounded-xl bg-card border border-border/50"
            >
              <div className={`p-2 rounded-lg ${step.bg} h-fit`}>
                <step.icon className={`h-5 w-5 ${step.color}`} />
              </div>
              <div>
                <h3 className="font-medium mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/5 to-status-shipped/5 border border-border/50">
        <h2 className="text-2xl font-semibold mb-2">Ready to start?</h2>
        <p className="text-muted-foreground mb-6">
          Import an existing project or create something new.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/import">
              <Github className="mr-2 h-5 w-5" />
              Import from GitHub
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/projects/new">
              <Sparkles className="mr-2 h-4 w-4" />
              Create New Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
