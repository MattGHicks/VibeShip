"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Webhook, Copy, Check, ExternalLink, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toggleGitHubWebhook, getWebhookUrl } from "@/lib/actions/webhooks";

interface WebhookToggleProps {
  projectId: string;
  githubRepoUrl: string | null;
  webhookEnabled: boolean;
}

export function WebhookToggle({
  projectId,
  githubRepoUrl,
  webhookEnabled: initialEnabled,
}: WebhookToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    getWebhookUrl().then(setWebhookUrl);
  }, []);

  const handleToggle = async (newEnabled: boolean) => {
    setEnabled(newEnabled);
    setIsToggling(true);

    try {
      const result = await toggleGitHubWebhook(projectId, newEnabled);
      if (result.error) {
        setEnabled(!newEnabled); // Revert on error
        console.error("Failed to toggle webhook:", result.error);
      }
    } catch {
      setEnabled(!newEnabled);
    } finally {
      setIsToggling(false);
    }
  };

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  // Extract repo path from URL for settings link
  const repoPath = githubRepoUrl?.replace("https://github.com/", "");
  const webhookSettingsUrl = repoPath
    ? `https://github.com/${repoPath}/settings/hooks/new`
    : null;

  if (!githubRepoUrl) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Toggle Row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Webhook className="h-3.5 w-3.5" />
          Real-time updates
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={isToggling}
        />
      </div>

      {/* Expandable Setup Instructions */}
      {isOpen && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          {enabled ? (
            <div className="rounded-lg bg-muted/50 border border-border/30 p-3 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground/90 mb-1">Setup Required</p>
                  <p>To receive real-time updates, add a webhook in your GitHub repository settings:</p>
                </div>
              </div>

              {/* Webhook URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Payload URL</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background px-2 py-1.5 rounded border border-border/50 truncate">
                    {webhookUrl}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={copyWebhookUrl}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Instructions */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Content type:</strong> application/json</p>
                <p><strong>Events:</strong> Pushes, Releases, Stars, Forks</p>
              </div>

              {/* Link to GitHub Settings */}
              {webhookSettingsUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                >
                  <a href={webhookSettingsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1.5" />
                    Open GitHub Webhook Settings
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enable to receive instant notifications when code is pushed, releases are published, or your repo gets stars.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
