import React, { useState, useEffect } from 'react';
import {
    User,
    Settings,
    LogOut,
    ChevronRight,
    Cloud,
    Shield,
    ArrowLeft,
    Moon,
    Repeat,
    Trash2,
    Camera,
    Upload,
    X
} from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import ConfirmationModal from '../components/ConfirmationModal';
import PhotoUploadModal from '../components/PhotoUploadModal';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';



const ProfileView = ({ user, onBack, onSignOut, onRecurring, onGeneral, onSecurity }) => {
    const { theme, toggleTheme } = useSettings();
    const isDark = theme === 'dark'; // Derived for UI compatibility

    const { showToast } = useToast();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [user.photoURL]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen animate-fade-in pb-24 relative z-50 transition-colors duration-300">

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 p-2 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex flex-col items-center">

                    <div className="relative group">
                        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner overflow-hidden border-4 border-white dark:border-gray-800">
                            {user.photoURL && !imgError ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <User size={48} strokeWidth={1.5} />
                            )}
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="absolute bottom-4 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 z-10"
                            title="Αλλαγή φωτογραφίας"
                        >
                            <Camera size={16} />
                        </button>
                        {user.photoURL && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('Θέλεις να αφαιρέσεις τη φωτογραφία προφίλ;')) {
                                        try {
                                            await updateProfile(user, { photoURL: '' });
                                            showToast('Η φωτογραφία αφαιρέθηκε επιτυχώς', 'success');
                                            // window.location.reload(); // Removed reload, might need manual re-fetch or rely on auth state update
                                            // Small hack to force re-render if auth listener doesn't catch deep prop change fast enough:
                                            // Ideally, user object updates automatically.
                                        } catch (e) {
                                            console.error("Error removing photo", e);
                                            showToast('Σφάλμα κατά την αφαίρεση της φωτογραφίας', 'error');
                                        }
                                    }
                                }}
                                className="absolute top-0 right-0 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 z-10"
                                title="Αφαίρεση φωτογραφίας"
                            >
                                <X size={14} />
                            </button>
                        )}

                        <PhotoUploadModal
                            isOpen={showUploadModal}
                            onClose={() => setShowUploadModal(false)}
                            onUpload={async (base64Image) => {
                                try {
                                    // 1. Create a reference
                                    const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);

                                    // 2. Upload the base64 string
                                    // Data URL format: "data:image/jpeg;base64,..."
                                    await uploadString(storageRef, base64Image, 'data_url');

                                    // 3. Get the download URL
                                    const url = await getDownloadURL(storageRef);

                                    // Append timestamp to bust cache
                                    const photoURL = `${url}&v=${Date.now()}`;

                                    // 4. Update Profile
                                    await updateProfile(user, { photoURL });

                                    // 5. Force refresh of local user object
                                    await user.reload();
                                    console.log("Photo updated to:", photoURL);

                                    showToast('Η φωτογραφία ενημερώθηκε επιτυχώς', 'success');
                                    setShowUploadModal(false);
                                    setTimeout(() => window.location.reload(), 500);
                                } catch (e) {
                                    console.error("Error updating photo", e);
                                    showToast('Αποτυχία ενημέρωσης φωτογραφίας: ' + e.message, 'error');
                                }
                            }}
                        />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.email || 'Ανώνυμος Χρήστης'}</h2>
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-100 dark:border-green-800">
                        <Cloud size={12} />
                        <span>Συγχρονισμός ενεργός</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Settings Group */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Ρυθμισεις</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">

                        {/* Theme Toggle */}
                        <div
                            onClick={toggleTheme}
                            className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Moon size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Σκοτεινό Θέμα</span>
                            </div>
                            <div className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${isDark ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>

                        </div>

                        {/* Recurring Transactions */}
                        <div
                            onClick={onRecurring}
                            className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Repeat size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Επαναλαμβανόμενες Συναλλαγές</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                        </div>
                    </div>

                    <div
                        onClick={onGeneral}
                        className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Settings size={18} /></div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">Γενικά</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <div
                        onClick={onSecurity}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Shield size={18} /></div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">Ασφάλεια</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                    </div>
                </div>
            </div>

            {/* Actions Group */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Λογαριασμος</h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg"><LogOut size={18} /></div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">Αποσύνδεση</span>
                        </div>
                    </button>
                    <button
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg"><Trash2 size={18} /></div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">Διαγραφή Λογαριασμού</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="text-center pt-4">
                <p className="text-xs text-gray-400">Έκδοση 1.0.0 • Build 2024</p>
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={onSignOut}
                title="Αποσύνδεση"
                message="Είσαι σίγουρος ότι θέλεις να αποσυνδεθείς από την εφαρμογή;"
                confirmText="Αποσύνδεση"
                type="danger"
            />

        </div>
    );
};

export default ProfileView;
