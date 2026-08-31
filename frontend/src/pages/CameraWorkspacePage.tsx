import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraViewfinder } from '../components/camera/CameraViewfinder';
import { RoomConfigPanel } from '../components/camera/RoomConfigPanel';
import { SpatialReconstructionView } from '../components/camera/SpatialReconstructionView';
import { RoomAnalysisCard } from '../components/camera/RoomAnalysisCard';
import { useToast } from '../context/ToastContext';
import { useProjects } from '../context/ProjectContext';
import {
  healthCheck,
  analyzeRoom,
  getApiBaseUrl,
  ProcessingState,
  RoomAnalysisResponse,
  RoomAnalysisConfig
} from '../services/api';
import { RoomType, DesignStyle } from '../types';
import {
  convertDetectedObjectsToPlacedFurniture,
  getArchetypeFurniture,
  STYLE_PRESETS
} from '../utils/roomArchetypes';

export const CameraWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { createProject, setActiveProject } = useProjects();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('ready');
  const [analysisResponse, setAnalysisResponse] = useState<RoomAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');

  // Track latest configured room settings
  const [activeConfig, setActiveConfig] = useState<RoomAnalysisConfig>({
    roomType: 'living_room',
    designStyle: 'modern',
    budget: 500000,
    dimensions: { length: 4.2, width: 3.5, height: 2.7 },
  });

  // Interactive CV & 3D Reconstruction controls
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.25);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);

  // Check backend health on mount & periodically
  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      const res = await healthCheck();
      if (isMounted) {
        setBackendStatus(res.status === 'online' ? 'online' : 'offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setProcessingState('ready');
    setErrorMessage(null);
    setAnalysisResponse(null);
    setSelectedObjectId(null);
    addToast({
      title: 'Room Image Captured',
      description: 'Image ready. Click "Analyze Room" to run Computer Vision and 3D spatial extraction.',
      type: 'info',
    });
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setProcessingState('ready');
    setErrorMessage(null);
    setAnalysisResponse(null);
    setSelectedObjectId(null);
  };

  const handleAnalyzeRoom = async (config: RoomAnalysisConfig) => {
    if (!capturedImage) {
      addToast({
        title: 'No Image Staged',
        description: 'Please start the camera and capture a frame or upload an image file first.',
        type: 'warning',
      });
      return;
    }

    setActiveConfig(config);
    setProcessingState('uploading');
    setErrorMessage(null);

    try {
      setTimeout(() => {
        setProcessingState((prev) => (prev === 'uploading' ? 'analyzing' : prev));
      }, 350);

      const res = await analyzeRoom(
        capturedImage,
        { ...config, confidenceThreshold },
        `room_scan_${Date.now()}.jpg`
      );

      setProcessingState('analysis_completed');
      setAnalysisResponse(res);
      setBackendStatus('online');

      // Create persistent project in local state with full 3D spatial reconstruction data
      const detectedCount = res.objects?.length || 0;
      const planesCount = res.planes?.length || 0;
      const rLen = res.room?.length_m || config.dimensions?.length || 4.2;
      const rWid = res.room?.width_m || config.dimensions?.width || 3.5;
      const rHgt = res.room?.height_m || config.dimensions?.height || 2.7;

      const stylePreset = STYLE_PRESETS[(config.designStyle || 'modern') as DesignStyle] || STYLE_PRESETS.modern;
      const wallColor = res.room_structure?.dominant_wall_color || stylePreset.palette.wall;
      const floorColor = res.room_structure?.dominant_floor_color || stylePreset.palette.floor;

      // Convert detected objects to real staged furniture (never inject fake furniture if none detected)
      const placedFurniture = res.objects && res.objects.length > 0
        ? convertDetectedObjectsToPlacedFurniture(res.objects, { length: rLen, width: rWid, height: rHgt })
        : [];

      const created = createProject({
        title: `${(config.designStyle || 'Modern').toUpperCase()} ${(config.roomType || 'Living Room').replace(/_/g, ' ')}`,
        roomType: (config.roomType || 'living_room') as RoomType,
        designStyle: (config.designStyle || 'modern') as DesignStyle,
        dimensions: {
          length: rLen,
          width: rWid,
          height: rHgt,
          unit: 'metric',
          isEstimated: res.is_estimated !== false,
          confidence: Math.round((res.scale_confidence ?? 0.78) * 100),
        },
        budgetAllocated: config.budget || 500000,
        budgetSpent: Math.round((config.budget || 500000) * 0.85),
        currency: 'INR',
        status: 'analyzed',
        recommendationsCount: 3,
        scanImage: capturedImage,
        detectedObjects: res.objects,
        roomStructure: res.room_structure,
        notes: `3D Spatial Reconstruction: ${detectedCount} objects, ${planesCount} RANSAC planes. Calibrated via ${res.calibration_source || 'prior'}.`,
        spatialData: {
          depthVisualization: res.depth_visualization,
          planesCount: res.planes?.length || 0,
          objectsCount: res.objects?.length || 0,
          floorAreaSqm: res.room?.floor_area_sqm,
          volumeM3: res.room?.volume_m3,
          scaleConfidence: res.scale_confidence,
          isEstimated: res.is_estimated,
          dominantWallColor: wallColor,
          dominantFloorColor: floorColor,
        },
        designCustomization: {
          scanImage: capturedImage,
          roomType: (config.roomType || 'living_room') as RoomType,
          style: (config.designStyle || 'modern') as DesignStyle,
          dimensions: {
            length: rLen,
            width: rWid,
            height: rHgt,
            unit: 'metric',
            isEstimated: res.is_estimated !== false,
            confidence: Math.round((res.scale_confidence ?? 0.78) * 100),
          },
          colors: {
            wall: wallColor,
            floor: floorColor,
            ceiling: stylePreset.palette.ceiling,
            furniture: stylePreset.palette.furniture,
            accent: stylePreset.palette.accent,
          },
          floorMaterial: stylePreset.floorMaterial,
          placedFurniture: placedFurniture,
          selectedItemId: null,
          budget: config.budget || 500000,
          viewMode: 'top_down',
        },
      });

      setActiveProject(created);

      addToast({
        title: 'Spatial Reconstruction Complete',
        description: `Extracted ${detectedCount} objects and fitted ${planesCount} room planes (${res.inference_time_ms || 180}ms).`,
        type: 'success',
      });
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : 'Reconstruction failed';
      setErrorMessage(errStr);

      if (errStr.toLowerCase().includes('offline') || errStr.toLowerCase().includes('network') || errStr.toLowerCase().includes('fetch')) {
        setProcessingState('backend_unavailable');
        setBackendStatus('offline');
        addToast({
          title: 'Backend is offline.',
          description: `Cannot reach FastAPI at ${getApiBaseUrl()}. Please ensure the backend service is running.`,
          type: 'error',
        });
      } else {
        setProcessingState('analysis_failed');
        addToast({
          title: 'Reconstruction Failed',
          description: errStr,
          type: 'error',
        });
      }
    }
  };

  const detectedObjects = analysisResponse?.objects || [];
  const imageDimensions = analysisResponse?.image_quality
    ? { width: analysisResponse.image_quality.width, height: analysisResponse.image_quality.height }
    : undefined;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
          Scan My Room
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Capture room geometry, identify interior furniture, and prepare your 2D and 3D room visualization.
        </p>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Viewfinder Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <CameraViewfinder
            capturedImage={capturedImage}
            onCapture={handleCapture}
            onRetake={handleRetake}
            onAnalyze={() =>
              handleAnalyzeRoom({
                roomType: activeConfig.roomType || 'living_room',
                designStyle: activeConfig.designStyle || 'modern',
                budget: activeConfig.budget || 500000,
                dimensions: activeConfig.dimensions || { length: 4.2, width: 3.5, height: 2.7 },
                confidenceThreshold,
              })
            }
            processingState={processingState}
            backendStatus={backendStatus}
            detectedObjects={detectedObjects}
            imageDimensions={imageDimensions}
            confidenceThreshold={confidenceThreshold}
            showOverlay={showOverlay}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
            depthVisualization={analysisResponse?.depth_visualization}
          />

          {/* If Analysis Completed, display the 3D Spatial Reconstruction View */}
          {processingState === 'analysis_completed' && analysisResponse && (
            <SpatialReconstructionView
              analysis={analysisResponse}
              confidenceThreshold={confidenceThreshold}
              onConfidenceChange={setConfidenceThreshold}
              showOverlay={showOverlay}
              onToggleOverlay={() => setShowOverlay(!showOverlay)}
              selectedObjectId={selectedObjectId}
              onSelectObject={setSelectedObjectId}
            />
          )}
        </div>

        {/* Configuration & Analysis Summary Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {processingState === 'analysis_completed' && analysisResponse ? (
            <RoomAnalysisCard
              analysis={analysisResponse}
              capturedImage={capturedImage}
              selectedRoomType={(activeConfig.roomType || 'living_room') as RoomType}
              selectedStyle={(activeConfig.designStyle || 'modern') as DesignStyle}
              targetBudget={activeConfig.budget || 500000}
              onOpenStudio={() => navigate('/studio')}
              onOpenRecommendations={() => navigate('/recommendations')}
              onRetakePhoto={handleRetake}
            />
          ) : (
            <RoomConfigPanel
              capturedImage={capturedImage}
              processingState={processingState}
              analysisResponse={analysisResponse}
              errorMessage={errorMessage}
              onAnalyzeTrigger={handleAnalyzeRoom}
              backendStatus={backendStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
};
