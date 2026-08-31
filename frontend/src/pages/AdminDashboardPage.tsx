import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Server,
  Activity,
  Users,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Clock,
  Terminal,
  IndianRupee,
  Layers,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  Download,
  Trash2,
  Code,
  Box,
  Eye,
  Sliders,
  Sparkles,
  Info,
  ExternalLink,
  FileCode
} from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  checkBackendHealth,
  HealthCheckResponse,
  getApiBaseUrl,
  fetchRecommendations,
  fetchDesignPlan,
  estimateDepth,
  reconstructRoom,
  analyzeRoom,
  dataUrlToBlob,
  apiAdminListUsers,
  apiAdminSystemStatus,
  AuthUser,
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

interface EndpointSpec {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  name: string;
  description: string;
  category: 'System' | 'Computer Vision' | 'Recommendations' | 'Administration';
  samplePayload?: Record<string, any>;
  hasImageInput?: boolean;
}

const REGISTERED_ENDPOINTS: EndpointSpec[] = [
  {
    id: 'ep-health',
    method: 'GET',
    path: '/api/health',
    name: 'Health Check & Capabilities',
    description: 'Returns backend operational status, service metadata, active phase capabilities, and registered CV/ML subsystems.',
    category: 'System',
  },
  {
    id: 'ep-admin-users',
    method: 'GET',
    path: '/api/admin/users',
    name: 'List Registered Accounts',
    description: 'ADMIN ONLY: Queries persistent SQLite database and returns all registered user accounts with role designations.',
    category: 'Administration',
  },
  {
    id: 'ep-admin-status',
    method: 'GET',
    path: '/api/admin/system-status',
    name: 'Infrastructure Telemetry',
    description: 'ADMIN ONLY: Returns administrative system telemetry, JWT security configuration, and active role enforcement.',
    category: 'Administration',
  },
  {
    id: 'ep-analyze',
    method: 'POST',
    path: '/api/analyze-room',
    name: 'Full Spatial & Room Analysis',
    description: 'Executes full Computer Vision pipeline: image quality assessment, YOLOv8/Saliency object detection, depth estimation, RANSAC 3D plane fitting, and metric coordinates calculation.',
    category: 'Computer Vision',
    hasImageInput: true,
    samplePayload: {
      room_type: 'living_room',
      design_style: 'modern',
      budget: 500000,
      length: 4.8,
      width: 3.6,
      height: 2.8,
      confidence_threshold: 0.25,
    },
  },
  {
    id: 'ep-depth',
    method: 'POST',
    path: '/api/estimate-depth',
    name: 'Monocular Depth Estimation',
    description: 'Computes continuous monocular relative depth map with normalization, depth variance statistics, and Inferno colormap visualization.',
    category: 'Computer Vision',
    hasImageInput: true,
  },
  {
    id: 'ep-reconstruct',
    method: 'POST',
    path: '/api/reconstruct-room',
    name: '3D Spatial Plane Reconstruction',
    description: 'Fits structural room planes (floor, walls, ceiling) via RANSAC and computes 3D metric bounding boxes for detected furniture.',
    category: 'Computer Vision',
    hasImageInput: true,
    samplePayload: {
      length: 4.8,
      width: 3.6,
      height: 2.8,
      confidence_threshold: 0.25,
    },
  },
  {
    id: 'ep-recommendations',
    method: 'POST',
    path: '/api/recommendations',
    name: 'Multi-Criteria Layout Solver',
    description: 'Generates 3 prioritized design alternatives with multi-criteria scores (Space Fit, Style Match, Storage, Lighting), budget optimizer in INR (₹), and Explainable AI rationales.',
    category: 'Recommendations',
    samplePayload: {
      room_type: 'living_room',
      design_style: 'modern',
      budget: 500000,
      length: 4.8,
      width: 3.6,
      height: 2.8,
      existing_objects: [],
      planes: [],
    },
  },
  {
    id: 'ep-design-plan',
    method: 'POST',
    path: '/api/design-plan',
    name: 'Master Spatial Design Plan',
    description: 'Generates cohesive master architectural design plan, itemized furniture schedule, and comprehensive room summary.',
    category: 'Recommendations',
    samplePayload: {
      room_type: 'living_room',
      design_style: 'modern',
      budget: 500000,
      length: 4.8,
      width: 3.6,
      height: 2.8,
    },
  },
];

