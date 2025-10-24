import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateAudio } from '@/lib/validation';

interface VoiceRecorderProps {
  onTranscription: (text: string, language: string) => void;
}

const VoiceRecorder = ({ onTranscription }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const handleRecord = async () => {
    if (isRecording && mediaRecorder) {
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          
          // Validate audio file
          const validation = validateAudio(audioBlob);
          if (!validation.valid) {
            toast.error(validation.error || 'Audio file is too large');
            return;
          }

          setIsProcessing(true);

          try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              
              const { data, error } = await supabase.functions.invoke('transcribe-voice', {
                body: { audioData: base64Audio }
              });

              if (error) {
                console.error('Transcription error:', error);
                throw error;
              }

              // Use translated text if available, otherwise use transcribed text
              const finalText = data.translatedText || data.transcribedText;
              onTranscription(finalText, data.detectedLanguage);
              
              if (data.detectedLanguage !== 'en') {
                toast.success(`Voice transcribed and translated from ${data.detectedLanguage} to English`);
              } else {
                toast.success('Voice transcribed successfully');
              }
            };
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Failed to transcribe voice recording');
          } finally {
            setIsProcessing(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        toast.info('Recording started - speak your business idea');
      } catch (error) {
        console.error('Microphone access error:', error);
        toast.error('Failed to access microphone. Please grant permission.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleRecord}
        disabled={isProcessing}
        variant={isRecording ? 'destructive' : 'default'}
        size="lg"
        className="w-full"
        aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
      >
        {isRecording ? (
          <>
            <Square className="mr-2 h-5 w-5" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="mr-2 h-5 w-5" />
            {isProcessing ? 'Processing...' : 'Start Recording'}
          </>
        )}
      </Button>
      {isRecording && (
        <div className="text-sm text-muted-foreground animate-pulse">
          Recording in progress...
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
