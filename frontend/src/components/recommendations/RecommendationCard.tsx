import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, IndianRupee, ShieldCheck, HelpCircle, Box, Sun, Archive, Compass, CheckCircle2 } from 'lucide-react';
import { RecommendationPlan } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';

import { useProjects } from '../../context/ProjectContext';

interface RecommendationCardProps {
  plan: RecommendationPlan;
  onOpenExplainability: (plan: RecommendationPlan) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  plan,
  onOpenExplainability,
}) => {
  const navigate = useNavigate();
  const { activeProject, updateProject } = useProjects();

  const handleExploreInStudio = () => {
    if (activeProject) {
      updateProject(activeProject.id, {
        activePlan: plan,
        designPlan: plan,
        designStyle: plan.designStyle as any,
      });
    }
    navigate('/studio');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-5 hover:border-terracotta-300 warm-card-hover transition-all flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="terracotta" size="sm">
                {plan.designStyle.toUpperCase()}
              </Badge>
              <Badge variant="neutral" size="sm">
                {plan.roomType.replace('_', ' ')}
              </Badge>
              <Badge variant={plan.isPlaceholder ? 'sand' : 'sage'} size="sm">
                {plan.isPlaceholder ? 'Sample Proposal' : 'AI Calibrated Plan'}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-charcoal-900 tracking-tight">{plan.title}</h3>
          </div>

          {/* Overall Match Score */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 text-terracotta-600 font-extrabold text-xl">
              <Sparkles className="w-4 h-4" />
              <span>{plan.scores.overallScore}%</span>
            </div>
            <span className="text-[10px] text-charcoal-500 font-semibold uppercase tracking-wider">Overall Score</span>
          </div>
        </div>

        {/* Cost & Items Summary */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-softBorder text-xs mb-4">
          <div className="flex items-center gap-1.5 text-charcoal-700">
            <IndianRupee className="w-4 h-4 text-sage-600" />
            <span>Est. Budget: <strong className="text-charcoal-900 font-bold">{formatCurrency(plan.estimatedCost)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-charcoal-600 font-medium">
            <Box className="w-3.5 h-3.5 text-terracotta-600" />
            <span>{plan.items?.length || 4} Pieces</span>
          </div>
        </div>

        {/* 4 Multi-Criteria Score Breakdown Gauges */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FCFBF9] border border-softBorder text-[11px] mb-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-charcoal-600">
              <Compass className="w-3 h-3 text-terracotta-600" />
              <span>Space Fit</span>
            </span>
            <span className="font-bold text-charcoal-900">{plan.scores.spaceCompatibility}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-charcoal-600">
              <Sparkles className="w-3 h-3 text-sand-600" />
              <span>Style Match</span>
            </span>
            <span className="font-bold text-charcoal-900">{plan.scores.styleCompatibility}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-charcoal-600">
              <Archive className="w-3 h-3 text-sage-600" />
              <span>Storage</span>
            </span>
            <span className="font-bold text-charcoal-900">{plan.scores.storageScore}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-charcoal-600">
              <Sun className="w-3 h-3 text-sand-600" />
              <span>Lighting</span>
            </span>
            <span className="font-bold text-charcoal-900">{plan.scores.lightingScore}%</span>
          </div>
        </div>

        {/* Key Furniture Items Preview */}
        {plan.items && plan.items.length > 0 && (
          <div className="mb-3 space-y-1.5">
            <span className="text-[11px] font-semibold text-charcoal-700 block">Recommended Furniture:</span>
            <div className="space-y-1">
              {plan.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] border border-softBorder">
                  <span className="font-medium text-charcoal-800 truncate max-w-[180px]">{item.name}</span>
                  <span className="font-mono font-bold text-sage-700 text-[11px]">{formatCurrency(item.price || item.estimatedCost || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constraint Checklist Excerpt */}
        <div className="space-y-1.5">
          {plan.constraints.slice(0, 2).map((c, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px] text-charcoal-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                <span className="truncate max-w-[200px]">{c.ruleName}</span>
              </span>
              <span className="font-mono text-[10px] text-charcoal-500 font-semibold">{c.metricValue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-softBorder">
        <Button
          onClick={handleExploreInStudio}
          variant="primary"
          size="sm"
          className="w-full shadow-terracotta"
        >
          Explore in 3D Studio
        </Button>

        <Button
          onClick={() => onOpenExplainability(plan)}
          variant="ghost"
          size="sm"
          className="w-full text-xs text-charcoal-600 hover:text-charcoal-900"
          leftIcon={<HelpCircle className="w-3.5 h-3.5 text-terracotta-600" />}
        >
          Why this recommendation? (Explainable AI)
        </Button>
      </div>
    </div>
  );
};
