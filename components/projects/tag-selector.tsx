"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Plus, Sparkles, Code, Wrench, ChevronDown } from "lucide-react";
import { getTagsCatalog, addTagToCatalog, type TagType } from "@/lib/actions/tags";
import type { TagCatalog } from "@/types/database";

interface SelectedTag {
  tag_type: TagType;
  tag_value: string;
}

interface TagSelectorProps {
  selectedTags: SelectedTag[];
  onChange: (tags: SelectedTag[]) => void;
}

const tagTypeConfig: Record<TagType, { label: string; icon: React.ElementType; color: string }> = {
  model: { label: "AI Models", icon: Sparkles, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  framework: { label: "Frameworks", icon: Code, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  tool: { label: "Tools", icon: Wrench, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [catalog, setCatalog] = useState<TagCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState<TagType>("tool");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [openPopover, setOpenPopover] = useState<TagType | null>(null);

  const loadCatalog = useCallback(async () => {
    const result = await getTagsCatalog();
    if (result.data) {
      setCatalog(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleAddTag = (type: TagType, value: string) => {
    if (selectedTags.some((t) => t.tag_type === type && t.tag_value === value)) {
      return;
    }
    onChange([...selectedTags, { tag_type: type, tag_value: value }]);
    setOpenPopover(null);
  };

  const handleRemoveTag = (type: TagType, value: string) => {
    onChange(selectedTags.filter((t) => !(t.tag_type === type && t.tag_value === value)));
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;

    setIsAddingNew(true);
    const result = await addTagToCatalog(newTagName.trim(), newTagType);
    if (result.data) {
      await loadCatalog();
      handleAddTag(newTagType, newTagName.trim());
    }
    setNewTagName("");
    setIsAddingNew(false);
  };

  const getTagsForType = (type: TagType) => {
    return catalog.filter((tag) => tag.type === type);
  };

  const getSelectedTagsForType = (type: TagType) => {
    return selectedTags.filter((tag) => tag.tag_type === type);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Tech Stack</Label>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
          {selectedTags.map((tag) => {
            const config = tagTypeConfig[tag.tag_type];
            return (
              <Badge
                key={`${tag.tag_type}-${tag.tag_value}`}
                variant="outline"
                className={`${config.color} pr-1`}
              >
                {tag.tag_value}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.tag_type, tag.tag_value)}
                  className="ml-1 rounded-full p-0.5 hover:bg-white/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Tag Type Selectors */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(tagTypeConfig) as TagType[]).map((type) => {
          const config = tagTypeConfig[type];
          const Icon = config.icon;
          const typeTags = getTagsForType(type);
          const selectedCount = getSelectedTagsForType(type).length;

          return (
            <Popover
              key={type}
              open={openPopover === type}
              onOpenChange={(open) => setOpenPopover(open ? type : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto py-2 px-3 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {selectedCount}
                      </Badge>
                    )}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                    {config.label}
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {typeTags.map((tag) => {
                      const isSelected = selectedTags.some(
                        (t) => t.tag_type === type && t.tag_value === tag.name
                      );
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() =>
                            isSelected
                              ? handleRemoveTag(type, tag.name)
                              : handleAddTag(type, tag.name)
                          }
                          className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                            isSelected
                              ? "bg-primary/20 text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* Add Custom Tag */}
      <div className="flex gap-2">
        <Input
          placeholder="Add custom tag..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddNewTag();
            }
          }}
          className="flex-1"
        />
        <select
          value={newTagType}
          onChange={(e) => setNewTagType(e.target.value as TagType)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="model">Model</option>
          <option value="framework">Framework</option>
          <option value="tool">Tool</option>
        </select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddNewTag}
          disabled={!newTagName.trim() || isAddingNew}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Display-only component for showing tags on cards
interface TagDisplayProps {
  tags: SelectedTag[];
  size?: "sm" | "default";
}

export function TagDisplay({ tags, size = "default" }: TagDisplayProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const config = tagTypeConfig[tag.tag_type];
        return (
          <Badge
            key={`${tag.tag_type}-${tag.tag_value}`}
            variant="outline"
            className={`${config.color} ${size === "sm" ? "text-xs px-1.5 py-0" : ""}`}
          >
            {tag.tag_value}
          </Badge>
        );
      })}
    </div>
  );
}
