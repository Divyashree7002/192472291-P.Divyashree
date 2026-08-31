import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  IndianRupee,
  Brain,
  Scale,
  Sun,
  HeartHandshake,
  Armchair,
  Eye,
  Info
} from 'lucide-react';
import { RecommendationPlan } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';

interface ExplainabilityModalProps {
  plan: RecommendationPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  plan,
  isOpen,
  onClose,
}) => {
  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Why this recommendation?"
      subtitle={`Explainable AI (XAI) multi-criteria breakdown for "${plan.title}"`}
      maxWidth="2xl"
      footer={
        <Button onClick={onClose} variant="secondary" size="sm">
          Close Analysis
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Notice */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-softBorder text-xs text-charcoal-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
          <span>
            This Explainable AI breakdown details the multi-criteria spatial ranking, daylight optimization, and ergonomic clearance validation for your room.
          </span>
        </div>

        {/* Primary Decision Rationale */}
        <div className="p-4 rounded-2xl bg-terracotta-50/80 border border-terracotta-200">
          <div className="flex items-center gap-2 text-terracotta-800 font-bold text-xs mb-1.5">
            <Brain className="w-4 h-4 text-terracotta-600" />
            <span>Primary Decision Rationale</span>
          </div>
          <p className="text-xs text-charcoal-700 leading-relaxed font-normal">
            {plan.explainability.primaryRationale}
          </p>
        </div>

        {/* 1. Spatial Constraints & Clearances */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>Spatial Constraints & Circulation Clearance</span>
            </span>
            <Badge variant="sage" size="sm">Score: {plan.scores.spaceCompatibility}%</Badge>
          </div>
          <div className="space-y-1.5">
            {plan.explainability.spatialReasoning.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FCFBF9] border border-softBorder text-xs text-charcoal-800"
              >
                <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. User Preference & Style Match */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-terracotta-600" />
              <span>User Preference & Aesthetic Match</span>
            </span>
            <Badge variant="terracotta" size="sm">Score: {plan.scores.styleCompatibility}%</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {plan.explainability.styleMatchingFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder text-xs text-charcoal-800 flex items-start gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-terracotta-600 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Budget Match & Trade-offs */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-sage-600" />
              <span>Budget Match & Cost Optimization</span>
            </span>
            <span className="text-xs font-bold text-charcoal-800">{formatCurrency(plan.estimatedCost)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#FCFBF9] border border-softBorder text-xs text-charcoal-700 leading-relaxed space-y-2.5">
            <p>{plan.explainability.budgetOptimizationNote}</p>
            <div className="space-y-1.5 pt-2.5 border-t border-softBorder">
              <span className="text-[11px] font-bold text-charcoal-800 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-sand-600" />
                <span>Trade-off Considerations:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-charcoal-600 pl-1">
                {plan.explainability.tradeOffConsiderations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Furniture Compatibility, Lighting, Lifestyle & Accessibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-charcoal-900">
              <Armchair className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Furniture Compatibility</span>
            </div>
            <p className="text-charcoal-600 text-[11px] leading-relaxed">
              Modular piece proportions fit room aspect ratio with preserved heirloom integration.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-charcoal-900">
              <Sun className="w-3.5 h-3.5 text-sand-600" />
              <span>Daylight & Ambient Lighting</span>
            </div>
            <p className="text-charcoal-600 text-[11px] leading-relaxed">
              Main seating configured to eliminate screen glare and maximize natural window sunlight.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-charcoal-900">
              <HeartHandshake className="w-3.5 h-3.5 text-sage-600" />
              <span>Lifestyle Alignment</span>
            </div>
            <p className="text-charcoal-600 text-[11px] leading-relaxed">
              Pet-friendly stain-resistant upholstery and child-safe rounded furniture corners.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-charcoal-900">
              <Eye className="w-3.5 h-3.5 text-charcoal-600" />
              <span>Accessibility Verification</span>
            </div>
            <p className="text-charcoal-600 text-[11px] leading-relaxed">
              1.15m clear doorways and wide turning radii exceeding standard ADA recommendations.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
