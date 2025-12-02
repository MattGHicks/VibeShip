import { ProjectForm } from "@/components/projects/project-form";
import { PlusCircle } from "lucide-react";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <PlusCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
        </div>
        <p className="text-muted-foreground">
          Create a new project to track your vibe coding journey
        </p>
      </div>

      <div className="max-w-3xl">
        <ProjectForm mode="create" />
      </div>
    </div>
  );
}
