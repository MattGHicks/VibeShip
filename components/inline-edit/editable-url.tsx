"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X, ExternalLink, Link as LinkIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableUrlProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  displayTransform?: (url: string) => string;
  className?: string;
}

export function EditableUrl({
  value,
  onSave,
  placeholder = "Add URL...",
  label,
  icon,
  displayTransform,
  className,
}: EditableUrlProps) {
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
    if (!url) return true; // Empty is valid (clearing the field)
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
      setError("Please enter a valid URL");
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

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const displayValue = displayTransform ? displayTransform(value) : value;

  if (isEditing) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
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
              "flex-1 px-2 py-1 text-sm rounded",
              "bg-muted/50 border",
              error ? "border-destructive" : "border-primary/50",
              "outline-none focus:ring-2 focus:ring-primary/20",
              "transition-all duration-200"
            )}
            disabled={isSaving}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 rounded hover:bg-muted transition-colors text-primary disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <p className="text-xs text-destructive pl-6">{error}</p>
        )}
      </div>
    );
  }

  // View mode
  if (value) {
    return (
      <div className={cn("group/url flex items-center gap-2", className)}>
        {icon && <span className="text-muted-foreground flex-shrink-0">{icon}</span>}
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-sm truncate hover:text-primary transition-colors"
        >
          {displayValue}
        </a>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsEditing(true);
          }}
          className="opacity-0 group-hover/url:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {showSaved && (
          <span className="text-xs text-emerald-500 animate-in fade-in duration-300">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    );
  }

  // Empty state
  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        "hover:text-foreground transition-colors",
        "group/url",
        className
      )}
    >
      {icon || <LinkIcon className="h-4 w-4" />}
      <span className="group-hover/url:underline">{label || placeholder}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover/url:opacity-100 transition-opacity" />
    </button>
  );
}
