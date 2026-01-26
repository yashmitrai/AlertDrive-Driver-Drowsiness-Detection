import { Volume2 } from "lucide-react";

interface VoiceOverlayProps {
  message: string;
  visible: boolean;
}

const VoiceOverlay = ({ message, visible }: VoiceOverlayProps) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-card/95 backdrop-blur-lg border-2 border-primary rounded-2xl px-8 py-6 shadow-2xl shadow-primary/50 animate-slide-up max-w-2xl mx-4">
        <div className="flex items-center gap-4">
          <Volume2 className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-xl font-bold text-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceOverlay;
