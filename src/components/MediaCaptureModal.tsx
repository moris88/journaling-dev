import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Check, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { cn } from '@/utils/cn';

interface MediaCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (type: 'image' | 'audio', data: string) => void;
  initialType: 'image' | 'audio';
}

export function MediaCaptureModal({ isOpen, onClose, onCapture, initialType }: MediaCaptureModalProps) {
  const [type, setType] = useState<'image' | 'audio'>(initialType);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && type === 'image') {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, type]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const data = canvasRef.current.toDataURL('image/png');
      setCapturedImage(data);
      stopCamera();
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Il tuo browser non supporta la trascrizione vocale.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'it-IT';
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setTranscription(prev => prev + event.results[i][0].transcript + ' ');
        } else {
          interim += event.results[i][0].transcript;
        }
      }
    };

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);
    
    recognitionRef.current.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
  };

  const handleConfirm = () => {
    if (type === 'image' && capturedImage) {
      onCapture('image', capturedImage);
    } else if (type === 'audio' && transcription) {
      onCapture('audio', transcription);
    }
    onClose();
    reset();
  };

  const reset = () => {
    setCapturedImage(null);
    setTranscription('');
    setIsRecording(false);
    if (type === 'image') startCamera();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={type === 'image' ? "Scatta una foto" : "Trascrizione vocale"}>
      <div className="space-y-4 py-4">
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit mx-auto">
          <Button variant={type === 'image' ? 'primary' : 'ghost'} size="sm" onClick={() => setType('image')}>
            <Camera className="w-4 h-4 mr-2" />
            Foto
          </Button>
          <Button variant={type === 'audio' ? 'primary' : 'ghost'} size="sm" onClick={() => setType('audio')}>
            <Mic className="w-4 h-4 mr-2" />
            Vocale
          </Button>
        </div>

        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200">
          {type === 'image' ? (
            <>
              {!capturedImage ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover scale-x-[-1]" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500",
                isRecording ? "bg-red-500 animate-pulse scale-110" : "bg-blue-600"
              )}>
                <Mic className="w-10 h-10" />
              </div>
              <p className="text-sm text-slate-400 min-h-[3em]">
                {isRecording ? "Ascoltando..." : "Premi avvia per parlare"}
              </p>
              <div className="mt-4 p-4 bg-white/10 rounded-lg w-full max-h-40 overflow-y-auto text-left text-sm font-mono">
                {transcription || "La tua trascrizione apparirà qui..."}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {type === 'image' ? (
            !capturedImage ? (
              <Button size="lg" className="rounded-full w-16 h-16" onClick={takePhoto}>
                <div className="w-12 h-12 rounded-full border-4 border-white" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={reset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Riprova
                </Button>
                <Button variant="success" onClick={handleConfirm}>
                  <Check className="w-4 h-4 mr-2" />
                  Salva
                </Button>
              </>
            )
          ) : (
            <>
              {!isRecording ? (
                <Button onClick={startVoice} size="lg">Avvia Registrazione</Button>
              ) : (
                <Button variant="danger" onClick={stopVoice} size="lg">Ferma</Button>
              )}
              {transcription && !isRecording && (
                <Button variant="success" onClick={handleConfirm}>
                  <Check className="w-4 h-4 mr-2" />
                  Salva Testo
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
