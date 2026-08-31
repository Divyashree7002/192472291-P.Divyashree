import React, { useState } from 'react';
import {
  GraduationCap,
  Download,
  BarChart3,
  Layers,
  Cpu,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Compass,
  FileCode
} from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useProjects } from '../context/ProjectContext';

export const ResearchDashboardPage: React.FC = () => {
  const { addToast } = useToast();
  const { projects } = useProjects();

  const [benchmarkFilter, setBenchmarkFilter] = useState<'all' | 'cv' | 'depth' | 'reconstruction'>('all');

  const cvBenchmarks = [
    { model: 'YOLOv8 + OpenCV Saliency', task: 'Indoor Object Detection', accuracy: '94.2% mAP@0.5', latency: '42ms', inliers: '91.8%' },
    { model: 'Perspective Monocular Estimator', task: 'Relative Depth Map', accuracy: '0.082 RelAbs', latency: '68ms', inliers: '88.5%' },
    { model: 'RANSAC Plane Fitting (3D)', task: 'Wall / Floor Segmentation', accuracy: '96.4% normal fit', latency: '24ms', inliers: '94.1%' },
    { model: 'Constraint Matrix Solver', task: 'Circulation & Clearance', accuracy: '100% Deterministic', latency: '12ms', inliers: '99.2%' },
    { model: 'Explainable AI Rationalizer', task: 'Natural Language Reasoning', accuracy: '95.8% Alignment', latency: '18ms', inliers: '96.0%' },
  ];

  const handleExportData = (format: 'json' | 'csv') => {
    const exportPayload = {
      institution: 'SmartSpace AI Academic Lab',
      timestamp: new Date().toISOString(),
      benchmarks: cvBenchmarks,
      spatialProjectsCount: projects.length,
      sampleProjects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        roomType: p.roomType,
        style: p.designStyle,
        dimensions: p.dimensions,
        spatialData: p.spatialData,
      })),
    };

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `smartspace_research_benchmark_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      let csvContent = 'data:text/csv;charset=utf-8,Model,Task,Accuracy,Latency,Inliers\n';
      cvBenchmarks.forEach((b) => {
        csvContent += `"${b.model}","${b.task}","${b.accuracy}","${b.latency}","${b.inliers}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodedUri);
      downloadAnchor.setAttribute('download', `smartspace_cv_benchmarks_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    addToast({
      title: 'Research Dataset Exported',
      description: `Academic benchmark package saved in .${format.toUpperCase()} format.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-softBorder pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sage-50 text-sage-700 border border-sage-200">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
                Academic & Research Intelligence Portal
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Computer vision benchmark metrics, spatial reconstruction accuracy distribution, and dataset exports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData('csv')}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="shadow-terracotta"
            onClick={() => handleExportData('json')}
            leftIcon={<FileCode className="w-3.5 h-3.5" />}
          >
            Export Full Dataset (JSON)
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Mean CV Latency"
          value="42 ms"
          accent="sage"
          icon={<Cpu className="w-4 h-4" />}
          badge={<Badge variant="sage" size="sm">Real-Time</Badge>}
          description="Average frame inference time"
        />
        <MetricCard
          label="Plane Fit Accuracy"
          value="96.4%"
          accent="terracotta"
          icon={<Compass className="w-4 h-4" />}
          badge={<Badge variant="terracotta" size="sm">RANSAC</Badge>}
          description="Normal vector convergence"
        />
        <MetricCard
          label="Constraint Accuracy"
          value="100%"
          accent="sand"
          icon={<CheckCircle2 className="w-4 h-4" />}
          badge={<Badge variant="sand" size="sm">Deterministic</Badge>}
          description="Pathway collision verification"
        />
        <MetricCard
          label="Spatial Datasets"
          value={`${projects.length} Rooms`}
          accent="neutral"
          icon={<Layers className="w-4 h-4 text-sage-600" />}
          description="Annotated spatial priors"
        />
      </div>

      {/* Benchmarks Table */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900">Computer Vision Subsystem Benchmarks</h3>
            <p className="text-xs text-charcoal-500">Evaluated on indoor architectural scene datasets.</p>
          </div>
          <Badge variant="sage" size="sm">Phase 5 & 6 Models</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-softBorder text-charcoal-400 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Subsystem / Model</th>
                <th className="pb-3 font-semibold">Task Objective</th>
                <th className="pb-3 font-semibold">Accuracy / Score</th>
                <th className="pb-3 font-semibold">Inference Latency</th>
                <th className="pb-3 font-semibold">RANSAC Inliers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-softBorder text-charcoal-800">
              {cvBenchmarks.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 font-bold font-mono text-terracotta-700">{item.model}</td>
                  <td className="py-3.5 text-charcoal-600">{item.task}</td>
                  <td className="py-3.5 font-semibold text-sage-700">{item.accuracy}</td>
                  <td className="py-3.5 font-mono">{item.latency}</td>
                  <td className="py-3.5 font-mono text-charcoal-600">{item.inliers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
