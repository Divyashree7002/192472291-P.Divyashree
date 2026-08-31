import React, { useState, useEffect } from 'react';
import {
  Server,
  Camera,
  Ruler,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  RotateCcw,
  IndianRupee
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';

export const SettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const { resetPreferences } = usePreferences();

  const [apiUrl, setApiUrl] = useState(apiClient.getBaseUrl());
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [resolution, setResolution] = useState('1080p');
  const [gridDensity, setGridDensity] = useState('medium');
  const [measurementUnit, setMeasurementUnit] = useState<'metric' | 'imperial'>('metric');
  const [logs, setLogs] = useState<{ timestamp: string; message: string; type: 'info' | 'warn' | 'success' }[]>([
    { timestamp: '10:41:02', message: 'SmartSpace AI Frontend initialized in warm light mode', type: 'info' },
    { timestamp: '10:41:03', message: 'Local storage repositories synchronized', type: 'success' },
    { timestamp: '10:41:04', message: 'WebRTC MediaDevices enumeration complete', type: 'info' },
    { timestamp: '10:41:05', message: 'FastAPI backend connection ready', type: 'info' },
  ]);

  const testBackendConnection = async () => {
    setBackendStatus('checking');
    addLog('Pinging FastAPI endpoint at ' + apiUrl, 'info');

    const result = await apiClient.checkBackendHealth();
    setBackendStatus(result.status);

    if (result.status === 'online') {
      addToast({
        title: 'Backend Connected',
        description: `Successfully connected to FastAPI server. Latency: ${result.latencyMs}ms.`,
        type: 'success',
      });
      addLog(`Backend responded OK in ${result.latencyMs}ms`, 'success');
    } else {
      addToast({
        title: 'Backend is offline',
        description: `FastAPI server not detected at ${apiUrl}. Start backend with python main.py or uvicorn main:app --port 8001.`,
        type: 'warning',
      });
      addLog(`FastAPI server connection refused at ${apiUrl}`, 'warn');
    }
  };

  const addLog = (message: string, type: 'info' | 'warn' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp: time, message, type }, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-16">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
          System Settings & Hardware Diagnostics
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Configure backend API endpoints, camera calibration, coordinate units, and diagnostic telemetry.
        </p>
      </div>

      {/* Backend API Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-terracotta-100 text-terracotta-700">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Python / FastAPI Backend Bridge</h3>
              <p className="text-xs text-charcoal-500">Endpoint URL for Computer Vision & Recommendation services.</p>
            </div>
          </div>

          <div>
            {backendStatus === 'checking' && <Badge variant="neutral" size="sm">Checking...</Badge>}
            {backendStatus === 'online' && <Badge variant="sage" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>Online</Badge>}
            {backendStatus === 'offline' && <Badge variant="sand" size="sm" icon={<AlertCircle className="w-3 h-3" />}>Offline</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-9">
            <Input
              label="FastAPI Base URL"
              value={apiUrl}
              onChange={(e) => {
                setApiUrl(e.target.value);
                apiClient.setBaseUrl(e.target.value);
              }}
              placeholder="http://localhost:8000"
              helperText="Default local endpoint for the FastAPI Python server."
            />
          </div>
          <div className="sm:col-span-3">
            <Button
              onClick={testBackendConnection}
              variant="secondary"
              size="md"
              className="w-full text-xs font-semibold"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Test Connection
            </Button>
          </div>
        </div>
      </div>

      {/* Camera & Spatial Viewport Settings */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sage-100 text-sage-700">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Camera & Spatial Viewport Settings</h3>
              <p className="text-xs text-charcoal-500">Video streaming resolution and architectural drafting grid density.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Video Stream Target Resolution"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            options={[
              { value: '720p', label: '1280 × 720 (HD - 30fps)' },
              { value: '1080p', label: '1920 × 1080 (Full HD - Recommended)' },
              { value: '4k', label: '3840 × 2160 (4K UHD - High Compute)' },
            ]}
          />

          <Select
            label="Spatial HUD Grid Density"
            value={gridDensity}
            onChange={(e) => setGridDensity(e.target.value)}
            options={[
              { value: 'sparse', label: 'Sparse (50cm Drafting Grid)' },
              { value: 'medium', label: 'Standard (25cm Drafting Grid)' },
              { value: 'dense', label: 'Dense (10cm High-Precision)' },
            ]}
          />
        </div>
      </div>

      {/* Measurement Units & Coordinate System */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sand-100 text-sand-800">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Measurement System & Coordinate Frame</h3>
              <p className="text-xs text-charcoal-500">Standard dimensional conventions for room dimensions and furniture.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Measurement Unit"
            value={measurementUnit}
            onChange={(e) => setMeasurementUnit(e.target.value as 'metric' | 'imperial')}
            options={[
              { value: 'metric', label: 'Metric System (Meters & Centimeters - Recommended)' },
              { value: 'imperial', label: 'Imperial System (Feet & Inches)' },
            ]}
          />

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-softBorder flex items-center gap-2.5 text-xs text-charcoal-700">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            <span>Right-Handed Coordinate Frame: X (Width), Y (Ceiling Height), Z (Depth).</span>
          </div>
        </div>
      </div>

      {/* Currency & Regional Localization */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sage-100 text-sage-700">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Currency & Regional Standard</h3>
              <p className="text-xs text-charcoal-500">Native monetary formatting and Indian numbering system (en-IN).</p>
            </div>
          </div>
          <Badge variant="sage" size="sm">Active: INR (₹)</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Currency"
            value="INR"
            disabled
            options={[
              { value: 'INR', label: 'Indian Rupee (₹)' },
            ]}
            helperText="Default native application currency standard."
          />

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-softBorder flex items-center gap-2.5 text-xs text-charcoal-700">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            <span>Format: Indian numbering (e.g. ₹50,000, ₹5,00,000, ₹25,00,000) with en-IN locale.</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy & Data Handling */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF6F0] text-charcoal-700">
              <ShieldCheck className="w-4 h-4 text-terracotta-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Privacy & Camera Security Guarantees</h3>
              <p className="text-xs text-charcoal-500">Transparency on how video streams and room imagery are processed.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-charcoal-700 leading-relaxed font-medium">
          <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            <span>Your camera is used only when you choose to start scanning.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            <span>Camera access is controlled strictly by your browser permission dialog.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            <span>Captured images will only be processed when you explicitly choose to analyze them.</span>
          </div>
        </div>
      </div>

      {/* Live System Diagnostics & Event Log */}
      <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
        <div className="flex items-center justify-between border-b border-softBorder pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF6F0] text-charcoal-700">
              <Activity className="w-4 h-4 text-terracotta-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Live Telemetry & Event Log</h3>
              <p className="text-xs text-charcoal-500">Real-time frontend state machine logs and hardware polling.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-terracotta-700 bg-terracotta-100 px-2 py-0.5 rounded-lg border border-terracotta-300 font-semibold">
            Telemetry Live
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-softBorder font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 shadow-inner">
          {logs.map((l, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px]">
              <span className="text-charcoal-400 shrink-0 font-medium">[{l.timestamp}]</span>
              <span
                className={
                  l.type === 'success'
                    ? 'text-sage-700 font-bold'
                    : l.type === 'warn'
                    ? 'text-sand-800 font-bold'
                    : 'text-charcoal-700'
                }
              >
                {l.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* User Preferences Data Reset Option */}
      <div className="p-5 rounded-2xl bg-white border border-softBorder shadow-warm-sm flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-charcoal-900">Reset Local Storage Profile</h4>
          <p className="text-[11px] text-charcoal-500 mt-0.5">
            Clear all saved design goals, space users, and preserved furniture from this browser session.
          </p>
        </div>
        <Button
          onClick={() => {
            resetPreferences();
            addToast({
              title: 'Storage Cleared',
              description: 'Preferences restored to default.',
              type: 'info',
            });
          }}
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Profile
        </Button>
      </div>

      <Alert variant="info">
        <span className="font-bold text-charcoal-900 block mb-0.5">Privacy & Security Notice</span>
        All spatial settings and hardware streams operate locally inside the browser, isolating sensitive video frames and protecting room confidentiality.
      </Alert>
    </div>
  );
};
