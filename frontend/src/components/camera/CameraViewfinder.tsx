import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Crosshair,
  Grid3X3,
  Video,
  Info,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Upload,
  Server,
  Image as ImageIcon,
  Compass,
  Layers
} from 'lucide-react';
import { useWebcam } from '../../hooks/useWebcam';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProcessingState, DetectedObject } from '../../services/api';
import { DetectionOverlay } from './DetectionOverlay';

export type CameraState =
  | 'not_started'
  | 'requesting_permission'
  | 'active'
  | 'unavailable'
  | 'permission_denied'
  | 'stopped';

export interface CameraViewfinderProps {
  capturedImage?: string | null;
  onCapture?: (imageDataUrl: string) => void;
  onRetake?: () => void;
  onAnalyze?: () => void;
  processingState?: ProcessingState;
  backendStatus?: 'online' | 'offline';
  detectedObjects?: DetectedObject[];
  imageDimensions?: { width: number; height: number };
  confidenceThreshold?: number;
  showOverlay?: boolean;
  selectedObjectId?: number | null;
  onSelectObject?: (id: number | null) => void;
  depthVisualization?: string;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  capturedImage: externalCapturedImage,
  onCapture,
  onRetake,
  onAnalyze,
  processingState = 'ready',
  backendStatus = 'offline',
  detectedObjects = [],
  imageDimensions,
  confidenceThreshold = 0.25,
  showOverlay = true,
  selectedObjectId = null,
  onSelectObject = () => {},
  depthVisualization,
}) => {
  const {
    isActive,
    isLoading,
    error,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    startCamera,
    stopCamera,
    captureFrame,
    videoRef,
  } = useWebcam();

  const [showGrid, setShowGrid] = useState(true);
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [internalCapturedImage, setInternalCapturedImage] = useState<string | null>(null);
  const [hasStopped, setHasStopped] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [naturalDim, setNaturalDim] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });
  const [viewMode, setViewMode] = useState<'rgb' | 'depth'>('rgb');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentImage = externalCapturedImage !== undefined ? externalCapturedImage : internalCapturedImage;

  // Sync internal state if external is cleared
  useEffect(() => {
    if (externalCapturedImage === null) {
      setInternalCapturedImage(null);
      setViewMode('rgb');
    }
  }, [externalCapturedImage]);

  const getCameraState = (): CameraState => {
    if (isLoading) return 'requesting_permission';
    if (error && error.toLowerCase().includes('denied')) return 'permission_denied';
    if (error) return 'unavailable';
    if (isActive) return 'active';
    if (hasStopped) return 'stopped';
    return 'not_started';
  };

  const cameraState = getCameraState();

  const handleStartCamera = async () => {
    setHasStopped(false);
    setInternalCapturedImage(null);
    setFileError(null);
    setViewMode('rgb');
    if (onRetake) onRetake();
    await startCamera();
  };

  const handleStopCamera = () => {
    stopCamera();
    setHasStopped(true);
  };

  const handleCapture = () => {
    const frame = captureFrame();
    if (frame) {
      setInternalCapturedImage(frame);
      setViewMode('rgb');
      if (onCapture) {
        onCapture(frame);
      }
    }
  };

  const handleRetake = () => {
    setInternalCapturedImage(null);
    setFileError(null);
    setViewMode('rgb');
    if (onRetake) {
      onRetake();
    }
    if (!isActive) {
      startCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setFileError('Invalid file type. Please upload a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFileError('File size exceeds 15 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setInternalCapturedImage(dataUrl);
        setViewMode('rgb');
        if (onCapture) {
          onCapture(dataUrl);
        }
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [scanMode, setScanMode] = useState<'guided' | 'single'>('guided');
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [scanQuality, setScanQuality] = useState<'good' | 'move_slower' | 'keep_steady' | 'too_dark'>('good');

  const guidedStepsList = [
    { step: 1, title: 'Front Wall', instruction: 'Point the camera toward the front wall.' },
    { step: 2, title: 'Left Side', instruction: 'Slowly turn toward the left.' },
    { step: 3, title: 'Right Side', instruction: 'Capture the right side of the room.' },
    { step: 4, title: 'Openings', instruction: 'Capture doors and windows.' },
    { step: 5, title: 'Furniture', instruction: 'Capture main room furniture.' },
    { step: 6, title: 'Floor', instruction: 'Tilt slightly toward the floor.' },
  ];

  const handleNextGuidedStep = () => {
    if (guidedStep < 6) {
      setGuidedStep((prev) => prev + 1);
    } else {
      handleCapture();
    }
  };

  const currentGuidedStepObj = guidedStepsList[guidedStep - 1];

  const isProcessing = processingState === 'uploading' || processingState === 'analyzing';
  const effectiveDim = imageDimensions || naturalDim;
  const displayedImage = viewMode === 'depth' && depthVisualization ? depthVisualization : currentImage;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-softBorder shadow-warm-md flex flex-col">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
        id="room-image-upload-input"
      />

      {/* Top HUD Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#FAF7F2] border-b border-softBorder z-20">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Video className="w-4 h-4 text-terracotta-600" />
            <span className="text-xs font-bold text-charcoal-900">Live Viewfinder</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-white rounded-xl p-0.5 border border-softBorder shadow-warm-sm text-xs font-semibold">
            <button
              onClick={() => setScanMode('guided')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scanMode === 'guided'
                  ? 'bg-terracotta-500 text-white shadow-terracotta'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              📐 Detailed Room Scan (Recommended)
            </button>
            <button
              onClick={() => setScanMode('single')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scanMode === 'single'
                  ? 'bg-terracotta-500 text-white shadow-terracotta'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              📷 Quick Scan (1 Photo)
            </button>
          </div>

          <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
            Recommended: Detailed Scan provides better room understanding.
          </span>

          {cameraState === 'active' && (
            <Badge variant="sage" size="sm" icon={<span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-ping" />}>
              Camera Active
            </Badge>
          )}
          {cameraState === 'requesting_permission' && (
            <Badge variant="sand" size="sm">Requesting Permission...</Badge>
          )}
          {cameraState === 'permission_denied' && (
            <Badge variant="danger" size="sm">Permission Denied</Badge>
          )}
          {cameraState === 'unavailable' && (
            <Badge variant="danger" size="sm">Camera Unavailable</Badge>
          )}
          {cameraState === 'stopped' && (
            <Badge variant="neutral" size="sm">Camera Stopped</Badge>
          )}
          {cameraState === 'not_started' && (
            <Badge variant="neutral" size="sm">Camera Not Started</Badge>
          )}
        </div>

        {/* Viewfinder Overlays Controls */}
        <div className="flex items-center gap-2">
          {depthVisualization && (
            <div className="flex items-center bg-white rounded-xl p-0.5 border border-softBorder shadow-warm-sm text-xs">
              <button
                onClick={() => setViewMode('rgb')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === 'rgb'
                    ? 'bg-terracotta-500 text-white shadow-terracotta'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                RGB Photo
              </button>
              <button
                onClick={() => setViewMode('depth')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === 'depth'
                    ? 'bg-terracotta-500 text-white shadow-terracotta'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Depth Map
              </button>
            </div>
          )}

          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                if (isActive) startCamera(e.target.value);
              }}
              className="bg-white border border-softBorder text-xs rounded-xl px-2.5 py-1 text-charcoal-800 focus:outline-none shadow-warm-sm font-medium"
            >
              {devices.map((device, idx) => (
                <option key={device.deviceId || idx} value={device.deviceId}>
                  {device.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid Overlay"
            className={`p-1.5 rounded-lg text-xs border transition-colors ${
              showGrid
                ? 'bg-terracotta-100 border-terracotta-300 text-terracotta-800 font-semibold'
                : 'bg-white border-softBorder text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            title="Toggle Plane Crosshairs"
            className={`p-1.5 rounded-lg text-xs border transition-colors ${
              showCrosshairs
                ? 'bg-terracotta-100 border-terracotta-300 text-terracotta-800 font-semibold'
                : 'bg-white border-softBorder text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Canvas */}
      <div className="relative aspect-video w-full bg-[#F4EFEA] flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isActive && !currentImage ? 'block' : 'hidden'}`}
        />

        {/* GUIDED SCAN OVERLAY (WHEN CAMERA ACTIVE) */}
        {isActive && !currentImage && scanMode === 'guided' && (
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 p-3.5 rounded-2xl bg-charcoal-900/85 backdrop-blur-md text-white border border-white/10 shadow-2xl">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2 py-0.5 rounded-md bg-terracotta-500 text-white font-mono font-bold text-xs">
                  SCAN {guidedStep}/6
                </span>
                <span className="font-bold text-sm tracking-tight">{currentGuidedStepObj.title}</span>
              </div>
              <p className="text-xs text-charcoal-200">{currentGuidedStepObj.instruction}</p>
            </div>

            {/* Quality Indicator Pill */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${
                  scanQuality === 'good' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <span>
                  {scanQuality === 'good'
                    ? '🟢 Good scan'
                    : scanQuality === 'move_slower'
                    ? '🟡 Move slower'
                    : '🟡 Keep camera steady'}
                </span>
              </div>

              <button
                onClick={handleNextGuidedStep}
                className="px-3 py-1.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold shadow-terracotta transition-all"
              >
                {guidedStep === 6 ? 'Complete Scan' : 'Next Step →'}
              </button>
            </div>
          </div>
        )}

        {/* SUBTLE LIVE DETECTION OVERLAYS */}
        {isActive && !currentImage && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 flex-wrap pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
              ✓ Wall detected
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
              ✓ Floor detected
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
              ✓ Sofa detected
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
              ✓ Window detected
            </span>
          </div>
        )}

        {/* Captured Freeze-Frame / Depth Map View with Detection Overlay */}
        {displayedImage && (
          <div className="relative w-full h-full">
            <img
              ref={imageRef}
              src={displayedImage}
              alt="Room frame"
              className="w-full h-full object-cover"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                  setNaturalDim({ width: img.naturalWidth, height: img.naturalHeight });
                }
              }}
            />

            {/* Interactive Detection Overlay */}
            <DetectionOverlay
              objects={detectedObjects}
              originalWidth={effectiveDim.width}
              originalHeight={effectiveDim.height}
              confidenceThreshold={confidenceThreshold}
              showOverlay={showOverlay}
              selectedObjectId={selectedObjectId}
              onSelectObject={onSelectObject}
            />

            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-softBorder text-xs text-charcoal-800 shadow-warm-sm font-semibold flex items-center gap-2 z-30">
              <span className="w-2 h-2 rounded-full bg-sage-500" />
              <span>
                {viewMode === 'depth'
                  ? 'Inferno Monocular Depth Colormap'
                  : detectedObjects.length > 0
                  ? `Spatial Scene: ${detectedObjects.length} Objects Detected`
                  : 'Room Image Staged for Reconstruction'}
              </span>
            </div>
          </div>
        )}

        {/* Fallback Display */}
        {!isActive && !currentImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-drafting-grid bg-[#FAF6F0]">
            <div className="w-16 h-16 rounded-2xl bg-white border border-softBorder flex items-center justify-center text-terracotta-500 mb-4 shadow-warm-md">
              <Camera className="w-8 h-8 text-terracotta-500" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 mb-1">
              Live Room Camera & Depth Viewport
            </h4>
            <p className="text-xs text-charcoal-600 max-w-md mb-4 leading-relaxed font-normal">
              Click Start Camera to request browser access, or upload a photo of your room for 3D depth reconstruction.
            </p>

            {(error || fileError) && (
              <div className="mb-4 text-xs text-red-800 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl flex items-center gap-2 max-w-md text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error || fileError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Button
                onClick={handleStartCamera}
                isLoading={isLoading}
                variant="primary"
                size="md"
                leftIcon={<Camera className="w-4 h-4" />}
              >
                Start Camera
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="md"
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload Image File
              </Button>
            </div>
          </div>
        )}

        {/* Spatial HUD Overlay */}
        {isActive && !currentImage && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {showGrid && <div className="absolute inset-0 bg-drafting-grid opacity-60" />}
            {showCrosshairs && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 border border-terracotta-500/60 rounded-2xl flex items-center justify-center">
                    <Crosshair className="w-8 h-8 text-terracotta-500/80 animate-pulse" />
                  </div>
                </div>
                <div className="absolute top-8 left-8 border-t-2 border-l-2 border-terracotta-500 w-8 h-8" />
                <div className="absolute top-8 right-8 border-t-2 border-r-2 border-terracotta-500 w-8 h-8" />
                <div className="absolute bottom-8 left-8 border-b-2 border-l-2 border-terracotta-500 w-8 h-8" />
                <div className="absolute bottom-8 right-8 border-b-2 border-r-2 border-terracotta-500 w-8 h-8" />
              </>
            )}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-terracotta-500 to-transparent animate-scan-warm shadow-warm-sm" />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#FAF7F2] border-t border-softBorder text-xs">
        <div className="flex items-center gap-2 text-charcoal-600">
          <Info className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
          <span>Point camera at primary wall boundary, or upload room image for 3D reconstruction.</span>
        </div>

        <div className="flex items-center gap-2">
          {currentImage ? (
            <>
              <Button
                onClick={handleRetake}
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                disabled={isProcessing}
              >
                Retake / New Photo
              </Button>
              <Button
                onClick={onAnalyze}
                isLoading={isProcessing}
                variant="primary"
                size="sm"
                className="shadow-terracotta font-semibold"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                {isProcessing ? 'Estimating 3D Depth...' : 'Reconstruct Room'}
              </Button>
            </>
          ) : isActive ? (
            <>
              <Button
                onClick={handleCapture}
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Capture Frame
              </Button>
              <Button
                onClick={handleStopCamera}
                variant="outline"
                size="sm"
                leftIcon={<CameraOff className="w-3.5 h-3.5" />}
              >
                Stop Camera
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
              >
                Upload File
              </Button>
              <Button
                onClick={handleStartCamera}
                isLoading={isLoading}
                variant="primary"
                size="sm"
                leftIcon={<Camera className="w-3.5 h-3.5" />}
              >
                Start Camera
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="px-5 py-3 bg-[#FCFBF9] border-t border-softBorder text-[11px] text-charcoal-600 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-semibold text-charcoal-900">Spatial Privacy Commitment:</p>
          <p>
            Image processing and 3D depth estimations are computed locally on your FastAPI server. Images are never transmitted to external third-party cloud services.
          </p>
        </div>
      </div>
    </div>
  );
};
