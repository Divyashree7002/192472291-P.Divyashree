import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { ProjectCard } from '../components/history/ProjectCard';
import { ProjectFilterBar } from '../components/history/ProjectFilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { FolderOpen, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProjectHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRoomType = selectedRoomType === 'all' || p.roomType === selectedRoomType;
    const matchesStyle = selectedStyle === 'all' || p.designStyle === selectedStyle;

    return matchesSearch && matchesRoomType && matchesStyle;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Spatial Project History
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Browse, filter, and review previously captured room scans and layout configurations.
          </p>
        </div>

        <button
          onClick={() => navigate('/camera')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-terracotta transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Room Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <ProjectFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRoomType={selectedRoomType}
        onRoomTypeChange={setSelectedRoomType}
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderOpen className="w-8 h-8" />}
          title="No projects match your filter criteria"
          description="Try clearing your search query or adjusting your room type and design style filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedRoomType('all');
            setSelectedStyle('all');
          }}
        />
      )}
    </div>
  );
};
