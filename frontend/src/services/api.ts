/**
 * SmartSpace AI - Centralized Backend API Service (Phase 6)
 * Handles communication with the FastAPI service running at http://127.0.0.1:8001
 * Integrates Real Computer Vision, Monocular Depth Estimation, 3D Spatial Reconstruction,
 * and AI-Powered Interior Design Recommendations.
 */

import { RecommendationPlan } from '../types';

const DEFAULT_API_BASE = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export interface HealthCheckResponse {
  status: 'online' | 'offline';
  service?: string;
  message?: string;
  phase?: string;
  features?: string[];
  latencyMs?: number;
}

export interface RoomDimensionsInput {
  length?: number;
  width?: number;
  height?: number;
}

export interface RoomAnalysisConfig {
  roomType?: string;
  designStyle?: string;
  budget?: number; // In INR
  dimensions?: RoomDimensionsInput;
  confidenceThreshold?: number;
}

export interface ImageQualityReport {
  width: number;
  height: number;
  aspect_ratio: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  quality_rating: 'good' | 'fair' | 'poor' | string;
  quality_issues: string[];
}

export interface PlaneNormal {
  x: number;
  y: number;
  z: number;
}

export interface EstimatedPlane {
  plane_type: 'floor' | 'ceiling' | 'wall_front' | 'wall_left' | 'wall_right' | string;
  orientation_label: string;
  normal: PlaneNormal;
  d_offset: number;
  confidence: number;
  inliers_count: number;
  estimated_distance_m: number;
  equation: string;
}

export interface Spatial3DCoordinates {
  x_m: number;
  y_m: number;
  z_m: number;
  width_m: number;
  height_m: number;
  depth_m: number;
  distance_from_camera_m: number;
  clearance_radius_m: number;
}

export interface DetectedObject {
  class_name: string;
  confidence: number;
  category?: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  center: {
    x: number;
    y: number;
  };
  spatial_3d?: Spatial3DCoordinates;
}

export interface RoomStructureReport {
  floor_detected: boolean;
  wall_detected: boolean;
  ceiling_detected: boolean;
  dominant_colors: string[];
  dominant_wall_color?: string;
  dominant_floor_color?: string;
  scene_type: string;
  estimated_clutter_level: 'low' | 'moderate' | 'high' | string;
  boundary_lines_count: number;
  estimated_floor_coverage?: string;
  detected_furniture_count?: number;
  is_estimate?: boolean;
  note?: string;
}

export interface ReconstructedRoomMetrics {
  length_m: number;
  width_m: number;
  height_m: number;
  floor_area_sqm: number;
  volume_m3: number;
}

export interface IgnoredObjectReport {
  raw_label: string;
  ignored_category: 'person' | 'animal' | 'clothing' | 'personal_item' | 'unrelated_object' | string;
  confidence: number;
}

export interface IgnoredObjectsSummary {
  total_ignored: number;
  people_count: number;
  animals_count: number;
  clothing_count?: number;
  personal_items_count: number;
  descriptions: string[];
}

export interface RoomAnalysisResponse {
  success: boolean;
  filename: string;
  content_type: string;
  message: string;
  inference_time_ms: number;
  image_quality: ImageQualityReport;
  objects: DetectedObject[];
  ignored_objects?: IgnoredObjectReport[];
  ignored_summary?: IgnoredObjectsSummary;
  furniture_detected_count?: number;
  doors_count?: number;
  windows_count?: number;
  ai_room_insights?: string[];
  room_structure: RoomStructureReport;
  // Phase 5 Spatial & Depth Reconstruction additions
  depth_visualization?: string; // base64 JPEG data URL
  depth_metrics?: {
    min_relative_depth: number;
    max_relative_depth: number;
    mean_relative_depth: number;
    depth_variance: number;
  };
  planes?: EstimatedPlane[];
  room?: ReconstructedRoomMetrics;
  calibration_source?: string;
  scale_confidence?: number;
  scale_estimated?: boolean;
  is_estimated?: boolean;
  cv_status?: string;
  room_type?: string;
  design_style?: string;
  budget?: number;
  dimensions?: RoomDimensionsInput;
  monocular_disclaimer?: string;
}

export interface DepthEstimationResponse {
  success: boolean;
  depth_visualization: string;
  depth_metrics: {
    min_relative_depth: number;
    max_relative_depth: number;
    mean_relative_depth: number;
    depth_variance: number;
  };
  scale_ambiguity_note: string;
}

export type ProcessingState =
  | 'idle'
  | 'ready'
  | 'uploading'
  | 'analyzing'
  | 'analysis_completed'
  | 'analysis_failed'
  | 'backend_unavailable';

