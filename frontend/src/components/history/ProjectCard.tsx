import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Calendar, IndianRupee, Layers, Trash2, ArrowUpRight, Download, Copy, Edit3, Check, X } from 'lucide-react';
import { Project } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useProjects } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setActiveProject, createProject, updateProject } = useProjects();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(project.title);

  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'rendered':
        return <Badge variant="sage" size="sm">3D Rendered</Badge>;
      case 'analyzed':
        return <Badge variant="terracotta" size="sm">Analyzed</Badge>;
      case 'scanned':
        return <Badge variant="sand" size="sm">Scanned</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const handleOpenInStudio = () => {
    setActiveProject(project);
    navigate('/studio');
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    createProject({
      title: `${project.title} (Copy)`,
      roomType: project.roomType,
      designStyle: project.designStyle,
      dimensions: { ...project.dimensions },
      budgetAllocated: project.budgetAllocated,
      budgetSpent: project.budgetSpent,
      currency: project.currency,
      status: project.status,
      recommendationsCount: project.recommendationsCount,
      notes: project.notes,
      spatialData: project.spatialData ? { ...project.spatialData } : undefined,
      activePlan: project.activePlan ? { ...project.activePlan } : undefined,
      designPlan: project.designPlan ? { ...project.designPlan } : undefined,
      designCustomization: project.designCustomization ? JSON.parse(JSON.stringify(project.designCustomization)) : undefined,
    });
  };

  const handleSaveRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (newTitle.trim()) {
      updateProject(project.id, { title: newTitle.trim() });
      setIsRenaming(false);
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smartspace_${project.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      title: 'Project Spec Downloaded',
      description: `JSON specification for "${project.title}" saved.`,
      type: 'success',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-softBorder shadow-warm-md space-y-4 hover:border-terracotta-300 warm-card-hover transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(project.status)}
            <span className="text-[11px] text-charcoal-600 font-semibold bg-[#FAF7F2] px-2.5 py-0.5 rounded-lg border border-softBorder capitalize">
              {project.roomType.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDuplicate}
              className="text-charcoal-400 hover:text-terracotta-600 p-1.5 rounded-lg transition-colors"
              title="Duplicate project"
              aria-label="Duplicate project"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsRenaming(true)}
              className="text-charcoal-400 hover:text-terracotta-600 p-1.5 rounded-lg transition-colors"
              title="Rename project"
              aria-label="Rename project"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExport}
              className="text-charcoal-400 hover:text-terracotta-600 p-1.5 rounded-lg transition-colors"
              title="Export project specification (JSON)"
              aria-label="Export project"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
              className="text-charcoal-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
              title="Delete project"
              aria-label="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isRenaming ? (
          <div className="flex items-center gap-1.5 mb-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-xs font-bold px-2 py-1 border border-terracotta-300 rounded-lg w-full focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveRename}
              className="p-1 rounded bg-terracotta-500 text-white hover:bg-terracotta-600"
              title="Save Title"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsRenaming(false)}
              className="p-1 rounded bg-cream-200 text-charcoal-600 hover:bg-cream-300"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <h3 className="text-sm font-bold text-charcoal-900 tracking-tight group-hover:text-terracotta-600 transition-colors">
            {project.title}
          </h3>
        )}

        {project.notes && (
          <p className="text-[11px] text-charcoal-500 mt-1 line-clamp-2 leading-relaxed font-medium">
            {project.notes}
          </p>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-softBorder text-[11px]">
        <div className="flex items-center gap-1.5 text-charcoal-700 font-medium">
          <IndianRupee className="w-3.5 h-3.5 text-sage-600" />
          <span>Spent: {formatCurrency(project.budgetSpent)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-charcoal-700 font-mono">
          <Box className="w-3.5 h-3.5 text-terracotta-600" />
          <span>{project.dimensions.length}m × {project.dimensions.width}m</span>
        </div>
        <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-sand-600" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
          <Layers className="w-3.5 h-3.5 text-terracotta-600" />
          <span>{project.recommendationsCount} Proposals</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-softBorder">
        <Button
          onClick={handleOpenInStudio}
          variant="outline"
          size="sm"
          className="w-full text-xs font-semibold"
          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
        >
          Open in Studio
        </Button>
      </div>
    </div>
  );
};

