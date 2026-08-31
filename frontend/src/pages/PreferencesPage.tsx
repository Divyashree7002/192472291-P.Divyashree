import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { StyleSelector } from '../components/preferences/StyleSelector';
import { ColorPalettePicker } from '../components/preferences/ColorPalettePicker';
import { LifestyleToggleGroup } from '../components/preferences/LifestyleToggleGroup';
import { Slider } from '../components/ui/Slider';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  Sliders,
  Palette,
  IndianRupee,
  HeartHandshake,
  RotateCcw,
  Save,
  CheckCircle2,
  Users,
  Target,
  Shield,
  Armchair,
  Plus,
  Trash2,
  Check,
  ArrowRight
} from 'lucide-react';
import {
  UserPreferences,
  DesignGoal,
  SpaceUser,
  StoragePreference,
  MaintenanceLevel,
  SpacePriority,
  AccessibilityRequirement,
  PreservedFurnitureItem
} from '../types';

export const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, savePreferences, resetPreferences } = usePreferences();
  const { activeProject, updateProject } = useProjects();
  const { addToast } = useToast();

  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  // New Preserved Furniture Form State
  const [newFurnitureName, setNewFurnitureName] = useState('');
  const [newFurnitureCategory, setNewFurnitureCategory] = useState('seating');
  const [newFurnitureDimensions, setNewFurnitureDimensions] = useState('');
  const [newFurnitureNotes, setNewFurnitureNotes] = useState('');
  const [showAddFurniture, setShowAddFurniture] = useState(false);

  const handleFieldChange = <K extends keyof UserPreferences>(field: K, value: UserPreferences[K]) => {
    setLocalPrefs((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    savePreferences(localPrefs);
    if (activeProject && localPrefs.preferredStyles?.length) {
      updateProject(activeProject.id, {
        designStyle: localPrefs.preferredStyles[0],
        budgetAllocated: localPrefs.budget?.max || activeProject.budgetAllocated,
      });
    }
    setHasChanges(false);
  };

  const handleSaveAndGenerate = () => {
    savePreferences(localPrefs);
    if (activeProject && localPrefs.preferredStyles?.length) {
      updateProject(activeProject.id, {
        designStyle: localPrefs.preferredStyles[0],
        budgetAllocated: localPrefs.budget?.max || activeProject.budgetAllocated,
      });
    }
    setHasChanges(false);
    navigate('/recommendations');
  };

  const handleReset = () => {
    resetPreferences();
    setLocalPrefs(preferences);
    setHasChanges(false);
  };

  const toggleSpaceUser = (user: SpaceUser) => {
    const current = localPrefs.spaceUsers || [];
    if (current.includes(user)) {
      if (current.length > 1) {
        handleFieldChange('spaceUsers', current.filter((u) => u !== user));
      }
    } else {
      handleFieldChange('spaceUsers', [...current, user]);
    }
  };

  const toggleSpacePriority = (priority: SpacePriority) => {
    const current = localPrefs.spacePriorities || [];
    if (current.includes(priority)) {
      if (current.length > 1) {
        handleFieldChange('spacePriorities', current.filter((p) => p !== priority));
      }
    } else {
      handleFieldChange('spacePriorities', [...current, priority]);
    }
  };

  const toggleAccessibility = (req: AccessibilityRequirement) => {
    const current = localPrefs.accessibility || [];
    if (current.includes(req)) {
      if (current.length > 1) {
        handleFieldChange('accessibility', current.filter((r) => r !== req));
      }
    } else {
      handleFieldChange('accessibility', [...current, req]);
    }
  };

  const handleAddPreservedFurniture = () => {
    if (!newFurnitureName.trim()) {
      addToast({
        title: 'Item Name Required',
        description: 'Please specify the name of the furniture piece to preserve.',
        type: 'warning',
      });
      return;
    }

    const newItem: PreservedFurnitureItem = {
      id: `pf-${Date.now()}`,
      name: newFurnitureName.trim(),
      category: newFurnitureCategory,
      dimensions: newFurnitureDimensions.trim() || undefined,
      notes: newFurnitureNotes.trim() || undefined,
    };

    handleFieldChange('preservedFurniture', [...(localPrefs.preservedFurniture || []), newItem]);
    setNewFurnitureName('');
    setNewFurnitureDimensions('');
    setNewFurnitureNotes('');
    setShowAddFurniture(false);

    addToast({
      title: 'Preserved Piece Added',
      description: `"${newItem.name}" locked into spatial design layout constraints.`,
      type: 'success',
    });
  };

  const handleRemovePreservedFurniture = (id: string) => {
    handleFieldChange(
      'preservedFurniture',
      (localPrefs.preservedFurniture || []).filter((f) => f.id !== id)
    );
  };

  const designGoals: { id: DesignGoal; title: string; desc: string }[] = [
    { id: 'my_home', title: 'My Home', desc: 'Personal living space optimization & comfort' },
    { id: 'new_apartment', title: 'New Apartment', desc: 'Fresh layout planning for newly acquired flat' },
    { id: 'rental_property', title: 'Rental Property', desc: 'Non-invasive, tenant-friendly modular decor' },
    { id: 'interior_design_project', title: 'Interior Design Project', desc: 'Professional design staging & proposal' },
    { id: 'building_elevation', title: 'Building Elevation', desc: 'Exterior facade & architectural visualization' },
    { id: 'furniture_planning', title: 'Furniture Planning', desc: 'Clearance checking for specific furniture suites' },
    { id: 'property_visualization', title: 'Property Visualization', desc: 'Real-estate staging & marketing showcase' },
  ];

  const spaceUserOptions: { id: SpaceUser; label: string }[] = [
    { id: 'individual', label: 'Individual' },
    { id: 'couple', label: 'Couple' },
    { id: 'family', label: 'Family' },
    { id: 'children', label: 'Children' },
    { id: 'elderly', label: 'Elderly' },
    { id: 'accessibility_focused', label: 'Accessibility-focused' },
    { id: 'pet_owner', label: 'Pet owner' },
  ];

  const spacePriorityOptions: { id: SpacePriority; label: string; desc: string }[] = [
    { id: 'open_space', label: 'Open space', desc: 'Max continuous floor area & minimal clutter' },
    { id: 'storage', label: 'Storage', desc: 'High-capacity built-ins & concealed shelving' },
    { id: 'comfort', label: 'Comfort', desc: 'Plush seating ergonomics & soft textures' },
    { id: 'aesthetics', label: 'Aesthetics', desc: 'Focal point symmetry & sculptural accents' },
    { id: 'functionality', label: 'Functionality', desc: 'Multi-purpose modular utility & durability' },
  ];

  const accessibilityOptions: { id: AccessibilityRequirement; label: string; desc: string }[] = [
    { id: 'standard', label: 'Standard Code', desc: 'General building clearance standards' },
    { id: 'elderly_friendly', label: 'Elderly-friendly', desc: 'Wide non-slip paths, zero floor transitions' },
    { id: 'wheelchair_friendly', label: 'Wheelchair-friendly', desc: 'ADA 1.2m+ corridors & 1.5m turn radius' },
    { id: 'child_friendly', label: 'Child-friendly', desc: 'Rounded edges, anti-tip furniture anchors' },
    { id: 'pet_friendly', label: 'Pet-friendly', desc: 'Claw-resistant fabrics & washable rugs' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Personalization & Preference Profile
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Configure your design goals, household occupants, style tastes, and budget limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            variant="secondary"
            size="sm"
            disabled={!hasChanges}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Preferences
          </Button>
          <Button
            onClick={handleSaveAndGenerate}
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="shadow-terracotta font-semibold"
          >
            Apply & Generate Recommendations
          </Button>
        </div>
      </div>


      {/* Storage Architecture Notice */}
      <Alert variant="info">
        <span className="font-bold text-charcoal-900 block mb-0.5">Local Storage Persistence</span>
        Your preference profile is persisted securely in your browser <code className="text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-1 py-0.5 rounded font-mono">localStorage</code> and synced with your active design sessions.
      </Alert>

      {/* Section 1: Design Goal Selection */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-terracotta-100 text-terracotta-700">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">What is your primary design goal?</h3>
              <p className="text-xs text-charcoal-500">Select the context that best fits your current project.</p>
            </div>
          </div>
          <Badge variant="terracotta" size="sm">
            {designGoals.find((g) => g.id === localPrefs.designGoal)?.title}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {designGoals.map((g) => {
            const isSelected = localPrefs.designGoal === g.id;
            return (
              <div
                key={g.id}
                onClick={() => handleFieldChange('designGoal', g.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-terracotta-50/80 border-terracotta-400 ring-1 ring-terracotta-300 shadow-warm-md'
                    : 'bg-[#FCFBF9] border-softBorder hover:border-softBorder-dark hover:bg-white shadow-warm-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-bold text-charcoal-900">{g.title}</h4>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-terracotta-500 flex items-center justify-center text-white text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-charcoal-600 leading-relaxed font-medium">{g.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Who will use the space? */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sage-100 text-sage-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Who will use the space?</h3>
              <p className="text-xs text-charcoal-500">Select all household members or occupants who will utilize this room.</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-charcoal-600 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-softBorder">
            {localPrefs.spaceUsers?.length || 0} Selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {spaceUserOptions.map((opt) => {
            const isSelected = (localPrefs.spaceUsers || []).includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleSpaceUser(opt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-sage-600 text-white border-sage-700 shadow-sage'
                    : 'bg-[#FAF7F2] text-charcoal-700 border-softBorder hover:border-softBorder-dark hover:bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Visual Design Style */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sand-100 text-sand-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Preferred Design Styles</h3>
              <p className="text-xs text-charcoal-500">Select one or more aesthetic themes to guide furniture and finish curation.</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-charcoal-600 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-softBorder">
            {localPrefs.preferredStyles.length} Selected
          </span>
        </div>

        <StyleSelector
          selectedStyles={localPrefs.preferredStyles}
          onChange={(styles) => handleFieldChange('preferredStyles', styles)}
        />
      </div>

      {/* Section 4: Color Palette Harmonization */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-terracotta-100 text-terracotta-700">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Color Palette Harmonies</h3>
              <p className="text-xs text-charcoal-500">Curated earth-tone color palettes used for wall paints and textiles.</p>
            </div>
          </div>
        </div>

        <ColorPalettePicker
          selectedColors={localPrefs.preferredColors}
          onChange={(colors) => handleFieldChange('preferredColors', colors)}
        />
      </div>

      {/* Section 5: Budget Range & Optimization */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-5">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sand-100 text-sand-800">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Budget Range & Optimization Parameters</h3>
              <p className="text-xs text-charcoal-500">Set the target expenditure ceiling and flexibility margin.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <Slider
            label="Maximum Target Budget (INR)"
            min={50000}
            max={2500000}
            step={25000}
            value={localPrefs.budget.max}
            valuePrefix="₹"
            onChangeValue={(val) =>
              handleFieldChange('budget', { ...localPrefs.budget, max: val })
            }
          />

          <Select
            label="Budget Flexibility Strategy"
            value={localPrefs.budget.flexibility}
            onChange={(e) =>
              handleFieldChange('budget', {
                ...localPrefs.budget,
                flexibility: e.target.value as UserPreferences['budget']['flexibility'],
              })
            }
            options={[
              { value: 'strict', label: 'Strict Ceiling (Never exceed budget)' },
              { value: 'moderate', label: 'Moderate Flexibility (Up to +10% for high value)' },
              { value: 'flexible', label: 'Flexible (Prioritize best aesthetic match)' },
            ]}
          />
        </div>
      </div>

      {/* Section 6: Space Priorities */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF6F0] text-charcoal-700">
              <Sliders className="w-4 h-4 text-terracotta-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Space Priorities</h3>
              <p className="text-xs text-charcoal-500">Rank what matters most for your layout satisfaction.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {spacePriorityOptions.map((p) => {
            const isSelected = (localPrefs.spacePriorities || []).includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleSpacePriority(p.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-terracotta-50/80 border-terracotta-400 ring-1 ring-terracotta-300 shadow-warm-sm'
                    : 'bg-[#FCFBF9] border-softBorder hover:border-softBorder-dark hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-charcoal-900">{p.label}</h4>
                  {isSelected && <Check className="w-3.5 h-3.5 text-terracotta-600 stroke-[3]" />}
                </div>
                <p className="text-[10px] text-charcoal-500 font-medium leading-normal">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 7: Lifestyle Factors */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF6F0] text-charcoal-700">
              <HeartHandshake className="w-4 h-4 text-terracotta-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Lifestyle & Practical Ergonomics</h3>
              <p className="text-xs text-charcoal-500">Fine-tune material durability, safety, and acoustic priorities.</p>
            </div>
          </div>
        </div>

        <LifestyleToggleGroup
          lifestyle={localPrefs.lifestyle}
          onChange={(lifestyle) => handleFieldChange('lifestyle', lifestyle)}
        />
      </div>

      {/* Section 8: Maintenance & Accessibility Standards */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-5">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sage-100 text-sage-700">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Maintenance & Accessibility Requirements</h3>
              <p className="text-xs text-charcoal-500">Cleaning effort, storage capacity, and clearance accessibility rules.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Storage Capacity Requirement"
            value={localPrefs.storagePreference}
            onChange={(e) =>
              handleFieldChange('storagePreference', e.target.value as StoragePreference)
            }
            options={[
              { value: 'minimal', label: 'Minimal (Clean, airy open spaces)' },
              { value: 'balanced', label: 'Balanced (Standard storage and display)' },
              { value: 'maximal', label: 'Maximal (High-capacity built-ins and credenzas)' },
            ]}
          />

          <Select
            label="Maintenance Effort Level"
            value={localPrefs.maintenanceLevel}
            onChange={(e) =>
              handleFieldChange('maintenanceLevel', e.target.value as MaintenanceLevel)
            }
            options={[
              { value: 'low', label: 'Low Maintenance (Stain-resistant, easy clean)' },
              { value: 'moderate', label: 'Moderate Maintenance (Standard natural materials)' },
              { value: 'high', label: 'High Maintenance (Delicate raw marble, silk weaves)' },
            ]}
          />
        </div>

        {/* Accessibility Tag Group */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-charcoal-700 mb-2">
            Accessibility Standards & Clearances
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {accessibilityOptions.map((acc) => {
              const isSelected = (localPrefs.accessibility || []).includes(acc.id);
              return (
                <div
                  key={acc.id}
                  onClick={() => toggleAccessibility(acc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sage-50 border-sage-400 ring-1 ring-sage-300 shadow-warm-sm'
                      : 'bg-[#FCFBF9] border-softBorder hover:border-softBorder-dark'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-charcoal-900">{acc.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sage-700 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-charcoal-500 font-medium">{acc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 9: Preserved Existing Furniture */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-terracotta-100 text-terracotta-700">
              <Armchair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Existing Furniture to Preserve</h3>
              <p className="text-xs text-charcoal-500">
                Treasured heirloom pieces or existing fixtures that must be preserved in layout generations.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddFurniture(!showAddFurniture)}
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Piece
          </Button>
        </div>

        {/* Add Furniture Form */}
        {showAddFurniture && (
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-softBorder space-y-3 animate-fade-in">
            <h4 className="text-xs font-bold text-charcoal-900">New Preserved Furniture Piece</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Piece Name"
                placeholder="e.g., Teak Dining Table"
                value={newFurnitureName}
                onChange={(e) => setNewFurnitureName(e.target.value)}
              />
              <Select
                label="Category"
                value={newFurnitureCategory}
                onChange={(e) => setNewFurnitureCategory(e.target.value)}
                options={[
                  { value: 'seating', label: 'Seating' },
                  { value: 'tables', label: 'Table / Desk' },
                  { value: 'storage', label: 'Storage / Credenza' },
                  { value: 'beds', label: 'Bed' },
                  { value: 'decor', label: 'Artwork / Mirror' },
                ]}
              />
              <Input
                label="Dimensions (W × D cm)"
                placeholder="e.g., 180 × 90 cm"
                value={newFurnitureDimensions}
                onChange={(e) => setNewFurnitureDimensions(e.target.value)}
              />
            </div>
            <Input
              label="Preservation Notes / Placement Constraints"
              placeholder="e.g., Keep centered on north wall with 1m clearance"
              value={newFurnitureNotes}
              onChange={(e) => setNewFurnitureNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button onClick={() => setShowAddFurniture(false)} variant="ghost" size="sm">
                Cancel
              </Button>
              <Button onClick={handleAddPreservedFurniture} variant="primary" size="sm">
                Save Piece
              </Button>
            </div>
          </div>
        )}

        {/* Preserved Furniture List */}
        <div className="space-y-2.5">
          {(localPrefs.preservedFurniture || []).length > 0 ? (
            (localPrefs.preservedFurniture || []).map((piece) => (
              <div
                key={piece.id}
                className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder flex items-start justify-between gap-3 shadow-warm-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-900">{piece.name}</span>
                    <Badge variant="terracotta" size="sm">{piece.category}</Badge>
                    {piece.dimensions && (
                      <span className="text-[11px] font-mono text-charcoal-500 font-medium">{piece.dimensions}</span>
                    )}
                  </div>
                  {piece.notes && (
                    <p className="text-[11px] text-charcoal-500 mt-1 font-medium">{piece.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemovePreservedFurniture(piece.id)}
                  className="text-charcoal-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                  title="Remove preserved piece"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-charcoal-500 italic py-2">
              No existing furniture pieces registered yet. Click &quot;Add Piece&quot; to lock existing furniture into spatial plans.
            </p>
          )}
        </div>
      </div>

      {/* Floating Save Footer when Modified */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-terracotta-300 shadow-warm-xl flex items-center gap-4 animate-slide-up">
          <div className="flex items-center gap-2 text-xs text-charcoal-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-terracotta-600" />
            <span>You have unsaved preference changes</span>
          </div>
          <Button onClick={handleSave} variant="primary" size="sm" className="shadow-terracotta">
            Save Preferences
          </Button>
        </div>
      )}
    </div>
  );
};
