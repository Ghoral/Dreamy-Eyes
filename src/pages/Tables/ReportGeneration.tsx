import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { supabaseClient } from "../../service/supabase";
import { showCustomToastError, showCustomToastSuccess } from "../../utils/toast";
import { appStore } from "../../store";
import { DownloadIcon } from "../../icons";

type StorageInfo = {
  [key: string]: any;
};

type StorageCard = {
  title: string;
  used: number;
  limit: number;
  percentage: number;
  unit: string;
};

export default function ReportGeneration() {
  const { userData } = appStore();
  const role = userData?.role || "user";
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [storageCards, setStorageCards] = useState<StorageCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchStorageInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.functions.invoke("get_storage_info");

      if (error) throw error;

      // Edge functions return data in { data: ... } format
      const info = (data as any)?.data || data as StorageInfo;
      setStorageInfo(info);
      
      // Process storage info into cards
      const cards = processStorageInfo(info);
      setStorageCards(cards);
    } catch (e: any) {
      showCustomToastError(e?.message || e, "Failed to load storage info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  const processStorageInfo = (data: StorageInfo): StorageCard[] => {
    const cards: StorageCard[] = [];
    
    // Filter out isfull fields and process storage data
    const processObject = (obj: any, parentKey: string = "") => {
      for (const key in obj) {
        // Skip isfull fields completely
        if (key.toLowerCase() === "isfull" || key.toLowerCase().includes("isfull")) {
          continue;
        }
        
        const value = obj[key];
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        
        // Look for storage-related data
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Check if this object has storage-like properties
          const hasUsed = "used" in value || "size" in value || "usage" in value;
          const hasLimit = "limit" in value || "max" in value || "quota" in value || "total" in value;
          
          if (hasUsed || hasLimit) {
            const used = value.used || value.size || value.usage || 0;
            const limit = value.limit || value.max || value.quota || value.total || 0;
            
            if (limit > 0) {
              const percentage = (used / limit) * 100;
              const unit = determineUnit(limit);
              
              cards.push({
                title: formatTitle(fullKey),
                used: convertToUnit(used, unit),
                limit: convertToUnit(limit, unit),
                percentage: Math.min(percentage, 100),
                unit: unit,
              });
            }
          } else {
            // Recursively process nested objects
            processObject(value, fullKey);
          }
        } else if (typeof value === "number" && parentKey) {
          // Handle direct numeric values that might be storage related
          const parentObj = obj;
          const limitKey = Object.keys(parentObj).find(k => 
            k.toLowerCase().includes("limit") || 
            k.toLowerCase().includes("max") || 
            k.toLowerCase().includes("quota") ||
            k.toLowerCase().includes("total")
          );
          
          if (limitKey && (key.toLowerCase().includes("used") || key.toLowerCase().includes("size"))) {
            const limit = parentObj[limitKey];
            if (limit > 0) {
              const percentage = (value / limit) * 100;
              const unit = determineUnit(limit);
              
              cards.push({
                title: formatTitle(parentKey),
                used: convertToUnit(value, unit),
                limit: convertToUnit(limit, unit),
                percentage: Math.min(percentage, 100),
                unit: unit,
              });
            }
          }
        }
      }
    };
    
    processObject(data);
    
    // If no cards found, try to extract from common storage patterns
    if (cards.length === 0) {
      // Try to find database_storage and file_storage
      const dbStorage = data.database_storage || data.database || data.db;
      const fileStorage = data.file_storage || data.files || data.storage;
      
      if (dbStorage && typeof dbStorage === "object") {
        const used = dbStorage.used || dbStorage.size || 0;
        const limit = dbStorage.limit || dbStorage.max || dbStorage.quota || 0;
        if (limit > 0) {
          const percentage = (used / limit) * 100;
          const unit = determineUnit(limit);
          cards.push({
            title: "Database Storage",
            used: convertToUnit(used, unit),
            limit: convertToUnit(limit, unit),
            percentage: Math.min(percentage, 100),
            unit: unit,
          });
        }
      }
      
      if (fileStorage && typeof fileStorage === "object") {
        const used = fileStorage.used || fileStorage.size || 0;
        const limit = fileStorage.limit || fileStorage.max || fileStorage.quota || 0;
        if (limit > 0) {
          const percentage = (used / limit) * 100;
          const unit = determineUnit(limit);
          cards.push({
            title: "File Storage",
            used: convertToUnit(used, unit),
            limit: convertToUnit(limit, unit),
            percentage: Math.min(percentage, 100),
            unit: unit,
          });
        }
      }
    }
    
    return cards;
  };

  const determineUnit = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) return "GB";
    if (bytes >= 1024 * 1024) return "MB";
    if (bytes >= 1024) return "KB";
    return "B";
  };

  const convertToUnit = (bytes: number, unit: string): number => {
    switch (unit) {
      case "GB":
        return bytes / (1024 * 1024 * 1024);
      case "MB":
        return bytes / (1024 * 1024);
      case "KB":
        return bytes / 1024;
      default:
        return bytes;
    }
  };

  const formatTitle = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/\./g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const convertToCSV = (data: StorageInfo): string => {
    if (!data) return "";
    
    let csv = "Category,Key,Value\n";
    
    const flatten = (obj: any, category: string = "", prefix: string = "") => {
      for (const key in obj) {
        // Skip isfull fields
        if (key.toLowerCase() === "isfull" || key.toLowerCase().includes("isfull")) {
          continue;
        }
        
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const currentCategory = category || formatTitle(key.split(".")[0]);
        
        if (value === null || value === undefined) {
          csv += `"${currentCategory}","${fullKey}","null"\n`;
        } else if (typeof value === "object" && !Array.isArray(value)) {
          flatten(value, currentCategory, fullKey);
        } else {
          const csvValue = String(value).replace(/"/g, '""');
          csv += `"${currentCategory}","${fullKey}","${csvValue}"\n`;
        }
      }
    };
    
    flatten(data);
    return csv;
  };

  const handleDownload = async () => {
    if (!storageInfo) {
      showCustomToastError("No data to download", "Download Error");
      return;
    }

    try {
      setDownloading(true);
      const csv = convertToCSV(storageInfo);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `storage_info_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showCustomToastSuccess("Storage info downloaded successfully");
    } catch (e: any) {
      showCustomToastError(e?.message || e, "Failed to download storage info");
    } finally {
      setDownloading(false);
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getCardBgColor = (index: number): string => {
    const colors = [
      "bg-blue-50 dark:bg-blue-900/20",
      "bg-purple-50 dark:bg-purple-900/20",
      "bg-green-50 dark:bg-green-900/20",
      "bg-orange-50 dark:bg-orange-900/20",
    ];
    return colors[index % colors.length];
  };

  const getProgressBarColor = (index: number): string => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-orange-500",
    ];
    return colors[index % colors.length];
  };

  const getTextColor = (index: number): string => {
    const colors = [
      "text-blue-600 dark:text-blue-400",
      "text-purple-600 dark:text-purple-400",
      "text-green-600 dark:text-green-400",
      "text-orange-600 dark:text-orange-400",
    ];
    return colors[index % colors.length];
  };

  if (role !== "super_admin") {
    return null;
  }

  return (
    <ComponentCard
      title="Report Generation"
      desc="View and download storage information"
    >
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleDownload}
          disabled={loading || downloading || !storageInfo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {downloading ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <DownloadIcon className="w-5 h-5" />
              Download Report
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Loading storage info...
          </p>
        </div>
      ) : storageCards.length > 0 ? (
        <div className="space-y-6">
          {/* Storage Information Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-brand-600 dark:text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Storage Information
            </h2>
          </div>

          {/* Storage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storageCards.map((card, index) => (
              <div
                key={index}
                className={`${getCardBgColor(index)} rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {card.title}
                  </h3>
                  <span className={`text-2xl font-bold ${getTextColor(index)}`}>
                    {card.percentage.toFixed(2)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${getProgressBarColor(index)} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(card.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Usage Details */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Used: {card.used.toFixed(2)} {card.unit}
                  </span>
                  <span className="text-gray-500 dark:text-gray-500">
                    Limit: {card.limit.toFixed(2)} {card.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <DownloadIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            No storage information available
          </p>
        </div>
      )}
    </ComponentCard>
  );
}
