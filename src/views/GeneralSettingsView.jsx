import React, { useState } from 'react';
import {
    ArrowLeft,
    Globe,
    Euro,
    Download,
    Trash2,
    Check
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import ConfirmationModal from '../components/ConfirmationModal';
import { useSettings } from '../contexts/SettingsContext';

const GeneralSettingsView = ({ user, onBack }) => {
    const { currency, updateCurrency, language, updateLanguage } = useSettings();
    const [showClearDataModal, setShowClearDataModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

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
            alert("Όλα τα δεδομένα διαγράφηκαν επιτυχώς.");
        } catch (error) {
            console.error("Clear data error:", error);
            alert("Σφάλμα κατά τη διαγραφή.");
        }
    };

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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Γενικές Ρυθμίσεις</h2>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Regional Group */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Τοπικες Ρυθμισεις</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">

                        {/* Currency */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Euro size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Νόμισμα</span>
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
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Globe size={18} /></div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Γλώσσα</span>
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
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 ml-2">Δεδομενα</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">

                        {/* Export */}
                        <button
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                    {isExporting ? <div className="animate-spin w-[18px] h-[18px] border-2 border-green-600 border-t-transparent rounded-full" /> : <Download size={18} />}
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Εξαγωγή Δεδομένων</span>
                            </div>
                        </button>

                        {/* Clear Data */}
                        <button
                            onClick={() => setShowClearDataModal(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors"><Trash2 size={18} /></div>
                                <span className="font-medium text-red-600 dark:text-red-400">Διαγραφή Όλων</span>
                            </div>
                        </button>

                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-2">
                        Η διαγραφή δεδομένων είναι μη αναστρέψιμη ενέργεια.
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
        </div>
    );
};

export default GeneralSettingsView;
