import { useRef, useCallback, useState, useEffect } from 'react';

interface UseCameraOptions {
  onError?: (error: Error) => void;
}

export const useCamera = ({ onError }: UseCameraOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video metadata to load before playing
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }
          
          const handleLoadedMetadata = () => {
            videoRef.current?.play()
              .then(() => {
                setIsActive(true);
                setIsLoading(false);
                resolve();
              })
              .catch(reject);
          };

          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          
          // Fallback timeout
          setTimeout(() => {
            if (!isActive) {
              reject(new Error('Video loading timeout'));
            }
          }, 5000);
        });
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setIsLoading(false);
      if (onError && error instanceof Error) {
        onError(error);
      }
      throw error;
    }
  }, [isActive, onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
    setIsLoading(false);
  }, []);

  const captureImage = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !isActive) {
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { 
            type: 'image/jpeg' 
          });
          resolve(file);
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.95);
    });
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    isLoading,
    startCamera,
    stopCamera,
    captureImage
  };
};
