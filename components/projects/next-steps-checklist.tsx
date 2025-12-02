"use client";

import { useState, useEffect, useRef } from "react";
import { CheckSquare, Square, Plus, Trash2, ListTodo } from "lucide-react";
import {
  getProjectChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "@/lib/actions/checklist";
import type { ProjectChecklist } from "@/types/database";
import { cn } from "@/lib/utils";

interface NextStepsChecklistProps {
  projectId: string;
}

export function NextStepsChecklist({ projectId }: NextStepsChecklistProps) {
  const [items, setItems] = useState<ProjectChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemContent, setNewItemContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProjectChecklist(projectId).then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, [projectId]);

  const handleAddItem = async () => {
    if (!newItemContent.trim()) return;

    setIsAdding(true);
    const result = await addChecklistItem(projectId, newItemContent.trim());
    if (result.item) {
      setItems([...items, result.item]);
      setNewItemContent("");
      inputRef.current?.focus();
    }
    setIsAdding(false);
  };

  const handleToggleComplete = async (item: ProjectChecklist) => {
    const newCompleted = !item.is_completed;
    // Optimistic update
    setItems(
      items.map((i) =>
        i.id === item.id ? { ...i, is_completed: newCompleted } : i
      )
    );
    await updateChecklistItem(item.id, projectId, { is_completed: newCompleted });
  };

  const handleDelete = async (itemId: string) => {
    // Optimistic update
    setItems(items.filter((i) => i.id !== itemId));
    await deleteChecklistItem(itemId, projectId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddItem();
    }
  };

  const incompleteItems = items.filter((i) => !i.is_completed);
  const completedItems = items.filter((i) => i.is_completed);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Add new item */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newItemContent}
          onChange={(e) => setNewItemContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a next step..."
          className="flex-1 bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
          disabled={isAdding}
        />
        <button
          onClick={handleAddItem}
          disabled={isAdding || !newItemContent.trim()}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Incomplete items */}
      {incompleteItems.length > 0 && (
        <div className="space-y-1">
          {incompleteItems.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-4 text-muted-foreground/60">
          <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No next steps yet</p>
          <p className="text-xs mt-1">Add tasks to track your progress</p>
        </div>
      )}

      {/* Completed items */}
      {completedItems.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">
            Completed ({completedItems.length})
          </p>
          <div className="space-y-1">
            {completedItems.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={handleToggleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ChecklistItemProps {
  item: ProjectChecklist;
  onToggle: (item: ProjectChecklist) => void;
  onDelete: (id: string) => void;
}

function ChecklistItem({ item, onToggle, onDelete }: ChecklistItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 py-2 px-3 rounded-lg transition-colors",
        "hover:bg-muted/50",
        item.is_completed && "opacity-60"
      )}
    >
      <button
        onClick={() => onToggle(item)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        {item.is_completed ? (
          <CheckSquare className="h-4 w-4 text-status-shipped" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          item.is_completed && "line-through text-muted-foreground"
        )}
      >
        {item.content}
      </span>
      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 p-1 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