export interface RecommendationRequest {
  room_type?: string;
  design_style?: string;
  budget?: number; // In INR
  length?: number;
  width?: number;
  height?: number;
  existing_objects?: DetectedObject[];
  planes?: EstimatedPlane[];
}

export interface RecommendationsApiResponse {
  success: boolean;
  plans: RecommendationPlan[];
  count: number;
  currency: string;
  room_type: string;
  design_style: string;
  budget_inr: number;
}

export interface DesignPlanResponse {
  success: boolean;
  room_summary: {
    room_type: string;
    design_style: string;
    length_m: number;
    width_m: number;
    height_m: number;
    floor_area_sqm: number;
    volume_m3: number;
    budget_inr: number;
    currency: string;
  };
  plan: RecommendationPlan;
  alternative_plans_count: number;
  generated_at: string;
}

let apiBaseUrl = DEFAULT_API_BASE;

export function setApiBaseUrl(url: string) {
  if (url && typeof url === 'string') {
    apiBaseUrl = url.trim();
  }
}

export function getApiBaseUrl(): string {
  let url = (apiBaseUrl || DEFAULT_API_BASE || '').trim();
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Automatically prepend protocol scheme if missing
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  return url;
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      const timeoutErr = new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
      (timeoutErr as any).isTimeout = true;
      throw timeoutErr;
    }
    throw err;
  }
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  if (parts.length !== 2) {
    throw new Error('Invalid data URL format for image conversion.');
  }
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

export async function healthCheck(): Promise<HealthCheckResponse> {
  const startTime = performance.now();
  const baseUrl = getApiBaseUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (response.ok) {
      const data = await response.json();
      return {
        status: 'online',
        service: data.service || 'SmartSpace AI Backend',
        phase: data.phase || 'Phase 6 - AI Recommendation Engine',
        features: data.features || [],
        latencyMs,
      };
    } else {
      return {
        status: 'offline',
        message: `HTTP error ${response.status}`,
        latencyMs,
      };
    }
  } catch (err: unknown) {
    return {
      status: 'offline',
      message: err instanceof Error ? err.message : 'Backend unreachable',
      latencyMs: Math.round(performance.now() - startTime),
    };
  }
}

export async function analyzeRoom(
  image: Blob | File | string,
  config: RoomAnalysisConfig = {},
  filename: string = `room_capture_${Date.now()}.jpg`
): Promise<RoomAnalysisResponse> {
  const baseUrl = getApiBaseUrl();
  let fileBlob: Blob;

  if (typeof image === 'string') {
    if (image.startsWith('data:')) {
      fileBlob = dataUrlToBlob(image);
    } else {
      throw new Error('Invalid image string. Must be a base64 Data URL.');
    }
  } else {
    fileBlob = image;
  }

  const formData = new FormData();
  formData.append('file', fileBlob, filename);
  formData.append('room_type', config.roomType || 'living_room');
  formData.append('design_style', config.designStyle || 'modern');
  formData.append('budget', (config.budget || 500000).toString());

  if (config.dimensions?.length) formData.append('length', config.dimensions.length.toString());
  if (config.dimensions?.width) formData.append('width', config.dimensions.width.toString());
  if (config.dimensions?.height) formData.append('height', config.dimensions.height.toString());
  if (config.confidenceThreshold !== undefined) {
    formData.append('confidence_threshold', config.confidenceThreshold.toString());
  }

  try {
    const response = await fetch(`${baseUrl}/api/analyze-room`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
      throw new Error(errorData.detail || `Server returned error status ${response.status}`);
    }

    const data: RoomAnalysisResponse = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error('Backend Offline: Unable to reach FastAPI server at ' + baseUrl);
    }
    throw err;
  }
}

export async function estimateDepth(
  image: Blob | File | string,
  filename: string = `depth_sample_${Date.now()}.jpg`
): Promise<DepthEstimationResponse> {
  const baseUrl = getApiBaseUrl();
  let fileBlob: Blob;

  if (typeof image === 'string') {
    if (image.startsWith('data:')) {
      fileBlob = dataUrlToBlob(image);
    } else {
      throw new Error('Invalid image data URL provided.');
    }
  } else {
    fileBlob = image;
  }

  const formData = new FormData();
  formData.append('file', fileBlob, filename);

  const response = await fetch(`${baseUrl}/api/estimate-depth`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Depth calculation failed' }));
    throw new Error(err.detail || 'Depth calculation failed');
  }

  return response.json();
}

