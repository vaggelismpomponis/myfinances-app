import React, { useState } from 'react';
import {
    ArrowLeft,
    Globe,
    Euro,
    Download,
    Trash2,
    Check
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { db, appId, auth } from '../firebase';
import ConfirmationModal from '../components/ConfirmationModal';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { openNotificationSettings } from '../utils/notificationListener';
import { Capacitor } from '@capacitor/core';

const GeneralSettingsView = ({ user, onBack }) => {
    const { currency, updateCurrency, language, updateLanguage, t: translate } = useSettings();
    const { showToast } = useToast();
    const [showClearDataModal, setShowClearDataModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            // Fetch all transactions
            const querySnapshot = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
            const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Create JSON file
            const dataStr = JSON.stringify(transactions, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            // Trigger download
            const link = document.createElement("a");
            link.href = url;
            link.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Export error:", error);
            alert("Σφάλμα κατά την εξαγωγή δεδομένων.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
            const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', d.id)));
            await Promise.all(deletePromises);
            showToast("Όλα τα δεδομένα διαγράφηκαν επιτυχώς.", 'success');
        } catch (error) {
            console.error("Clear data error:", error);
            showToast("Σφάλμα κατά τη διαγραφή.", 'error');
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setIsDeleting(true);
        try {
            // 1. Re-authenticate
            const isPasswordUser = user.providerData.some(p => p.providerId === 'password');

            if (isPasswordUser) {
                const credential = EmailAuthProvider.credential(user.email, deletePassword);
                await reauthenticateWithCredential(user, credential);
            } else {
                const provider = new GoogleAuthProvider();
                await reauthenticateWithPopup(user, provider);
            }

            // 2. Delete User Data (Subcollections)
            const subcollections = ['transactions', 'recurring_transactions', 'goals', 'budgets', 'sessions'];

            for (const subcol of subcollections) {
                const q = collection(db, 'artifacts', appId, 'users', user.uid, subcol);
                const snapshot = await getDocs(q);

                const batch = writeBatch(db);
                let count = 0;

                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                    count++;
                });

                if (count > 0) {
                    await batch.commit();
                }
            }

            // 3. Delete Auth Account
            await deleteUser(user);

            showToast('Ο λογαριασμός διαγράφηκε επιτυχώς.', 'success');

        } catch (error) {
            console.error("Delete account error:", error);
            if (error.code === 'auth/wrong-password') {
                showToast('Λάθος κωδικός πρόσβασης.', 'error');
            } else if (error.code === 'auth/requires-recent-login') {
                showToast('Απαιτείται πρόσφατη σύνδεση. Παρακαλώ συνδεθείτε ξανά.', 'error');
            } else if (error.code === 'auth/popup-closed-by-user') {
                showToast('Η επαλήθευση ακυρώθηκε.', 'info');
            } else {
                showToast('Σφάλμα διαγραφής: ' + error.message, 'error');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-[#F9F9F9] dark:bg-gray-900 min-h-screen animate-fade-in pb-24 relative z-50 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 pt-12 pb-6 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{translate('general_settings')}</h2>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Regional Group */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">{translate('regional_settings')}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">

                        {/* Currency */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Euro size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('currency')}</span>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => updateCurrency('€')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currency === '€' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
                                >
                                    EUR
                                </button>
                                <button
                                    onClick={() => updateCurrency('$')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currency === '$' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
                                >
                                    USD
                                </button>
                            </div>
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Globe size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('language')}</span>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => updateLanguage('el')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'el' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
                                >
                                    EL
                                </button>
                                <button
                                    onClick={() => updateLanguage('en')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
                                >
                                    EN
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Data Group */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">{translate('data')}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">

                        {/* Export */}
                        <button
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    {isExporting ? <div className="animate-spin w-[18px] h-[18px] border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Download size={18} />}
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('export_data')}</span>
                            </div>
                        </button>

                        {/* Clear Data */}
                        <button
                            onClick={() => setShowClearDataModal(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors"><Trash2 size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('clear_all_data')}</span>
                            </div>
                        </button>

                        {/* Delete Account */}
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group border-t border-gray-50 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors"><Trash2 size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('delete_account')}</span>
                            </div>
                        </button>

                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-2">
                        {translate('data_deletion_warning')}
                    </p>
                </div>

                {/* Notifications Group */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">{translate('notifications')}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
                        <button
                            onClick={openNotificationSettings}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <Check size={18} />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{translate('enable_sms_reading')}</span>
                            </div>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-2">
                        {translate('sms_reading_desc')}
                    </p>
                </div>

            </div>

            <ConfirmationModal
                isOpen={showClearDataModal}
                onClose={() => setShowClearDataModal(false)}
                onConfirm={handleClearData}
                title="Διαγραφή Δεδομένων"
                message="Είσαι σίγουρος; Αυτή η ενέργεια θα διαγράψει ΟΛΕΣ τις συναλλαγές σου και δεν μπορεί να αναιρεθεί."
                confirmText="Οριστική Διαγραφή"
                type="danger"
            />

            {/* Delete Account Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                        <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col items-center mb-6 text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Διαγραφή Λογαριασμού</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Αυτή η ενέργεια είναι <strong>μη αναστρέψιμη</strong>. Όλα τα δεδομένα σας (συναλλαγές, στόχοι, ρυθμίσεις) θα χαθούν οριστικά.
                                </p>
                            </div>

                            <form onSubmit={handleDeleteAccount} className="space-y-4">
                                {user.providerData.some(p => p.providerId === 'password') ? (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Επιβεβαίωση με τον κωδικό σας
                                        </label>
                                        <input
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="Ο κωδικός σας..."
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                        Θα σας ζητηθεί να συνδεθείτε ξανά με τον Google λογαριασμό σας για επιβεβαίωση.
                                    </p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl"
                                        disabled={isDeleting}
                                    >
                                        Ακύρωση
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-colors"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Διαγραφή...' : 'Οριστική Διαγραφή'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default GeneralSettingsView;
