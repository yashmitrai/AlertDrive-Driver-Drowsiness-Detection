import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Eye, AlertTriangle, Activity } from "lucide-react";

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: "info" | "warning" | "danger";
}

interface ActivityLogProps {
  logs: LogEntry[];
}

const ActivityLog = ({ logs }: ActivityLogProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "danger":
        return "text-destructive";
      case "warning":
        return "text-warning";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-sm">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Driver Status Log
        </h3>
      </div>
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="p-4 space-y-3">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity recorded yet
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors animate-slide-up"
              >
                {getIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getTextColor(log.type)}`}>
                    {log.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{log.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ActivityLog;
