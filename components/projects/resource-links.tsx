"use client";

import { useState, useEffect, useRef } from "react";
import { Link2, Plus, Trash2, ExternalLink, BookOpen } from "lucide-react";
import {
  getProjectLinks,
  addProjectLink,
  deleteProjectLink,
} from "@/lib/actions/project-links";
import type { ProjectLink } from "@/types/database";
import { cn } from "@/lib/utils";

interface ResourceLinksProps {
  projectId: string;
}

export function ResourceLinks({ projectId }: ResourceLinksProps) {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProjectLinks(projectId).then((data) => {
      setLinks(data);
      setIsLoading(false);
    });
  }, [projectId]);

  const handleAddLink = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    setIsAdding(true);
    const result = await addProjectLink(projectId, newTitle.trim(), newUrl.trim());
    if (result.link) {
      setLinks([...links, result.link]);
      setNewTitle("");
      setNewUrl("");
      setShowAddForm(false);
    }
    setIsAdding(false);
  };

  const handleDelete = async (linkId: string) => {
    // Optimistic update
    setLinks(links.filter((l) => l.id !== linkId));
    await deleteProjectLink(linkId, projectId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddLink();
    }
    if (e.key === "Escape") {
      setShowAddForm(false);
      setNewTitle("");
      setNewUrl("");
    }
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain;
    } catch {
      return url;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Links list */}
      {links.length > 0 && (
        <div className="space-y-1">
          {links.map((link) => (
            <div
              key={link.id}
              className="group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  {link.title}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
                <p className="text-xs text-muted-foreground truncate">
                  {getDomain(link.url)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {links.length === 0 && !showAddForm && (
        <div className="text-center py-4 text-muted-foreground/60">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No resources yet</p>
          <p className="text-xs mt-1">Add docs, design files, or reference links</p>
        </div>
      )}

      {/* Add form */}
      {showAddForm ? (
        <div className="space-y-2 p-3 rounded-lg border border-border/60 bg-muted/20">
          <input
            ref={titleInputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Link title..."
            className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
            disabled={isAdding}
          />
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://..."
            className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
            disabled={isAdding}
          />
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAddLink}
              disabled={isAdding || !newTitle.trim() || !newUrl.trim()}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Link
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewTitle("");
                setNewUrl("");
              }}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setShowAddForm(true);
            setTimeout(() => titleInputRef.current?.focus(), 0);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 rounded-lg hover:border-border transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add resource link
        </button>
      )}
    </div>
  );
}
