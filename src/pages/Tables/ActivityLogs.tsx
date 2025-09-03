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
import { useUserRole } from "../../hooks/useUserRole";
import { toCamelCase } from "../../utils";
import { appStore } from "../../store";

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

  return (
    <ComponentCard title="Activity Logs" desc="User activity history">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Action
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Table
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Module
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {logs.length === 0 && !loading && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500">
                    <div>No activity logs found.</div>
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="px-5 py-4 text-start">
                    {toCamelCase(log.action)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {toCamelCase(log.table_name)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {log.module}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {log.user_name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {log.email}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {toCamelCase(log.role)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {new Date(log.created_at).toLocaleString()}
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
