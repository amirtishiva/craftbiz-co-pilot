import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VoiceWaveformProps {
  isRecording: boolean;
  className?: string;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isRecording, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isRecording) {
      initializeAudio();
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isRecording]);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      setIsActive(true);
      draw();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const cleanup = () => {
    setIsActive(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedAverage = average / 255;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw sea-wave effect
    const bars = 50;
    const barWidth = width / bars;
    const time = Date.now() * 0.001;

    for (let i = 0; i < bars; i++) {
      const dataIndex = Math.floor((i / bars) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255;
      
      // Create flowing wave motion
      const x = i * barWidth;
      const waveHeight = Math.sin(i * 0.2 + time * 2) * 20 * normalizedAverage;
      const barHeight = (amplitude * height * 0.6) + waveHeight + 10;
      
      const y = (height - barHeight) / 2;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      
      // Dynamic color based on amplitude
      const opacity = 0.3 + (amplitude * 0.7);
      const hue = 200 + (amplitude * 60); // Blue to purple
      
      gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${opacity})`);
      gradient.addColorStop(0.5, `hsla(${hue + 20}, 80%, 55%, ${opacity * 1.2})`);
      gradient.addColorStop(1, `hsla(${hue}, 70%, 60%, ${opacity})`);

      ctx.fillStyle = gradient;
      
      // Rounded bars
      const radius = barWidth / 2;
      ctx.beginPath();
      ctx.roundRect(x + 1, y, barWidth - 2, barHeight, radius);
      ctx.fill();

      // Add glow effect for active bars
      if (amplitude > 0.1) {
        ctx.shadowBlur = 10 + (amplitude * 20);
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, ${opacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Add center line for visual reference
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm"
        style={{ 
          maxHeight: '200px',
          imageRendering: 'crisp-edges'
        }}
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-1 items-end h-16">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-muted rounded-full opacity-30"
                style={{
                  height: `${20 + Math.sin(i * 0.3) * 15}px`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceWaveform;
