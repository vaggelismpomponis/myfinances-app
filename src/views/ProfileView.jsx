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
    Repeat
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';



const ProfileView = ({ user, onBack, onSignOut, onRecurring, onGeneral, onSecurity }) => {
    const { theme, toggleTheme, t: translate } = useSettings();
    const isDark = theme === 'dark'; // Derived for UI compatibility

    const { showToast } = useToast();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [user.photoURL]);



    return (
        <div className="bg-[#F9F9F9] dark:bg-gray-900 min-h-screen animate-fade-in pb-24 relative z-50 transition-colors duration-300">

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-8 rounded-b-3xl shadow-sm border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <button
                    onClick={onBack}
                    className="absolute top-[calc(env(safe-area-inset-top)+1.5rem)] left-6 p-2 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
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
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.email || translate('anonymous_user')}</h2>
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-100 dark:border-green-800">
                        <Cloud size={12} />
                        <span>{translate('sync_active')}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Settings Group */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">{translate('settings_title')}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">

                        {/* Theme Toggle */}
                        <div
                            onClick={toggleTheme}
                            className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Moon size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('dark_theme')}</span>
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
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Repeat size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('recurring_transactions')}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                        </div>

                        {/* General */}
                        <div
                            onClick={onGeneral}
                            className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Settings size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('general')}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                        </div>

                        {/* Security */}
                        <div
                            onClick={onSecurity}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Shield size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('security')}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Group */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">{translate('account')}</h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><LogOut size={18} /></div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">{translate('logout')}</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="text-center pt-4">
                <p className="text-xs text-gray-400">{translate('version')} • Build 2024</p>
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={onSignOut}
                title={translate('logout_confirm_title')}
                message={translate('logout_confirm_message')}
                confirmText={translate('logout')}
                type="danger"
            />
        </div>
    );
};

export default ProfileView;
