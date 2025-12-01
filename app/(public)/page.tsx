import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, ArrowRight, Sparkles, FolderGit2, Share2 } from "lucide-react";

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
              backgroundSize: '60px 60px'
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
            <span className="text-sm text-muted-foreground">For solo builders who ship fast</span>
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
            Never lose track of where you left off. Organize your AI-assisted builds,
            remember context, and showcase what you&apos;ve shipped.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up delay-300">
            <Button size="lg" className="h-12 px-8 text-base glow-amber-sm" asChild>
              <Link href="/login">
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base group" asChild>
              <Link href="/discover">
                Explore projects
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
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
                color: "bg-status-active",
                glow: "shadow-[0_0_30px_-5px] shadow-status-active/30",
                description: "In the zone"
              },
              {
                status: "Paused",
                color: "bg-status-paused",
                glow: "shadow-[0_0_30px_-5px] shadow-status-paused/30",
                description: "Taking a break"
              },
              {
                status: "Graveyard",
                color: "bg-status-graveyard",
                glow: "shadow-[0_0_30px_-5px] shadow-status-graveyard/20",
                description: "Lessons learned"
              },
              {
                status: "Shipped",
                color: "bg-status-shipped",
                glow: "shadow-[0_0_30px_-5px] shadow-status-shipped/30",
                description: "Out in the world"
              },
            ].map((item, i) => (
              <div
                key={item.status}
                className={`group relative p-6 rounded-2xl bg-card border border-border/50 text-center transition-all duration-300 hover:-translate-y-1 ${item.glow}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-4 transition-transform group-hover:scale-125`} />
                <p className="font-medium mb-1">{item.status}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  icon: Sparkles,
                  title: "Remember Context",
                  description: "Capture where you left off, what's next, and lessons learned. Never start from scratch again.",
                },
                {
                  icon: FolderGit2,
                  title: "GitHub Connected",
                  description: "Import repos directly. See activity at a glance. Know when projects go stale.",
                },
                {
                  icon: Share2,
                  title: "Share Your Work",
                  description: "Public profiles for shipped projects. Inspire others. Get discovered.",
                },
              ].map((feature, i) => (
                <div key={feature.title} className="group">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Quote Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-normal italic text-foreground/80 mb-6">
              &ldquo;The best ideas happen at 2am. VibeShip makes sure you remember them at 2pm.&rdquo;
            </blockquote>
            <p className="text-muted-foreground">
              Built for developers who move fast
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl mb-6">
            Ready to <span className="italic text-gradient">ship more vibes</span>?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Join solo builders who are shipping faster and staying organized.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg glow-amber" asChild>
            <Link href="/login">
              <Github className="mr-2 h-5 w-5" />
              Start building
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
