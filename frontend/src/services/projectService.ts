import { Project } from '../types';

const PROJECTS_STORAGE_KEY = 'smartspace_projects_v2';

export const INITIAL_SAMPLE_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    title: 'Modern Minimalist Living Space',
    roomType: 'living_room',
    designStyle: 'modern_minimalist',
    dimensions: { length: 5.2, width: 4.0, height: 2.8, unit: 'metric' },
    budgetAllocated: 500000,
    budgetSpent: 425000,
    currency: 'INR',
    status: 'analyzed',
    createdAt: '2026-08-10T10:30:00Z',
    updatedAt: '2026-08-15T14:20:00Z',
    recommendationsCount: 3,
    notes: 'Prioritized high natural lighting and ergonomic low-profile seating.',
  },
  {
    id: 'proj-002',
    title: 'Japandi Home Workspace',
    roomType: 'home_office',
    designStyle: 'japandi',
    dimensions: { length: 3.6, width: 3.0, height: 2.6, unit: 'metric' },
    budgetAllocated: 300000,
    budgetSpent: 245000,
    currency: 'INR',
    status: 'rendered',
    createdAt: '2026-08-12T09:15:00Z',
    updatedAt: '2026-08-16T18:45:00Z',
    recommendationsCount: 2,
    notes: 'Acoustic wall paneling consideration and modular standing desk fit.',
  },
  {
    id: 'proj-003',
    title: 'Scandinavian Master Bedroom',
    roomType: 'bedroom',
    designStyle: 'scandinavian',
    dimensions: { length: 4.5, width: 3.8, height: 2.7, unit: 'metric' },
    budgetAllocated: 400000,
    budgetSpent: 350000,
    currency: 'INR',
    status: 'scanned',
    createdAt: '2026-08-17T11:00:00Z',
    updatedAt: '2026-08-17T11:00:00Z',
    recommendationsCount: 4,
    notes: 'Integrated wardrobe clearance verified.',
  }
];

export const projectService = {
  getProjects(): Project[] {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PROJECTS));
        return INITIAL_SAMPLE_PROJECTS;
      }
      const parsed: Project[] = JSON.parse(stored);
      // Migrate older USD values to native INR if needed
      const migrated = parsed.map((p) => {
        if (p.currency === 'USD' || p.budgetAllocated < 50000) {
          return {
            ...p,
            currency: 'INR',
            budgetAllocated: p.budgetAllocated < 50000 ? p.budgetAllocated * 100 : p.budgetAllocated,
            budgetSpent: p.budgetSpent < 50000 ? p.budgetSpent * 100 : p.budgetSpent,
          };
        }
        return p;
      });
      return migrated;
    } catch (error) {
      console.warn('Failed to read projects from localStorage:', error);
      return INITIAL_SAMPLE_PROJECTS;
    }
  },

  getProjectById(id: string): Project | undefined {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id);
  },

  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProject, ...projects];
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    // TODO: Future FastAPI hook: await apiClient.post('/api/v1/projects', newProject);
    return newProject;
  },

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const updatedProject = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    projects[index] = updatedProject;
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    return updatedProject;
  },

  deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) return false;
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};
