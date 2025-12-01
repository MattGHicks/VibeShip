"use client";

import { useState, useRef, useEffect } from "react";
import { Github, Globe, ExternalLink, Pencil, Check, X, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableLinksProps {
  githubUrl: string;
  liveUrl: string;
  onSaveGithub: (value: string) => Promise<void>;
  onSaveLive: (value: string) => Promise<void>;
  className?: string;
}

interface LinkFieldProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  displayTransform?: (url: string) => string;
}

function LinkField({ value, onSave, icon, label, placeholder, displayTransform }: LinkFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    setError(null);

    if (trimmedValue && !validateUrl(trimmedValue)) {
      setError("Invalid URL");
      return;
    }

    if (trimmedValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmedValue);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
      setIsEditing(false);
    } catch {
      setEditValue(value);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await onSave("");
      setEditValue("");
      setIsEditing(false);
    } catch {
      // Keep value on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setError(null);
      setIsEditing(false);
    }
  };

  const displayValue = displayTransform && value ? displayTransform(value) : value;

  // Edit mode
  if (isEditing) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex-shrink-0">{icon}</span>
          <input
            ref={inputRef}
            type="url"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent text-sm outline-none",
              "border-b pb-0.5",
              error ? "border-destructive" : "border-primary",
              "placeholder:text-muted-foreground/50"
            )}
            disabled={isSaving}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 rounded hover:bg-muted text-primary transition-colors"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditValue(value);
              setError(null);
              setIsEditing(false);
            }}
            disabled={isSaving}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive ml-6">{error}</p>}
      </div>
    );
  }

  // Has value - show link
  if (value) {
    return (
      <div className="group/link flex items-center gap-2">
        <span className="text-muted-foreground flex-shrink-0">{icon}</span>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-sm truncate hover:text-primary transition-colors"
        >
          {displayValue}
        </a>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
        <div className="flex items-center gap-0.5 opacity-0 group-hover/link:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {showSaved && <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
      </div>
    );
  }

  // Empty - show add button
  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors group/add w-full"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <Plus className="h-3.5 w-3.5 opacity-0 group-hover/add:opacity-100 transition-opacity" />
    </button>
  );
}

export function EditableLinks({
  githubUrl,
  liveUrl,
  onSaveGithub,
  onSaveLive,
  className,
}: EditableLinksProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <LinkField
        value={githubUrl}
        onSave={onSaveGithub}
        icon={<Github className="h-4 w-4" />}
        label="Add GitHub repository"
        placeholder="https://github.com/user/repo"
        displayTransform={(url) => url.replace("https://github.com/", "")}
      />
      <LinkField
        value={liveUrl}
        onSave={onSaveLive}
        icon={<Globe className="h-4 w-4" />}
        label="Add live site URL"
        placeholder="https://example.com"
        displayTransform={(url) => url.replace(/https?:\/\//, "")}
      />
    </div>
  );
}
