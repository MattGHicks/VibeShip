"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Compass, EyeOff } from "lucide-react";
import { toggleProjectVisibility } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

interface DiscoverableToggleProps {
  projectId: string;
  isPublic: boolean;
  showLabel?: boolean;
  className?: string;
}

export function DiscoverableToggle({
  projectId,
  isPublic,
  showLabel = true,
  className,
}: DiscoverableToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(isPublic);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCheckedChange = async (checked: boolean) => {
    setIsUpdating(true);
    setIsDiscoverable(checked);

    const result = await toggleProjectVisibility(projectId, checked);

    if (result.error) {
      setIsDiscoverable(!checked);
    }

    setIsUpdating(false);
  };

  return (
    <div
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 transition-colors",
        isDiscoverable
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-border bg-muted/50",
        isUpdating && "opacity-50",
        className
      )}
    >
      <Switch
        checked={isDiscoverable}
        onCheckedChange={handleCheckedChange}
        disabled={isUpdating}
        aria-label="Toggle discoverability"
        className="data-[state=checked]:bg-emerald-500"
      />
      {showLabel && (
        <label className={cn(
          "flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none transition-colors",
          isDiscoverable ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        )}>
          {isDiscoverable ? (
            <Compass className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
          <span>{isDiscoverable ? "Discoverable" : "Hidden"}</span>
        </label>
      )}
    </div>
  );
}
