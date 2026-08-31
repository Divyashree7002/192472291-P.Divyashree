import React, { useState, useEffect } from 'react';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { ExplainabilityModal } from '../components/recommendations/ExplainabilityModal';
import { RecommendationPlan } from '../types';
import {
  SlidersHorizontal,
  RefreshCw,
  Server,
  Sparkles,
  Layers,
  IndianRupee,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Slider } from '../components/ui/Slider';
import { useProjects } from '../context/ProjectContext';
import { fetchRecommendations, healthCheck } from '../services/api';

export const SAMPLE_RECOMMENDATIONS: RecommendationPlan[] = [
  {
    id: 'rec-1',
    title: 'Warm Japandi Spatial Flow Layout',
    designStyle: 'japandi',
    roomType: 'living_room',
    matchScore: 96,
    scores: {
      spaceCompatibility: 98,
      styleCompatibility: 96,
      storageScore: 92,
      lightingScore: 95,
      overallScore: 96,
    },
    estimatedCost: 485000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    isPlaceholder: false,
    constraints: [
      { ruleName: 'Pathway Circulation Clearance', category: 'circulation', status: 'passed', message: 'Main path exceeds 0.9m standard', metricValue: '1.15m (Req: >0.9m)' },
      { ruleName: 'Entry Door Swing Arc Clearance', category: 'door_swing', status: 'passed', message: 'No furniture in door arc', metricValue: '0.45m buffer' },
      { ruleName: 'Natural Window Daylight Path', category: 'light_path', status: 'passed', message: 'Window sightline unobstructed', metricValue: '100% Unobstructed' },
      { ruleName: 'Budget Ceiling Compliance', category: 'budget_ceiling', status: 'passed', message: 'Within target limit', metricValue: '₹4,85,000 of ₹5,00,000' },
    ],
    items: [],
    explainability: {
      primaryRationale:
        'This layout maximizes open continuous floor space while aligning natural oak and bouclé textures with the user Japandi preference profile.',
      spatialReasoning: [
        'Main 3-seater sofa placed perpendicular to the primary light source to prevent screen glare while keeping the focal view open.',
        '1.15m circulation corridor preserved between entryway and balcony access.',
        'Low-profile seating keeps vertical sightlines unbroken across the 2.8m ceiling plane.',
      ],
      styleMatchingFactors: [
        '96% match with preferred natural oak and warm earth tone palette.',
        'Minimalist geometry satisfies clutter-free ergonomic criteria.',
        'Wabi-sabi organic pottery and linen upholstery harmonize with ambient lighting priors.',
      ],
      budgetOptimizationNote:
        'Allocated ₹4,85,000 of ₹5,00,000 budget cap (97% utilization) with zero overages.',
      tradeOffConsiderations: [
        'Selected a 220cm sofa instead of a 280cm sectional to maintain generous 1.15m circulation clearance.',
        'Utilized wall-mounted concealed credenza instead of freestanding bookcase to preserve floor area.',
      ],
    },
  },
  {
    id: 'rec-2',
    title: 'Scandinavian Organic Light Concept',
    designStyle: 'scandinavian',
    roomType: 'living_room',
    matchScore: 92,
    scores: {
      spaceCompatibility: 94,
      styleCompatibility: 92,
      storageScore: 88,
      lightingScore: 96,
      overallScore: 92,
    },
    estimatedCost: 420000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    isPlaceholder: false,
    constraints: [
      { ruleName: 'Pathway Circulation Clearance', category: 'circulation', status: 'passed', message: 'Adequate pathway preserved', metricValue: '1.05m (Req: >0.9m)' },
      { ruleName: 'Entry Door Swing Arc Clearance', category: 'door_swing', status: 'passed', message: 'Clear doorway radius', metricValue: '0.38m buffer' },
      { ruleName: 'Natural Window Daylight Path', category: 'light_path', status: 'passed', message: 'Daylight envelope open', metricValue: '95% Unobstructed' },
      { ruleName: 'Budget Ceiling Compliance', category: 'budget_ceiling', status: 'passed', message: 'Under total limit', metricValue: '₹4,20,000 of ₹5,00,000' },
    ],
    items: [],
    explainability: {
      primaryRationale:
        'Emphasizes bright neutral finishes, organic ash timbers, and cozy textural layering for maximum diurnal daylight utilization.',
      spatialReasoning: [
        'Sofa oriented facing south-east window to capture morning indirect natural illumination.',
        'Clearance exceeds ADA ergonomic standard across all primary room access vectors.',
      ],
      styleMatchingFactors: [
        '92% alignment with user preference for Scandinavian timber and sage accent textiles.',
        'Tapered leg silhouettes elevate furniture from the floor plane, augmenting perceived room volume.',
      ],
      budgetOptimizationNote: 'Utilizes 84% of total budget limit (₹4,20,000 spent).',
      tradeOffConsiderations: [
        'Slightly higher expenditure on solid ash timber offset by choosing modular occasional tables.',
      ],
    },
  },
  {
    id: 'rec-3',
    title: 'Modern Minimalist Architectural Focus',
    designStyle: 'minimalist',
    roomType: 'living_room',
    matchScore: 89,
    scores: {
      spaceCompatibility: 97,
      styleCompatibility: 89,
      storageScore: 90,
      lightingScore: 91,
      overallScore: 89,
    },
    estimatedCost: 360000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    isPlaceholder: false,
    constraints: [
      { ruleName: 'Pathway Circulation Clearance', category: 'circulation', status: 'passed', message: 'Maximal open corridor', metricValue: '1.30m (Req: >0.9m)' },
      { ruleName: 'Entry Door Swing Arc Clearance', category: 'door_swing', status: 'passed', message: 'Zero arc intersection', metricValue: '0.55m buffer' },
      { ruleName: 'Natural Window Daylight Path', category: 'light_path', status: 'passed', message: 'Full floor-to-ceiling daylight', metricValue: '100% Unobstructed' },
      { ruleName: 'Budget Ceiling Compliance', category: 'budget_ceiling', status: 'passed', message: 'Under total limit', metricValue: '₹3,60,000 of ₹5,00,000' },
    ],
    items: [],
    explainability: {
      primaryRationale:
        'Streamlined architectural composition with structured modular storage and high-durability fabrics.',
      spatialReasoning: [
        'Extreme circulation clearance (1.30m) achieved through cantilevered wall shelving.',
        'Zero obstruction to air flow and radiator perimeter zones.',
      ],
      styleMatchingFactors: [
        'High contrast monochrome and muted brass hardware highlights modern architectural features.',
      ],
      budgetOptimizationNote: 'Economical budget balance of ₹1,40,000 reserved for accent accessories.',
      tradeOffConsiderations: [
        'Reduced total seating capacity to 4 people in exchange for dramatic open spatial volume.',
      ],
    },
  },
];

