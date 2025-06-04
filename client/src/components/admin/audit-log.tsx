import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditLog } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { Activity, RotateCcw, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AuditLogTable() {
  const [actionTypeFilter, setActionTypeFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const { user } = useAuth();

  const { data: auditLogs, isLoading, refetch } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit-logs"],
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "LOGIN":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEntityColor = (entity: string) => {
    switch (entity) {
      case "activity":
        return "bg-yellow-100 text-yellow-800";
      case "booking":
        return "bg-indigo-100 text-indigo-800";
      case "user":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get username by user id
  const getUserNameById = (userId: number) => `User #${userId}`;

  const filteredLogs = (auditLogs || []).filter((log) => {
    // Filter by action type if selected
    if (actionTypeFilter && log.action !== actionTypeFilter) {
      return false;
    }

    // Filter by user if specified
    const userName = getUserNameById(log.userId);
    if (userFilter && !userName.toLowerCase().includes(userFilter.toLowerCase())) {
      return false;
    }

    // Filter by date if specified
    if (dateFilter) {
      const logDate = log.createdAt ? new Date(log.createdAt).toISOString().split('T')[0] : '';
      if (logDate !== dateFilter) {
        return false;
      }
    }

    return true;
  });

  const renderDetails = (details: any) => {
    if (!details) return null;
    
    try {
      const detailsObj = typeof details === 'string' ? JSON.parse(details) : details;
      return (
        <div className="text-xs text-gray-600 max-w-md whitespace-normal">
          {Object.entries(detailsObj).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="font-medium">{key}:</span>{" "}
              {typeof value === 'object' 
                ? JSON.stringify(value) 
                : String(value)}
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return <span className="text-xs text-gray-600">{String(details)}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-medium mb-2">Audit Logs</h2>
        <p className="text-gray-600 text-sm mb-4">
          Track all system activities and changes
        </p>

        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Select
              value={actionTypeFilter || ""}
              onValueChange={(value) => setActionTypeFilter(value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="Filter by user"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Input
              type="date"
              placeholder="Filter by date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setActionTypeFilter(null);
              setUserFilter("");
              setDateFilter("");
            }}
            className="flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Clear
          </Button>

          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex-shrink-0"
          >
            <Activity className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No audit logs found with the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>
                Showing {filteredLogs.length} of {auditLogs?.length || 0} audit
                logs
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {log.createdAt 
                        ? new Date(log.createdAt).toLocaleString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{getUserNameById(log.userId)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getActionColor(
                          log.action
                        )} border-none font-normal`}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.entityType && (
                        <Badge
                          className={`${getEntityColor(
                            log.entityType
                          )} border-none font-normal`}
                        >
                          {log.entityType}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{log.entityId ?? 'N/A'}</TableCell>
                    <TableCell>
                      {renderDetails(log.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}