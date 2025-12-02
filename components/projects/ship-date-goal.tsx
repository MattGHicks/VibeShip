"use client";

import { useState } from "react";
import { Calendar, Target, Rocket, X, Edit2 } from "lucide-react";
import { updateProject } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

interface ShipDateGoalProps {
  projectId: string;
  targetDate: string | null;
  status: string;
}

export function ShipDateGoal({ projectId, targetDate: initialDate, status }: ShipDateGoalProps) {
  const [targetDate, setTargetDate] = useState(initialDate);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialDate || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const getDaysUntilShip = () => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCountdownDisplay = () => {
    const days = getDaysUntilShip();
    if (days === null) return null;
    if (status === "shipped") return { text: "Shipped!", color: "text-status-shipped", bg: "bg-status-shipped/10" };
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: "text-red-500", bg: "bg-red-500/10" };
    if (days === 0) return { text: "Ship day!", color: "text-status-active", bg: "bg-status-active/10" };
    if (days === 1) return { text: "1 day left", color: "text-status-active", bg: "bg-status-active/10" };
    if (days <= 7) return { text: `${days} days left`, color: "text-amber-500", bg: "bg-amber-500/10" };
    return { text: `${days} days left`, color: "text-status-shipped", bg: "bg-status-shipped/10" };
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const newDate = inputValue || null;
      await updateProject(projectId, { target_ship_date: newDate });
      setTargetDate(newDate);
      setIsEditing(false);
    } catch {
      setInputValue(targetDate || "");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClear = async () => {
    setIsUpdating(true);
    try {
      await updateProject(projectId, { target_ship_date: null });
      setTargetDate(null);
      setInputValue("");
      setIsEditing(false);
    } catch {
      // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const countdown = getCountdownDisplay();

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground" />
        <input
          type="date"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-transparent border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          disabled={isUpdating}
        />
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setInputValue(targetDate || "");
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (!targetDate) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      >
        <Target className="h-4 w-4" />
        <span className="group-hover:underline">Set ship date goal</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Target className="h-4 w-4" />
        <span>
          {new Date(targetDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      {countdown && (
        <span className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
          countdown.color,
          countdown.bg
        )}>
          {status === "shipped" ? (
            <Rocket className="h-3.5 w-3.5" />
          ) : (
            <Calendar className="h-3.5 w-3.5" />
          )}
          {countdown.text}
        </span>
      )}
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
      >
        <Edit2 className="h-3 w-3" />
      </button>
      <button
        onClick={handleClear}
        disabled={isUpdating}
        className="p-1 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
