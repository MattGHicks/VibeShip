"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MarkdownDisplay } from "./markdown-display";
import { Eye, Edit3, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  className?: string;
  disabled?: boolean;
}

const MARKDOWN_HELP = `
**Markdown Tips:**
- **Bold**: \`**text**\`
- *Italic*: \`*text*\`
- Lists: \`- item\` or \`1. item\`
- Tasks: \`- [ ] todo\` or \`- [x] done\`
- Links: \`[text](url)\`
- Code: \`\`code\`\`
- Headings: \`# H1\`, \`## H2\`, \`### H3\`
`;

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your notes here...",
  minRows = 4,
  maxRows = 12,
  className,
  disabled = false,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || isPreview) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    const lineHeight = 24; // Approximate line height in pixels
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;

    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [value, isPreview, minRows, maxRows]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={isPreview ? "ghost" : "secondary"}
            size="sm"
            onClick={() => setIsPreview(false)}
            disabled={disabled}
            className="h-7 px-2 text-xs"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            variant={isPreview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(true)}
            disabled={disabled || !value}
            className="h-7 px-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </Button>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <MarkdownDisplay content={MARKDOWN_HELP} className="text-xs" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2">
          {value ? (
            <MarkdownDisplay content={value} />
          ) : (
            <p className="text-sm text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="resize-none font-mono text-sm"
          rows={minRows}
        />
      )}
    </div>
  );
}
