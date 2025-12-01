"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Bot,
  Clock,
  FileText,
  Sparkles,
  Wand2,
  ChevronDown,
  FolderOpen,
  GitBranch,
} from "lucide-react";
import { generateProjectApiKey, revokeProjectApiKey, getProjectActivity } from "@/lib/actions/api-keys";
import { generateAiContextPrompt, maskApiKey } from "@/lib/ai-prompt";
import type { Project, ApiActivityLog } from "@/types/database";
import { cn } from "@/lib/utils";

interface ProjectTag {
  tag_type: "model" | "framework" | "tool";
  tag_value: string;
}

interface ApiSettingsProps {
  project: Project;
  tags: ProjectTag[];
  apiKey: string | null;
}

export function ApiSettings({ project, tags, apiKey: initialKey }: ApiSettingsProps) {
  const [apiKey, setApiKey] = useState(initialKey);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<"key" | "prompt" | null>(null);
  const [activity, setActivity] = useState<ApiActivityLog[]>([]);
  const [showActivity, setShowActivity] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Use current origin - localhost when local, Vercel URL when deployed
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  // Check if project needs initial setup (no description or progress notes)
  const needsSetup = !project.description && !project.where_i_left_off;

  // Fetch activity when expanded
  useEffect(() => {
    if (showActivity && apiKey) {
      getProjectActivity(project.id, 5).then((result) => {
        if (result.activity) {
          setActivity(result.activity);
        }
      });
    }
  }, [showActivity, apiKey, project.id]);

  const handleGenerate = async () => {
    setIsLoading(true);
    const result = await generateProjectApiKey(project.id);
    if (result.apiKey) {
      setApiKey(result.apiKey);
    }
    setIsLoading(false);
  };

  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to revoke this API key? Any AI tools using it will lose access.")) {
      return;
    }
    setIsLoading(true);
    await revokeProjectApiKey(project.id);
    setApiKey(null);
    setActivity([]);
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string, type: "key" | "prompt") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyPrompt = () => {
    if (!apiKey) return;
    const prompt = generateAiContextPrompt({
      project,
      tags,
      apiKey,
      baseUrl,
    });
    copyToClipboard(prompt, "prompt");
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatAction = (action: string) => {
    if (action === "read") return "Read context";
    if (action.startsWith("update_")) {
      const fields = action.replace("update_", "").split("_");
      return `Updated ${fields.join(", ")}`;
    }
    return action;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">AI Integration</h4>
        </div>
        {needsSetup && apiKey && (
          <span className="flex items-center gap-1.5 text-xs text-amber bg-amber/10 px-2 py-1 rounded-full">
            <Sparkles className="h-3 w-3" />
            Setup available
          </span>
        )}
      </div>

      {apiKey ? (
        <div className="space-y-4">
          {/* API Key display */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">API Key</label>
            <div className="flex gap-2">
              <Input
                value={maskApiKey(apiKey)}
                readOnly
                className="font-mono text-xs bg-muted/50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(apiKey, "key")}
                className="shrink-0"
              >
                {copied === "key" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Copy AI prompt button - Primary action */}
          <Button
            onClick={copyPrompt}
            className={cn(
              "w-full",
              needsSetup && "bg-gradient-to-r from-amber to-primary hover:opacity-90"
            )}
            variant={copied === "prompt" ? "outline" : "default"}
          >
            {copied === "prompt" ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied AI Context Prompt!
              </>
            ) : needsSetup ? (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Copy Setup Prompt for AI
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Copy AI Context Prompt
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Paste into your AI tool. It will create a .vibe folder and sync your progress automatically.
          </p>

          {/* How It Works Section */}
          <div className="border border-border/30 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <span className="font-medium">How it works</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showHowItWorks && "rotate-180"
                )}
              />
            </button>

            {showHowItWorks && (
              <div className="px-3 pb-3 space-y-2 border-t border-border/30">
                <div className="flex items-start gap-2 pt-2">
                  <FolderOpen className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                  <div className="text-xs">
                    <span className="text-foreground font-medium">Creates .vibe/ folder</span>
                    <p className="text-muted-foreground">
                      Local context file in your project
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-3.5 w-3.5 mt-0.5 text-status-active shrink-0" />
                  <div className="text-xs">
                    <span className="text-foreground font-medium">Reads your progress</span>
                    <p className="text-muted-foreground">
                      Picks up where you left off
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-3.5 w-3.5 mt-0.5 text-status-paused shrink-0" />
                  <div className="text-xs">
                    <span className="text-foreground font-medium">Updates as you work</span>
                    <p className="text-muted-foreground">
                      Tracks progress and lessons learned
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <GitBranch className="h-3.5 w-3.5 mt-0.5 text-status-shipped shrink-0" />
                  <div className="text-xs">
                    <span className="text-foreground font-medium">Syncs on git push</span>
                    <p className="text-muted-foreground">
                      Keeps VibeShip and local in sync
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/30">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
              Regenerate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRevoke}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Revoke
            </Button>
          </div>

          {/* Activity section */}
          <div className="pt-2 border-t border-border/30">
            <button
              type="button"
              onClick={() => setShowActivity(!showActivity)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <Clock className="h-3 w-3" />
              <span>Recent Activity</span>
              <span className="ml-auto">{showActivity ? "−" : "+"}</span>
            </button>

            {showActivity && (
              <div className="mt-2 space-y-1.5">
                {activity.length > 0 ? (
                  activity.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <span className="text-muted-foreground">
                        {formatAction(log.action)}
                      </span>
                      <span className="text-muted-foreground/60">
                        {formatTimeAgo(log.created_at)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground/60 py-2">
                    No activity yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Generate an API key to connect your AI coding tools. They&apos;ll create a local .vibe/ folder to track your progress.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className={cn(
              "w-full",
              needsSetup && "bg-gradient-to-r from-amber to-primary hover:opacity-90"
            )}
          >
            {needsSetup ? (
              <>
                <Wand2 className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                {isLoading ? "Generating..." : "Generate API Key for AI Setup"}
              </>
            ) : (
              <>
                <Key className={cn("h-4 w-4 mr-2", isLoading && "animate-pulse")} />
                {isLoading ? "Generating..." : "Generate API Key"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
