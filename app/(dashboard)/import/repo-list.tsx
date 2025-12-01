"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Lock,
  Globe,
  Search,
  Check,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { getGitHubRepos, importGitHubRepo } from "@/lib/actions/github";

interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  language: string | null;
  updatedAt: string;
  isPrivate: boolean;
  isImported: boolean;
}

export function RepoList() {
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [importingId, setImportingId] = useState<number | null>(null);

  const loadRepos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getGitHubRepos();

    if (result.error) {
      setError(result.error);
    } else if (result.repos) {
      setRepos(result.repos);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  const handleImport = async (repoId: number) => {
    setImportingId(repoId);

    const result = await importGitHubRepo(repoId);

    if (result.error) {
      setError(result.error);
      setImportingId(null);
    } else if (result.project) {
      // Update local state
      setRepos((prev) =>
        prev.map((r) => (r.id === repoId ? { ...r, isImported: true } : r))
      );
      setImportingId(null);
      // Optionally navigate to the new project
      router.push(`/projects/${result.project.id}`);
    }
  };

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.description?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "public" && !repo.isPrivate) ||
      (filter === "private" && repo.isPrivate);

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive text-center mb-4">{error}</p>
        <Button variant="outline" onClick={loadRepos}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="public">
                <Globe className="mr-1 h-3 w-3" />
                Public
              </TabsTrigger>
              <TabsTrigger value="private">
                <Lock className="mr-1 h-3 w-3" />
                Private
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={loadRepos}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border rounded-lg border">
        {filteredRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No repositories found</p>
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{repo.name}</h3>
                  {repo.isPrivate ? (
                    <Badge variant="secondary" className="flex-shrink-0">
                      <Lock className="mr-1 h-3 w-3" />
                      Private
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex-shrink-0">
                      <Globe className="mr-1 h-3 w-3" />
                      Public
                    </Badge>
                  )}
                  {repo.language && (
                    <Badge variant="outline" className="flex-shrink-0">
                      {repo.language}
                    </Badge>
                  )}
                </div>
                {repo.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{repo.stars}</span>
                  </div>
                  <span>
                    Updated {new Date(repo.updatedAt).toLocaleDateString()}
                  </span>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on GitHub
                  </a>
                </div>
              </div>
              <div className="flex-shrink-0">
                {repo.isImported ? (
                  <Button variant="outline" disabled>
                    <Check className="mr-2 h-4 w-4" />
                    Imported
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleImport(repo.id)}
                    disabled={importingId === repo.id}
                  >
                    {importingId === repo.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Import"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredRepos.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredRepos.length} of {repos.length} repositories
        </p>
      )}
    </div>
  );
}
