import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabaseClient } from "../service/supabase";
import { showCustomToastNotification } from "../utils/toast";

interface Notification {
  id: string;
  title: string;
  body: string;
  user_id: string;
  order_id: string | null;
  is_read: boolean;
  created_at: string;
  notification_type?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  hasNewNotifications: boolean;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const NOTIFICATION_OPENED_KEY = "notification_opened_time";

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get notification opened time from localStorage
  const getNotificationOpenedTime = (): string | null => {
    return localStorage.getItem(NOTIFICATION_OPENED_KEY);
  };

  // Set notification opened time in localStorage
  const setNotificationOpenedTime = (): void => {
    localStorage.setItem(NOTIFICATION_OPENED_KEY, new Date().toISOString());
  };

  // Check if there are new notifications
  const checkForNewNotifications = (
    fetchedNotifications: Notification[]
  ): boolean => {
    if (fetchedNotifications.length === 0) return false;

    const openedTime = getNotificationOpenedTime();
    if (!openedTime) return true; // If no opened time, show dot

    const latestNotification = fetchedNotifications[0]; // Assuming API returns sorted by created_at DESC
    const notificationTime = new Date(latestNotification.created_at);
    const openedTimeDate = new Date(openedTime);

    return notificationTime > openedTimeDate;
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.rpc(
        "get_notifications_admin"
      );

      if (!error && data) {
        setNotifications(data);
        const hasNew = checkForNewNotifications(data);
        setHasNewNotifications(hasNew);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string): void => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback((): void => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true }))
    );
    setNotificationOpenedTime();
    setHasNewNotifications(false);
  }, []);

  // Set up realtime subscription for new notifications
  useEffect(() => {
    const channel = supabaseClient
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: "type=eq.admin",
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setHasNewNotifications(true);

          // Show browser notification if permission is granted
          if (Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.body,
              icon: "/favicon.png",
              tag: newNotification.id,
              silent: false,
            });
          }

          // Update document title
          if (!document.title.startsWith("🔴 ")) {
            document.title = "🔴 " + document.title;
          }

          // Show toast notification if page is visible
          if (document.visibilityState === "visible") {
            showCustomToastNotification(
              newNotification.title,
              newNotification.body
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const value: NotificationContextType = {
    notifications,
    hasNewNotifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
