import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RefreshCw,
  Server,
  Info
} from 'lucide-react';
import { RoomType, DesignStyle } from '../../types';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { ProcessingState, RoomAnalysisResponse, RoomAnalysisConfig, getApiBaseUrl } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

export interface RoomConfigPanelProps {
  capturedImage?: string | null;
  processingState?: ProcessingState;
  analysisResponse?: RoomAnalysisResponse | null;
  errorMessage?: string | null;
  onAnalyzeTrigger?: (config: RoomAnalysisConfig) => Promise<void>;
  backendStatus?: 'online' | 'offline';
}

export const RoomConfigPanel: React.FC<RoomConfigPanelProps> = ({
  capturedImage,
  processingState = 'ready',
  analysisResponse,
  errorMessage,
  onAnalyzeTrigger,
  backendStatus = 'offline',
}) => {
  const navigate = useNavigate();

  const [roomType, setRoomType] = useState<RoomType>('living_room');
  const [designStyle, setDesignStyle] = useState<DesignStyle>('modern');
  const [budget, setBudget] = useState<number>(500000);
  const [roomLength, setRoomLength] = useState<number>(4.8);
  const [roomWidth, setRoomWidth] = useState<number>(3.6);
  const [ceilingHeight, setCeilingHeight] = useState<number>(2.8);

  const roomOptions = [
    { value: 'living_room', label: 'Living Room' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'home_office', label: 'Home Office / Study' },
    { value: 'dining_room', label: 'Dining Room' },
    { value: 'kitchen', label: 'Kitchen Space' },
    { value: 'studio', label: 'Studio Apartment' },
    { value: 'bathroom', label: 'Bathroom Space' },
  ];

  const styleOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'contemporary', label: 'Contemporary' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'scandinavian', label: 'Scandinavian' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'bohemian', label: 'Bohemian' },
  ];

  const handleAction = async () => {
    if (onAnalyzeTrigger) {
      await onAnalyzeTrigger({
        roomType,
        designStyle,
        budget,
        dimensions: {
          length: roomLength,
          width: roomWidth,
          height: ceilingHeight,
        },
      });
    }
  };

  const isProcessing = processingState === 'uploading' || processingState === 'analyzing';

  return (
    <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-6">
      <div className="flex items-center justify-between border-b border-softBorder pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-terracotta-600" />
          <h3 className="text-sm font-bold text-charcoal-900">Spatial Parameters & Priors</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-terracotta-700 bg-terracotta-100 px-2 py-0.5 rounded-lg border border-terracotta-300 font-semibold">
            Room Context
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
            backendStatus === 'online'
              ? 'bg-sage-50 text-sage-700 border-sage-200'
              : 'bg-[#FAF7F2] text-charcoal-500 border-softBorder'
          }`}>
            <Server className="w-2.5 h-2.5" />
            <span>{backendStatus === 'online' ? 'Backend: Connected' : 'Backend Offline'}</span>
          </span>
        </div>
      </div>

      {/* Room Type and Style Selections */}
      <div className="space-y-4">
        <Select
          label="Target Room Type"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value as RoomType)}
          options={roomOptions}
          helperText="Determines circulation requirements and standard furniture modules."
        />

        <Select
          label="Preferred Design Style"
          value={designStyle}
          onChange={(e) => setDesignStyle(e.target.value as DesignStyle)}
          options={styleOptions}
          helperText="Guides material textures, color harmony, and aesthetic scoring."
        />
      </div>

      {/* Target Budget Slider */}
      <div className="pt-2">
        <Slider
          label="Estimated Budget Limit (INR)"
          min={50000}
          max={2500000}
          step={25000}
          value={budget}
          valuePrefix="₹"
          onChangeValue={(val) => setBudget(val)}
        />
      </div>

      {/* Dimensional Priors */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-charcoal-700 mb-2">
          Metric Dimension Priors (Optional Calibration)
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <Input
            label="Length (m)"
            type="number"
            step="0.1"
            min="1.0"
            value={roomLength}
            onChange={(e) => setRoomLength(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Width (m)"
            type="number"
            step="0.1"
            min="1.0"
            value={roomWidth}
            onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Height (m)"
            type="number"
            step="0.1"
            min="1.8"
            value={ceilingHeight}
            onChange={(e) => setCeilingHeight(parseFloat(e.target.value) || 0)}
          />
        </div>
        <p className="text-[11px] text-charcoal-500 mt-1.5 leading-relaxed">
          Provides dimensional scaling priors to calibrate spatial clearances.
        </p>
      </div>

      {/* State 1: Multi-Stage Progress Animation */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-terracotta-300 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-800">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-terracotta-600 animate-spin" />
              <span>Analyzing Your Room...</span>
            </span>
            <span className="font-mono text-xs text-terracotta-700 font-bold">SmartSpace AI</span>
          </div>

          <div className="space-y-1.5 text-xs font-medium">
            <div className="flex items-center gap-2 text-sage-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Reading room images</span>
            </div>
            <div className="flex items-center gap-2 text-sage-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Detecting room boundaries</span>
            </div>
            <div className="flex items-center gap-2 text-sage-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Detecting doors and windows</span>
            </div>
            <div className="flex items-center gap-2 text-terracotta-700 font-semibold animate-pulse">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>4. Detecting furniture</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-500">
              <span className="w-3.5 h-3.5 rounded-full border border-charcoal-300 inline-block" />
              <span>5. Filtering irrelevant objects (people, animals, clothes)</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-500">
              <span className="w-3.5 h-3.5 rounded-full border border-charcoal-300 inline-block" />
              <span>6. Estimating depth</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-500">
              <span className="w-3.5 h-3.5 rounded-full border border-charcoal-300 inline-block" />
              <span>7. Estimating dimensions</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-500">
              <span className="w-3.5 h-3.5 rounded-full border border-charcoal-300 inline-block" />
              <span>8. Building room model</span>
            </div>
          </div>
        </div>
      )}

      {/* State 2: Backend Unavailable / Analysis Failed */}
      {(processingState === 'backend_unavailable' || processingState === 'analysis_failed') && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-red-900">
                {processingState === 'backend_unavailable' ? 'Backend Offline' : 'Analysis Failed'}
              </h5>
              <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                {errorMessage || (
                  processingState === 'backend_unavailable'
                    ? `FastAPI server not responding at ${getApiBaseUrl()}. Please ensure the backend is running.`
                    : 'The request could not be processed by the server.'
                )}
              </p>
              {processingState === 'backend_unavailable' && (
                <p className="text-[10px] text-red-600 font-mono mt-1">
                  Endpoint: <code className="bg-red-100 px-1 py-0.5 rounded">{getApiBaseUrl()}</code>
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleAction}
            variant="outline"
            size="sm"
            className="w-full text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Analysis
          </Button>
        </div>
      )}

      {/* State 3: Analysis Completed / Success */}
      {processingState === 'analysis_completed' && analysisResponse && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-3 animate-fade-in shadow-warm-sm">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>
                <h5 className="text-xs font-bold text-charcoal-900">Spatial Reconstruction Completed</h5>
                <p className="text-[11px] text-charcoal-700 leading-relaxed mt-0.5">
                  Processed in <strong className="font-mono text-charcoal-900">{analysisResponse.inference_time_ms ?? 180}ms</strong>.
                </p>
              </div>

              {/* Backend response summary card */}
              <div className="p-2.5 rounded-xl bg-white/90 border border-sage-200 text-[11px] font-mono text-charcoal-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Detected Objects:</span>
                  <span className="text-sage-700 font-bold">{analysisResponse.objects?.length || 0} items localized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">RANSAC Planes:</span>
                  <span className="text-sage-700 font-bold">{analysisResponse.planes?.length || 0} fitted planes</span>
                </div>
                {analysisResponse.room && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Floor Area:</span>
                      <span className="text-charcoal-900 font-semibold">{analysisResponse.room.floor_area_sqm} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Room Volume:</span>
                      <span className="text-charcoal-900 font-semibold">{analysisResponse.room.volume_m3} m³</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Target Budget:</span>
                  <span className="text-charcoal-800 font-medium">{formatCurrency(analysisResponse.budget || budget)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={() => navigate('/recommendations')}
              variant="primary"
              size="sm"
              className="w-full shadow-terracotta font-semibold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Generate AI Recommendations
            </Button>
            <Button
              onClick={() => navigate('/studio')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Inspect in 3D Design Studio
            </Button>
          </div>
        </div>
      )}

      {/* Main Action Button */}
      {processingState !== 'analysis_completed' && (
        <Button
          onClick={handleAction}
          isLoading={isProcessing}
          variant="primary"
          size="lg"
          className="w-full shadow-terracotta font-semibold"
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          {isProcessing
            ? 'Processing with FastAPI...'
            : capturedImage
            ? 'Analyze Room (Full CV & 3D Planes)'
            : 'Capture or Select Image to Analyze'}
        </Button>
      )}

    </div>
  );
};
