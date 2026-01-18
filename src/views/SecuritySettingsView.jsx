import React, { useState } from 'react';
import {
    ArrowLeft,
    Lock,
    Smartphone,
    ShieldCheck,
    History,
    ChevronRight,
    KeyRound
} from 'lucide-react';

const SecuritySettingsView = ({ user, onBack }) => {
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);

    // Mock Sessions Data
    const sessions = [
        { id: 1, device: 'iPhone 15 Pro', location: 'Athens, GR', active: true, date: 'Τώρα' },
        { id: 2, device: 'Chrome on Windows', location: 'Thessaloniki, GR', active: false, date: '2 ώρες πριν' },
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen animate-fade-in pb-24 relative z-50 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 pt-12 pb-6 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ασφάλεια</h2>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Login Security */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Συνδεση & Αυθεντικοποιηση</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">

                        {/* Change Password */}
                        <button
                            className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                            onClick={() => alert('Η λειτουργία αλλαγής κωδικού θα είναι διαθέσιμη σύντομα.')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><KeyRound size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Αλλαγή Κωδικού</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                        </button>

                        {/* Biometrics Toggle */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Smartphone size={18} /></div>
                                <div>
                                    <span className="block font-medium text-gray-700 dark:text-gray-200">FaceID / TouchID</span>
                                    <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">Απαίτηση κατά το άνοιγμα</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                                className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${biometricsEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${biometricsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Active Sessions */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Ενεργες Συνεδριες</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">

                        {sessions.map((session, index) => (
                            <div key={session.id} className={`p-4 flex items-center justify-between ${index !== sessions.length - 1 ? 'border-b border-gray-50 dark:border-gray-700' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
                                        {session.device.includes('iPhone') ? <Smartphone size={18} /> : <ShieldCheck size={18} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white">{session.device}</span>
                                            {session.active && (
                                                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] uppercase font-bold rounded-md">This</span>
                                            )}
                                        </div>
                                        <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">{session.location} • {session.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default SecuritySettingsView;