export async function reconstructRoom(
  image: Blob | File | string,
  dimensions?: RoomDimensionsInput,
  confidenceThreshold: number = 0.25,
  filename: string = `reconstruct_sample_${Date.now()}.jpg`
): Promise<RoomAnalysisResponse> {
  const baseUrl = getApiBaseUrl();
  let fileBlob: Blob;

  if (typeof image === 'string') {
    if (image.startsWith('data:')) {
      fileBlob = dataUrlToBlob(image);
    } else {
      throw new Error('Invalid image data URL provided.');
    }
  } else {
    fileBlob = image;
  }

  const formData = new FormData();
  formData.append('file', fileBlob, filename);
  if (dimensions?.length) formData.append('length', dimensions.length.toString());
  if (dimensions?.width) formData.append('width', dimensions.width.toString());
  if (dimensions?.height) formData.append('height', dimensions.height.toString());
  formData.append('confidence_threshold', confidenceThreshold.toString());

  const response = await fetch(`${baseUrl}/api/reconstruct-room`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Spatial reconstruction failed' }));
    throw new Error(err.detail || 'Spatial reconstruction failed');
  }

  return response.json();
}

/**
 * Phase 6: Fetch personalized, multi-criteria interior design recommendations from FastAPI.
 */
export async function fetchRecommendations(
  req: RecommendationRequest
): Promise<RecommendationsApiResponse> {
  const baseUrl = getApiBaseUrl();

  const response = await fetch(`${baseUrl}/api/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      room_type: req.room_type || 'living_room',
      design_style: req.design_style || 'modern',
      budget: req.budget || 500000,
      length: req.length || 4.8,
      width: req.width || 3.6,
      height: req.height || 2.8,
      existing_objects: req.existing_objects || [],
      planes: req.planes || [],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to generate recommendations' }));
    throw new Error(err.detail || 'Failed to generate recommendations');
  }

  return response.json();
}

/**
 * Phase 6: Fetch comprehensive design plan from FastAPI.
 */
export async function fetchDesignPlan(
  req: RecommendationRequest
): Promise<DesignPlanResponse> {
  const baseUrl = getApiBaseUrl();

  const response = await fetch(`${baseUrl}/api/design-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      room_type: req.room_type || 'living_room',
      design_style: req.design_style || 'modern',
      budget: req.budget || 500000,
      length: req.length || 4.8,
      width: req.width || 3.6,
      height: req.height || 2.8,
      existing_objects: req.existing_objects || [],
      planes: req.planes || [],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to generate design plan' }));
    throw new Error(err.detail || 'Failed to generate design plan');
  }

  return response.json();
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'RESEARCH';
  created_at?: string;
  last_login_at?: string;
  is_active?: boolean;
}

export interface AuthApiResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
  expires_in_seconds: number;
}

export const AUTH_TOKEN_KEY = 'smartspace_jwt_token_v1';
export const AUTH_USER_KEY = 'smartspace_auth_user_v1';
export const AUTH_REMEMBER_KEY = 'smartspace_auth_remember_v1';

/**
 * Decodes standard JWT payload without verifying signature (for client-side expiration check).
 */
export function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks whether a JWT token has expired temporally.
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds; Date.now() is in milliseconds
  return Date.now() >= payload.exp * 1000;
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }
  return token;
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: AuthUser, rememberMe: boolean = true) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    if (rememberMe) {
      localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_REMEMBER_KEY);
    }
    // Clean up temporary sessionStorage
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  } catch (err) {
    console.error('[SmartSpace Auth] Failed to save session to localStorage:', err);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_REMEMBER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  } catch (err) {
    console.error('[SmartSpace Auth] Failed to clear session:', err);
  }
}

// Backward-compatibility aliases
export function setAuthToken(token: string, rememberMe: boolean = true) {
  const existingUser = getStoredUser();
  if (existingUser) {
    setStoredSession(token, existingUser, rememberMe);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (rememberMe) localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
  }
}

export function clearAuthToken() {
  clearAuthSession();
}

/**
 * Executes a fetch request with timeout and standard connection error formatting.
 */
async function safeAuthFetch(url: string, options: RequestInit, timeoutMs: number = 8000): Promise<Response> {
  try {
    const response = await fetchWithTimeout(url, options, timeoutMs);
    return response;
  } catch (err: unknown) {
    console.error('[SmartSpace Network Error]:', err);
    const msg = (err as Error)?.message || 'SmartSpace AI server is currently unavailable. Please try again.';
    throw new Error(msg);
  }
}

