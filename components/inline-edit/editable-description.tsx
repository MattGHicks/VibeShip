"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableDescriptionProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export function EditableDescription({
  value,
  onSave,
  placeholder = "Add a description...",
  className,
}: EditableDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      adjustHeight();
    }
  }, [isEditing]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 24)}px`;
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("relative max-w-2xl", className)}>
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
          rows={1}
          className={cn(
            "w-full bg-transparent resize-none outline-none",
            "text-muted-foreground",
            "border-b-2 border-primary pb-1",
            "placeholder:text-muted-foreground/50"
          )}
          disabled={isSaving}
        />
        <div className="absolute right-0 top-0 flex items-center gap-1">
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "max-w-2xl cursor-pointer group/desc",
        "transition-colors duration-200",
        className
      )}
    >
      <span
        className={cn(
          "inline",
          value
            ? "text-muted-foreground group-hover/desc:text-foreground"
            : "text-muted-foreground/60 italic group-hover/desc:text-muted-foreground",
          "border-b border-transparent group-hover/desc:border-dashed group-hover/desc:border-muted-foreground/40"
        )}
      >
        {value || placeholder}
      </span>
      {showSaved && (
        <Check className="inline-block ml-2 h-3.5 w-3.5 text-emerald-500" />
      )}
    </div>
  );
}
