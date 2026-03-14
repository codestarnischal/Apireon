'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
      if (!activeProject && data.length > 0) {
        setActiveProject(data[0]);
      }
    }
    setLoading(false);
  }, [userId, activeProject]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (prompt: string) => {
    const response = await fetch('/api/architect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userId }),
    });
    const result = await response.json();
    if (result.success) {
      await fetchProjects();
      setActiveProject(result.data.project);
    }
    return result;
  }, [userId, fetchProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (activeProject?.id === projectId) {
        setActiveProject(projects.find((p) => p.id !== projectId) ?? null);
      }
    }
    return { error };
  }, [activeProject, projects]);

  return {
    projects,
    activeProject,
    setActiveProject,
    loading,
    createProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