export async function apiRegister(name: string, email: string, password: string): Promise<AuthApiResponse> {
  const baseUrl = getApiBaseUrl();
  const response = await safeAuthFetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
  }, 10000);

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || '';
    } catch {
      // response wasn't JSON
    }

    if (response.status === 409) {
      throw new Error(errorDetail || 'Email already registered. Please sign in instead.');
    } else if (response.status === 400) {
      throw new Error(errorDetail || 'Password does not meet requirements.');
    } else if (response.status >= 500) {
      throw new Error('Something went wrong. Please try again.');
    } else {
      throw new Error(errorDetail || `Registration failed (HTTP ${response.status})`);
    }
  }

  const data: AuthApiResponse = await response.json();
  setStoredSession(data.access_token, data.user, true);
  return data;
}

export async function apiLogin(email: string, password: string, rememberMe: boolean = false): Promise<AuthApiResponse> {
  const baseUrl = getApiBaseUrl();
  const response = await safeAuthFetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password, remember_me: rememberMe }),
  }, 10000);

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || '';
    } catch {
      // response wasn't JSON
    }

    if (response.status === 401) {
      throw new Error(errorDetail || 'Incorrect email or password.');
    } else if (response.status === 403) {
      throw new Error(errorDetail || 'Your account has been deactivated. Please contact an administrator.');
    } else if (response.status >= 500) {
      throw new Error('Something went wrong. Please try again.');
    } else {
      throw new Error(errorDetail || `Authentication failed (HTTP ${response.status})`);
    }
  }

  const data: AuthApiResponse = await response.json();
  setStoredSession(data.access_token, data.user, rememberMe);
  return data;
}

export async function apiGetMe(): Promise<{ user: AuthUser }> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication session found.');
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }, 8000);
  } catch (err: unknown) {
    console.error('[SmartSpace Auth] Profile verification connection issue:', err);
    const isTimeout = (err as any)?.isTimeout;
    const networkErr = new Error(
      isTimeout
        ? 'Session verification timed out. Please check your connection.'
        : 'SmartSpace AI server is currently unavailable. Please try again.'
    );
    (networkErr as any).isNetworkError = true;
    throw networkErr;
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || '';
    } catch {
      // response wasn't JSON
    }

    if (response.status === 401) {
      clearAuthSession();
      const authErr = new Error(errorDetail || 'Your session has expired. Please sign in again.');
      (authErr as any).isAuthExpired = true;
      throw authErr;
    }
    throw new Error(errorDetail || `Failed to authenticate user profile (HTTP ${response.status})`);
  }

  const data = await response.json();
  // Update stored user with freshly verified data
  if (data && data.user) {
    const isRemembered = localStorage.getItem(AUTH_REMEMBER_KEY) === 'true';
    setStoredSession(token, data.user, isRemembered);
  } else {
    throw new Error('Invalid user profile response from server.');
  }
  return data;
}

export async function apiLogout(): Promise<{ status: string; message: string }> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  clearAuthSession();

  try {
    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return response.json();
  } catch {
    return { status: 'ok', message: 'Successfully logged out locally.' };
  }
}

// Role-protected API helpers
export async function apiAdminListUsers(): Promise<{ total_users: number; users: AuthUser[]; queried_by: string }> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const response = await safeAuthFetch(`${baseUrl}/api/admin/users`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Access denied: Administrator privileges required.');
    }
    throw new Error('Failed to load user list.');
  }

  return response.json();
}

export async function apiAdminSystemStatus(): Promise<Record<string, any>> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const response = await safeAuthFetch(`${baseUrl}/api/admin/system-status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Access denied: Administrator privileges required.');
    }
    throw new Error('Failed to load system status.');
  }

  return response.json();
}

export async function apiResearchBenchmarks(): Promise<Record<string, any>> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const response = await safeAuthFetch(`${baseUrl}/api/research/benchmarks`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Access denied: Research privileges required.');
    }
    throw new Error('Failed to load benchmarks.');
  }

  return response.json();
}

export const checkBackendHealth = healthCheck;
export const generateRecommendations = fetchRecommendations;
export const generateDesignPlan = fetchDesignPlan;

export const api = {
  healthCheck,
  checkBackendHealth,
  analyzeRoom,
  estimateDepth,
  reconstructRoom,
  fetchRecommendations,
  generateRecommendations,
  fetchDesignPlan,
  generateDesignPlan,
  apiRegister,
  apiLogin,
  apiGetMe,
  apiLogout,
  apiAdminListUsers,
  apiAdminSystemStatus,
  apiResearchBenchmarks,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getStoredUser,
  setStoredSession,
  clearAuthSession,
  isTokenExpired,
  getBaseUrl: getApiBaseUrl,
  setBaseUrl: setApiBaseUrl,
};


