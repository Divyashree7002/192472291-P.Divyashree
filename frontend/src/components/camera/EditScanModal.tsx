import React, { useState } from 'react';
import { Sliders, CheckCircle2, Trash2, Edit2, Plus, X, AlertTriangle, Ruler, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { PlacedFurnitureItem } from '../../types';

interface EditScanModalProps {
  roomDimensions: { length: number; width: number; height: number; isEstimated?: boolean; confidence?: number };
  onUpdateDimensions: (dims: { length: number; width: number; height: number }) => void;
  placedFurniture: PlacedFurnitureItem[];
  onUpdateFurniture: (updated: PlacedFurnitureItem[]) => void;
  onClose: () => void;
}

export const EditScanModal: React.FC<EditScanModalProps> = ({
  roomDimensions,
  onUpdateDimensions,
  placedFurniture,
  onUpdateFurniture,
  onClose,
}) => {
  const [length, setLength] = useState<number>(roomDimensions.length || 4.8);
  const [width, setWidth] = useState<number>(roomDimensions.width || 3.6);
  const [height, setHeight] = useState<number>(roomDimensions.height || 2.8);

  const [knownWallLength, setKnownWallLength] = useState<string>('');
  const [items, setItems] = useState<PlacedFurnitureItem[]>(placedFurniture);
  const [showAddObjectForm, setShowAddObjectForm] = useState(false);

  // New object form fields
  const [newObjClass, setNewObjClass] = useState<string>('table');
  const [newObjName, setNewObjName] = useState<string>('Custom Table');
  const [newObjWidth, setNewObjWidth] = useState<number>(1.2);
  const [newObjDepth, setNewObjDepth] = useState<number>(0.8);
  const [newObjHeight, setNewObjHeight] = useState<number>(0.75);

  const handleCalibrateKnownLength = () => {
    const val = parseFloat(knownWallLength);
    if (!isNaN(val) && val > 0) {
      const scaleRatio = val / length;
      setLength(roundVal(val));
      setWidth(roundVal(width * scaleRatio));
      setHeight(roundVal(height));
    }
  };

  const roundVal = (v: number) => Math.round(v * 100) / 100;

  const handleSaveDimensions = () => {
    onUpdateDimensions({ length, width, height });
    onUpdateFurniture(items);
    onClose();
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleConfirmItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, confidenceLevel: 'High' } : i))
    );
  };

  const handleRenameItem = (id: string, newName: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name: newName } : i)));
  };

  const handleAddObject = () => {
    const newItem: PlacedFurnitureItem = {
      id: `custom-add-${Date.now()}`,
      name: newObjName || newObjClass,
      category: 'furniture',
      dimensions: {
        widthCm: Math.round(newObjWidth * 100),
        depthCm: Math.round(newObjDepth * 100),
        heightCm: Math.round(newObjHeight * 100),
      },
      position: { x: 0, y: newObjHeight / 2, z: 1.5 },
      rotationY: 0,
      scale: 1.0,
      isVisible: true,
      isCustomAdded: true,
      source: 'custom',
      confidence: 1.0,
      confidenceLevel: 'High',
    };

    setItems((prev) => [...prev, newItem]);
    setShowAddObjectForm(false);
    setNewObjName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-softBorder shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-softBorder pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                Edit Detections & Calibration
              </h3>
              <p className="text-xs text-charcoal-500">
                Confirm, correct, or add furniture manually with source tracking.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Room Dimensions Calibration */}
        <div className="p-4 rounded-2xl bg-warmWhite border border-softBorder space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-800 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-terracotta-600" />
              <span>Estimated Room Dimensions</span>
            </h4>
            <Badge variant="sand" size="sm">
              {knownWallLength ? 'User Calibrated' : 'AI Estimated'}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Length (m)"
              type="number"
              step="0.1"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Width (m)"
              type="number"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Height (m)"
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Improve Measurement Accuracy */}
          <div className="pt-2 border-t border-softBorder space-y-2">
            <span className="text-xs font-bold text-charcoal-700 block">Improve Measurement Accuracy</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                placeholder="Known Wall Length (meters)"
                value={knownWallLength}
                onChange={(e) => setKnownWallLength(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-softBorder text-xs text-charcoal-800 bg-white"
              />
              <Button
                onClick={handleCalibrateKnownLength}
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
              >
                Calibrate Scale
              </Button>
            </div>
          </div>
        </div>

        {/* Section 2: Detected Objects Review */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-800">
              Objects Detected in Your Room ({items.length})
            </h4>
            <Button
              onClick={() => setShowAddObjectForm(!showAddObjectForm)}
              variant="outline"
              size="sm"
              className="text-xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Add Missing Object
            </Button>
          </div>

          {/* Inline Add Object Form */}
          {showAddObjectForm && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 animate-fade-in">
              <span className="text-xs font-bold text-amber-900 block">Add Custom Furniture Piece</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-charcoal-600 block">Class</label>
                  <select
                    value={newObjClass}
                    onChange={(e) => {
                      setNewObjClass(e.target.value);
                      setNewObjName(`Custom ${e.target.value.replace('_', ' ')}`);
                    }}
                    className="w-full px-2 py-1.5 rounded-xl border border-softBorder text-xs bg-white text-charcoal-800"
                  >
                    <option value="table">Table</option>
                    <option value="sofa">Sofa</option>
                    <option value="chair">Chair</option>
                    <option value="bed">Bed</option>
                    <option value="wardrobe">Wardrobe</option>
                    <option value="cabinet">Cabinet</option>
                    <option value="bookshelf">Bookshelf</option>
                    <option value="television">TV</option>
                    <option value="door">Door</option>
                    <option value="window">Window</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-charcoal-600 block">Name</label>
                  <input
                    type="text"
                    value={newObjName}
                    onChange={(e) => setNewObjName(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-softBorder text-xs bg-white text-charcoal-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-charcoal-600 block">Width (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newObjWidth}
                    onChange={(e) => setNewObjWidth(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl border border-softBorder text-xs bg-white text-charcoal-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-charcoal-600 block">Depth (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newObjDepth}
                    onChange={(e) => setNewObjDepth(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl border border-softBorder text-xs bg-white text-charcoal-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowAddObjectForm(false)} variant="ghost" size="sm" className="text-xs">
                  Cancel
                </Button>
                <Button onClick={handleAddObject} variant="primary" size="sm" className="text-xs">
                  Add Object (source="custom")
                </Button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="p-4 rounded-2xl bg-warmWhite border border-softBorder text-center text-xs text-charcoal-500">
              No furniture detected from scan. Click "+ Add Missing Object" to add custom furniture.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item, idx) => {
                const conf = Math.round((item.confidence || 0.82) * 100);
                const isCustom = item.source === 'custom' || item.isCustomAdded;
                return (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-warmWhite border border-softBorder flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1 truncate">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${isCustom ? 'text-amber-600' : 'text-sage-600'}`}
                      />
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleRenameItem(item.id, e.target.value)}
                        className="font-bold text-charcoal-900 bg-transparent border-b border-transparent hover:border-softBorder focus:border-terracotta-400 focus:outline-none truncate px-1 py-0.5"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          isCustom
                            ? 'bg-amber-100 text-amber-900'
                            : conf >= 80
                            ? 'bg-sage-100 text-sage-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isCustom ? 'source: custom' : `${conf}% confidence`}
                      </span>

                      <button
                        onClick={() => handleConfirmItem(item.id)}
                        className="p-1 rounded-lg text-sage-700 hover:bg-sage-100 text-[10px] font-semibold"
                      >
                        Confirm
                      </button>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove Object"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-softBorder">
          <Button onClick={onClose} variant="outline" size="sm" className="text-xs">
            Cancel
          </Button>
          <Button onClick={handleSaveDimensions} variant="primary" size="sm" className="text-xs shadow-terracotta font-semibold">
            Save Detections & Calibration
          </Button>
        </div>
      </div>
    </div>
  );
};
