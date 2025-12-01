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

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; color: string }> = {
  active: { label: "Active", icon: Flame, color: "bg-status-active hover:bg-status-active/90 text-white" },
  paused: { label: "Paused", icon: Pause, color: "bg-status-paused hover:bg-status-paused/90 text-white" },
  graveyard: { label: "Graveyard", icon: Skull, color: "bg-status-graveyard hover:bg-status-graveyard/90 text-white" },
  shipped: { label: "Shipped", icon: Rocket, color: "bg-status-shipped hover:bg-status-shipped/90 text-white" },
};

interface StatusSwitcherProps {
  projectId: string;
  currentStatus: ProjectStatus;
}

export function StatusSwitcher({ projectId, currentStatus }: StatusSwitcherProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const config = statusConfig[status];
  const Icon = config.icon;

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (newStatus === status) return;

    setIsUpdating(true);
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
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={config.color} disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icon className="mr-2 h-4 w-4" />
          )}
          {config.label}
          <ChevronDown className="ml-2 h-4 w-4" />
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
