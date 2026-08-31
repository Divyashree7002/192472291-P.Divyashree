import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebcamState {
  stream: MediaStream | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
}

export function useWebcam() {
  const [state, setState] = useState<WebcamState>({
    stream: null,
    isActive: false,
    isLoading: false,
    error: null,
    devices: [],
    selectedDeviceId: '',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Enumerate video input devices
  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return;
      }
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
      setState((prev) => ({
        ...prev,
        devices: videoInputs,
        selectedDeviceId: prev.selectedDeviceId || (videoInputs[0]?.deviceId ?? ''),
      }));
    } catch (e) {
      console.warn('Could not enumerate video devices:', e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((prev) => ({
      ...prev,
      stream: null,
      isActive: false,
      isLoading: false,
      error: null,
    }));
  }, [state.stream]);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      stopCamera();
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Webcam access is not supported by your browser environment.');
        }

        const targetDeviceId = deviceId || state.selectedDeviceId;
        const constraints: MediaStreamConstraints = {
          video: targetDeviceId
            ? { deviceId: { exact: targetDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setState((prev) => ({
          ...prev,
          stream: mediaStream,
          isActive: true,
          isLoading: false,
          error: null,
          selectedDeviceId: targetDeviceId || prev.selectedDeviceId,
        }));

        await refreshDevices();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to access camera device.';
        setState((prev) => ({
          ...prev,
          stream: null,
          isActive: false,
          isLoading: false,
          error: message,
        }));
      }
    },
    [state.selectedDeviceId, stopCamera, refreshDevices]
  );

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !state.isActive) return null;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.error('Frame capture failed:', e);
      return null;
    }
  }, [state.isActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [state.stream]);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
    captureFrame,
    refreshDevices,
    setSelectedDeviceId: (id: string) => setState((prev) => ({ ...prev, selectedDeviceId: id })),
  };
}
