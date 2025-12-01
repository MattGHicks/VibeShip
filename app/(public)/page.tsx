import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Flame, Pause, Skull, Rocket, ArrowRight, Zap, Brain, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            For Solo Vibe Coders
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Never Lose Track of Your
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Vibe Coding Projects
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track your AI-assisted projects, remember where you left off, and showcase what you&apos;ve shipped. Built for developers who move fast and build faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                <Github className="mr-2 h-5 w-5" />
                Get Started with GitHub
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/discover">
                Explore Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Status Cards Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { status: "Active", icon: Flame, color: "bg-status-active", emoji: "🔥" },
              { status: "Paused", icon: Pause, color: "bg-status-paused", emoji: "😴" },
              { status: "Graveyard", icon: Skull, color: "bg-status-graveyard", emoji: "⚰️" },
              { status: "Shipped", icon: Rocket, color: "bg-status-shipped", emoji: "🚀" },
            ].map((item) => (
              <Card key={item.status} className="text-center">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-2xl">{item.emoji}</span>
                  </div>
                  <p className="font-medium">{item.status}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for How You Actually Work
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Remember Context</h3>
                <p className="text-muted-foreground">
                  Never forget where you left off. Save your notes, todos, and next steps for each project.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">GitHub Sync</h3>
                <p className="text-muted-foreground">
                  Import repos directly from GitHub. Track commits and see when projects go stale.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Share Your Work</h3>
                <p className="text-muted-foreground">
                  Public profile to showcase shipped projects. Discover what other vibe coders are building.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Ship More Vibes?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join other solo developers who are building faster with AI tools and keeping track of it all.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              <Github className="mr-2 h-5 w-5" />
              Start Tracking Projects
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
