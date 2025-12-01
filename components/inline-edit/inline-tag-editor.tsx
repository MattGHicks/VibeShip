"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Plus, Sparkles, Code, Wrench, Check, Loader2, Search } from "lucide-react";
import { getTagsCatalog, addTagToCatalog, updateProjectTags, type TagType } from "@/lib/actions/tags";
import type { TagCatalog } from "@/types/database";
import { cn } from "@/lib/utils";

interface SelectedTag {
  tag_type: TagType;
  tag_value: string;
}

interface InlineTagEditorProps {
  projectId: string;
  initialTags: SelectedTag[];
  className?: string;
}

const tagTypeConfig: Record<TagType, { label: string; icon: React.ElementType; color: string; hoverColor: string }> = {
  model: { label: "AI Models", icon: Sparkles, color: "bg-amber-500/20 text-amber-400 border-amber-500/30", hoverColor: "hover:bg-amber-500/30" },
  framework: { label: "Frameworks", icon: Code, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", hoverColor: "hover:bg-blue-500/30" },
  tool: { label: "Tools", icon: Wrench, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", hoverColor: "hover:bg-emerald-500/30" },
};

export function InlineTagEditor({ projectId, initialTags, className }: InlineTagEditorProps) {
  const [tags, setTags] = useState<SelectedTag[]>(initialTags);
  const [catalog, setCatalog] = useState<TagCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TagType>("model");

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const loadCatalog = useCallback(async () => {
    if (catalog.length > 0) return;
    setIsLoading(true);
    const result = await getTagsCatalog();
    if (result.data) {
      setCatalog(result.data);
    }
    setIsLoading(false);
  }, [catalog.length]);

  useEffect(() => {
    if (isOpen) {
      loadCatalog();
    }
  }, [isOpen, loadCatalog]);

  const saveTags = async (newTags: SelectedTag[]) => {
    setIsSaving(true);
    try {
      await updateProjectTags(projectId, newTags);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save tags:", error);
      setTags(initialTags);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (type: TagType, value: string) => {
    if (tags.some((t) => t.tag_type === type && t.tag_value === value)) {
      return;
    }
    const newTags = [...tags, { tag_type: type, tag_value: value }];
    setTags(newTags);
    saveTags(newTags);
  };

  const handleRemoveTag = (type: TagType, value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newTags = tags.filter((t) => !(t.tag_type === type && t.tag_value === value));
    setTags(newTags);
    saveTags(newTags);
  };

  const handleAddNewTag = async () => {
    if (!searchQuery.trim()) return;

    const result = await addTagToCatalog(searchQuery.trim(), activeTab);
    if (result.data) {
      setCatalog([]);
      await loadCatalog();
      handleAddTag(activeTab, searchQuery.trim());
    }
    setSearchQuery("");
  };

  const getFilteredTags = (type: TagType) => {
    return catalog
      .filter((tag) => tag.type === type)
      .filter((tag) =>
        searchQuery ? tag.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );
  };

  const isTagSelected = (type: TagType, value: string) => {
    return tags.some((t) => t.tag_type === type && t.tag_value === value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Tags display with inline remove */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => {
          const config = tagTypeConfig[tag.tag_type];
          return (
            <Badge
              key={`${tag.tag_type}-${tag.tag_value}`}
              variant="outline"
              className={cn(config.color, "pr-1 group/tag")}
            >
              {tag.tag_value}
              <button
                type="button"
                onClick={(e) => handleRemoveTag(tag.tag_type, tag.tag_value, e)}
                className="ml-1 rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-white/20 transition-all"
                disabled={isSaving}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}

        {/* Add tag button */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                "text-muted-foreground hover:text-foreground",
                "border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60",
                "transition-colors"
              )}
            >
              <Plus className="h-3 w-3" />
              Add tag
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            {/* Search input */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or add new..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 rounded-md outline-none focus:ring-1 focus:ring-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      handleAddNewTag();
                    }
                  }}
                />
              </div>
            </div>

            {/* Tab selector */}
            <div className="flex border-b">
              {(Object.keys(tagTypeConfig) as TagType[]).map((type) => {
                const config = tagTypeConfig[type];
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveTab(type)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                      activeTab === type
                        ? "text-foreground border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{config.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tag list */}
            <div className="max-h-48 overflow-y-auto p-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {getFilteredTags(activeTab).map((tag) => {
                    const selected = isTagSelected(activeTab, tag.name);
                    const config = tagTypeConfig[activeTab];
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          selected
                            ? handleRemoveTag(activeTab, tag.name)
                            : handleAddTag(activeTab, tag.name)
                        }
                        disabled={isSaving}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center justify-between",
                          selected ? `${config.color}` : "hover:bg-muted"
                        )}
                      >
                        <span>{tag.name}</span>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}

                  {/* Add new option */}
                  {searchQuery.trim() && !getFilteredTags(activeTab).some(
                    (t) => t.name.toLowerCase() === searchQuery.toLowerCase()
                  ) && (
                    <button
                      type="button"
                      onClick={handleAddNewTag}
                      className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted flex items-center gap-2 text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add "{searchQuery}"
                    </button>
                  )}

                  {getFilteredTags(activeTab).length === 0 && !searchQuery && (
                    <p className="px-2 py-3 text-sm text-muted-foreground text-center">
                      No {tagTypeConfig[activeTab].label.toLowerCase()} yet
                    </p>
                  )}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Saving indicator */}
        {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {showSaved && <Check className="h-3.5 w-3.5 text-emerald-500" />}
      </div>
    </div>
  );
}
