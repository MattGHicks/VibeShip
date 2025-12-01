"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  required?: boolean;
  maxLength?: number;
}

export function EditableText({
  value,
  onSave,
  placeholder = "Click to edit...",
  className,
  inputClassName,
  as: Component = "span",
  required = false,
  maxLength,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
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

  const handleSave = async () => {
    const trimmedValue = editValue.trim();

    if (required && !trimmedValue) {
      setEditValue(value);
      setIsEditing(false);
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
    } catch {
      setEditValue(value);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
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

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-2 w-full">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={cn(
            "flex-1 bg-transparent border-b-2 border-primary outline-none",
            "text-inherit font-inherit",
            "transition-colors duration-200",
            inputClassName
          )}
          disabled={isSaving}
        />
        <button
          type="button"
          onClick={handleSave}
          className="p-1 rounded hover:bg-muted transition-colors text-primary"
          disabled={isSaving}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
          disabled={isSaving}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group/edit inline-flex items-center gap-2">
      <Component
        onClick={() => setIsEditing(true)}
        className={cn(
          "cursor-pointer transition-all duration-200",
          "hover:text-primary",
          "border-b border-transparent hover:border-dashed hover:border-muted-foreground/50",
          !value && "text-muted-foreground italic",
          className
        )}
      >
        {value || placeholder}
      </Component>
      <Pencil
        className={cn(
          "h-3.5 w-3.5 text-muted-foreground/50",
          "opacity-0 group-hover/edit:opacity-100 transition-opacity duration-200",
          "cursor-pointer hover:text-primary"
        )}
        onClick={() => setIsEditing(true)}
      />
      {showSaved && (
        <span className="text-xs text-emerald-500 animate-in fade-in duration-300">
          <Check className="h-3.5 w-3.5 inline" />
        </span>
      )}
    </div>
  );
}
