"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flame, Pause, Skull, Rocket, ChevronDown, Loader2 } from "lucide-react";
import { updateProjectStatus } from "@/lib/actions/projects";
import type { ProjectStatus } from "@/types/database";
import { cn } from "@/lib/utils";

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; color: string; bgLight: string }> = {
  active: { label: "Active", icon: Flame, color: "bg-status-active hover:bg-status-active/90 text-white", bgLight: "bg-status-active/10 text-status-active hover:bg-status-active/20 border-status-active/30" },
  paused: { label: "Paused", icon: Pause, color: "bg-status-paused hover:bg-status-paused/90 text-white", bgLight: "bg-status-paused/10 text-status-paused hover:bg-status-paused/20 border-status-paused/30" },
  graveyard: { label: "Graveyard", icon: Skull, color: "bg-status-graveyard hover:bg-status-graveyard/90 text-white", bgLight: "bg-status-graveyard/10 text-status-graveyard hover:bg-status-graveyard/20 border-status-graveyard/30" },
  shipped: { label: "Shipped", icon: Rocket, color: "bg-status-shipped hover:bg-status-shipped/90 text-white", bgLight: "bg-status-shipped/10 text-status-shipped hover:bg-status-shipped/20 border-status-shipped/30" },
};

interface StatusSwitcherProps {
  projectId: string;
  currentStatus: ProjectStatus;
  variant?: "dropdown" | "expanded";
  size?: "default" | "lg";
}

export function StatusSwitcher({ projectId, currentStatus, variant = "dropdown", size = "default" }: StatusSwitcherProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<ProjectStatus | null>(null);

  const config = statusConfig[status];
  const Icon = config.icon;

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (newStatus === status) return;

    setIsUpdating(true);
    setUpdatingStatus(newStatus);
    setStatus(newStatus);

    try {
      const result = await updateProjectStatus(projectId, newStatus);
      if (result?.error) {
        setStatus(currentStatus); // Revert on error
      }
    } catch {
      setStatus(currentStatus); // Revert on error
    } finally {
      setIsUpdating(false);
      setUpdatingStatus(null);
    }
  };

  // Expanded variant - shows all status buttons
  if (variant === "expanded") {
    return (
      <div className="flex flex-wrap gap-2">
        {(Object.keys(statusConfig) as ProjectStatus[]).map((s) => {
          const c = statusConfig[s];
          const I = c.icon;
          const isActive = s === status;
          const isLoading = updatingStatus === s;
          return (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={isUpdating}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
                size === "lg" ? "text-sm" : "text-xs",
                isActive ? c.color : c.bgLight,
                isUpdating && !isLoading && "opacity-50"
              )}
            >
              {isLoading ? (
                <Loader2 className={cn("animate-spin", size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")} />
              ) : (
                <I className={cn(size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")} />
              )}
              {c.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(config.color, size === "lg" && "h-11 px-5 text-base")}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className={cn("mr-2 animate-spin", size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
          ) : (
            <Icon className={cn("mr-2", size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
          )}
          {config.label}
          <ChevronDown className={cn("ml-2", size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(statusConfig) as ProjectStatus[]).map((s) => {
          const c = statusConfig[s];
          const I = c.icon;
          return (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusChange(s)}
              className={s === status ? "bg-accent" : ""}
            >
              <I className="mr-2 h-4 w-4" />
              {c.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
