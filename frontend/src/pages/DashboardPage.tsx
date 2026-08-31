import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  Sparkles,
  Palette,
  FolderOpen,
  Bot,
  Sliders,
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Project } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setActiveProject } = useProjects();
  const { user } = useAuth();

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    navigate('/studio');
  };

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cream-100 via-[#FAF7F2] to-sand-100 border border-softBorder shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-terracotta-100 text-terracotta-700 text-xs font-bold uppercase tracking-wider border border-terracotta-200">
              Welcome to SmartSpace AI 👋
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight mt-2">
            What would you like to do today?
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1 font-medium">
            Scan your room, customize layout and furniture, or let AI redesign your home.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/camera">
            <Button
              variant="primary"
              size="lg"
              className="shadow-terracotta font-semibold"
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Scan My Room
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Primary User Action Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-charcoal-900 tracking-tight">
          Homeowner Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1: Scan My Room */}
          <div
            onClick={() => navigate('/camera')}
            className="p-6 rounded-3xl bg-white border border-softBorder hover:border-terracotta-300 hover:shadow-warm-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-warm-xs">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                📐 Scan My Room
              </h3>
              <p className="text-xs text-charcoal-500 mt-1.5 leading-relaxed">
                Capture your room with Quick Scan or Detailed Room Scan.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-terracotta-600 group-hover:translate-x-1 transition-transform">
              <span>Start Scan</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Action 2: Design My Room */}
          <div
            onClick={() => navigate('/studio')}
            className="p-6 rounded-3xl bg-white border border-softBorder hover:border-terracotta-300 hover:shadow-warm-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-700 border border-sage-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-warm-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-charcoal-900 group-hover:text-sage-700 transition-colors">
                ✨ Design My Room
              </h3>
              <p className="text-xs text-charcoal-500 mt-1.5 leading-relaxed">
                Customize 2D floor plans, 3D visualization, colors, and furniture.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-sage-700 group-hover:translate-x-1 transition-transform">
              <span>Open Design Studio</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Action 3: My Projects */}
          <div
            onClick={() => navigate('/history')}
            className="p-6 rounded-3xl bg-white border border-softBorder hover:border-terracotta-300 hover:shadow-warm-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F0EAE1] text-charcoal-700 border border-[#DDD4C7] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-warm-xs">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                📂 My Projects
              </h3>
              <p className="text-xs text-charcoal-500 mt-1.5 leading-relaxed">
                View saved room designs, scan history, and custom plans.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-charcoal-700 group-hover:translate-x-1 transition-transform">
              <span>Saved Projects ({projects.length})</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Action 4: Renovation Planner */}
          <div
            onClick={() => navigate('/renovation')}
            className="p-6 rounded-3xl bg-white border border-softBorder hover:border-terracotta-300 hover:shadow-warm-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-warm-xs">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-charcoal-900 group-hover:text-amber-700 transition-colors">
                🔨 Renovation Planner
              </h3>
              <p className="text-xs text-charcoal-500 mt-1.5 leading-relaxed">
                Calculate estimated wall paint liters, flooring area, and costs in ₹ (INR).
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>Plan Renovation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Action 5: Budget Planner */}
          <div
            onClick={() => navigate('/recommendations')}
            className="p-6 rounded-3xl bg-white border border-softBorder hover:border-terracotta-300 hover:shadow-warm-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EAF2EC] text-sage-800 border border-[#C5DAC9] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-warm-xs">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-charcoal-900 group-hover:text-sage-800 transition-colors">
                💰 Budget Planner
              </h3>
              <p className="text-xs text-charcoal-500 mt-1.5 leading-relaxed">
                Optimize staged furniture sets and stay within your target budget in ₹ (INR).
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-sage-800 group-hover:translate-x-1 transition-transform">
              <span>Optimize Budget</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Action 6: Whole Home Overview */}
          <div
            onClick={() => navigate('/home-planning')}
            className="p-6 rounded-3xl bg-white border border-softBorder hover:border-terracotta-300 hover:shadow-warm-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-warm-xs">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-charcoal-900 group-hover:text-purple-700 transition-colors">
                🏠 Whole Home Overview
              </h3>
              <p className="text-xs text-charcoal-500 mt-1.5 leading-relaxed">
                Multi-room overview for building, renovating, or redesigning an entire home.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
              <span>View Home Overview</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Saved Designs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-charcoal-900 tracking-tight">Recent Designs</h2>
            <p className="text-xs text-charcoal-500">Pick up right where you left off.</p>
          </div>
          {projects.length > 0 && (
            <Link to="/history" className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1">
              <span>View all ({projects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-softBorder text-center space-y-3 shadow-warm-xs">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 text-charcoal-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-charcoal-900">No room designs saved yet</h3>
            <p className="text-xs text-charcoal-500 max-w-md mx-auto">
              Capture your room image or start fresh in the Design Studio to create and save your personalized interior.
            </p>
            <Link to="/camera">
              <Button variant="primary" size="sm" className="mt-2">
                Scan Your First Room
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map((p) => {
              const roomTypeFormatted = (p.roomType || 'Living Room').replace(/_/g, ' ');
              const styleFormatted = (p.designStyle || 'Modern').toUpperCase();
              const sizeFormatted = p.dimensions
                ? `${p.dimensions.length}m × ${p.dimensions.width}m`
                : '4.2m × 3.5m';

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenProject(p)}
                  className="p-5 rounded-3xl bg-white border border-softBorder hover:border-terracotta-300 hover:shadow-warm-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-[#FAF7F2] border border-softBorder flex items-center justify-center">
                      {p.scanImage ? (
                        <img
                          src={p.scanImage}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Layers className="w-8 h-8 text-terracotta-400 mx-auto mb-1" />
                          <span className="text-[10px] text-charcoal-400 font-medium">3D Design</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="terracotta" size="sm">
                          {styleFormatted}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-terracotta-600 transition-colors capitalize truncate">
                        {p.title || roomTypeFormatted}
                      </h3>
                      <p className="text-[11px] text-charcoal-500 font-mono mt-0.5">
                        Size: {sizeFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-softBorder flex items-center justify-between">
                    <span className="text-[10px] text-charcoal-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{p.status === 'rendered' ? 'Saved' : 'Analyzed'}</span>
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProject(p);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5 font-semibold group-hover:bg-terracotta-50 group-hover:text-terracotta-700 group-hover:border-terracotta-300"
                    >
                      Open Design
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

