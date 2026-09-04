import { useState, useEffect } from "react";
import { fetchAuditTrail } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuditLog {
  id: number;
  timestamp: string;
  step: string;
  status: string;
  details: string;
  is_failure_recovery: boolean;
}

export function AuditTrailViewer({ url }: { url: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchAuditTrail(url);
        setLogs(data);
      } catch (e) {
        console.error("Failed to load audit logs", e);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [url]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#0052FF]" /></div>;
  }

  return (
    <Card className="bg-[#02042B] border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Execution Audit Trail</CardTitle>
        <CardDescription className="text-slate-400">
          Raw agentic reasoning logs, tool calls, and payload traces for full transparency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border border-slate-700/50 rounded-lg bg-[#0C2340]/50 p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  {log.status === "success" ? (
                     <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  ) : log.is_failure_recovery ? (
                     <ShieldAlert className="h-5 w-5 text-yellow-500" />
                  ) : (
                     <Code className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-semibold text-white">{log.step}</span>
                  <Badge variant="outline" className={`
                    ${log.status === "success" ? "text-[#10B981] border-[#10B981]" : ""}
                    ${log.is_failure_recovery ? "text-yellow-500 border-yellow-500" : ""}
                    ${log.status === "error" ? "text-red-500 border-red-500" : ""}
                  `}>
                    {log.is_failure_recovery ? "FALLBACK MODE" : log.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              <Tabs defaultValue="json" className="w-full">
                <TabsList className="bg-[#02042B] border border-slate-700">
                  <TabsTrigger value="json">Raw JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="json" className="mt-2">
                  <pre className="p-4 bg-[#010216] rounded-md text-xs text-[#10B981] overflow-x-auto max-h-[300px] overflow-y-auto">
                    <code>
                      {JSON.stringify(JSON.parse(log.details), null, 2)}
                    </code>
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
