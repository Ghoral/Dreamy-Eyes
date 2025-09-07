import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { supabaseClient } from "../../service/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { showCustomToastError } from "../../utils/toast";
import { toCamelCase } from "../../utils";
import { appStore } from "../../store";
import Badge from "../../components/ui/badge/Badge";
import { TimeIcon } from "../../icons";
import { cn } from "../../lib/utils";

type ActivityLog = {
  id: number;
  action: string;
  table_name: string;
  module: string;
  created_at: string;
  user_name: string;
  email: string;
  role: string;
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = appStore();
  const role = userData?.role || "user";
  const [filter, setFilter] = useState<string>("all");

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.rpc(
        "get_user_activity_logs"
      );

      if (error) throw error;

      setLogs((data as ActivityLog[]) || []);
    } catch (e) {
      showCustomToastError(e, "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  if (role !== "super_admin") {
    return null;
  }

  // Get unique action types for filtering
  const actionTypes = ["all", ...new Set(logs.map((log) => log.action))];

  // Filter logs based on selected filter
  const filteredLogs =
    filter === "all" ? logs : logs.filter((log) => log.action === filter);

  // Function to get badge color based on action type
  const getActionBadgeColor = (
    action: string
  ): "primary" | "success" | "error" | "warning" | "info" => {
    switch (action.toLowerCase()) {
      case "create":
        return "success";
      case "update":
        return "info";
      case "delete":
        return "error";
      case "sign_in":
        return "primary";
      default:
        return "warning";
    }
  };

  return (
    <ComponentCard title="Activity Logs" desc="User activity history">
      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {actionTypes.map((actionType) => (
          <button
            key={actionType}
            onClick={() => setFilter(actionType)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === actionType
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {actionType === "all" ? "All Activities" : toCamelCase(actionType)}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-gray-800/50">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300"
                >
                  Action
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300"
                >
                  Table
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300"
                >
                  Module
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300"
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredLogs.length === 0 && !loading && (
                <TableRow>
                  <TableCell className="px-5 py-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                        <TimeIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No activity logs found
                      </p>
                      {filter !== "all" && (
                        <button
                          onClick={() => setFilter("all")}
                          className="text-brand-500 text-sm font-medium hover:underline"
                        >
                          View all activities
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {filteredLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <TableCell className="px-5 py-4 text-start">
                    <Badge
                      variant="light"
                      color={getActionBadgeColor(log.action)}
                    >
                      {toCamelCase(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start font-medium text-gray-700 dark:text-gray-300">
                    {toCamelCase(log.table_name)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                    {log.module}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start font-medium">
                    {log.user_name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                    {log.email}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <Badge
                      variant="light"
                      color={log.role === "super_admin" ? "primary" : "info"}
                      size="sm"
                    >
                      {toCamelCase(log.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <TimeIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ComponentCard>
  );
}
