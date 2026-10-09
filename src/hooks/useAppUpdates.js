import { useEffect } from 'react';
import { supabase } from '../supabase';
import logger from '../utils/logger';

export function useAppUpdates({ user, loading, isLocked, setLatestUpdate, setShowWhatsNew, setCurrentBroadcast, setShowBroadcast }) {
    // 1. Check for App Updates (WhatsNew)
    useEffect(() => {
        const checkWhatsNew = async () => {
            if (user && !loading && !isLocked) {
                try {
                    const { data, error } = await supabase
                        .from('app_updates')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (error) throw error;
                    if (data && data.length > 0) {
                        const update = data[0];
                        const hasSeen = localStorage.getItem(`whatsnew_seen_${update.version}_${user.id}`);
                        if (!hasSeen) {
                            setLatestUpdate(update);
                            setShowWhatsNew(true);
                        }
                    }
                } catch (e) {
                    logger.error('Error fetching latest update', e, 'App');
                }
            }
        };
        checkWhatsNew();
    }, [user, loading, isLocked, setLatestUpdate, setShowWhatsNew]);

    // 2. Check for Broadcasts
    useEffect(() => {
        const checkBroadcasts = async () => {
            if (user && !loading && !isLocked) {
                try {
                    const { data, error } = await supabase
                        .from('broadcasts')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (error) {
                        console.error('[Broadcast] Fetch error:', error);
                        return;
                    }

                    if (data && data.length > 0) {
                        const broadcast = data[0];
                        const lastSeenId = localStorage.getItem(`broadcast_seen_${user.id}`);

                        console.log('[Broadcast] Latest:', broadcast.id, 'Last Seen:', lastSeenId);

                        if (lastSeenId !== broadcast.id.toString()) {
                            setCurrentBroadcast(broadcast);
                            setShowBroadcast(true);
                        }
                    }
                } catch (e) {
                    console.error('[Broadcast] Exception:', e);
                }
            }
        };
        checkBroadcasts();
    }, [user, loading, isLocked, setCurrentBroadcast, setShowBroadcast]);
}
