import React from 'react';
import {
    User,
    Settings,
    LogOut,
    ChevronRight,
    Cloud,
    Shield,
    Trash2,
    ArrowLeft
} from 'lucide-react';

const ProfileView = ({ user, onBack, onSignOut }) => {
    const [isDark, setIsDark] = useState(() => {
        if (localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return true;
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

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
                    <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
                        <User size={48} strokeWidth={1.5} />
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
                            onClick={() => setIsDark(!isDark)}
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

                        <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Settings size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Γενικά</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
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
                            onClick={onSignOut}
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

            </div>
        </div>
    );
};

export default ProfileView;
