import { supabase } from '../supabase';

export const trackSession = async (user) => {
    if (!user) return;

    // Use session storage to cache IP/Location for the current tab session
    let ip = sessionStorage.getItem('myfinances_ip');
    let location = sessionStorage.getItem('myfinances_location');
    const lastAttempt = sessionStorage.getItem('myfinances_ip_last_attempt');
    const isBlocked = sessionStorage.getItem('myfinances_ip_blocked');

    // Skip if already found or if we're known to be blocked in this session
    if (!ip && !isBlocked) {
        // Throttling: only try once every 5 minutes if it failed previously
        if (!lastAttempt || Date.now() - parseInt(lastAttempt) > 300000) {
            try {
                sessionStorage.setItem('myfinances_ip_last_attempt', Date.now().toString());
                const response = await fetch('https://ipwho.is/', { cache: 'no-store' });
                
                if (response.status === 403) {
                    sessionStorage.setItem('myfinances_ip_blocked', 'true');
                    throw new Error('Forbidden');
                }

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.success) {
                        ip = data.ip;
                        // Build location string: "City, CountryCode" or just "CountryName" or null
                        if (data.city && data.country_code) {
                            location = `${data.city}, ${data.country_code}`;
                        } else if (data.country_name) {
                            location = data.country_name;
                        } else {
                            location = null;
                        }

                        if (ip) sessionStorage.setItem('myfinances_ip', ip);
                        if (location) sessionStorage.setItem('myfinances_location', location);
                    }
                }
            } catch (e) {
                // Silent fail for location tracking
            }
        }
    }

    // Parsed Device Info
    const ua = navigator.userAgent;
    let device = null;
    if (ua.includes("iPhone")) device = "iPhone";
    else if (ua.includes("iPad")) device = "iPad";
    else if (ua.includes("Android")) device = "Android";
    else if (ua.includes("Windows")) device = "Windows PC";
    else if (ua.includes("Mac")) device = "Mac";
    else if (ua.includes("Linux")) device = "Linux PC";

    if (ua.includes("Chrome")) device += " (Chrome)";
    else if (ua.includes("Firefox")) device += " (Firefox)";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) device += " (Safari)";
    else if (ua.includes("Edge")) device += " (Edge)";

    const sessionData = {
        user_id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        ip,
        location,
        device,
        last_active: new Date().toISOString(),
        user_agent: ua,
    };

    let sessionId = localStorage.getItem('myfinances_session_id');

    if (sessionId) {
        // Update existing session
        const { error } = await supabase
            .from('sessions')
            .update({ ...sessionData, last_active: new Date().toISOString() })
            .eq('id', sessionId);

        if (error) {
            // Session might have been deleted, create a new one
            sessionId = null;
        }
    }

    if (!sessionId) {
        // Create new session
        const { data, error } = await supabase
            .from('sessions')
            .insert(sessionData)
            .select()
            .single();

        if (!error && data) {
            localStorage.setItem('myfinances_session_id', data.id);
        }
    }
};
