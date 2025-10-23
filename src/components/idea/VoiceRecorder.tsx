import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onTranscription: (text: string, language: string) => void;
}

const VoiceRecorder = ({ onTranscription }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);

      try {
        // Simulate audio recording and transcription
        const { data, error } = await supabase.functions.invoke('transcribe-voice', {
          body: { audioData: 'simulated-audio-data' }
        });

        if (error) throw error;

        onTranscription(data.transcribedText, data.detectedLanguage);
        toast.success('Voice transcribed successfully');
      } catch (error) {
        console.error('Transcription error:', error);
        toast.error('Failed to transcribe voice recording');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsRecording(true);
      toast.info('Recording started - speak your business idea');
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
