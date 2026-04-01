'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Bell, Mail, Check } from 'lucide-react';

// Shape từ BE: { id, type, payload, read_at, created_at, ... }
interface RawNotification {
  id: string;
  type: string;
  payload?: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

function mapNotification(raw: RawNotification): Notification {
  const p = raw.payload ?? {};
  const title = (p.title as string) ?? notificationTitle(raw.type);
  const message = (p.message as string) ?? notificationMessage(raw.type, p);
  return {
    id: raw.id,
    type: notificationCategory(raw.type),
    title,
    message,
    read: raw.read_at !== null,
    created_at: raw.created_at,
  };
}

function notificationCategory(type: string): string {
  if (type.startsWith("match")) return "match";
  if (type.startsWith("data_room")) return "request";
  if (type.includes("approved") || type.includes("accepted")) return "approved";
  return "default";
}

function notificationTitle(type: string): string {
  const map: Record<string, string> = {
    data_room_request_created: "New Data Room Request",
    data_room_request_updated: "Data Room Request Updated",
    data_access_revoked: "Data Access Revoked",
    match_created_startup: "New Match Interest",
    match_created_investor: "Match Created",
    match_stage_changed: "Match Status Changed",
  };
  return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function notificationMessage(type: string, payload: Record<string, unknown>): string {
  if (type === "data_room_request_created") return "An investor has requested access to your data room.";
  if (type === "data_room_request_updated") return `Your data room request was ${payload.status ?? "updated"}.`;
  if (type === "data_access_revoked") return "Your access to a data room has been revoked.";
  if (type === "match_created_startup") return "An investor is interested in your project.";
  if (type === "match_created_investor") return "A match has been created for you.";
  if (type === "match_stage_changed") return `Match moved to ${payload.new_status ?? "new stage"}.`;
  return "You have a new notification.";
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread'>('all');
  const [marking, setMarking] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // BE trả Notification[] trực tiếp (không wrap {data: []})
      const raw = await api.get<RawNotification[]>('/notifications');
      setNotifications((raw ?? []).map(mapNotification));
    } catch (error) {
      toast.error('Failed to load notifications');
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredNotifications = useMemo(() => {
    return selectedFilter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;
  }, [notifications, selectedFilter]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkAsRead = async (notificationId: string, isAlreadyRead: boolean) => {
    if (isAlreadyRead) return;

    try {
      setMarking(notificationId);
      // Không cần truyền header Authorization — api-client tự gắn từ stored token
      await api.patch(`/notifications/${notificationId}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    } finally {
      setMarking(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) return;

      await Promise.all(unreadIds.map((id) => api.patch(`/notifications/${id}/read`, {})));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'match':
        return 'border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent';
      case 'message':
        return 'border-l-purple-500 bg-gradient-to-r from-purple-500/10 to-transparent';
      case 'request':
        return 'border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent';
      case 'approved':
        return 'border-l-green-500 bg-gradient-to-r from-green-500/10 to-transparent';
      default:
        return 'border-l-slate-500 bg-gradient-to-r from-slate-500/10 to-transparent';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Bell className="w-5 h-5 text-blue-400" />;
      case 'message':
        return <Mail className="w-5 h-5 text-purple-400" />;
      case 'request':
        return <Check className="w-5 h-5 text-amber-400" />;
      case 'approved':
        return <Check className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-20 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-slate-400">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium border border-blue-500/30 transition-colors"
            >
              Mark all as read
            </motion.button>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          {[
            { label: 'All', value: 'all' as const, count: notifications.length },
            { label: 'Unread', value: 'unread' as const, count: unreadCount },
          ].map((tab) => (
            <motion.button
              key={tab.value}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                selectedFilter === tab.value
                  ? 'bg-blue-500/30 border-blue-500/50 text-blue-300'
                  : 'bg-white/70 border-slate-200/80 text-slate-600 hover:border-slate-300/90'
              }`}
            >
              {tab.label} ({tab.count})
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-24 bg-slate-200/50 rounded-lg border border-slate-200/70"
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">
              {selectedFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-slate-500 text-sm">
              {selectedFilter === 'unread' ? "You're all caught up!" : 'Check back later for updates'}
            </p>
          </motion.div>
        ) : (
          <motion.div className="space-y-3">
            {filteredNotifications.map((notification, idx) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleMarkAsRead(notification.id, notification.read)}
                className={`group relative p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-slate-900/50 ${getNotificationStyle(notification.type)} ${
                  !notification.read ? 'bg-opacity-20' : 'opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 pt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 font-semibold mb-1 group-hover:text-blue-700 transition-colors">
                      {notification.title}
                    </h3>
                    <p className="text-slate-300 text-sm mb-2">{notification.message}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(notification.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {!notification.read && (
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500"
                      />
                    )}
                    {!notification.read && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id, notification.read);
                        }}
                        disabled={marking === notification.id}
                        className="p-2 rounded hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                      >
                        {marking === notification.id ? (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-blue-400 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-slate-500 hover:text-slate-400" />
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
