/**
 * Compatibility bridge for apiClient, referencing the centralized api.ts service.
 */

export * from './api';
import {
  api,
  healthCheck,
  analyzeRoom,
  estimateDepth,
  reconstructRoom,
  fetchRecommendations,
  fetchDesignPlan,
  getApiBaseUrl,
  setApiBaseUrl,
  HealthCheckResponse,
  RoomAnalysisResponse,
  DepthEstimationResponse,
  RecommendationsApiResponse,
  DesignPlanResponse,
} from './api';

export type UploadState =
  | 'idle'
  | 'ready'
  | 'uploading'
  | 'analyzing'
  | 'success'
  | 'analysis_completed'
  | 'error'
  | 'backend_unavailable'
  | 'analysis_failed';

export type BackendHealthResponse = HealthCheckResponse;
export type RoomUploadResponse = RoomAnalysisResponse;

export const apiClient = {
  getBaseUrl: getApiBaseUrl,
  setBaseUrl: setApiBaseUrl,
  checkBackendHealth: healthCheck,
  uploadRoomImage: analyzeRoom,
  estimateDepth,
  reconstructRoom,
  fetchRecommendations,
  fetchDesignPlan,
};
