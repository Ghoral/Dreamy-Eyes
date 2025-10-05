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
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
              filter === actionType
                ? "bg-brand-500 text-white shadow-md border-brand-500 hover:bg-brand-600 transform hover:-translate-y-0.5"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700"
            )}
          >
            {actionType === "all" ? "All Activities" : toCamelCase(actionType)}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-white/[0.05] dark:bg-white/[0.03] transition-all duration-300 hover:shadow-lg">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/70 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                >
                  Action
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                >
                  Table
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                >
                  Module
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] bg-white dark:bg-transparent">
              {filteredLogs.length === 0 && !loading && (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center" colSpan={7}>
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="rounded-full bg-gray-100 p-4 shadow-inner dark:bg-gray-800 animate-pulse">
                        <TimeIcon className="h-8 w-8 text-brand-500" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg dark:text-gray-300">
                        No activity logs found
                      </p>
                      {filter !== "all" && (
                        <button
                          onClick={() => setFilter("all")}
                          className="text-brand-500 text-sm font-medium px-4 py-2 border border-brand-500 rounded-full hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors duration-200"
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 hover:shadow-sm group"
                >
                  <TableCell className="px-5 py-4 text-start">
                    <Badge
                      variant="light"
                      color={getActionBadgeColor(log.action)}
                      className="transform transition-transform duration-200 group-hover:scale-105 shadow-sm"
                    >
                      {toCamelCase(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-md group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors duration-200">
                      {toCamelCase(log.table_name)}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="text-gray-600 dark:text-gray-400 italic group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors duration-200">
                      {log.module}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">
                      {log.user_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200 text-sm">
                      {log.email}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <Badge
                      variant="light"
                      color={log.role === "super_admin" ? "primary" : "info"}
                      size="sm"
                      className="transform transition-transform duration-200 group-hover:scale-105 shadow-sm"
                    >
                      {toCamelCase(log.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors duration-200">
                      <TimeIcon className="h-4 w-4 text-brand-500 group-hover:text-brand-600 transition-colors duration-200" />
                      <span className="text-sm font-medium">
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
