import { supabase } from '../supabase';

// Fetch IP and location data with primary + fallback services
const fetchIpLocation = async () => {
    // Primary: ipwho.is
    try {
        const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
        if (res.status === 403) throw new Error('Forbidden');
        if (res.ok) {
            const data = await res.json();
            if (data?.success && data.ip) {
                let location = null;
                if (data.city && data.country_code) location = `${data.city}, ${data.country_code}`;
                else if (data.country_name) location = data.country_name;
                return { ip: data.ip, location };
            }
        }
    } catch (_) { /* fall through to backup */ }

    // Fallback: ip-api.com (free, no key needed)
    try {
        const res = await fetch('http://ip-api.com/json/?fields=status,query,city,countryCode', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data?.status === 'success' && data.query) {
                let location = null;
                if (data.city && data.countryCode) location = `${data.city}, ${data.countryCode}`;
                return { ip: data.query, location };
            }
        }
    } catch (_) { /* silent fail */ }

    return { ip: null, location: null };
};

// Parse a device label from the user-agent string
const parseDevice = (ua) => {
    let os = null;
    if (ua.includes('iPhone')) os = 'iPhone';
    else if (ua.includes('iPad')) os = 'iPad';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Windows')) os = 'Windows PC';
    else if (ua.includes('Mac')) os = 'Mac';
    else if (ua.includes('Linux')) os = 'Linux PC';

    if (!os) return null; // Unknown OS — don't produce "null (Chrome)"

    let browser = '';
    if (ua.includes('Edg/') || ua.includes('Edge/')) browser = ' (Edge)';
    else if (ua.includes('Chrome')) browser = ' (Chrome)';
    else if (ua.includes('Firefox')) browser = ' (Firefox)';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = ' (Safari)';

    return os + browser;
};

export const trackSession = async (user) => {
    if (!user) return;

    // Use session storage to cache IP/Location for the current tab session
    let ip = sessionStorage.getItem('myfinances_ip');
    let location = sessionStorage.getItem('myfinances_location');
    const lastAttempt = sessionStorage.getItem('myfinances_ip_last_attempt');
    const isBlocked = sessionStorage.getItem('myfinances_ip_blocked');

    if (!ip && !isBlocked) {
        // Throttle retries: only re-attempt every 5 minutes after a failure
        if (!lastAttempt || Date.now() - parseInt(lastAttempt) > 300000) {
            sessionStorage.setItem('myfinances_ip_last_attempt', Date.now().toString());
            const result = await fetchIpLocation();
            ip = result.ip;
            location = result.location;
            if (ip) {
                sessionStorage.setItem('myfinances_ip', ip);
                if (location) sessionStorage.setItem('myfinances_location', location);
            } else {
                // Mark as blocked/unavailable to avoid hammering the APIs
                sessionStorage.setItem('myfinances_ip_blocked', 'true');
            }
        }
    }

    const ua = navigator.userAgent;
    const device = parseDevice(ua);

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
        const { error } = await supabase
            .from('sessions')
            .update(sessionData)
            .eq('id', sessionId);

        if (error) {
            // Session was deleted remotely — fall through to create a new one
            sessionId = null;
        }
    }

    if (!sessionId) {
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
