import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['toolLogs'],
    queryFn: () => base44.entities.ToolLog.list('-created_date', 100),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Logs</h1>
          <p className="text-slate-600">Clinical calculation history and usage tracking</p>
        </div>

        <Card className="bg-white shadow-lg border-slate-200">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Calculations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Tool</TableHead>
                    <TableHead>Inputs</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Safety Alerts</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Loading logs...
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No calculation logs yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>
                              {log.created_date ? format(new Date(log.created_date), "MMM d, HH:mm") : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {log.tool_id}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-600 max-w-xs truncate">
                            {JSON.stringify(log.inputs || {})}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-600 max-w-xs truncate">
                            {JSON.stringify(log.outputs || {})}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.safety_alerts && log.safety_alerts.length > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800">
                              {log.safety_alerts.length} alert(s)
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              None
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 truncate">
                              {log.user_hash?.substring(0, 8) || "System"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}