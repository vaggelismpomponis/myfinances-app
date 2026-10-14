import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from '../supabase';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const MAX_NOTIFICATIONS = 50;
const STORAGE_KEY = (userId) => `spendwise_notifications_${userId}`;

const loadFromStorage = (userId) => {
    if (!userId) return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY(userId));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveToStorage = (userId, notifications) => {
    if (!userId) return;
    try {
        localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(notifications));
    } catch {
        // ignore storage errors
    }
};

export const mergeNotifications = (listA = [], listB = []) => {
    const map = new Map();

    const addList = (list) => {
        if (!Array.isArray(list)) return;
        for (const item of list) {
            if (!item || !item.id) continue;
            if (map.has(item.id)) {
                const existing = map.get(item.id);
                // If either is marked read, it stays read across devices
                const isRead = !!(existing.read || item.read);
                // Keep the newer timestamp or item data
                const dateExisting = new Date(existing.timestamp || 0).getTime();
                const dateItem = new Date(item.timestamp || 0).getTime();
                const base = dateItem >= dateExisting ? item : existing;
                map.set(item.id, {
                    ...base,
                    read: isRead,
                    metadata: {
                        ...(existing.metadata || {}),
                        ...(item.metadata || {})
                    }
                });
            } else {
                map.set(item.id, { ...item, read: !!item.read });
            }
        }
    };

    addList(listA);
    addList(listB);

    return Array.from(map.values())
        .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
        .slice(0, MAX_NOTIFICATIONS);
};

export const NotificationProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const notificationsChannelRef = useRef(null);
    const cloudSyncTimeoutRef = useRef(null);

    const syncToCloud = useCallback((updatedNotifs) => {
        if (!userId) return;
        if (cloudSyncTimeoutRef.current) {
            clearTimeout(cloudSyncTimeoutRef.current);
        }
        cloudSyncTimeoutRef.current = setTimeout(async () => {
            try {
                await supabase.auth.updateUser({
                    data: { notifications: updatedNotifs }
                });
            } catch (err) {
                console.warn('Failed to sync notifications to Supabase user account:', err);
            }
        }, 500);
    }, [userId]);

    const broadcastNotifications = useCallback((updatedNotifs) => {
        if (notificationsChannelRef.current) {
            notificationsChannelRef.current.send({
                type: 'broadcast',
                event: 'notifications-update',
                payload: { notifications: updatedNotifs }
            }).catch(() => {});
        }
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id || null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            return;
        }

        // 1. Initial fast load from local cache
        const localNotifs = loadFromStorage(userId);
        setNotifications(localNotifs);

        // 2. Fetch remote notifications from user account
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            const cloudNotifs = Array.isArray(user.user_metadata?.notifications)
                ? user.user_metadata.notifications
                : [];

            setNotifications(prev => {
                const merged = mergeNotifications(prev, cloudNotifs);
                saveToStorage(userId, merged);

                // If local had new items or read updates not in cloud, sync merged up to cloud
                const hasChanges = JSON.stringify(merged) !== JSON.stringify(cloudNotifs);
                if (hasChanges) {
                    syncToCloud(merged);
                }
                return merged;
            });
        }).catch(err => {
            console.warn('Could not fetch user metadata for notifications sync:', err);
        });

        // 3. Setup Realtime Broadcast channel across devices for this account
        const channel = supabase.channel(`notifications-sync-${userId}`);
        notificationsChannelRef.current = channel;

        channel
            .on('broadcast', { event: 'notifications-update' }, ({ payload }) => {
                if (Array.isArray(payload?.notifications)) {
                    setNotifications(prev => {
                        const merged = mergeNotifications(prev, payload.notifications);
                        saveToStorage(userId, merged);
                        return merged;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            notificationsChannelRef.current = null;
        };
    }, [userId, syncToCloud]);

    const addNotification = useCallback((type, message, metadata = {}) => {
        const newNotif = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            message,
            metadata, // { amount, category, note, date, txType }
            timestamp: new Date().toISOString(),
            read: false,
        };

        setNotifications(prev => {
            const updated = [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
            if (userId) {
                saveToStorage(userId, updated);
                broadcastNotifications(updated);
                syncToCloud(updated);
            }
            return updated;
        });
    }, [userId, broadcastNotifications, syncToCloud]);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            if (userId) {
                saveToStorage(userId, updated);
                broadcastNotifications(updated);
                syncToCloud(updated);
            }
            return updated;
        });
    }, [userId, broadcastNotifications, syncToCloud]);

    const clearAll = useCallback(() => {
        setNotifications([]);
        if (userId) {
            saveToStorage(userId, []);
            broadcastNotifications([]);
            syncToCloud([]);
        }
    }, [userId, broadcastNotifications, syncToCloud]);

    const deleteNotification = useCallback((id) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== id);
            if (userId) {
                saveToStorage(userId, updated);
                broadcastNotifications(updated);
                syncToCloud(updated);
            }
            return updated;
        });
    }, [userId, broadcastNotifications, syncToCloud]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, clearAll, deleteNotification, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