interface LogEntry {
  id: string;
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  method?: 'GET' | 'POST';
  endpoint?: string;
  latencyMs?: number;
  statusText?: string;
  message: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const backendUrl = getApiBaseUrl();

  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>('ep-health');
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [testResponses, setTestResponses] = useState<Record<string, any>>({});
  const [testLatencies, setTestLatencies] = useState<Record<string, number>>({});
  const [testErrors, setTestErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'warn' | 'error' | 'info'>('all');

  // Custom image file for POST endpoints test
  const [customTestImage, setCustomTestImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString(),
      level: 'info',
      message: `Admin Console initialized for ${user?.name || 'Administrator'}. Gateway target: ${backendUrl}`,
    },
    {
      id: 'init-2',
      time: new Date().toLocaleTimeString(),
      level: 'info',
      message: '6 registered FastAPI endpoints cataloged and ready for probe verification',
    },
  ]);

  // Helper to append log
  const appendLog = (entry: Omit<LogEntry, 'id' | 'time'>) => {
    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString(),
      ...entry,
    };
    setSystemLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  // 1. Admin Health Probe
  const fetchHealth = async (isManualProbe = false) => {
    if (isPinging) return;
    setIsPinging(true);

    try {
      const res = await checkBackendHealth();
      setHealthData(res);

      if (res.status === 'online') {
        appendLog({
          level: 'success',
          method: 'GET',
          endpoint: '/api/health',
          latencyMs: res.latencyMs,
          statusText: '200 OK',
          message: `Health probe 200 OK: ${res.service || 'SmartSpace API'} (Phase: ${res.phase || 'Phase 6'}) - ${res.latencyMs}ms`,
        });

        if (isManualProbe) {
          addToast({
            title: 'Health Probe Succeeded',
            description: `FastAPI responded in ${res.latencyMs}ms (200 OK).`,
            type: 'success',
          });
        }
      } else {
        appendLog({
          level: 'warn',
          method: 'GET',
          endpoint: '/api/health',
          statusText: 'Offline',
          message: `Health probe failed: ${res.message || 'Cannot reach server at ' + backendUrl}`,
        });

        if (isManualProbe) {
          addToast({
            title: 'Backend Offline',
            description: `Cannot connect to FastAPI at ${backendUrl}. Check if server is running.`,
            type: 'error',
          });
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Connection failed';
      setHealthData({ status: 'offline', message: errMsg });
      appendLog({
        level: 'error',
        method: 'GET',
        endpoint: '/api/health',
        statusText: 'ERROR',
        message: `Health probe error: ${errMsg}`,
      });

      if (isManualProbe) {
        addToast({
          title: 'Probe Error',
          description: errMsg,
          type: 'error',
        });
      }
    } finally {
      setIsPinging(false);
    }
  };

  // Periodic polling every 8s
  useEffect(() => {
    fetchHealth(false);
    const interval = setInterval(() => {
      fetchHealth(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Helper to generate synthetic test room image
  const getOrCreateTestImage = (): string => {
    if (customTestImage) return customTestImage;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw simulated room canvas
      ctx.fillStyle = '#EAE4D9';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#D3CABA';
      ctx.fillRect(0, 200, 400, 100); // Floor plane
      ctx.fillStyle = '#9C6644';
      ctx.fillRect(120, 150, 160, 70); // Sofa outline
      ctx.fillStyle = '#4A7C59';
      ctx.fillRect(40, 120, 50, 100); // Plant/Cabinet
    }
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (url) {
        setCustomTestImage(url);
        addToast({
          title: 'Custom Test Image Staged',
          description: `${file.name} staged for endpoint verification.`,
          type: 'info',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // 3. Test Individual Registered Endpoint
  const handleTestEndpoint = async (endpoint: EndpointSpec) => {
    if (testingEndpointId) return;
    setTestingEndpointId(endpoint.id);
    setTestErrors((prev) => ({ ...prev, [endpoint.id]: '' }));

    const startTime = performance.now();
    const testImage = getOrCreateTestImage();

    try {
      let resultData: any = null;

      if (endpoint.id === 'ep-health') {
        const healthRes = await checkBackendHealth();
        resultData = healthRes;
        if (healthRes.status === 'offline') {
          throw new Error(healthRes.message || 'FastAPI service offline at ' + backendUrl);
        }
      } else if (endpoint.id === 'ep-admin-users') {
        resultData = await apiAdminListUsers();
      } else if (endpoint.id === 'ep-admin-status') {
        resultData = await apiAdminSystemStatus();
      } else if (endpoint.id === 'ep-recommendations') {
        resultData = await fetchRecommendations({
          room_type: 'living_room',
          design_style: 'modern',
          budget: 500000,
          length: 4.8,
          width: 3.6,
          height: 2.8,
        });
      } else if (endpoint.id === 'ep-design-plan') {
        resultData = await fetchDesignPlan({
          room_type: 'living_room',
          design_style: 'modern',
          budget: 500000,
          length: 4.8,
          width: 3.6,
          height: 2.8,
        });
      } else if (endpoint.id === 'ep-depth') {
        resultData = await estimateDepth(testImage);
      } else if (endpoint.id === 'ep-reconstruct') {
        resultData = await reconstructRoom(testImage, { length: 4.8, width: 3.6, height: 2.8 });
      } else if (endpoint.id === 'ep-analyze') {
        resultData = await analyzeRoom(
          testImage,
          {
            roomType: 'living_room',
            designStyle: 'modern',
            budget: 500000,
            dimensions: { length: 4.8, width: 3.6, height: 2.8 },
            confidenceThreshold: 0.25,
          },
          'admin_test_scan.jpg'
        );
      }

      const elapsed = Math.round(performance.now() - startTime);
      setTestLatencies((prev) => ({ ...prev, [endpoint.id]: elapsed }));
      setTestResponses((prev) => ({ ...prev, [endpoint.id]: resultData }));

      appendLog({
        level: 'success',
        method: endpoint.method,
        endpoint: endpoint.path,
        latencyMs: elapsed,
        statusText: '200 OK',
        message: `Endpoint test passed: ${endpoint.method} ${endpoint.path} (${elapsed}ms)`,
      });

      addToast({
        title: 'Endpoint Test Passed',
        description: `${endpoint.method} ${endpoint.path} responded in ${elapsed}ms.`,
        type: 'success',
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      const errMsg = err?.message || 'Endpoint request failed';
      setTestLatencies((prev) => ({ ...prev, [endpoint.id]: elapsed }));
      setTestErrors((prev) => ({ ...prev, [endpoint.id]: errMsg }));

      appendLog({
        level: 'error',
        method: endpoint.method,
        endpoint: endpoint.path,
        latencyMs: elapsed,
        statusText: 'FAILED',
        message: `Endpoint test failed: ${endpoint.method} ${endpoint.path} -> ${errMsg}`,
      });

      addToast({
        title: 'Endpoint Test Failed',
        description: errMsg,
        type: 'error',
      });
    } finally {
      setTestingEndpointId(null);
    }
  };

  const handleCopyJson = (id: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({
      title: 'JSON Copied',
      description: 'Response payload copied to clipboard.',
      type: 'info',
    });
  };

  const handleClearLogs = () => {
    setSystemLogs([]);
    addToast({
      title: 'Audit Console Cleared',
      description: 'Log history cleared.',
      type: 'info',
    });
  };

  const handleExportLogs = () => {
    const text = systemLogs
      .map(
        (l) =>
          `[${l.time}] [${l.level.toUpperCase()}] ${l.method ? `${l.method} ${l.endpoint} ` : ''}${
            l.latencyMs ? `(${l.latencyMs}ms) ` : ''
          }${l.message}`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartspace_admin_audit_${Date.now()}.log`;
    link.click();
    URL.revokeObjectURL(url);

    addToast({
      title: 'Logs Exported',
      description: 'Audit log downloaded.',
      type: 'success',
    });
  };

  const isBackendOnline = healthData?.status === 'online';
  const filteredLogs =
    logFilter === 'all' ? systemLogs : systemLogs.filter((l) => l.level === logFilter);

  const selectedEndpoint =
    REGISTERED_ENDPOINTS.find((e) => e.id === selectedEndpointId) || REGISTERED_ENDPOINTS[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Hidden File Input for Custom Test Image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleCustomImageUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-softBorder pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200 shadow-warm-sm">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
                System Administration & Infrastructure
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Real-time API gateway metrics, active model pipelines, security status, and endpoint inspection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isBackendOnline ? 'sage' : 'terracotta'} size="md">
            Backend: {isBackendOnline ? 'Connected (200 OK)' : 'Backend Offline'}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchHealth(true)}
            isLoading={isPinging}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Probe Health
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="API Latency"
          value={isBackendOnline ? `${healthData?.latencyMs ?? 0} ms` : '-- ms'}
          accent="sage"
          icon={<Activity className="w-4 h-4" />}
          badge={
            <Badge variant={isBackendOnline ? 'sage' : 'neutral'} size="sm">
              {isBackendOnline ? (healthData?.latencyMs && healthData.latencyMs < 50 ? 'Fast' : 'Nominal') : 'Offline'}
            </Badge>
          }
          description="FastAPI gateway roundtrip"
        />
        <MetricCard
          label="Active Subsystems"
          value="4 Pipelines"
          accent="terracotta"
          icon={<Cpu className="w-4 h-4" />}
          badge={<Badge variant={isBackendOnline ? 'sage' : 'sand'} size="sm">{isBackendOnline ? 'Online' : 'Standby'}</Badge>}
          description="YOLO, Depth, RANSAC, XAI"
        />
        <MetricCard
          label="Registered Endpoints"
          value="6 Endpoints"
          accent="sand"
          icon={<Layers className="w-4 h-4" />}
          badge={<Badge variant={isBackendOnline ? 'sage' : 'neutral'} size="sm">{isBackendOnline ? 'Active' : 'Offline'}</Badge>}
          description="FastAPI v0.6.0 Gateway"
        />
        <MetricCard
          label="Server Endpoint"
          value="Port 8001"
          accent="neutral"
          icon={<Server className="w-4 h-4 text-terracotta-600" />}
          description={backendUrl}
        />
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Registered Endpoints Interactive List & Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-4">
            <div className="flex items-center justify-between border-b border-softBorder pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-terracotta-600" />
                <h3 className="text-sm font-bold text-charcoal-900">
                  Registered FastAPI Endpoints
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] text-charcoal-700 border border-softBorder">
                Click to inspect & test
              </span>
            </div>

            {/* Endpoints List */}
            <div className="space-y-2">
              {REGISTERED_ENDPOINTS.map((ep) => {
                const isSelected = selectedEndpointId === ep.id;
                const isTestingThis = testingEndpointId === ep.id;
                const hasTested = Boolean(testResponses[ep.id]);
                const hasError = Boolean(testErrors[ep.id]);
                const latency = testLatencies[ep.id];

                return (
                  <div
                    key={ep.id}
                    onClick={() => setSelectedEndpointId(isSelected ? null : ep.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-terracotta-400 shadow-warm-sm'
                        : 'bg-white hover:bg-[#FCFBF9] border-softBorder hover:border-cream-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                            ep.method === 'GET'
                              ? 'bg-sage-100 text-sage-800 border border-sage-300'
                              : 'bg-terracotta-100 text-terracotta-800 border border-terracotta-300'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-charcoal-900">
                          {ep.path}
                        </span>
                        <span className="text-[10px] text-charcoal-400 font-sans hidden sm:inline">
                          &bull; {ep.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isBackendOnline ? (
                          <Badge variant="sage" size="sm">
                            {hasTested ? `200 OK (${latency}ms)` : 'Active'}
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Unavailable
                          </Badge>
                        )}
                        {isSelected ? (
                          <ChevronUp className="w-4 h-4 text-charcoal-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-charcoal-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-charcoal-500 mt-1 font-normal leading-relaxed">
                      {ep.description}
                    </p>

                    {/* Expanded Interactive Test Console for Selected Endpoint */}
                    {isSelected && (
                      <div
                        className="mt-4 pt-3.5 border-t border-softBorder space-y-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Parameters & Payload Preview */}
                        {ep.samplePayload && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block font-mono">
                              Request Payload Parameters:
                            </span>
                            <div className="p-2.5 rounded-xl bg-charcoal-950 text-cream-200 font-mono text-[10px] overflow-x-auto max-h-36">
                              <pre>{JSON.stringify(ep.samplePayload, null, 2)}</pre>
                            </div>
                          </div>
                        )}

                        {ep.hasImageInput && (
                          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-softBorder flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-charcoal-700">
                              <Box className="w-3.5 h-3.5 text-terracotta-600" />
                              <span className="text-[11px] font-medium">
                                {customTestImage ? 'Using Custom Staged Image' : 'Using Synthetic 3D Room Test Canvas'}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[10px] h-7 px-2"
                            >
                              Choose Custom Image
                            </Button>
                          </div>
                        )}

                        {/* Test Execution Action Button */}
                        <div className="flex items-center justify-between gap-3 pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTestEndpoint(ep)}
                            isLoading={isTestingThis}
                            disabled={!isBackendOnline}
                            className="shadow-terracotta text-xs"
                            leftIcon={<Play className="w-3 h-3" />}
                          >
                            {isTestingThis ? 'Testing Endpoint...' : `Test ${ep.method} ${ep.path}`}
                          </Button>

                          {!isBackendOnline && (
                            <span className="text-[11px] text-terracotta-600 font-medium">
                              Backend offline at {backendUrl}
                            </span>
                          )}
                        </div>

                        {/* Error Banner */}
                        {hasError && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span className="font-mono text-[11px]">{testErrors[ep.id]}</span>
                          </div>
                        )}

                        {/* Response JSON Viewer */}
                        {hasTested && (
                          <div className="space-y-1.5 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sage-800 block font-mono flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-sage-600" />
                                <span>Response (200 OK &middot; {latency}ms):</span>
                              </span>
                              <button
                                onClick={() => handleCopyJson(ep.id, testResponses[ep.id])}
                                className="text-[10px] text-charcoal-500 hover:text-charcoal-900 font-mono flex items-center gap-1"
                              >
                                {copiedId === ep.id ? <Check className="w-3 h-3 text-sage-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === ep.id ? 'Copied' : 'Copy JSON'}</span>
                              </button>
                            </div>

                            <div className="p-3 rounded-xl bg-charcoal-950 text-sage-300 font-mono text-[10px] overflow-x-auto max-h-48 shadow-warm-inner">
                              <pre>{JSON.stringify(testResponses[ep.id], null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Terminal-Style Admin Activity Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-charcoal-950 text-cream-100 rounded-2xl p-5 border border-charcoal-800 shadow-warm-lg space-y-3 flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-terracotta-400" />
                  <span className="text-xs font-bold font-mono text-cream-100">
                    Live Gateway Audit Stream
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isBackendOnline ? 'bg-sage-400 animate-pulse' : 'bg-red-400'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-charcoal-400">
                    {isBackendOnline ? 'LISTENING' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>

              {/* Console Filter Pills & Controls */}
              <div className="flex items-center justify-between gap-2 py-2 border-b border-charcoal-800/80 text-[10px] font-mono flex-wrap">
                <div className="flex items-center gap-1">
                  {(['all', 'success', 'warn', 'error', 'info'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLogFilter(filter)}
                      className={`px-2 py-0.5 rounded capitalize transition-colors ${
                        logFilter === filter
                          ? 'bg-terracotta-600 text-white font-bold'
                          : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleExportLogs}
                    title="Export log stream as text file"
                    className="p-1 rounded text-charcoal-400 hover:text-cream-100 hover:bg-charcoal-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleClearLogs}
                    title="Clear console output"
                    className="p-1 rounded text-charcoal-400 hover:text-red-400 hover:bg-charcoal-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Console Output List */}
              <div className="mt-3 space-y-2 font-mono text-[11px] max-h-[400px] overflow-y-auto pr-1">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-charcoal-900/60 p-1 rounded transition-colors">
                      <span className="text-charcoal-500 select-none text-[10px] shrink-0">
                        [{log.time}]
                      </span>
                      {log.method && (
                        <span
                          className={`text-[9px] font-bold px-1 rounded shrink-0 ${
                            log.method === 'GET' ? 'bg-sage-900/80 text-sage-300' : 'bg-terracotta-900/80 text-terracotta-300'
                          }`}
                        >
                          {log.method}
                        </span>
                      )}
                      <span
                        className={`break-words ${
                          log.level === 'success'
                            ? 'text-sage-400'
                            : log.level === 'warn'
                            ? 'text-sand-300'
                            : log.level === 'error'
                            ? 'text-terracotta-400'
                            : 'text-cream-200'
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-charcoal-500 text-xs">
                    No log events recorded under "{logFilter}" filter.
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Footer */}
            <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between text-[10px] font-mono text-charcoal-400">
              <span>Operator: {user?.name || 'Administrator'} ({user?.role || 'ADMIN'})</span>
              <span className={isBackendOnline ? 'text-sage-400 font-bold' : 'text-red-400 font-bold'}>
                GATEWAY: {isBackendOnline ? 'HEALTHY' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
