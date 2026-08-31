import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InteractiveRoom3D } from '../components/studio/InteractiveRoom3D';
import { RoomDesignPanel } from '../components/studio/RoomDesignPanel';
import { DesignAlternatives, DesignVariation } from '../components/studio/DesignAlternatives';
import { AIDesignerAssistant } from '../components/studio/AIDesignerAssistant';
import { DesignReportModal } from '../components/studio/DesignReportModal';
import { MoodboardModal } from '../components/studio/MoodboardModal';
import { PlanningTools } from '../components/studio/PlanningTools';
import { BeforeAfterSlider } from '../components/studio/BeforeAfterSlider';
import { StyleCompareModal } from '../components/studio/StyleCompareModal';
import { EditScanModal } from '../components/camera/EditScanModal';
import {
  Layers,
  Sparkles,
  Save,
  RefreshCw,
  Compass,
  Box,
  CheckCircle2,
  Sliders,
  Armchair,
  Palette,
  Eye,
  Camera,
  ArrowRight,
  ShieldCheck,
  Check,
  Ruler,
  Bot,
  FileText,
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import {
  DesignCustomizationState,
  PlacedFurnitureItem,
  DesignStyle,
  RoomType
} from '../types';
import { fetchDesignPlan } from '../services/api';
import {
  STYLE_PRESETS,
  getArchetypeFurniture,
  convertDetectedObjectsToPlacedFurniture
} from '../utils/roomArchetypes';

export const DesignStudioPage: React.FC = () => {
  const { projects, activeProject, updateProject } = useProjects();
  const { addToast } = useToast();
  const currentProject = activeProject || projects[0];

  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMoodboardModal, setShowMoodboardModal] = useState(false);
  const [showCompareStylesModal, setShowCompareStylesModal] = useState(false);
  const [showEditScanModal, setShowEditScanModal] = useState(false);
  const [showPlanningTools, setShowPlanningTools] = useState(false);

  const roomDimensions = useMemo(() => {
    return currentProject?.dimensions
      ? {
          length: currentProject.dimensions.length,
          width: currentProject.dimensions.width,
          height: currentProject.dimensions.height,
          isEstimated: currentProject.dimensions.isEstimated,
          confidence: currentProject.dimensions.confidence,
        }
      : { length: 4.2, width: 3.5, height: 2.7, isEstimated: true, confidence: 78 };
  }, [currentProject?.dimensions]);

  const initialFurniture: PlacedFurnitureItem[] = useMemo(() => {
    if (currentProject?.designCustomization?.placedFurniture) {
      return currentProject.designCustomization.placedFurniture;
    }

    if (currentProject?.detectedObjects && currentProject.detectedObjects.length > 0) {
      return convertDetectedObjectsToPlacedFurniture(
        currentProject.detectedObjects,
        roomDimensions,
        '#E07A5F'
      );
    }

    if (currentProject?.scanImage) {
      return [];
    }

    return getArchetypeFurniture(
      currentProject?.roomType || 'living_room',
      roomDimensions,
      currentProject?.designStyle || 'modern'
    );
  }, [currentProject, roomDimensions]);

  const defaultStylePreset = STYLE_PRESETS[(currentProject?.designStyle || 'modern') as DesignStyle] || STYLE_PRESETS.modern;

  const [customization, setCustomization] = useState<DesignCustomizationState>({
    scanImage: currentProject?.scanImage || currentProject?.designCustomization?.scanImage || null,
    roomType: currentProject?.designCustomization?.roomType || currentProject?.roomType || 'living_room',
    style: currentProject?.designCustomization?.style || currentProject?.designStyle || 'modern',
    colors: currentProject?.designCustomization?.colors || {
      wall: currentProject?.spatialData?.dominantWallColor || defaultStylePreset.palette.wall,
      floor: currentProject?.spatialData?.dominantFloorColor || defaultStylePreset.palette.floor,
      ceiling: defaultStylePreset.palette.ceiling,
      furniture: defaultStylePreset.palette.furniture,
      accent: defaultStylePreset.palette.accent,
    },
    floorMaterial: currentProject?.designCustomization?.floorMaterial || defaultStylePreset.floorMaterial,
    placedFurniture: initialFurniture,
    selectedItemId: null,
    budget: currentProject?.designCustomization?.budget || currentProject?.budgetAllocated || 500000,
    viewMode: 'top_down',
  });

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentProject?.designCustomization) {
      setCustomization(currentProject.designCustomization);
    } else if (currentProject) {
      const preset = STYLE_PRESETS[(currentProject.designStyle || 'modern') as DesignStyle] || STYLE_PRESETS.modern;
      setCustomization({
        scanImage: currentProject.scanImage || null,
        roomType: currentProject.roomType || 'living_room',
        style: currentProject.designStyle || 'modern',
        colors: {
          wall: currentProject.spatialData?.dominantWallColor || preset.palette.wall,
          floor: currentProject.spatialData?.dominantFloorColor || preset.palette.floor,
          ceiling: preset.palette.ceiling,
          furniture: preset.palette.furniture,
          accent: preset.palette.accent,
        },
        floorMaterial: preset.floorMaterial,
        placedFurniture: initialFurniture,
        selectedItemId: null,
        budget: currentProject.budgetAllocated || 500000,
        viewMode: 'top_down',
      });
    }
  }, [currentProject?.id]);

  const handleChangeCustomization = (updated: Partial<DesignCustomizationState>) => {
    setCustomization((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateDimensions = (dims: { length: number; width: number; height: number }) => {
    if (currentProject) {
      updateProject(currentProject.id, {
        dimensions: {
          ...currentProject.dimensions,
          length: dims.length,
          width: dims.width,
          height: dims.height,
        },
      });
    }
  };

  // 1-Click Perfect Colors Generator
  const handleFindPerfectColors = () => {
    const preset = STYLE_PRESETS[(customization.style || 'modern') as DesignStyle] || STYLE_PRESETS.modern;
    setCustomization((prev) => ({
      ...prev,
      colors: {
        wall: preset.palette.wall,
        floor: preset.palette.floor,
        ceiling: preset.palette.ceiling,
        furniture: preset.palette.furniture,
        accent: preset.palette.accent,
      },
    }));
    addToast({
      title: 'Perfect Colors Applied',
      description: `Harmonized surface palettes for ${customization.style.toUpperCase()} theme.`,
      type: 'success',
    });
  };

  // 1-Click Fit My Budget Optimizer
  const handleFitMyBudget = () => {
    const targetBudget = customization.budget || 500000;
    const items = customization.placedFurniture;
    const total = items.reduce((acc, i) => acc + (i.price || i.estimatedCost || 0), 0);

    if (total <= targetBudget) {
      addToast({
        title: 'Budget Verified',
        description: `Current room arrangement is within your allocated budget limit.`,
        type: 'info',
      });
      return;
    }

    const scaleFactor = targetBudget / total;
    const adjustedFurniture = items.map((item) => ({
      ...item,
      price: Math.round((item.price || item.estimatedCost || 20000) * scaleFactor),
    }));

    setCustomization((prev) => ({ ...prev, placedFurniture: adjustedFurniture }));
    addToast({
      title: 'Budget Optimized',
      description: `Selected cost-effective furniture alternatives fitting within budget limit.`,
      type: 'success',
    });
  };

  const handleGenerateDesignPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const planRes = await fetchDesignPlan({
        room_type: customization.roomType || currentProject?.roomType || 'living_room',
        design_style: customization.style,
        budget: customization.budget,
        length: roomDimensions.length,
        width: roomDimensions.width,
        height: roomDimensions.height,
        existing_objects: currentProject?.detectedObjects || [],
      });

      if (planRes?.plan?.items) {
        const L = roomDimensions.length;
        const W = roomDimensions.width;

        const newFurniture: PlacedFurnitureItem[] = planRes.plan.items.map((item: any, idx: number) => ({
          ...item,
          id: item.id || `api-plan-${idx}`,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          source: 'recommended',
          position: {
            x: idx === 0 ? 0 : (idx % 2 === 0 ? -1 : 1) * (W * 0.25),
            y: ((item.dimensions?.heightCm || 80) / 100) / 2,
            z: Math.max(0.6, Math.min(L - 0.6, 1.2 + idx * 0.8)),
          },
        }));

        setCustomization((prev) => ({
          ...prev,
          placedFurniture: newFurniture,
        }));

        if (currentProject) {
          updateProject(currentProject.id, {
            activePlan: planRes.plan,
            designPlan: planRes.plan,
          });
        }

        addToast({
          title: 'Design Plan Generated',
          description: `Generated cohesive ${customization.style.toUpperCase()} layout with ${newFurniture.length} staged pieces.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Design Generation Notice',
        description: err?.message || 'Generated default cohesive spatial plan.',
        type: 'info',
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleResetDesign = () => {
    const preset = STYLE_PRESETS[(currentProject?.designStyle || 'modern') as DesignStyle] || STYLE_PRESETS.modern;
    const defaultState: DesignCustomizationState = {
      scanImage: currentProject?.scanImage || null,
      roomType: currentProject?.roomType || 'living_room',
      style: currentProject?.designStyle || 'modern',
      colors: {
        wall: currentProject?.spatialData?.dominantWallColor || preset.palette.wall,
        floor: currentProject?.spatialData?.dominantFloorColor || preset.palette.floor,
        ceiling: preset.palette.ceiling,
        furniture: preset.palette.furniture,
        accent: preset.palette.accent,
      },
      floorMaterial: preset.floorMaterial,
      placedFurniture: initialFurniture,
      selectedItemId: null,
      budget: currentProject?.budgetAllocated || 500000,
      viewMode: 'top_down',
    };
    setCustomization(defaultState);

    addToast({
      title: 'Design Reset',
      description: 'Restored initial colors and layout without altering room scans.',
      type: 'info',
    });
  };

  const handleSaveDesign = () => {
    if (!currentProject) return;
    setIsSaving(true);

    try {
      const totalCost = customization.placedFurniture
        .filter((item) => item.isVisible !== false)
        .reduce((acc, item) => acc + (item.price || item.estimatedCost || 0), 0);

      updateProject(currentProject.id, {
        roomType: (customization.roomType || currentProject.roomType) as RoomType,
        designStyle: customization.style as DesignStyle,
        budgetAllocated: customization.budget,
        budgetSpent: totalCost,
        status: 'rendered',
        designCustomization: customization,
      });

      addToast({
        title: 'Design Saved Successfully',
        description: `Saved ${customization.placedFurniture.length} furniture placements, ${customization.style.toUpperCase()} style, and custom surface palette.`,
        type: 'success',
      });
    } catch (e: any) {
      addToast({
        title: 'Save Failed',
        description: e?.message || 'Could not save project.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const workflowSteps = [
    { num: 1, title: 'Analyze', path: '/camera' },
    { num: 2, title: 'Room Type', path: '/studio' },
    { num: 3, title: 'Style', path: '/studio' },
    { num: 4, title: 'Colors', path: '/studio' },
    { num: 5, title: 'Furniture', path: '/studio' },
    { num: 6, title: 'Layout', path: '/studio' },
    { num: 7, title: 'Preview', path: '/studio' },
    { num: 8, title: 'Budget', path: '/studio' },
    { num: 9, title: 'Save', path: '/studio' },
  ];

  const hasScan = Boolean(customization.scanImage || currentProject?.scanImage);

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-softBorder pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200 shadow-warm-xs">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
                <span>Design Studio</span>
                {hasScan && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-terracotta-600" />
                    <span>Analyzed from your room scan</span>
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
                Dynamic 2D/3D visualization generated directly from your room scan.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Action Buttons Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setShowEditScanModal(true)}
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<Sliders className="w-3.5 h-3.5 text-terracotta-600" />}
          >
            Edit Scan
          </Button>

          <Button
            onClick={() => setShowCompareStylesModal(true)}
            variant="outline"
            size="sm"
            className="text-xs border-amber-200 text-amber-900 bg-amber-50/80 hover:bg-amber-100 font-semibold"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-terracotta-600" />}
          >
            Compare Styles
          </Button>

          <Button
            onClick={() => setShowPlanningTools(!showPlanningTools)}
            variant="outline"
            size="sm"
            className="text-xs border-sage-200 text-sage-900 bg-sage-50/80 hover:bg-sage-100 font-semibold"
            leftIcon={<Ruler className="w-3.5 h-3.5 text-sage-600" />}
          >
            Planning Tools
          </Button>

          <Button
            onClick={() => setShowAssistantModal(true)}
            variant="outline"
            size="sm"
            className="text-xs border-purple-200 text-purple-800 bg-purple-50/80 hover:bg-purple-100 font-semibold"
            leftIcon={<Bot className="w-3.5 h-3.5 text-purple-600" />}
          >
            SmartSpace Assistant
          </Button>

          <Button
            onClick={handleFindPerfectColors}
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<Palette className="w-3.5 h-3.5 text-sage-600" />}
          >
            Find Perfect Colors
          </Button>

          <Button
            onClick={handleFitMyBudget}
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<DollarSign className="w-3.5 h-3.5 text-sand-700" />}
          >
            Fit My Budget
          </Button>

          <Button
            onClick={() => setShowMoodboardModal(true)}
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
          >
            Moodboard
          </Button>

          <Button
            onClick={() => setShowReportModal(true)}
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Design Report
          </Button>
        </div>
      </div>

      {/* 9-Step User Guidance Stepper Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-softBorder shadow-warm-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] text-xs">
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {step.num}
                </span>
                <span className="font-semibold text-charcoal-800">{step.title}</span>
              </div>
              {idx < workflowSteps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-charcoal-300 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Planning Tools Section (Collapsible) */}
      {showPlanningTools && (
        <PlanningTools
          customization={customization}
          roomDimensions={roomDimensions}
          onChangeCustomization={handleChangeCustomization}
        />
      )}

      {/* Main Studio 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Room Design Customization Suite */}
        <div className="lg:col-span-5 space-y-4">
          <RoomDesignPanel
            customization={customization}
            onChangeCustomization={handleChangeCustomization}
            roomDimensions={roomDimensions}
            onUpdateDimensions={handleUpdateDimensions}
            onGenerateDesignPlan={handleGenerateDesignPlan}
            isGeneratingPlan={isGeneratingPlan}
            onResetDesign={handleResetDesign}
            onSaveDesign={handleSaveDesign}
            isSaving={isSaving}
            detectedObjectsCount={currentProject?.detectedObjects?.length || currentProject?.spatialData?.objectsCount || 0}
          />
        </div>

        {/* Right Column: Live Interactive 2D Floor Plan & 3D Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <BeforeAfterSlider scanImage={customization.scanImage || currentProject?.scanImage || null}>
            <InteractiveRoom3D
              roomTitle={currentProject?.title || 'Interactive Room Design'}
              roomDimensions={roomDimensions}
              scanImage={customization.scanImage || currentProject?.scanImage || null}
              customColors={customization.colors}
              customStyle={customization.style}
              floorMaterial={customization.floorMaterial}
              placedFurniture={customization.placedFurniture}
              selectedFurnitureId={customization.selectedItemId}
              onSelectFurniture={(id) => handleChangeCustomization({ selectedItemId: id })}
              isCalibrated={Boolean(currentProject?.spatialData)}
            />
          </BeforeAfterSlider>
        </div>
      </div>

      {/* Modals */}
      {showCompareStylesModal && (
        <StyleCompareModal
          customization={customization}
          onChangeCustomization={handleChangeCustomization}
          onClose={() => setShowCompareStylesModal(false)}
        />
      )}

      {showEditScanModal && (
        <EditScanModal
          roomDimensions={roomDimensions}
          onUpdateDimensions={handleUpdateDimensions}
          placedFurniture={customization.placedFurniture}
          onUpdateFurniture={(updated) => handleChangeCustomization({ placedFurniture: updated })}
          onClose={() => setShowEditScanModal(false)}
        />
      )}

      {showAlternativesModal && (
        <DesignAlternatives
          currentStyle={customization.style}
          currentBudget={customization.budget}
          onSelectDesign={(varItem: DesignVariation) => {
            const preset = STYLE_PRESETS[varItem.style] || STYLE_PRESETS.modern;
            setCustomization((prev) => ({
              ...prev,
              style: varItem.style,
              colors: {
                ...prev.colors,
                wall: varItem.wallColor,
                floor: varItem.floorColor,
                accent: varItem.accentColor,
              },
            }));
            addToast({
              title: `Applied ${varItem.name}`,
              description: `Updated surface palette and style theme to ${varItem.style.toUpperCase()}.`,
              type: 'success',
            });
          }}
          onClose={() => setShowAlternativesModal(false)}
        />
      )}

      {showAssistantModal && (
        <AIDesignerAssistant
          customization={customization}
          onChangeCustomization={handleChangeCustomization}
          onClose={() => setShowAssistantModal(false)}
        />
      )}

      {showReportModal && (
        <DesignReportModal
          project={currentProject}
          customization={customization}
          roomDimensions={roomDimensions}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showMoodboardModal && (
        <MoodboardModal
          customization={customization}
          onClose={() => setShowMoodboardModal(false)}
        />
      )}
    </div>
  );
};

