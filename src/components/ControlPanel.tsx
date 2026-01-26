import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, Square, Bell, Send } from "lucide-react";

interface ControlPanelProps {
  isActive: boolean;
  alarmEnabled: boolean;
  onToggleSystem: () => void;
  onToggleAlarm: () => void;
  onManualAlert: () => void;
}

const ControlPanel = ({
  isActive,
  alarmEnabled,
  onToggleSystem,
  onToggleAlarm,
  onManualAlert,
}: ControlPanelProps) => {
  return (
    <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* System Control */}
        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={onToggleSystem}
            className={`font-semibold ${
              isActive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-success hover:bg-success/90"
            }`}
          >
            {isActive ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop System
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start System
              </>
            )}
          </Button>
        </div>

        {/* Alarm Toggle */}
        <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-lg">
          <Bell className={`w-4 h-4 ${alarmEnabled ? "text-primary" : "text-muted-foreground"}`} />
          <Label htmlFor="alarm-toggle" className="cursor-pointer font-medium">
            Alarm
          </Label>
          <Switch
            id="alarm-toggle"
            checked={alarmEnabled}
            onCheckedChange={onToggleAlarm}
          />
        </div>

        {/* Manual Alert */}
        <Button
          variant="destructive"
          size="lg"
          onClick={onManualAlert}
          className="font-semibold"
        >
          <Send className="w-4 h-4 mr-2" />
          Manual Alert
        </Button>
      </div>
    </Card>
  );
};

export default ControlPanel;