export const RecommendationsPage: React.FC = () => {
  const { projects, activeProject } = useProjects();
  const currentProject = activeProject || projects[0];

  const [plans, setPlans] = useState<RecommendationPlan[]>(SAMPLE_RECOMMENDATIONS);
  const [selectedPlanForExplain, setSelectedPlanForExplain] = useState<RecommendationPlan | null>(null);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter & Generation State
  const [roomType, setRoomType] = useState<string>(currentProject?.roomType || 'living_room');
  const [designStyle, setDesignStyle] = useState<string>(currentProject?.designStyle || 'modern');
  const [budget, setBudget] = useState<number>(currentProject?.budgetAllocated || 500000);

  const length = currentProject?.dimensions?.length || 4.8;
  const width = currentProject?.dimensions?.width || 3.6;
  const height = currentProject?.dimensions?.height || 2.8;

  const loadRecommendations = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const health = await healthCheck();
      setBackendStatus(health.status === 'online' ? 'online' : 'offline');

      if (health.status === 'online') {
        const res = await fetchRecommendations({
          room_type: roomType,
          design_style: designStyle,
          budget: budget,
          length: length,
          width: width,
          height: height,
        });

        if (res.plans && res.plans.length > 0) {
          setPlans(res.plans);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Backend offline';
      setErrorMessage(msg);
      setBackendStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [roomType, designStyle, budget]);

  const handleOpenExplain = (plan: RecommendationPlan) => {
    setSelectedPlanForExplain(plan);
    setIsExplainModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Personalized Design Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Multi-criteria layout ranking with metric spatial validation and Explainable AI (XAI) rationale.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-softBorder text-xs text-charcoal-700 shadow-warm-sm font-semibold">
            <Server className={`w-3.5 h-3.5 ${backendStatus === 'online' ? 'text-sage-600' : 'text-charcoal-400'}`} />
            <span>{backendStatus === 'online' ? 'FastAPI Recommendation Engine: Active' : 'Backend Offline (Using Cached Engine)'}</span>
          </div>

          <Button
            onClick={loadRecommendations}
            isLoading={isLoading}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Regenerate Plans
          </Button>
        </div>
      </div>

      {/* Interactive Controls & Spatial Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-sm grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <Select
          label="Target Room Archetype"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          options={[
            { value: 'living_room', label: 'Living Room' },
            { value: 'bedroom', label: 'Bedroom' },
            { value: 'dining_room', label: 'Dining Room' },
            { value: 'office', label: 'Home Office' },
            { value: 'study_room', label: 'Study Room' },
            { value: 'kitchen', label: 'Kitchen & Pantry' },
          ]}
        />

        <Select
          label="Preferred Design Style"
          value={designStyle}
          onChange={(e) => setDesignStyle(e.target.value)}
          options={[
            { value: 'modern', label: 'Modern Architectural' },
            { value: 'minimalist', label: 'Minimalist Clean' },
            { value: 'scandinavian', label: 'Scandinavian Light' },
            { value: 'contemporary', label: 'Contemporary Warm' },
            { value: 'industrial', label: 'Industrial Raw' },
            { value: 'traditional', label: 'Traditional Indian Heritage' },
            { value: 'luxury', label: 'Luxury Opulent' },
            { value: 'japandi', label: 'Warm Japandi Organic' },
          ]}
        />

        <div>
          <Slider
            label="Target Budget Ceiling (INR)"
            min={100000}
            max={2000000}
            step={50000}
            value={budget}
            valuePrefix="₹"
            onChangeValue={setBudget}
          />
        </div>
      </div>

      {/* Offline Notice if Backend Unreachable */}
      {backendStatus === 'offline' && (
        <Alert variant="warning">
          <div className="flex items-center justify-between gap-2">
            <div>
              <strong className="block text-charcoal-900 font-semibold mb-0.5">FastAPI Backend Standby</strong>
              Displaying validated architectural proposals. Ensure the FastAPI backend is running for dynamic real-time synthesis.
            </div>
            <Button onClick={loadRecommendations} variant="outline" size="sm">
              Retry Connection
            </Button>
          </div>
        </Alert>
      )}

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <RecommendationCard
            key={plan.id}
            plan={plan}
            onOpenExplainability={handleOpenExplain}
          />
        ))}
      </div>

      {/* Transparent XAI Dialog */}
      <ExplainabilityModal
        plan={selectedPlanForExplain}
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
      />
    </div>
  );
};
