import React from 'react';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { UserPreferences } from '../../types';

interface LifestyleToggleGroupProps {
  lifestyle: UserPreferences['lifestyle'];
  onChange: (lifestyle: UserPreferences['lifestyle']) => void;
}

export const LifestyleToggleGroup: React.FC<LifestyleToggleGroupProps> = ({
  lifestyle,
  onChange,
}) => {
  const updateField = (field: keyof UserPreferences['lifestyle'], val: boolean) => {
    onChange({ ...lifestyle, [field]: val });
  };

  return (
    <div className="divide-y divide-softBorder">
      <ToggleSwitch
        label="Work from home"
        description="Allocates acoustic isolation zones, task lighting paths, and ergonomic desk postures."
        checked={lifestyle.workFromHome}
        onChange={(checked) => updateField('workFromHome', checked)}
      />
      <ToggleSwitch
        label="Entertaining & Socializing"
        description="Optimizes wide conversational seating clusters and flexible modular cocktail/coffee tables."
        checked={lifestyle.entertaining}
        onChange={(checked) => updateField('entertaining', checked)}
      />
      <ToggleSwitch
        label="Relaxation & Quiet Living"
        description="Prioritizes deep lounge seating, warm indirect lighting, and clutter-free sightlines."
        checked={lifestyle.relaxation}
        onChange={(checked) => updateField('relaxation', checked)}
      />
      <ToggleSwitch
        label="Family Living"
        description="High-traffic durable surfaces, generous central play/gathering area, and multi-user seating."
        checked={lifestyle.familyLiving}
        onChange={(checked) => updateField('familyLiving', checked)}
      />
      <ToggleSwitch
        label="Study-Focused"
        description="Dedicated reading nooks, focused ambient lighting, and integrated bookshelf clearances."
        checked={lifestyle.studyFocused}
        onChange={(checked) => updateField('studyFocused', checked)}
      />
      <ToggleSwitch
        label="Storage-Focused"
        description="Maximizes vertical wall storage, concealed credenzas, and integrated cabinetry."
        checked={lifestyle.storageFocused}
        onChange={(checked) => updateField('storageFocused', checked)}
      />
      <ToggleSwitch
        label="Pet-Friendly Considerations"
        description="Selects scratch-resistant, stain-treated fabrics and avoids delicate floor rugs."
        checked={!!lifestyle.hasPets}
        onChange={(checked) => updateField('hasPets', checked)}
      />
      <ToggleSwitch
        label="Child-Friendly Safety"
        description="Favors rounded furniture corners, non-toxic finishes, and secure heavy item anchoring."
        checked={!!lifestyle.hasKids}
        onChange={(checked) => updateField('hasKids', checked)}
      />
    </div>
  );
};
