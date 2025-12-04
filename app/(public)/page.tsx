import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Github,
  ArrowRight,
  Sparkles,
  FolderGit2,
  Share2,
  Bot,
  Activity,
  GitCommit,
  FileText,
  Zap,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  Pause,
  Skull,
  Rocket,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 md:py-32">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-status-shipped/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-status-paused/5 rounded-full blur-[80px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                               linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm mb-8 opacity-0 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm text-muted-foreground">
              For solo builders who ship fast
            </span>
          </div>

          {/* Main headline - Instrument Serif */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight mb-6 opacity-0 animate-fade-in-up delay-100">
            Track your
            <br />
            <span className="text-gradient italic">vibe coding</span>
            <br />
            projects
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up delay-200">
            Never lose track of where you left off. Organize your AI-assisted
            builds, remember context, and showcase what you&apos;ve shipped.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up delay-300">
            <Button size="lg" className="h-12 px-8 text-base glow-amber-sm" asChild>
              <Link href="/login">
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base group"
              asChild
            >
              <Link href="/discover">
                Explore projects
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            {/* Mock dashboard card */}
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur overflow-hidden shadow-2xl shadow-black/20">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-status-graveyard/40" />
                  <div className="w-3 h-3 rounded-full bg-status-active/40" />
                  <div className="w-3 h-3 rounded-full bg-status-shipped/40" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">
                    vibe-ship.vercel.app/dashboard
                  </span>
                </div>
              </div>

              {/* Mock content */}
              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Project cards */}
                  {[
                    {
                      name: "AI Recipe App",
                      status: "active",
                      statusIcon: Flame,
                      statusColor: "text-status-active",
                      activity: "2 hours ago",
                      note: "Working on ingredient parsing...",
                    },
                    {
                      name: "Portfolio v3",
                      status: "shipped",
                      statusIcon: Rocket,
                      statusColor: "text-status-shipped",
                      activity: "Shipped!",
                      note: "Live at mysite.com",
                    },
                    {
                      name: "CLI Tool",
                      status: "paused",
                      statusIcon: Pause,
                      statusColor: "text-status-paused",
                      activity: "5 days ago",
                      note: "Need to refactor auth flow",
                    },
                  ].map((project, i) => (
                    <div
                      key={project.name}
                      className="p-4 rounded-xl bg-background/50 border border-border/30 hover:border-border/60 transition-colors"
                      style={{ animationDelay: `${400 + i * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-sm">{project.name}</h4>
                        <project.statusIcon
                          className={`w-4 h-4 ${project.statusColor}`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {project.note}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                        <Clock className="w-3 h-3" />
                        {project.activity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Preview Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">
              Four states. <span className="italic text-muted-foreground">Infinite vibes.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every project has a journey. Track yours from spark to ship.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              {
                status: "Active",
                icon: Flame,
                color: "bg-status-active",
                textColor: "text-status-active",
                glow: "shadow-[0_0_30px_-5px] shadow-status-active/30",
                description: "In the zone",
              },
              {
                status: "Paused",
                icon: Pause,
                color: "bg-status-paused",
                textColor: "text-status-paused",
                glow: "shadow-[0_0_30px_-5px] shadow-status-paused/30",
                description: "Taking a break",
              },
              {
                status: "Graveyard",
                icon: Skull,
                color: "bg-status-graveyard",
                textColor: "text-status-graveyard",
                glow: "shadow-[0_0_30px_-5px] shadow-status-graveyard/20",
                description: "Lessons learned",
              },
              {
                status: "Shipped",
                icon: Rocket,
                color: "bg-status-shipped",
                textColor: "text-status-shipped",
                glow: "shadow-[0_0_30px_-5px] shadow-status-shipped/30",
                description: "Out in the world",
              },
            ].map((item, i) => (
              <div
                key={item.status}
                className={`group relative p-6 rounded-2xl bg-card border border-border/50 text-center transition-all duration-300 hover:-translate-y-1 ${item.glow}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <item.icon
                  className={`w-6 h-6 mx-auto mb-3 ${item.textColor} transition-transform group-hover:scale-110`}
                />
                <p className="font-medium mb-1">{item.status}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Integration Section - Key Differentiator */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[120px] -translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    AI-Powered
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
                  Your AI assistant
                  <br />
                  <span className="italic text-gradient">never forgets</span>
                </h2>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Connect Claude, Cursor, or any AI tool directly to your
                  VibeShip projects. Your assistant can read context, update
                  notes, and track progress automatically.
                </p>

                <ul className="space-y-4">
                  {[
                    "Sync project context across AI sessions",
                    "Auto-update \"where I left off\" notes",
                    "Track which AI tools you're using",
                    "Never re-explain your codebase again",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-status-shipped mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code preview */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-status-shipped/10 to-status-paused/10 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden">
                  {/* File tab */}
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/30">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">
                      .vibe/vibeship.md
                    </span>
                  </div>

                  {/* Code content */}
                  <div className="p-4 font-mono text-sm">
                    <pre className="text-muted-foreground leading-relaxed">
                      <code>
                        <span className="text-primary"># AI Recipe App</span>
                        {"\n\n"}
                        <span className="text-status-active">Status:</span>{" "}
                        Active
                        {"\n"}
                        <span className="text-status-shipped">Last sync:</span>{" "}
                        2 minutes ago
                        {"\n\n"}
                        <span className="text-foreground/80">
                          ## Where I Left Off
                        </span>
                        {"\n"}
                        Working on ingredient parsing.
                        {"\n"}
                        The regex for quantities is
                        {"\n"}
                        almost there...
                        {"\n\n"}
                        <span className="text-foreground/80">## Next Steps</span>
                        {"\n"}
                        <span className="text-muted-foreground/60">- [ ]</span>{" "}
                        Fix edge cases for fractions
                        {"\n"}
                        <span className="text-status-shipped">- [x]</span> Add
                        unit conversion
                        {"\n"}
                        <span className="text-muted-foreground/60">- [ ]</span>{" "}
                        Write tests
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">
              Everything you need to{" "}
              <span className="italic text-gradient">ship faster</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built by solo devs, for solo devs. Every feature designed to help
              you stay in flow.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "Remember Context",
                  description:
                    "Capture where you left off, what's next, and lessons learned. Never start from scratch again.",
                  accent: "from-primary/20 to-primary/5",
                },
                {
                  icon: FolderGit2,
                  title: "GitHub Connected",
                  description:
                    "Import repos directly. Track commits, stars, and activity. Know when projects go stale.",
                  accent: "from-status-shipped/20 to-status-shipped/5",
                },
                {
                  icon: Share2,
                  title: "Public Profiles",
                  description:
                    "Share your shipped projects. Build your portfolio. Get discovered by the community.",
                  accent: "from-status-paused/20 to-status-paused/5",
                },
                {
                  icon: Activity,
                  title: "Activity Timeline",
                  description:
                    "See project activity at a glance. Track days since last update. Stay accountable.",
                  accent: "from-status-active/20 to-status-active/5",
                },
                {
                  icon: GitCommit,
                  title: "Webhook Events",
                  description:
                    "Real-time updates from GitHub. Push, release, and star events tracked automatically.",
                  accent: "from-primary/20 to-status-shipped/5",
                },
                {
                  icon: FileText,
                  title: "Markdown Notes",
                  description:
                    "Rich notes with full markdown support. Todo lists, code blocks, and more.",
                  accent: "from-status-paused/20 to-primary/5",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl bg-card border border-border/50 transition-all duration-300 hover:border-border hover:-translate-y-1"
                >
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />

                  <div className="relative">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">
              Get started in{" "}
              <span className="italic text-muted-foreground">minutes</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From sign-up to shipping, we keep it simple.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-status-shipped/50 to-status-active/50 hidden md:block" />

              {/* Steps */}
              <div className="space-y-12 md:space-y-0">
                {[
                  {
                    step: "01",
                    title: "Connect GitHub",
                    description:
                      "Sign in with GitHub and import your repos in one click. We'll pull in stars, activity, and more.",
                    icon: Github,
                  },
                  {
                    step: "02",
                    title: "Track Progress",
                    description:
                      "Set status, add notes, and capture where you left off. Your future self will thank you.",
                    icon: CheckCircle2,
                  },
                  {
                    step: "03",
                    title: "Connect Your AI",
                    description:
                      "Drop the bootstrap prompt into Claude or Cursor. Your AI now has persistent project memory.",
                    icon: Bot,
                  },
                  {
                    step: "04",
                    title: "Ship & Share",
                    description:
                      "Mark projects as shipped and share your public profile. Celebrate your wins.",
                    icon: Rocket,
                  },
                ].map((item, i) => (
                  <div
                    key={item.step}
                    className={`relative md:grid md:grid-cols-2 md:gap-12 items-center ${
                      i % 2 === 1 ? "md:direction-rtl" : ""
                    }`}
                  >
                    {/* Content */}
                    <div
                      className={`${i % 2 === 1 ? "md:col-start-2 md:text-left" : "md:text-right"} mb-6 md:mb-0`}
                    >
                      <span className="text-sm font-mono text-primary mb-2 block">
                        {item.step}
                      </span>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>

                    {/* Icon */}
                    <div
                      className={`${i % 2 === 1 ? "md:col-start-1 md:row-start-1 md:justify-end" : "md:justify-start"} flex md:justify-center`}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                        <div className="relative w-12 h-12 rounded-2xl bg-card border border-border/50 flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Quote Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative">
              {/* Quote marks */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-8xl text-primary/10 font-serif">
                &ldquo;
              </div>
              <blockquote className="text-2xl md:text-3xl font-normal italic text-foreground/80 mb-6 relative z-10">
                The best ideas happen at 2am. VibeShip makes sure you remember
                them at 2pm.
              </blockquote>
            </div>
            <p className="text-muted-foreground">
              Built for developers who move fast
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "Free", label: "Forever" },
                { value: "∞", label: "Projects" },
                { value: "100%", label: "Open Source" },
                { value: "< 1min", label: "To Start" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-semibold text-gradient mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6">
            Ready to <span className="italic text-gradient">ship more vibes</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join solo builders who are shipping faster and staying organized.
            It&apos;s free, forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-10 text-lg glow-amber" asChild>
              <Link href="/login">
                <Github className="mr-2 h-5 w-5" />
                Start building
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 text-lg group"
              asChild
            >
              <Link href="/discover">
                See what others built
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
