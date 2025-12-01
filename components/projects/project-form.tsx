"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Pause, Skull, Rocket, Globe, Lock, Loader2 } from "lucide-react";
import { createProject, updateProject, type ProjectFormData } from "@/lib/actions/projects";
import { getProjectTags, updateProjectTags, type TagType } from "@/lib/actions/tags";
import { TagSelector } from "@/components/projects/tag-selector";
import { ScreenshotUpload } from "@/components/projects/screenshot-upload";
import type { Project, ProjectStatus } from "@/types/database";

const statusOptions: { value: ProjectStatus; label: string; icon: React.ElementType; description: string }[] = [
  { value: "active", label: "Active", icon: Flame, description: "Currently working on it" },
  { value: "paused", label: "Paused", icon: Pause, description: "Taking a break" },
  { value: "graveyard", label: "Graveyard", icon: Skull, description: "Abandoned but learned from" },
  { value: "shipped", label: "Shipped", icon: Rocket, description: "Live and in production" },
];

interface ProjectFormProps {
  project?: Project;
  mode: "create" | "edit";
}

interface SelectedTag {
  tag_type: TagType;
  tag_value: string;
}

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([]);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "active",
    is_public: project?.is_public ?? false,
    github_repo_url: project?.github_repo_url || "",
    live_url: project?.live_url || "",
    screenshot_url: project?.screenshot_url || null,
    where_i_left_off: project?.where_i_left_off || "",
    lessons_learned: project?.lessons_learned || "",
  });

  // Load existing tags when editing
  const loadTags = useCallback(async () => {
    if (mode === "edit" && project) {
      const result = await getProjectTags(project.id);
      if (result.data) {
        setSelectedTags(
          result.data.map((tag) => ({
            tag_type: tag.tag_type,
            tag_value: tag.tag_value,
          }))
        );
      }
    }
  }, [mode, project]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        const result = await createProject(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result && "id" in result) {
          // Save tags for new project
          await updateProjectTags(result.id as string, selectedTags);
        }
      } else if (project) {
        const result = await updateProject(project.id, formData);
        if (result?.error) {
          setError(result.error);
        } else {
          // Save tags for existing project
          await updateProjectTags(project.id, selectedTags);
          router.push(`/projects/${project.id}`);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
          <CardDescription>Give your project a name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Awesome Project"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tech Stack</CardTitle>
          <CardDescription>Tag the AI models, frameworks, and tools you used</CardDescription>
        </CardHeader>
        <CardContent>
          <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status & Visibility</CardTitle>
          <CardDescription>Set the current status and who can see this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                        <span className="text-muted-foreground">- {option.description}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={formData.is_public ? "public" : "private"}
              onValueChange={(value) => setFormData({ ...formData, is_public: value === "public" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Private</span>
                    <span className="text-muted-foreground">- Only you can see it</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Public</span>
                    <span className="text-muted-foreground">- Visible on your profile</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
          <CardDescription>Connect your GitHub repo and live site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github_repo_url">GitHub Repository URL</Label>
            <Input
              id="github_repo_url"
              type="url"
              value={formData.github_repo_url}
              onChange={(e) => setFormData({ ...formData, github_repo_url: e.target.value })}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live_url">Live URL</Label>
            <Input
              id="live_url"
              type="url"
              value={formData.live_url}
              onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
              placeholder="https://myproject.vercel.app"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Screenshot</CardTitle>
          <CardDescription>Add a screenshot to showcase your project</CardDescription>
        </CardHeader>
        <CardContent>
          <ScreenshotUpload
            projectId={project?.id}
            currentUrl={formData.screenshot_url}
            onUpload={(url) => setFormData({ ...formData, screenshot_url: url })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Track where you left off and what you learned</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="where_i_left_off">Where I Left Off</Label>
            <Textarea
              id="where_i_left_off"
              value={formData.where_i_left_off}
              onChange={(e) => setFormData({ ...formData, where_i_left_off: e.target.value })}
              placeholder="What were you working on last? What's the next step?"
              rows={3}
            />
          </div>

          {(formData.status === "graveyard" || formData.status === "shipped") && (
            <div className="space-y-2">
              <Label htmlFor="lessons_learned">Lessons Learned</Label>
              <Textarea
                id="lessons_learned"
                value={formData.lessons_learned}
                onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                placeholder="What did you learn from this project?"
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Project" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
