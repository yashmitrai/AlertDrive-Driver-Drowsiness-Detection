import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Activity } from "lucide-react";

interface StatusPanelProps {
  eyeStatus: "open" | "closed";
  yawnDetected: boolean;
  location: string;
  sessionDuration: number;
  isActive: boolean;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const StatusPanel = ({ eyeStatus, yawnDetected, location, sessionDuration, isActive }: StatusPanelProps) => {
  return (
    <div className="space-y-4">
      {/* Eye Status */}
      <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${eyeStatus === "open" ? "bg-success animate-pulse-safe" : "bg-destructive animate-pulse-alert"}`} />
            <span className="font-semibold text-sm">Eye Status</span>
          </div>
          <Badge variant={eyeStatus === "open" ? "default" : "destructive"}>
            {eyeStatus === "open" ? "Open" : "Closed"}
          </Badge>
        </div>
      </Card>

      {/* Yawn Detection */}
      <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Yawn Detection</span>
          </div>
          <Badge variant={yawnDetected ? "secondary" : "outline"}>
            {yawnDetected ? "Yes" : "No"}
          </Badge>
        </div>
      </Card>

      {/* Session Duration */}
      <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-accent" />
            <span className="font-semibold text-sm">Session Time</span>
          </div>
          <Badge variant="outline" className="font-mono">
            {isActive ? formatDuration(sessionDuration) : "00:00:00"}
          </Badge>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-primary mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-sm block mb-1">Current Location</span>
            <p className="text-xs text-muted-foreground font-mono">{location}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatusPanel;
