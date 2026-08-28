import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

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

import { supabase } from '../supabase';

export const NotificationProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [notifications, setNotifications] = useState([]);

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
        if (userId) {
            setNotifications(loadFromStorage(userId));
        } else {
            setNotifications([]);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            saveToStorage(userId, notifications);
        }
    }, [notifications, userId]);

    const addNotification = useCallback((type, message, metadata = {}) => {
        const newNotif = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            message,
            metadata, // { amount, category, note, date }
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS));
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, clearAll, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
