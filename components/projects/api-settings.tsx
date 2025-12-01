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

  // Use current origin - localhost when local, Vercel URL when deployed
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

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
    <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">AI Integration</h4>
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
            className="w-full"
            variant={copied === "prompt" ? "outline" : "default"}
          >
            {copied === "prompt" ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied AI Context Prompt!
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Copy AI Context Prompt
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Paste this prompt into Claude Code, Cursor, or any AI IDE
          </p>

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
            Generate an API key to let AI tools read and update this project.
          </p>
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            <Key className={cn("h-4 w-4 mr-2", isLoading && "animate-pulse")} />
            {isLoading ? "Generating..." : "Generate API Key"}
          </Button>
        </div>
      )}
    </div>
  );
}
