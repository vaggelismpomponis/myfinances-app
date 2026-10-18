import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../supabase';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const MAX_NOTIFICATIONS = 50;
const STORAGE_KEY = (userId) => `spendwise_notifications_${userId}`;
const LEGACY_STORAGE_KEY = 'spendwise_notifications';

const loadFromStorage = (userId) => {
    if (!userId) return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY(userId));
        if (raw) return JSON.parse(raw);
        // Fallback to legacy un-scoped key
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
            const parsed = JSON.parse(legacy);
            localStorage.setItem(STORAGE_KEY(userId), legacy);
            return parsed;
        }
        return [];
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
    const userIdRef = useRef(userId);
    const [notifications, setNotifications] = useState([]);
    const notificationsRef = useRef(notifications);

    const notificationsChannelRef = useRef(null);
    const cloudSyncTimeoutRef = useRef(null);

    useEffect(() => {
        userIdRef.current = userId;
    }, [userId]);

    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    // Re-fetch legacy notifications from Supabase, merge into local storage, and clean up user_metadata
    const refetchNotifications = useCallback(async () => {
        const uid = userId || userIdRef.current;
        if (!uid) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const legacyCloudNotifs = Array.isArray(user.user_metadata?.notifications)
                ? user.user_metadata.notifications
                : null;

            if (legacyCloudNotifs && legacyCloudNotifs.length > 0) {
                setNotifications(prev => {
                    const merged = mergeNotifications(prev, legacyCloudNotifs);
                    saveToStorage(uid, merged);
                    return merged;
                });
                // Clean up user_metadata so notifications don't bloat the Auth JWT token
                await supabase.auth.updateUser({
                    data: { notifications: null }
                }).catch(() => {});
            }
        } catch (err) {
            console.warn('Could not re-fetch notifications from Supabase:', err);
        }
    }, [userId]);

    // Auth state listener
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const id = session?.user?.id || null;
            setUserId(id);
            userIdRef.current = id;
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const id = session?.user?.id || null;
            setUserId(id);
            userIdRef.current = id;
        });

        return () => subscription?.unsubscribe();
    }, []);

    // Setup channel, initial load, and foreground listeners
    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            return;
        }

        // 1. Initial fast load from local cache
        const localNotifs = loadFromStorage(userId);
        setNotifications(localNotifs);

        // 2. Fetch remote notifications
        refetchNotifications();

        // 3. Realtime Broadcast channel across devices
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

        // 4. Foreground resume re-sync (app state, visibility change, window focus)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refetchNotifications();
            }
        };

        const handleFocus = () => {
            refetchNotifications();
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        let appStateListener = null;
        if (Capacitor.isNativePlatform()) {
            try {
                const p = CapApp.addListener('appStateChange', ({ isActive }) => {
                    if (isActive) {
                        refetchNotifications();
                    }
                });
                Promise.resolve(p).then(handle => { appStateListener = handle; });
            } catch (e) {
                // ignore
            }
        }

        return () => {
            supabase.removeChannel(channel);
            notificationsChannelRef.current = null;
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            if (appStateListener?.remove) {
                appStateListener.remove();
            }
        };
    }, [userId, refetchNotifications]);

    const broadcastNotifications = useCallback((updatedNotifs) => {
        if (notificationsChannelRef.current) {
            notificationsChannelRef.current.send({
                type: 'broadcast',
                event: 'notifications-update',
                payload: { notifications: updatedNotifs }
            }).catch(() => {});
        }
    }, []);

    // Mutation handlers (deterministic, state + storage + broadcast)
    const addNotification = useCallback((type, message, metadata = {}) => {
        const newNotif = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            message,
            metadata,
            timestamp: new Date().toISOString(),
            read: false,
        };

        const current = notificationsRef.current || [];
        const updated = [newNotif, ...current].slice(0, MAX_NOTIFICATIONS);
        setNotifications(updated);

        const uid = userId || userIdRef.current;
        if (uid) {
            saveToStorage(uid, updated);
            broadcastNotifications(updated);
        }
    }, [userId, broadcastNotifications]);

    const markAllRead = useCallback(() => {
        const current = notificationsRef.current || [];
        const updated = current.map(n => ({ ...n, read: true }));
        setNotifications(updated);

        const uid = userId || userIdRef.current;
        if (uid) {
            saveToStorage(uid, updated);
            broadcastNotifications(updated);
        }
    }, [userId, broadcastNotifications]);

    const clearAll = useCallback(() => {
        setNotifications([]);
        const uid = userId || userIdRef.current;
        if (uid) {
            saveToStorage(uid, []);
            broadcastNotifications([]);
        }
    }, [userId, broadcastNotifications]);

    const deleteNotification = useCallback((id) => {
        const current = notificationsRef.current || [];
        const updated = current.filter(n => n.id !== id);
        setNotifications(updated);

        const uid = userId || userIdRef.current;
        if (uid) {
            saveToStorage(uid, updated);
            broadcastNotifications(updated);
        }
    }, [userId, broadcastNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAllRead,
            clearAll,
            deleteNotification,
            unreadCount,
            refetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
