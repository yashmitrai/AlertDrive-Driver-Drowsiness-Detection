import { useState, useEffect, useRef } from "react";
import CameraFeed from "@/components/CameraFeed";
import StatusPanel from "@/components/StatusPanel";
import ActivityLog from "@/components/ActivityLog";
import ControlPanel from "@/components/ControlPanel";
import VoiceOverlay from "@/components/VoiceOverlay";
import { useToast } from "@/hooks/use-toast";
import { getTextToSpeech } from "@/utils/textToSpeech";
import { getAlarmSound } from "@/utils/alarmSound";

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: "info" | "warning" | "danger";
}

const Index = () => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [eyeStatus, setEyeStatus] = useState<"open" | "closed">("open");
  const [yawnDetected, setYawnDetected] = useState(false);
  const [alertLevel, setAlertLevel] = useState<"safe" | "warning" | "danger">("safe");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [eyesClosedTime, setEyesClosedTime] = useState(0);
  const [mouthOpenTime, setMouthOpenTime] = useState(0);
  const [warningGiven, setWarningGiven] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const ttsRef = useRef(getTextToSpeech());
  const alarmRef = useRef(getAlarmSound());

  const location = "12.9716° N, 77.5946° E";

  const addLog = (message: string, type: "info" | "warning" | "danger") => {
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const showVoice = (message: string, repeat: number = 1) => {
    setVoiceMessage(message);
    setShowVoiceOverlay(true);
    
    // Speak the message
    console.log("Speaking message:", message);
    
    if (repeat > 1) {
      // For repeated messages (like "Driver down!")
      const repeatedMessage = Array(repeat).fill(message).join(". ");
      ttsRef.current.speak(repeatedMessage, 1.2, 0.9);
    } else {
      ttsRef.current.speak(message);
    }
    
    setTimeout(() => setShowVoiceOverlay(false), 3000);
  };

  // Handle face detection from camera
  const handleDetection = (eyesClosed: boolean, mouthOpen: boolean) => {
    // Update eye status
    if (eyesClosed && eyeStatus === "open") {
      setEyeStatus("closed");
      setEyesClosedTime(0);
      setWarningGiven(false);
      addLog("Eyes closed", "info");
    } else if (!eyesClosed && eyeStatus === "closed") {
      setEyeStatus("open");
      
      // Only log if warning was not given or eyes were closed for significant time
      if (eyesClosedTime >= 2) {
        addLog("Driver responded - Eyes open", "info");
      }
      
      setEyesClosedTime(0);
      setAlertLevel("safe");
      setWarningGiven(false);
    }

    // Update mouth status for yawn detection
    if (mouthOpen && !yawnDetected) {
      setMouthOpenTime(prev => prev + 1);
    } else if (!mouthOpen) {
      if (mouthOpenTime >= 3) {
        setYawnDetected(true);
        addLog("Yawn detected - mouth open for 3 seconds", "warning");
        showVoice("You seem sleepy. Please take rest and drink water.");
        setTimeout(() => {
          setYawnDetected(false);
        }, 3000);
      }
      setMouthOpenTime(0);
    }
  };

  // Timer for eyes closed duration
  useEffect(() => {
    if (!isActive || eyeStatus !== "closed") {
      return;
    }

    const interval = setInterval(() => {
      setEyesClosedTime((prev) => {
        const newTime = prev + 1;
        
        // 2 seconds: First warning
        if (newTime === 2 && !warningGiven) {
          addLog("Eyes closed for 2s - Warning", "warning");
          setAlertLevel("warning");
          showVoice("Please look into the camera.");
          setWarningGiven(true);
        }
        
        // 5 seconds (2 + 3): Driver down alert
        if (newTime === 5) {
          addLog("Eyes closed for 5s – Driver down alert", "danger");
          setAlertLevel("danger");
          showVoice("Driver down", 3); // Repeat 3 times
          
          if (alarmEnabled) {
            console.log("Playing alarm sound");
            alarmRef.current.play(10000);
            
            toast({
              title: "🚨 EMERGENCY ALERT",
              description: "Alarm triggered! Sending location to emergency services...",
              variant: "destructive",
            });
          }
          
          setTimeout(() => {
            showVoice("Sending location to emergency department.");
            addLog("GPS location sent to emergency services", "danger");
          }, 4000);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, eyeStatus, warningGiven, alarmEnabled, toast]);

  // Session duration timer
  useEffect(() => {
    if (!isActive || !sessionStartTime) {
      return;
    }

    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, sessionStartTime]);

  const handleToggleSystem = () => {
    setIsActive(!isActive);
    if (!isActive) {
      addLog("System started", "info");
      setSessionStartTime(Date.now());
      setSessionDuration(0);
      
      toast({
        title: "System Activated",
        description: "AlertDrive monitoring started",
      });
      
      // Welcome message with safety guidelines
      setTimeout(() => {
        const safetyMessage = "Welcome to AlertDrive. Please ensure your seat belt is fastened. Stay hydrated by drinking water regularly. Never drink and drive. Keep your eyes on the road. Drive safe and stay alert.";
        showVoice(safetyMessage);
        addLog("Safety guidelines provided", "info");
      }, 1000);
    } else {
      addLog("System stopped", "info");
      setSessionStartTime(null);
      
      toast({
        title: "System Deactivated",
        description: "AlertDrive monitoring stopped",
      });
    }
  };

  const handleToggleAlarm = () => {
    setAlarmEnabled(!alarmEnabled);
    toast({
      title: alarmEnabled ? "Alarm Disabled" : "Alarm Enabled",
      description: alarmEnabled ? "Emergency alarm turned off" : "Emergency alarm turned on",
    });
  };

  const handleManualAlert = () => {
    addLog("Manual alert sent to emergency services", "danger");
    showVoice("Sending location to emergency department.");
    
    if (alarmEnabled) {
      alarmRef.current.play(5000);
    }
    
    toast({
      title: "Manual Alert Sent",
      description: "Emergency services have been notified",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg shadow-primary/50">
              <span className="text-2xl font-bold text-primary-foreground">A</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AlertDrive
              </h1>
              <p className="text-sm text-muted-foreground">Stay Awake, Stay Safe.</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full border-2 ${
            isActive 
              ? "border-success bg-success/10 text-success" 
              : "border-muted bg-muted/10 text-muted-foreground"
          }`}>
            <span className="font-semibold text-sm">
              {isActive ? "● MONITORING" : "○ STANDBY"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Section - Camera Feed */}
        <div className="lg:col-span-2 space-y-6">
          <CameraFeed 
            eyeStatus={eyeStatus}
            yawnDetected={yawnDetected}
            alertLevel={alertLevel}
            isActive={isActive}
            onDetection={handleDetection}
          />
          <StatusPanel
            eyeStatus={eyeStatus}
            yawnDetected={yawnDetected}
            location={location}
            sessionDuration={sessionDuration}
            isActive={isActive}
          />
        </div>

        {/* Right Section - Activity Log */}
        <div className="lg:col-span-1">
          <ActivityLog logs={logs} />
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel
        isActive={isActive}
        alarmEnabled={alarmEnabled}
        onToggleSystem={handleToggleSystem}
        onToggleAlarm={handleToggleAlarm}
        onManualAlert={handleManualAlert}
      />

      {/* Voice Overlay */}
      <VoiceOverlay message={voiceMessage} visible={showVoiceOverlay} />
    </div>
  );
};

export default Index;
