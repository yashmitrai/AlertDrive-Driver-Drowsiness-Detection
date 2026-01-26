import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFaceDetection } from "@/hooks/useFaceDetection";

interface CameraFeedProps {
  eyeStatus: "open" | "closed";
  yawnDetected: boolean;
  alertLevel: "safe" | "warning" | "danger";
  isActive: boolean;
  onDetection: (eyesClosed: boolean, mouthOpen: boolean) => void;
}

const CameraFeed = ({ eyeStatus, yawnDetected, alertLevel, isActive, onDetection }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const detection = useFaceDetection(videoRef, isActive);

  // Report detection results to parent
  useEffect(() => {
    if (isActive) {
      onDetection(detection.eyesClosed, detection.mouthOpen);
    }
  }, [detection.eyesClosed, detection.mouthOpen, isActive, onDetection]);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraError("");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Camera access denied. Please allow camera access in browser settings.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const getBorderClass = () => {
    switch (alertLevel) {
      case "danger":
        return "border-destructive animate-pulse-alert";
      case "warning":
        return "border-warning";
      default:
        return "border-primary/30";
    }
  };

  return (
    <Card className={`relative overflow-hidden border-2 ${getBorderClass()} transition-all duration-300`}>
      {/* Live Camera Feed */}
      <div className="aspect-video bg-card flex items-center justify-center relative">
        {cameraError ? (
          <div className="text-center p-6">
            <VideoOff className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-semibold mb-2">Camera Error</p>
            <p className="text-sm text-muted-foreground">{cameraError}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Detection overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Face detection box simulation */}
              {stream && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-dashed border-primary/60 rounded-lg" />
              )}
            </div>
          </>
        )}

        {/* Status overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Badge 
            variant={eyeStatus === "open" ? "default" : "destructive"}
            className="backdrop-blur-sm bg-card/80"
          >
            {eyeStatus === "open" ? "👁️ Eyes Open" : "❌ Eyes Closed"}
          </Badge>
          {yawnDetected && (
            <Badge variant="secondary" className="backdrop-blur-sm bg-warning/80 text-warning-foreground">
              😴 Yawn Detected
            </Badge>
          )}
        </div>

        {/* Recording indicator */}
        {stream && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 bg-destructive/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-semibold text-white">LIVE</span>
            </div>
          </div>
        )}

        {/* No camera message */}
        {!stream && !cameraError && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 backdrop-blur-sm">
            <div className="text-center">
              <Video className="w-12 h-12 text-primary mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CameraFeed;
