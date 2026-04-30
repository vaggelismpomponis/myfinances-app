import React, { useState, useEffect, useRef } from 'react';
import {
    X, Camera, Layers, Mic, Delete, Check, Plus,
    Coffee, ShoppingCart, Home as HomeIcon, Receipt,
    Gift, Utensils, Banknote, LineChart, Package,
    MessageSquare, Gamepad2, MoreHorizontal, AlertCircle
} from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import ScannerModal from './ScannerModal';
import BulkScannerModal from './BulkScannerModal';
import { useSettings } from '../contexts/SettingsContext';
import logger from '../utils/logger';

const NOTE_MAX_LENGTH = 200;
const CATEGORY_NAME_MAX_LENGTH = 30;
const AMOUNT_MAX_VALUE = 999999.99;

const AddModal = ({ onClose, onAdd, initialData }) => {
    const { customCategories, addCustomCategory, t, privacyMode } = useSettings();
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [activeTab, setActiveTab] = useState('manual');
    const [audioBlob, setAudioBlob] = useState(null);
    const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

    const getCategoryTranslation = (catName) => {
        const mapping = {
            'Σούπερ Μάρκετ': 'cat_supermarket',
            'Φαγητό': 'cat_food',
            'Καφές': 'cat_coffee',
            'Σπίτι': 'cat_home',
            'Λογαριασμοί': 'cat_bills',
            'Διασκέδαση': 'cat_entertainment',
            'Μισθός': 'cat_salary',
            'Δώρο': 'cat_gift',
            'Επενδύσεις': 'cat_investments',
            'Άλλο': 'cat_other'
        };
        const key = mapping[catName];
        if (key && t(key) !== key) return t(key);
        return catName;
    };
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showBulkScanner, setShowBulkScanner] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [showNote, setShowNote] = useState(false);
    const transcriptRef = useRef('');
    const recognitionRef = useRef(null);

    // Batch mode state
    const [batchQueue, setBatchQueue] = useState([]);
    const [batchIndex, setBatchIndex] = useState(0);

    // Handle Android back button/gesture to close modal
    useEffect(() => {
        let backHandler;
        if (Capacitor.isNativePlatform()) {
            backHandler = App.addListener('backButton', () => {
                onClose();
            });
        }

        return () => {
            if (backHandler) backHandler.then(h => h.remove());
            if (Capacitor.isNativePlatform()) {
                SpeechRecognition.removeAllListeners();
            }
        };
    }, [onClose]);

    useEffect(() => {
        if (initialData) {
            logger.debug('AddModal received initialData (editing mode)', 'AddModal');
            setType(initialData.type || 'expense');
            setAmount(initialData.amount ? initialData.amount.toString() : '');
            setCategory(initialData.category || '');
            setNote(initialData.note ? initialData.note.substring(0, NOTE_MAX_LENGTH) : '');
            setShowNote(!!(initialData.note));
        } else {
            // Reset if no data
            setAmount('');
            setCategory('');
            setNote('');
            setShowNote(false);
        }
    }, [initialData]);

    const baseExpenseCategories = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Άλλο'];
    const baseIncomeCategories = ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλο'];

    const categories = type === 'expense'
        ? [...baseExpenseCategories, ...(customCategories?.expense || [])]
        : [...baseIncomeCategories, ...(customCategories?.income || [])];

    // Keyword mapping for auto-categorization
    const CATEGORY_KEYWORDS = {
        'Σούπερ Μάρκετ': ['σούπερ', 'μάρκετ', 'ψώνια', 'γάλα', 'ψωμί', 'κρέας', 'κρεοπωλείο', 'τυρί', 'λαχανικά', 'φρούτα'],
        'Φαγητό': ['φαγητό', 'ταβέρνα', 'σουβλάκια', 'πίτσα', 'delivery', 'εστιατόριο', 'γεύμα', 'δείπνο'],
        'Καφές': ['καφές', 'ποτό', 'μπαρ', 'freddo', 'latte', 'espresso'],
        'Σπίτι': ['σπίτι', 'νοίκι', 'κοινόχρηστα', 'καθαριστικά', 'επισκευή', 'υδραυλικός', 'ηλεκτρολόγος'],
        'Λογαριασμοί': ['λογαριασμός', 'τέλη', 'ρεύμα', 'νερό', 'ίντερνετ', 'τηλέφωνο', 'δεή', 'eydap', 'cosmote', 'vodafone', 'nova'],
        'Διασκέδαση': ['σινεμά', 'θέατρο', 'έξοδος', 'συναυλία', 'εισιτήρια'],
        'Άλλο': []
    };

    const processVoiceInput = (text) => {
        const lowerText = text.toLowerCase();

        // 1. Extract Amount
        // Look for numbers, possibly with decimals (dot or comma)
        const amountMatch = lowerText.match(/\d+([.,]\d{1,2})?/);
        let extractedAmount = '';
        if (amountMatch) {
            // Replace comma with dot for standard parsing
            extractedAmount = amountMatch[0].replace(',', '.');
        }

        // 2. Extract Category
        let extractedCategory = '';
        if (type === 'expense') {
            for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
                if (keywords.some(k => lowerText.includes(k))) {
                    extractedCategory = cat;
                    break;
                }
            }
        }

        // 3. Extract Note (everything else, cleaned up)
        let extractedNote = text;
        if (extractedAmount) {
            // Remove the amount from the note text to avoid duplication
            // Also remove common currency words
            const amountRegex = new RegExp(`${amountMatch[0]}\\s*(ευρώ|euro|€)?`, 'i');
            extractedNote = text.replace(amountRegex, '').trim();
        }

        // Apply changes
        if (extractedAmount) setAmount(extractedAmount);
        if (extractedCategory) setCategory(extractedCategory);
        if (extractedNote) {
            // Capitalize first letter of note
            setNote(extractedNote.charAt(0).toUpperCase() + extractedNote.slice(1));
        }
    };

    const startListening = async () => {
        // Native Implementation
        if (Capacitor.isNativePlatform()) {
            try {
                const { available } = await SpeechRecognition.available();
                if (!available) {
                    alert('Η αναγνώριση φωνής δεν είναι διαθέσιμη σε αυτή τη συσκευή.');
                    return;
                }

                // Check and request permission
                const status = await SpeechRecognition.checkPermissions();
                if (status.speechRecognition !== 'granted') {
                    const reqStatus = await SpeechRecognition.requestPermissions();
                    if (reqStatus.speechRecognition !== 'granted') {
                        alert('Η πρόσβαση στο μικρόφωνο δεν επιτράπηκε.');
                        return;
                    }
                }

                // Remove existing listeners to avoid duplicates
                await SpeechRecognition.removeAllListeners();

                setIsListening(true);
                setTranscript('');
                transcriptRef.current = '';

                // Add listeners
                await SpeechRecognition.addListener('partialResults', (data) => {
                    if (data.matches && data.matches.length > 0) {
                        const newText = data.matches[0];
                        setTranscript(newText);
                        transcriptRef.current = newText;
                    }
                });

                // Some devices/versions return the final result in a 'result' event or only after stopping
                // We mainly rely on partialResults building up the transcript

                // Monitor listening state to auto-complete when silence is detected (Google-like behavior)
                await SpeechRecognition.addListener('listeningState', (data) => {
                    if (!data.status) {
                        setIsListening(false);
                        // Access the latest transcript state via functional update or ref if needed
                        // Since we can't access updated state in listener easily without refs, 
                        // we rely on the fact that transcript state *might* be stale here in a closure.
                        // HOWEVER, let's use a workaround: The `processVoiceInput` is called manually 
                        // or we can trigger it if we have text. 

                        // Better approach: Let the user see it stopped and click Done, OR 
                        // attempt to process content if we have it in a Ref. 
                        // For now, let's just update UI state to "not listening" so the user sees it stopped.
                    }
                });

                // Start listening
                await SpeechRecognition.start({
                    language: 'el-GR',
                    maxResults: 1,
                    prompt: 'Πείτε το ποσό και την κατηγορία...',
                    partialResults: true,
                    popup: false,
                });

            } catch (err) {
                console.error('Native Speech Recognition Error:', err);
                setIsListening(false);
                alert('Σφάλμα: ' + (err.message || JSON.stringify(err)));
            }
            return;
        }

        // Web Implementation (Fallback)
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Η φωνητική πληκτρολόγηση δεν υποστηρίζεται σε αυτόν τον browser.');
            return;
        }

        // Explicitly request microphone permission first to trigger the browser prompt
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error('Permission denied:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                alert('Η πρόσβαση στο μικρόφωνο δεν επιτράπηκε. Παρακαλώ ελέγξτε τις ρυθμίσεις του browser σας για να επιτρέψετε την πρόσβαση.');
            } else {
                alert('Δεν ήταν δυνατή η πρόσβαση στο μικρόφωνο: ' + err.message);
            }
            return;
        }

        const WebSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new WebSpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = 'el-GR';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            setTranscript(finalTranscript || interimTranscript);

            if (finalTranscript) {
                processVoiceInput(finalTranscript);
                setIsListening(false);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            // Alert user on error (useful for mobile debugging)
            if (event.error === 'not-allowed') {
                alert('Η πρόσβαση στο μικρόφωνο δεν επιτράπηκε. Ελέγξτε τις ρυθμίσεις σας.');
            } else if (event.error === 'network') {
                alert('Πρόβλημα δικτύου. Η αναγνώριση ομιλίας απαιτεί σύνδεση στο internet.');
            } else {
                alert('Σφάλμα φωνητικής εντολής: ' + event.error);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const stopListening = async () => {
        // UI should update immediately to unblock user
        setIsListening(false);

        try {
            if (Capacitor.isNativePlatform()) {
                await SpeechRecognition.stop();
            } else {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            }
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    };

    const loadFromBatchItem = (item) => {
        if (item.amount) setAmount(item.amount.toString());
        if (item.note) setNote(item.note.substring(0, 30));
        setType('expense');
        setCategory('');
    };

    // Category icon mapping
    const categoryIcons = {
        'Σούπερ Μάρκετ': ShoppingCart,
        'Φαγητό': Utensils,
        'Καφές': Coffee,
        'Σπίτι': HomeIcon,
        'Λογαριασμοί': Receipt,
        'Διασκέδαση': Gamepad2,
        'Μισθός': Banknote,
        'Δώρο': Gift,
        'Επενδύσεις': LineChart,
        'Άλλο': Package
    };

    // Numpad handler
    const handleNumpadPress = (key) => {
        if (key === 'backspace') {
            setAmount(prev => prev.slice(0, -1));
        } else if (key === '.') {
            setAmount(prev => {
                if (prev.includes('.')) return prev;
                return prev === '' ? '0.' : prev + '.';
            });
        } else {
            // Digit
            setAmount(prev => {
                if (prev === '0' && key !== '.') return key;
                const decIndex = prev.indexOf('.');
                if (decIndex !== -1 && prev.length - decIndex > 2) return prev;
                if (prev.length >= 10) return prev;
                return prev + key;
            });
        }
    };

    const [amountError, setAmountError] = useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!amount || !category) return;

        // Validate amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setAmountError(t('amount_positive_error'));
            return;
        }
        if (parsedAmount > AMOUNT_MAX_VALUE) {
            setAmountError(t('amount_max_error'));
            return;
        }
        setAmountError('');

        setIsSubmitting(true);
        await onAdd({
            type,
            amount: parsedAmount,
            category,
            note: note.substring(0, NOTE_MAX_LENGTH)
        });

        // If in batch mode, load next item
        if (batchQueue.length > 0 && batchIndex < batchQueue.length - 1) {
            const nextIndex = batchIndex + 1;
            setBatchIndex(nextIndex);
            loadFromBatchItem(batchQueue[nextIndex]);
            setIsSubmitting(false);
        } else {
            // Close modal
            setIsSubmitting(false);
            setBatchQueue([]);
            setBatchIndex(0);
            onClose();
        }
    };

    const handleScanComplete = (data) => {
        if (data.amount) setAmount(data.amount.toString());
        if (data.note) setNote(data.note.substring(0, 30));
        setType('expense');
    };

    const handleBulkScanComplete = (results) => {
        if (!results || results.length === 0) return;

        if (results.length === 1) {
            // Single result, just fill form
            handleScanComplete(results[0]);
        } else {
            // Multiple results, enter batch mode
            setBatchQueue(results);
            setBatchIndex(0);
            loadFromBatchItem(results[0]);
        }
    };

    const handleSkipBatchItem = () => {
        if (batchQueue.length === 0) return;

        if (batchIndex < batchQueue.length - 1) {
            const nextIndex = batchIndex + 1;
            setBatchIndex(nextIndex);
            loadFromBatchItem(batchQueue[nextIndex]);
        } else {
            // Last item skipped, close
            setBatchQueue([]);
            setBatchIndex(0);
            onClose();
        }
    };

    const inBatchMode = batchQueue.length > 1;


    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
            <div className="bg-white dark:bg-surface-dark2 w-full max-w-md h-[100dvh] sm:h-auto sm:max-h-[95vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up relative transition-colors">

                {/* Voice Input Overlay */}
                {isListening && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md animate-fade-in p-6 text-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                            <div className="relative bg-gradient-to-tr from-red-500 to-pink-500 p-6 rounded-full shadow-xl shadow-red-200 dark:shadow-red-900/30">
                                <Mic size={40} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{t('listening')}</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium min-h-[4rem] flex items-center justify-center max-w-[80%]">
                            {transcript || t('listening_example')}
                        </p>
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={stopListening}
                                className="px-6 py-3 bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-100 active:bg-gray-300 rounded-full text-sm font-bold text-gray-500 dark:text-black transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    if (transcript) processVoiceInput(transcript);
                                    stopListening();
                                }}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-full text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all"
                            >
                                {t('save')}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Header ── */}
                <div className="px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex justify-between items-center border-b border-gray-100 dark:border-transparent flex-shrink-0">
                    <button onClick={onClose} className="p-2 text-gray-400 dark:text-black bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-100 rounded-full transition-colors">
                        <X size={22} />
                    </button>
                    <div className="text-center">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">
                            {initialData ? t('edit') : t('new_transaction')}
                        </h3>
                        {inBatchMode && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                {batchIndex + 1} {t('of')} {batchQueue.length}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!amount || !category || isSubmitting}
                        className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all ${!amount || !category
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 active:scale-95'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        ) : initialData ? t('update') : t('save')}
                    </button>
                </div>

                {/* ── Content area (scrollable if needed) ── */}
                <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">

                    {/* Type Toggle */}
                    <div className="px-5 pt-4 pb-2 flex-shrink-0">
                        <div className="bg-gray-100 dark:bg-surface-dark3 p-1 rounded-xl flex">
                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense'
                                    ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-400'
                                    }`}
                            >
                                {t('expense_type')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income'
                                    ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-400'
                                    }`}
                            >
                                {t('income_type')}
                            </button>
                        </div>
                    </div>

                    {/* Amount Display */}
                    <div className="px-5 py-4 text-center flex-1 flex items-center justify-center">
                        <div className="flex items-baseline justify-center gap-1">
                            {!privacyMode && <span className="text-2xl font-bold text-gray-300 dark:text-gray-500">€</span>}
                            <span className={`text-5xl font-extrabold tracking-tight transition-colors ${amount ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'
                                }`}>
                                {privacyMode ? '****' : (amount || '0')}
                            </span>
                        </div>
                    </div>

                    {/* Category Chips with Icons */}
                    <div className="px-4 pb-3 flex-shrink-0">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map(cat => {
                                const Icon = categoryIcons[cat] || MoreHorizontal;
                                const isSelected = category === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 ${isSelected
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'border-gray-200 dark:border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-surface-dark3'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        <span>{getCategoryTranslation(cat)}</span>
                                    </button>
                                );
                            })}

                            {!isAddingCategory ? (
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCategory(true)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 border-dashed border-gray-300 dark:border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 bg-transparent"
                                >
                                    <Plus size={14} />
                                    <span>{t('new_category')}</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-1 animate-fade-in">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value.substring(0, CATEGORY_NAME_MAX_LENGTH))}
                                        placeholder={t('name_placeholder')}
                                        autoFocus
                                        maxLength={CATEGORY_NAME_MAX_LENGTH}
                                        className="w-24 px-3 py-1.5 rounded-full text-xs border border-indigo-300 dark:border-transparent bg-white dark:bg-surface-dark2 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newCategoryName.trim()) {
                                                e.preventDefault();
                                                addCustomCategory(type, newCategoryName.trim());
                                                setCategory(newCategoryName.trim());
                                                setNewCategoryName('');
                                                setIsAddingCategory(false);
                                            } else if (e.key === 'Escape') {
                                                setIsAddingCategory(false);
                                                setNewCategoryName('');
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newCategoryName.trim()) {
                                                addCustomCategory(type, newCategoryName.trim());
                                                setCategory(newCategoryName.trim());
                                            }
                                            setNewCategoryName('');
                                            setIsAddingCategory(false);
                                        }}
                                        className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingCategory(false);
                                            setNewCategoryName('');
                                        }}
                                        className="p-1.5 rounded-full bg-gray-100 dark:bg-surface-dark3 text-gray-500 dark:text-gray-400"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Collapsible Note */}
                    <div className="px-5 pb-2 flex-shrink-0">
                        {showNote ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value.substring(0, NOTE_MAX_LENGTH))}
                                    placeholder={t('note_placeholder')}
                                    autoFocus
                                    maxLength={NOTE_MAX_LENGTH}
                                    className="w-full bg-gray-50 dark:bg-surface-dark3 border border-gray-200 dark:border-transparent rounded-xl px-4 py-2.5 pr-14 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    onBlur={() => { if (!note) setShowNote(false); }}
                                />
                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium tabular-nums ${
                                    note.length >= NOTE_MAX_LENGTH ? 'text-rose-500' : 'text-gray-300 dark:text-gray-600'
                                }`}>
                                    {note.length}/{NOTE_MAX_LENGTH}
                                </span>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowNote(true)}
                                className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-full justify-center py-1"
                            >
                                <MessageSquare size={14} />
                                <span>{t('note_placeholder')}</span>
                            </button>
                        )}
                    </div>

                    {/* Amount validation error */}
                    {amountError && (
                        <div className="px-5 pb-2 flex-shrink-0">
                            <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-xl">
                                <AlertCircle size={12} />
                                <span>{amountError}</span>
                            </div>
                        </div>
                    )}

                    {/* Tool Strip — voice, scan, bulk */}
                    <div className="px-5 pb-3 flex justify-center gap-3 flex-shrink-0">
                        <button
                            type="button"
                            onClick={startListening}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-md shadow-red-200/50 dark:shadow-red-900/30 hover:shadow-lg active:scale-95 transition-all"
                        >
                            <Mic size={14} />
                            {t('voice')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 active:scale-95 transition-all"
                        >
                            <Camera size={14} />
                            {t('scan')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowBulkScanner(true)}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/20 hover:bg-violet-100 dark:hover:bg-violet-500/30 active:scale-95 transition-all"
                        >
                            <Layers size={14} />
                            {t('bulk')}
                        </button>
                    </div>

                    {/* Batch Skip */}
                    {inBatchMode && (
                        <div className="px-5 pb-2 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleSkipBatchItem}
                                className="w-full py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-surface-dark3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                                {t('skip')}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Numpad ── */}
                <div className="bg-gray-50 dark:bg-surface-dark border-t border-gray-200 dark:border-transparent p-3 pb-[calc(0.75rem+env(safe-area-inset-top))] flex-shrink-0">
                    {/* Digits 1-9 */}
                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(key => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleNumpadPress(key)}
                                className="h-14 rounded-2xl text-xl font-bold flex items-center justify-center transition-all active:scale-95 bg-white dark:bg-surface-dark2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-transparent"
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                    {/* Bottom row: .  0  ⌫  ✓ */}
                    <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mt-2">
                        <button type="button" onClick={() => handleNumpadPress('.')} className="h-14 rounded-2xl text-xl font-bold flex items-center justify-center transition-all active:scale-95 bg-white dark:bg-surface-dark2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-transparent">.</button>
                        <button type="button" onClick={() => handleNumpadPress('0')} className="h-14 rounded-2xl text-xl font-bold flex items-center justify-center transition-all active:scale-95 bg-white dark:bg-surface-dark2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-transparent">0</button>
                        <button type="button" onClick={() => handleNumpadPress('backspace')} className="h-14 rounded-2xl text-xl font-bold flex items-center justify-center transition-all active:scale-95 bg-gray-200 dark:bg-surface-dark3 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                            <Delete size={22} />
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!amount || !category || isSubmitting}
                            className={`h-14 rounded-2xl text-xl font-bold flex items-center justify-center transition-all active:scale-95 ${!amount || !category
                                ? 'bg-gray-200 dark:bg-surface-dark3 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:bg-indigo-700'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Check size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {showScanner && <ScannerModal onClose={() => setShowScanner(false)} onScanComplete={handleScanComplete} />}
                {showBulkScanner && <BulkScannerModal onClose={() => setShowBulkScanner(false)} onScanComplete={handleBulkScanComplete} />}
            </div>
        </div>
    );
};

export default AddModal;
