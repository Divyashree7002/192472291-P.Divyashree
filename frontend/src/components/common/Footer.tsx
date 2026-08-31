import React from 'react';
import { Box, Sparkles, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-softBorder bg-[#F4EFEA] text-charcoal-600 text-xs py-14 px-6 sm:px-12 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-terracotta-500 to-sand-400 flex items-center justify-center text-white shadow-warm-sm">
              <Box className="w-4 h-4" />
            </div>
            <span className="text-charcoal-900 font-bold text-sm">SmartSpace AI</span>
          </div>
          <p className="text-charcoal-600 text-xs max-w-md leading-relaxed">
            An Intelligent Live Camera-Based Platform for Context-Aware 3D Elevation Visualization and Personalized Interior Design Recommendations.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-charcoal-500 pt-2 font-mono">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-terracotta-600" />
              <span>FastAPI Backend Ready</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sage-600" />
              <span>Modular CV/ML Architecture</span>
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-charcoal-900 font-bold text-xs tracking-wider uppercase mb-3 font-mono">Platform</h4>
          <ul className="space-y-2 font-medium">
            <li><Link to="/camera" className="hover:text-terracotta-600 transition-colors">Camera Workspace</Link></li>
            <li><Link to="/studio" className="hover:text-terracotta-600 transition-colors">3D Design Studio</Link></li>
            <li><Link to="/recommendations" className="hover:text-terracotta-600 transition-colors">Recommendations</Link></li>
            <li><Link to="/dashboard" className="hover:text-terracotta-600 transition-colors">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-charcoal-900 font-bold text-xs tracking-wider uppercase mb-3 font-mono">Research & Specs</h4>
          <ul className="space-y-2 font-medium">
            <li><Link to="/preferences" className="hover:text-terracotta-600 transition-colors">Preference Engine</Link></li>
            <li><Link to="/settings" className="hover:text-terracotta-600 transition-colors">System Diagnostics</Link></li>
            <li><Link to="/history" className="hover:text-terracotta-600 transition-colors">Project History</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-softBorder-dark flex flex-col sm:flex-row items-center justify-between gap-4 text-charcoal-500 text-[11px]">
        <p>© 2026 SmartSpace AI Research Project. Built for Academic & Spatial Computing Innovation.</p>
        <p className="font-mono text-charcoal-400">Warm Light Architectural Interface</p>
      </div>
    </footer>
  );
};
