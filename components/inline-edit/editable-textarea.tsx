"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Pencil, Check, Loader2, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditableTextareaProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  label?: string;
  description?: string;
  className?: string;
  minRows?: number;
  maxRows?: number;
  emptyStateMessage?: string;
}

export function EditableTextarea({
  value,
  onSave,
  placeholder = "Click to add content...",
  label,
  description,
  className,
  minRows = 3,
  maxRows = 10,
  emptyStateMessage,
}: EditableTextareaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if content needs truncation (more than 5 lines or 250 chars)
  const needsTruncation = useMemo(() => {
    if (!value) return false;
    const lineCount = value.split("\n").length;
    return lineCount > 5 || value.length > 250;
  }, [value]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      // Auto-resize
      adjustHeight();
    }
  }, [isEditing]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const lineHeight = 24; // Approximate line height
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();

    if (trimmedValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmedValue);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch {
      setEditValue(value);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
    // Cmd/Ctrl + Enter to save
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">{label}</h3>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </button>
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            adjustHeight();
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2 rounded-lg",
            "bg-muted/50 border border-primary/50",
            "text-sm leading-relaxed",
            "outline-none focus:ring-2 focus:ring-primary/20",
            "resize-none transition-all duration-200",
            "placeholder:text-muted-foreground/50"
          )}
          style={{ minHeight: `${minRows * 24}px` }}
          disabled={isSaving}
        />
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">Cmd+Enter</kbd> to save, <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">Esc</kbd> to cancel
        </p>
      </div>
    );
  }

  // View mode
  const hasContent = value && value.trim().length > 0;

  return (
    <div className={cn("group/textarea", className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2">
              {label}
              {showSaved && (
                <span className="text-xs text-emerald-500 animate-in fade-in duration-300 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Saved
                </span>
              )}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover/textarea:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>
      )}

      {hasContent ? (
        <div className="flex flex-col h-full">
          <div
            onClick={() => setIsEditing(true)}
            className={cn(
              "px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 flex-1",
              "bg-muted/20 hover:bg-muted/40",
              "border border-transparent hover:border-dashed hover:border-muted-foreground/30"
            )}
          >
            <p
              className={cn(
                "text-sm whitespace-pre-wrap leading-relaxed text-foreground/90",
                needsTruncation && "line-clamp-5"
              )}
            >
              {value}
            </p>
          </div>
          {needsTruncation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Expand className="h-3 w-3" />
              Read more
            </button>
          )}

          {/* Full content modal */}
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-base font-medium">
                  {label || "Details"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {value}
                </p>
              </div>
              <div className="pt-4 border-t border-border/30 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={cn(
            "px-3 py-3 rounded-lg cursor-pointer transition-all duration-200",
            "bg-muted/20 hover:bg-muted/40",
            "border border-dashed border-muted-foreground/20 hover:border-muted-foreground/40",
            "flex items-center gap-2"
          )}
        >
          <Pencil className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          <p className="text-sm text-muted-foreground/70">
            {emptyStateMessage || placeholder}
          </p>
        </div>
      )}
    </div>
  );
}
