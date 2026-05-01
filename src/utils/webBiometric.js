/**
 * webBiometric.js
 * Proper WebAuthn-based biometric authentication for web/PWA.
 * Uses the platform authenticator (Touch ID, Windows Hello, Android fingerprint)
 * via the browser's Credential Management API.
 *
 * This is used ONLY when not on a native Capacitor platform.
 */

const RP_NAME = 'SpendWise';
const CREDENTIAL_STORAGE_KEY = 'spendwise_webauthn_cred_id';

/**
 * Returns the RP ID for WebAuthn.
 * Must match the effective domain the app is served from.
 */
const getRpId = () => window.location.hostname;

/**
 * Checks if the current browser/OS supports platform biometric authentication.
 * @returns {Promise<boolean>}
 */
export const isWebBiometricAvailable = async () => {
    if (
        typeof window === 'undefined' ||
        !window.PublicKeyCredential ||
        typeof navigator.credentials?.create !== 'function'
    ) {
        return false;
    }
    try {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
        return false;
    }
};

/**
 * Registers a new platform credential (enrollment step).
 * Shows the OS biometric prompt (Touch ID / Windows Hello / etc.).
 * Stores the credential ID in localStorage for later use.
 *
 * @param {string} userIdentifier - A unique string to identify the user (e.g. user ID or email).
 * @returns {Promise<void>}
 * @throws If the user cancels or biometrics fail.
 */
export const registerWebBiometric = async (userIdentifier) => {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = new TextEncoder().encode(userIdentifier);

    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: {
                id: getRpId(),
                name: RP_NAME,
            },
            user: {
                id: userId,
                name: userIdentifier,
                displayName: 'SpendWise User',
            },
            pubKeyCredParams: [
                { alg: -7,   type: 'public-key' }, // ES256 (preferred)
                { alg: -257, type: 'public-key' }, // RS256 (fallback for Windows Hello)
            ],
            authenticatorSelection: {
                authenticatorAttachment: 'platform',  // device-bound (Face ID, Touch ID, Windows Hello)
                userVerification: 'required',          // must actually verify the user biometrically
                residentKey: 'preferred',
            },
            timeout: 60000,
            attestation: 'none', // we don't need server-side attestation
        },
    });

    if (!credential) throw new Error('Credential creation returned null');

    // Encode the raw credential ID as base64 for localStorage
    const credIdBase64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    localStorage.setItem(CREDENTIAL_STORAGE_KEY, credIdBase64);
};

/**
 * Verifies the user using a previously registered platform credential.
 * Shows the OS biometric prompt.
 *
 * @returns {Promise<void>} Resolves if the user is verified, throws if not.
 */
export const verifyWebBiometric = async () => {
    const storedCredId = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
    if (!storedCredId) {
        throw new Error('No WebAuthn credential registered. Please re-enable biometrics.');
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credIdBytes = Uint8Array.from(atob(storedCredId), c => c.charCodeAt(0));

    // This call WILL show the OS biometric dialog (Touch ID popup, Windows Hello, etc.)
    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge,
            allowCredentials: [
                {
                    id: credIdBytes,
                    type: 'public-key',
                    transports: ['internal'],
                },
            ],
            userVerification: 'required',
            timeout: 60000,
        },
    });

    if (!assertion) {
        throw new Error('Biometric verification returned no assertion');
    }
    // If we reach here, the OS confirmed the user's identity biometrically.
};

/**
 * Removes the stored credential ID from localStorage.
 * Call this when the user disables biometrics.
 */
export const clearWebBiometric = () => {
    localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
};

/**
 * Returns true if a web biometric credential is already registered.
 */
export const hasWebBiometricRegistered = () => {
    return Boolean(localStorage.getItem(CREDENTIAL_STORAGE_KEY));
};
