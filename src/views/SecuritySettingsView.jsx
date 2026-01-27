import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Smartphone,
    ShieldCheck,
    ChevronRight,
    KeyRound,
    X,
    Laptop,
    Monitor,
    Lock
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, appId, auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

const SecuritySettingsView = ({ user, onBack }) => {
    const { isBiometricsEnabled, toggleBiometrics, isPinEnabled, setPin, removePin, appPin, t: translate } = useSettings();
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // Change Password State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // PIN State
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');

    useEffect(() => {
        // Get current session ID
        setCurrentSessionId(localStorage.getItem('myfinances_session_id'));

        // Subscribe to sessions
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'sessions'), orderBy('lastActive', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSessions(data);
        });

        return () => unsubscribe();
    }, [user]);

    const handleToggleBiometrics = async () => {
        if (!isBiometricsEnabled) {
            // Requirement: Must have a PIN set as fallback before enabling Biometrics
            if (!isPinEnabled || !appPin) { // Check context state
                alert("Πρέπει πρώτα να ορίσετε ένα PIN Εφαρμογής ως εφεδρική μέθοδο ασφαλείας.");
                setShowPinModal(true);
                return;
            }

            try {
                const result = await NativeBiometric.isAvailable();
                if (!result.isAvailable) {
                    alert("Η συσκευή σας δεν υποστηρίζει βιομετρική είσοδο ή δεν έχει ρυθμιστεί.");
                    return;
                }

                // Verify identity once before enabling to ensure it works
                await NativeBiometric.verifyIdentity({
                    reason: "Confirm transparency to enable biometrics",
                    title: "Enable Biometrics",
                    subtitle: "",
                    description: "",
                });

                toggleBiometrics(true);
            } catch (error) {
                console.error("Biometric setup failed:", error);
                // alert("Αποτυχία ρύθμισης βιομετρικών: " + error.message);
            }
        } else {
            toggleBiometrics(false);
        }
    };

    const handleTogglePin = () => {
        if (isPinEnabled) {
            removePin();
        } else {
            setPinInput('');
            setShowPinModal(true);
        }
    };

    const handleSavePin = (e) => {
        e.preventDefault();
        if (pinInput.length === 4) {
            setPin(pinInput);
            setShowPinModal(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setPasswordError(translate('password_mismatch'));
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError(translate('password_length_error'));
            setLoading(false);
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setPasswordSuccess(translate('password_changed_success'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (error) {
            console.error("Password change error:", error);
            if (error.code === 'auth/wrong-password') {
                setPasswordError(translate('current_password_error'));
            } else {
                setPasswordError("Σφάλμα: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (deviceStr) => {
        if (!deviceStr) return <ShieldCheck size={18} />;
        if (deviceStr.includes('iPhone') || deviceStr.includes('Android')) return <Smartphone size={18} />;
        if (deviceStr.includes('Mac') || deviceStr.includes('Windows') || deviceStr.includes('Linux')) return <Laptop size={18} />;
        return <Monitor size={18} />;
    };

    return (
        <div className="bg-[#F9F9F9] dark:bg-gray-900 h-screen flex flex-col animate-fade-in relative z-50 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 pt-12 pb-6 shadow-sm border-b border-gray-100 dark:border-gray-700 shrink-0 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{translate('security_title')}</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">

                {/* Login Security */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">{translate('login_auth')}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">

                        {/* Change Password */}
                        <button
                            className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><KeyRound size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('change_password')}</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                        </button>

                        {/* PIN Toggle */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Lock size={18} /></div>
                                <div>
                                    <span className="block font-medium text-gray-700 dark:text-gray-200">{translate('app_pin')}</span>
                                    <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">{translate('lock_screen')}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleTogglePin}
                                className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${isPinEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isPinEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Biometrics Toggle */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Smartphone size={18} /></div>
                                <div>
                                    <span className="block font-medium text-gray-700 dark:text-gray-200">{translate('biometrics')}</span>
                                    <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">{translate('biometrics_desc')}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleToggleBiometrics}
                                className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${isBiometricsEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isBiometricsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Active Sessions */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">{translate('active_sessions')}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
                        {sessions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">{translate('loading_sessions')}</div>
                        ) : (
                            sessions.map((session, index) => {
                                const isCurrent = session.id === currentSessionId;
                                const dateStr = new Date(session.lastActive).toLocaleString('el-GR', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                                return (
                                    <div key={session.id} className={`p-4 flex items-center justify-between ${index !== sessions.length - 1 ? 'border-b border-gray-50 dark:border-gray-700' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
                                                {getDeviceIcon(session.device)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 dark:text-white">{session.device}</span>
                                                    {isCurrent && (
                                                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] uppercase font-bold rounded-md">{translate('this_device')}</span>
                                                    )}
                                                </div>
                                                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">{session.location} • {dateStr}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{translate('change_password')}</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        {passwordSuccess ? (
                            <div className="text-center py-6">
                                <KeyRound size={48} className="mx-auto text-emerald-500 mb-3" />
                                <p className="text-emerald-600 font-bold">{passwordSuccess}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                {passwordError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl">
                                        {passwordError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{translate('current_password')}</label>
                                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" required />
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{translate('new_password')}</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{translate('confirm_new_password')}</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" required />
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors disabled:opacity-50">{loading ? '...' : translate('change_password')}</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* PIN Setup Modal */}
            {showPinModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPinModal(false)} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={24} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{translate('pin_setup')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{translate('pin_instruction')}</p>

                        <form onSubmit={handleSavePin}>
                            <input
                                type="tel"
                                maxLength="4"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                className="w-40 text-center text-3xl font-bold tracking-widest p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl">{translate('cancel')}</button>
                                <button type="submit" disabled={pinInput.length !== 4} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50">{translate('save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecuritySettingsView;
