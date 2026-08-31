import React, { useState } from 'react';
import { Home, Plus, Trash2, ArrowRight, Layers, Calculator, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/currency';

interface RoomPlanItem {
  id: string;
  name: string;
  roomType: string;
  lengthM: number;
  widthM: number;
  budgetInr: number;
  furnitureCount: number;
}

export const HomePlanningPage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomPlanItem[]>([
    { id: '1', name: 'Master Living Room', roomType: 'living_room', lengthM: 4.8, widthM: 3.6, budgetInr: 250000, furnitureCount: 5 },
    { id: '2', name: 'Primary Bedroom', roomType: 'bedroom', lengthM: 4.2, widthM: 3.5, budgetInr: 180000, furnitureCount: 4 },
    { id: '3', name: 'Modular Kitchen', roomType: 'kitchen', lengthM: 3.6, widthM: 2.8, budgetInr: 300000, furnitureCount: 3 },
    { id: '4', name: 'Home Office / Study', roomType: 'office', lengthM: 3.2, widthM: 2.8, budgetInr: 120000, furnitureCount: 3 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('bedroom');
  const [newLen, setNewLen] = useState(4.0);
  const [newWid, setNewWid] = useState(3.2);
  const [newBudget, setNewBudget] = useState(150000);

  const totalAreaSqm = rooms.reduce((acc, r) => acc + Math.round(r.lengthM * r.widthM * 10) / 10, 0);
  const totalBudgetInr = rooms.reduce((acc, r) => acc + r.budgetInr, 0);
  const totalFurnitureCount = rooms.reduce((acc, r) => acc + r.furnitureCount, 0);

  const handleAddRoom = () => {
    const created: RoomPlanItem = {
      id: `room-${Date.now()}`,
      name: newRoomName || `${newRoomType.replace('_', ' ').toUpperCase()} Plan`,
      roomType: newRoomType,
      lengthM: newLen,
      widthM: newWid,
      budgetInr: newBudget,
      furnitureCount: 3,
    };
    setRooms((prev) => [...prev, created]);
    setShowAddModal(false);
    setNewRoomName('');
  };

  const handleRemoveRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-softBorder pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200">
            <Home className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
              <span>Whole Home Overview & Multi-Room Planner</span>
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Plan, budget, and design multiple rooms across your entire home.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          size="sm"
          className="text-xs shadow-terracotta"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Room to Home Plan
        </Button>
      </div>

      {/* Whole Home Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Total Planned Rooms</span>
          <p className="text-2xl font-mono font-bold text-charcoal-900">{rooms.length} Rooms</p>
          <span className="text-[10px] text-charcoal-400">Living, Bedroom, Kitchen, Office</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Total Floor Area</span>
          <p className="text-2xl font-mono font-bold text-charcoal-900">{Math.round(totalAreaSqm * 10) / 10} sq.m</p>
          <span className="text-[10px] text-charcoal-400">Cumulative house footprint</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Staged Furniture Count</span>
          <p className="text-2xl font-mono font-bold text-charcoal-900">{totalFurnitureCount} Pieces</p>
          <span className="text-[10px] text-charcoal-400">Across all planned rooms</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Total Home Budget</span>
          <p className="text-2xl font-mono font-bold text-terracotta-700">{formatCurrency(totalBudgetInr, 'INR')}</p>
          <span className="text-[10px] text-charcoal-400">Cumulative budget ceiling</span>
        </div>
      </div>

      {/* Multi-Room Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-terracotta-600" />
          <span>Planned Rooms ({rooms.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const roomArea = Math.round(room.lengthM * room.widthM * 10) / 10;
            return (
              <div
                key={room.id}
                className="p-5 rounded-2xl bg-white border border-softBorder shadow-warm-xs hover:shadow-warm-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-terracotta-500" />
                    <h4 className="font-bold text-sm text-charcoal-900">{room.name}</h4>
                  </div>
                  <button
                    onClick={() => handleRemoveRoom(room.id)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs p-3 rounded-xl bg-warmWhite border border-softBorder">
                  <div>
                    <span className="block text-[10px] text-charcoal-400 font-semibold">Dimensions</span>
                    <span className="font-mono font-bold text-charcoal-800">
                      {room.lengthM}m × {room.widthM}m
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-charcoal-400 font-semibold">Floor Area</span>
                    <span className="font-mono font-bold text-charcoal-800">{roomArea} sq.m</span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-charcoal-400 font-semibold">Budget</span>
                    <span className="font-mono font-bold text-terracotta-700">
                      {formatCurrency(room.budgetInr, 'INR')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-softBorder space-y-4">
            <h3 className="text-lg font-bold text-charcoal-900">Add Room to Home Plan</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-charcoal-700 block mb-1">Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. Guest Bedroom"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-xs text-charcoal-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal-700 block mb-1">Room Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-xs text-charcoal-800 bg-white"
                >
                  <option value="living_room">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="dining_room">Dining Room</option>
                  <option value="office">Office / Study</option>
                  <option value="kids_room">Kids Room</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="custom">Other / Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal-700 block mb-1">Length (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLen}
                    onChange={(e) => setNewLen(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-xs text-charcoal-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal-700 block mb-1">Width (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWid}
                    onChange={(e) => setNewWid(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-xs text-charcoal-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal-700 block mb-1">Budget (₹ INR)</label>
                <input
                  type="number"
                  step="10000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-xs text-charcoal-800 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-softBorder">
              <Button onClick={() => setShowAddModal(false)} variant="ghost" size="sm" className="text-xs">
                Cancel
              </Button>
              <Button onClick={handleAddRoom} variant="primary" size="sm" className="text-xs">
                Add Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
