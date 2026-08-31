import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { projectService } from '../services/projectService';
import { useToast } from './ToastContext';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  refreshProjects: () => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  const refreshProjects = () => {
    try {
      const list = projectService.getProjects();
      setProjects(list);
      if (!activeProject && list.length > 0) {
        setActiveProject(list[0]);
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const created = projectService.createProject(projectData);
    setProjects((prev) => [created, ...prev]);
    setActiveProject(created);
    addToast({
      title: 'Project Created',
      description: `"${created.title}" initialized. Ready for room scanning.`,
      type: 'success',
    });
    return created;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = projectService.updateProject(id, updates);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (activeProject?.id === id) {
        setActiveProject(updated);
      }
      addToast({
        title: 'Project Updated',
        description: 'Changes saved successfully.',
        type: 'info',
      });
    }
  };

  const deleteProject = (id: string) => {
    const success = projectService.deleteProject(id);
    if (success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
      addToast({
        title: 'Project Deleted',
        description: 'The project record was removed.',
        type: 'warning',
      });
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        createProject,
        updateProject,
        deleteProject,
        refreshProjects,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
