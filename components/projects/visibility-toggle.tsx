"use client";

import { useState } from "react";
import { Globe, Lock } from "lucide-react";
import { toggleProjectVisibility } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

interface VisibilityToggleProps {
  projectId: string;
  isPublic: boolean;
  className?: string;
}

export function VisibilityToggle({ projectId, isPublic, className }: VisibilityToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentVisibility, setCurrentVisibility] = useState(isPublic);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsUpdating(true);
    const newVisibility = !currentVisibility;
    setCurrentVisibility(newVisibility);

    const result = await toggleProjectVisibility(projectId, newVisibility);

    if (result.error) {
      setCurrentVisibility(!newVisibility);
    }

    setIsUpdating(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors",
        currentVisibility
          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        isUpdating && "opacity-50 cursor-not-allowed",
        className
      )}
      title={currentVisibility ? "Visible on Discover - Click to hide" : "Hidden from Discover - Click to show"}
    >
      {currentVisibility ? (
        <>
          <Globe className="h-3 w-3" />
          <span>Public</span>
        </>
      ) : (
        <>
          <Lock className="h-3 w-3" />
          <span>Private</span>
        </>
      )}
    </button>
  );
}
