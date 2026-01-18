import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

export const trackSession = async (user) => {
    if (!user) return;

    try {
        // 1. Get IP & Location
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        // 2. Parsed Device Info
        const ua = navigator.userAgent;
        let device = "Unknown Device";
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
            ip: data.ip || 'Unknown',
            location: `${data.city || 'Unknown'}, ${data.country_code || ''}`,
            device: device,
            lastActive: new Date().toISOString(),
            userAgent: ua,
            isCurrent: true // Marker for UI
        };

        // 3. Identification (Simple localStorage persistence to track "this" browser)
        let sessionId = localStorage.getItem('myfinances_session_id');
        const sessionsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'sessions');

        if (sessionId) {
            // Update existing
            await setDoc(doc(sessionsRef, sessionId), sessionData, { merge: true });
        } else {
            // Create new
            const newDoc = await setDoc(doc(sessionsRef), sessionData);
            // setDoc requires an ID if we want one, or we use addDoc. 
            // Actually, let's use doc() to generate ID if we want, or just addDoc then save ID.
            // Let's use custom ID generation for cleaner control or just let firestore handle it.
            // Better:
            const newSessionRef = doc(sessionsRef);
            await setDoc(newSessionRef, sessionData);
            localStorage.setItem('myfinances_session_id', newSessionRef.id);
        }

    } catch (error) {
        console.error("Session tracking failed:", error);
    }
};
