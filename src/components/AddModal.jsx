import React, { useState, useEffect, useRef } from 'react';
import {
    X, Camera, Layers, Mic, Delete, Check, Plus, Search,
    Coffee, ShoppingCart, Home as HomeIcon, Receipt,
    Gift, Utensils, Banknote, LineChart, Shapes,
    MessageSquare, Martini, MoreHorizontal, AlertCircle, ShieldCheck,
    Fuel, HeartPulse
} from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import ScannerModal from './ScannerModal';
import BulkScannerModal from './BulkScannerModal';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import ProBadge from '../components/ProBadge';
import { CATEGORY_ACCENT } from '../components/CategoryIcon';
import logger from '../utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import useIsDesktop from '../hooks/useIsDesktop';
import { getCategoryTranslation } from '../utils/categoryTranslations';

const NOTE_MAX_LENGTH = 200;
const CATEGORY_NAME_MAX_LENGTH = 30;
const AMOUNT_MAX_VALUE = 999999.99;

const AddModal = ({ onClose, onAdd, initialData, initialType }) => {
    const { customCategories, addCustomCategory, t, privacyMode } = useSettings();
    const { isPro, openUpgradeModal } = useSubscription();
    const isDesktop = useIsDesktop();
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [activeTab, setActiveTab] = useState('manual');
    const [audioBlob, setAudioBlob] = useState(null);
    const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);


    const [type, setType] = useState(initialType || 'expense');

    useEffect(() => {
        if (initialType) {
            setType(initialType);
        }
    }, [initialType]);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showBulkScanner, setShowBulkScanner] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [showNote, setShowNote] = useState(false);
    const [isNoteFocused, setIsNoteFocused] = useState(false);
    const noteInputRef = useRef(null);
    const contentRef = useRef(null);
    const transcriptRef = useRef('');
    const recognitionRef = useRef(null);

    const handleOpenNote = () => {
        setShowNote(true);
        setTimeout(() => {
            noteInputRef.current?.focus();
        }, 50);
    };

    useEffect(() => {
        if (isNoteFocused && noteInputRef.current) {
            const timer = setTimeout(() => {
                noteInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
            return () => clearTimeout(timer);
        } else if (!isNoteFocused && contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isNoteFocused]);

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
            setIsNoteFocused(false);
        }
    }, [initialData]);

    const baseExpenseCategories = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Βενζίνη', 'Υγεία', 'Άλλο'];
    const baseIncomeCategories = ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλα Έσοδα'];

    const categories = type === 'income'
        ? [...baseIncomeCategories, ...(customCategories?.income || [])]
        : [...baseExpenseCategories, ...(customCategories?.expense || [])];

    // Keyword mapping for auto-categorization
    const CATEGORY_KEYWORDS = {
        'Σούπερ Μάρκετ': ['σούπερ', 'μάρκετ', 'ψώνια', 'γάλα', 'ψωμί', 'κρέας', 'κρεοπωλείο', 'τυρί', 'λαχανικά', 'φρούτα', 'supermarket', 'groceries', 'milk', 'bread', 'meat', 'cheese', 'vegetables', 'fruit'],
        'Φαγητό': ['φαγητό', 'ταβέρνα', 'σουβλάκια', 'πίτσα', 'delivery', 'εστιατόριο', 'γεύμα', 'δείπνο', 'food', 'restaurant', 'pizza', 'meal', 'dinner', 'lunch'],
        'Καφές': ['καφές', 'ποτό', 'μπαρ', 'freddo', 'latte', 'espresso', 'coffee', 'drink', 'bar', 'cafe'],
        'Σπίτι': ['σπίτι', 'νοίκι', 'κοινόχρηστα', 'καθαριστικά', 'επισκευή', 'υδραυλικός', 'ηλεκτρολόγος', 'home', 'rent', 'cleaning', 'repair', 'plumber', 'electrician'],
        'Λογαριασμοί': ['λογαριασμός', 'τέλη', 'ρεύμα', 'νερό', 'ίντερνετ', 'τηλέφωνο', 'δεή', 'eydap', 'cosmote', 'vodafone', 'nova', 'bill', 'electricity', 'water', 'internet', 'phone'],
        'Διασκέδαση': ['σινεμά', 'θέατρο', 'έξοδος', 'συναυλία', 'εισιτήρια', 'cinema', 'movie', 'theater', 'concert', 'tickets', 'entertainment'],
        'Βενζίνη': ['βενζίνη', 'καύσιμα', 'πετρέλαιο', 'αέριο', 'διόδια', 'gas', 'fuel', 'petrol', 'toll'],
        'Υγεία': ['υγεία', 'γιατρός', 'φάρμακα', 'φαρμακείο', 'εξετάσεις', 'health', 'doctor', 'medicine', 'pharmacy', 'hospital'],
        'Άλλο': ['other'],
        'Άλλα Έσοδα': ['other income']
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
            setShowNote(true);
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
                    language: 'el-GR', // We use el-GR model but parsing keywords natively supports English text if captured
                    maxResults: 1,
                    prompt: 'Say amount & category / Πείτε ποσό & κατηγορία...',
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
        if (item.note) {
            setNote(item.note.substring(0, 30));
            setShowNote(true);
        }
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
        'Διασκέδαση': Martini,
        'Βενζίνη': Fuel,
        'Υγεία': HeartPulse,
        'Μισθός': Banknote,
        'Δώρο': Gift,
        'Επενδύσεις': LineChart,
        'Άλλο': Shapes,
        'Άλλα Έσοδα': Shapes
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
        if (data.note) {
            setNote(data.note.substring(0, 30));
            setShowNote(true);
        }
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-0 lg:p-3"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-modal-title"
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="bg-white dark:bg-surface-dark2 text-gray-900 dark:text-white w-full max-w-md lg:max-w-[740px] xl:max-w-[800px] h-[100dvh] lg:h-[880px] xl:h-[940px] lg:min-h-[700px] lg:max-h-[96vh] rounded-none lg:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative transition-colors"
            >

                {/* Voice Input Overlay */}
                <AnimatePresence>
                    {isListening && (
                        <motion.div
                            key="voice-input-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-surface-dark backdrop-blur-md p-6 text-center"
                        >
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
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={stopListening}
                                    className="px-6 py-3 bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-100 active:bg-gray-300 rounded-full text-sm font-bold text-gray-500 dark:text-black transition-colors"
                                >
                                    {t('cancel')}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (transcript) processVoiceInput(transcript);
                                        stopListening();
                                    }}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-full text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all"
                                >
                                    {t('save')}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Header ── */}
                <div className="px-4 lg:px-6 py-3 lg:py-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex justify-between items-center border-b border-gray-100 dark:border-transparent flex-shrink-0">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} aria-label="Close" className="p-2 lg:p-2.5 text-gray-400 dark:text-black bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-100 rounded-full transition-colors">
                        <X size={22} />
                    </motion.button>
                    <div className="text-center">
                        <h3 id="add-modal-title" className="text-base lg:text-lg font-bold text-gray-800 dark:text-white">
                            {initialData ? t('edit') : t('new_transaction')}
                        </h3>
                        {inBatchMode && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                {batchIndex + 1} {t('of')} {batchQueue.length}
                            </p>
                        )}
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleSubmit}
                        disabled={!amount || !category || isSubmitting}
                        className={`text-sm lg:text-base font-bold px-4 lg:px-5 py-1.5 lg:py-2 rounded-full transition-all ${!amount || !category
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        ) : initialData ? t('update') : t('save')}
                    </motion.button>
                </div>

                {/* ── Content area (scrollable if needed) ── */}
                <div
                    ref={contentRef}
                    onPointerDown={(e) => {
                        if (isNoteFocused && noteInputRef.current && !noteInputRef.current.contains(e.target) && !e.target.closest('button')) {
                            noteInputRef.current.blur();
                        }
                    }}
                    className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0"
                >

                    {/* Type Toggle */}
                    <div className="px-5 lg:px-8 pt-4 lg:pt-5 pb-2 lg:pb-3 flex-shrink-0">
                        <div className="bg-gray-100 dark:bg-surface-dark3 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl flex gap-1">
                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={`flex-1 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[13px] lg:text-sm font-semibold transition-all ${type === 'expense'
                                    ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-400'
                                    }`}
                            >
                                {t('expense_type')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={`flex-1 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[13px] lg:text-sm font-semibold transition-all ${type === 'income'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-400'
                                    }`}
                            >
                                {t('income_type')}
                            </button>
                        </div>
                    </div>

                    {/* Amount Display */}
                    <div className={`px-5 text-center flex items-center justify-center transition-all duration-200 ${isNoteFocused ? 'py-2 flex-shrink-0' : 'py-4 lg:py-8 xl:py-10 flex-1'
                        }`}>
                        <motion.div
                            key={amount}
                            initial={{ scale: 0.95, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-baseline justify-center gap-1.5"
                        >
                            {!privacyMode && (
                                <span className={`font-bold text-gray-300 dark:text-gray-500 transition-all ${isNoteFocused ? 'text-lg' : 'text-2xl lg:text-3xl xl:text-4xl'
                                    }`}>€</span>
                            )}
                            <span className={`font-extrabold tracking-tight transition-all ${isNoteFocused ? 'text-3xl' : 'text-5xl lg:text-6xl xl:text-7xl'
                                } ${amount ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                                {privacyMode ? '****' : (amount || '0')}
                            </span>
                        </motion.div>
                    </div>

                    {/* Category Selector Bar — tapping opens the bottom-sheet picker */}
                    <div className="px-4 lg:px-8 pb-3 lg:pb-4 flex-shrink-0">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            id="category-selector-btn"
                            aria-label="Select category"
                            onClick={() => { setCategorySearch(''); setShowCategoryPicker(true); }}
                            className="w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 rounded-2xl border transition-all duration-200
                                bg-gray-50 dark:bg-surface-dark3
                                border-gray-200 dark:border-white/5
                                hover:border-indigo-300 dark:hover:border-indigo-500/50
                                hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5
                                group"
                        >
                            {category ? (() => {
                                const Icon = categoryIcons[category] || MoreHorizontal;
                                const accentHex = CATEGORY_ACCENT[category.toLowerCase()] || (type === 'income' ? '#10b981' : '#f43f5e');
                                return (
                                    <>
                                        <div
                                            className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
                                            style={{ backgroundColor: `${accentHex}20` }}
                                        >
                                            <div className="absolute inset-0 opacity-30 blur-md" style={{ backgroundColor: accentHex }} />
                                            <Icon size={16} className="relative z-10" style={{ color: accentHex }} />
                                        </div>
                                        <span className="flex-1 text-left text-sm lg:text-base font-semibold" style={{ color: accentHex }}>
                                            {getCategoryTranslation(category, t)}
                                        </span>
                                        <span className="text-xs lg:text-sm text-gray-400 dark:text-gray-500 group-hover:text-indigo-400 transition-colors">
                                            {t('change_category') || 'Αλλαγή'}
                                        </span>
                                    </>
                                );
                            })() : (
                                <>
                                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center bg-gray-200 dark:bg-white/10 flex-shrink-0">
                                        <Shapes size={16} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <span className="flex-1 text-left text-sm lg:text-base font-medium text-gray-400 dark:text-gray-500">
                                        {t('select_category') || 'Επιλογή κατηγορίας…'}
                                    </span>
                                    <span className="text-xs lg:text-sm text-indigo-400 dark:text-indigo-500 font-semibold">
                                        {t('tap_to_pick') || 'Πάτησε'}
                                    </span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* ── Category Picker Bottom Sheet ── */}
                    <AnimatePresence>
                        {showCategoryPicker && [
                            /* Backdrop */
                            <motion.div
                                key="cat-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 z-30 bg-black/30 backdrop-blur-[2px]"
                                onClick={() => { setShowCategoryPicker(false); setIsAddingCategory(false); setCategorySearch(''); }}
                            />,
                            /* Sheet */
                            <motion.div
                                key="cat-sheet"
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 32, stiffness: 340, mass: 0.9 }}
                                className="absolute bottom-0 left-0 right-0 z-40 bg-white dark:bg-surface-dark2 text-gray-900 dark:text-white rounded-t-[2rem] shadow-2xl flex flex-col"
                                style={{ maxHeight: '82%' }}
                            >
                                {/* Sheet handle */}
                                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                                    <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
                                </div>

                                {/* Sheet header */}
                                <div className="px-5 pb-3 flex items-center justify-between flex-shrink-0">
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                        {t('select_category') || 'Κατηγορία'}
                                    </h4>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        type="button"
                                        onClick={() => { setShowCategoryPicker(false); setIsAddingCategory(false); setCategorySearch(''); }}
                                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <X size={18} />
                                    </motion.button>
                                </div>

                                {/* Search input */}
                                <div className="px-5 pb-3 flex-shrink-0">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            placeholder={t('search_category') || 'Αναζήτηση…'}
                                            aria-label="Search categories"
                                            className="w-full bg-gray-100 dark:bg-surface-dark3 rounded-xl px-4 py-2.5 pl-9 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/50 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                                        />
                                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Category grid — scrollable */}
                                <div className="overflow-y-auto flex-1 px-4 pb-4">
                                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3.5">
                                        {categories
                                            .filter(cat => !categorySearch || getCategoryTranslation(cat, t).toLowerCase().includes(categorySearch.toLowerCase()) || cat.toLowerCase().includes(categorySearch.toLowerCase()))
                                            .map(cat => {
                                                const Icon = categoryIcons[cat] || MoreHorizontal;
                                                const isSelected = category === cat;
                                                const accentHex = CATEGORY_ACCENT[cat.toLowerCase()] || (type === 'income' ? '#10b981' : '#f43f5e');
                                                return (
                                                    <motion.button
                                                        whileTap={{ scale: 0.93 }}
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => {
                                                            setCategory(cat);
                                                            setShowCategoryPicker(false);
                                                            setIsAddingCategory(false);
                                                            setCategorySearch('');
                                                        }}
                                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 ${isSelected
                                                                ? 'shadow-premium'
                                                                : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-surface-dark3 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200'
                                                            }`}
                                                        style={isSelected ? {
                                                            backgroundColor: `${accentHex}12`,
                                                            borderColor: `${accentHex}40`,
                                                        } : {}}
                                                    >
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                                                            style={{ backgroundColor: `${accentHex}20` }}
                                                        >
                                                            <div className="absolute inset-0 opacity-30 blur-md" style={{ backgroundColor: accentHex }} />
                                                            <Icon size={18} className="relative z-10" style={{ color: accentHex }} />
                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center"
                                                                    style={{ boxShadow: `0 0 0 1.5px ${accentHex}` }}
                                                                >
                                                                    <Check size={8} style={{ color: accentHex }} />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        <span
                                                            className={`text-[11px] font-semibold text-center leading-tight line-clamp-2 ${
                                                                isSelected ? '' : 'text-gray-800 dark:text-gray-200'
                                                            }`}
                                                            style={isSelected ? { color: accentHex } : {}}
                                                        >
                                                            {getCategoryTranslation(cat, t)}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}

                                        {/* Add new category cell */}
                                        {!isAddingCategory ? (
                                            <motion.button
                                                whileTap={{ scale: 0.93 }}
                                                type="button"
                                                aria-label="Add new category"
                                                onClick={() => {
                                                    if (!isPro) {
                                                        openUpgradeModal('categories');
                                                        setShowCategoryPicker(false);
                                                        return;
                                                    }
                                                    setIsAddingCategory(true);
                                                }}
                                                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all bg-transparent"
                                            >
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                                                    <Plus size={18} />
                                                </div>
                                                <span className="text-[11px] font-semibold text-center leading-tight text-gray-700 dark:text-gray-300">
                                                    {t('new_category') || 'Νέα'}
                                                    {!isPro && <ShieldCheck size={11} className="text-amber-500 ml-0.5 inline-block" />}
                                                </span>
                                            </motion.button>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="col-span-3 flex items-center gap-2 mt-1"
                                            >
                                                <input
                                                    type="text"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value.substring(0, CATEGORY_NAME_MAX_LENGTH))}
                                                    placeholder={t('name_placeholder') || 'Όνομα κατηγορίας…'}
                                                    aria-label={t('name_placeholder') || 'New category name'}
                                                    autoFocus
                                                    maxLength={CATEGORY_NAME_MAX_LENGTH}
                                                    className="flex-1 px-3 py-2 rounded-xl text-sm border border-indigo-300 dark:border-indigo-500/50 bg-white dark:bg-surface-dark3 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newCategoryName.trim()) {
                                                            e.preventDefault();
                                                            addCustomCategory(type, newCategoryName.trim());
                                                            setCategory(newCategoryName.trim());
                                                            setNewCategoryName('');
                                                            setIsAddingCategory(false);
                                                            setShowCategoryPicker(false);
                                                            setCategorySearch('');
                                                        } else if (e.key === 'Escape') {
                                                            setIsAddingCategory(false);
                                                            setNewCategoryName('');
                                                        }
                                                    }}
                                                />
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    type="button"
                                                    onClick={() => {
                                                        if (newCategoryName.trim()) {
                                                            addCustomCategory(type, newCategoryName.trim());
                                                            setCategory(newCategoryName.trim());
                                                            setShowCategoryPicker(false);
                                                            setCategorySearch('');
                                                        }
                                                        setNewCategoryName('');
                                                        setIsAddingCategory(false);
                                                    }}
                                                    className="p-2 rounded-xl bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                                                >
                                                    <Check size={16} />
                                                </motion.button>
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    type="button"
                                                    onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }}
                                                    className="p-2 rounded-xl bg-gray-100 dark:bg-surface-dark3 text-gray-500 dark:text-gray-400"
                                                >
                                                    <X size={16} />
                                                </motion.button>
                                            </motion.div>
                                        )}

                                    </div>
                                </div>
                            </motion.div>
                        ]}
                    </AnimatePresence>

                    {/* Collapsible Note */}
                    <div className="px-5 pb-2 flex-shrink-0">
                        {showNote ? (
                            <div className="relative">
                                <input
                                    ref={noteInputRef}
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value.substring(0, NOTE_MAX_LENGTH))}
                                    placeholder={t('note_placeholder')}
                                    aria-label={t('note_placeholder') || 'Note'}
                                    maxLength={NOTE_MAX_LENGTH}
                                    onFocus={() => setIsNoteFocused(true)}
                                    onBlur={() => {
                                        setIsNoteFocused(false);
                                        if (!note.trim()) setShowNote(false);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            noteInputRef.current?.blur();
                                        }
                                    }}
                                    className="w-full bg-white dark:bg-surface-dark3 border border-slate-200/60 dark:border-transparent rounded-xl px-4 py-2.5 pr-20 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-medium shadow-premium"
                                />
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                    <span className={`text-[10px] font-medium tabular-nums ${note.length >= NOTE_MAX_LENGTH ? 'text-rose-500' : 'text-gray-300 dark:text-gray-600'
                                        }`}>
                                        {note.length}/{NOTE_MAX_LENGTH}
                                    </span>
                                    {note.length > 0 && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                setNote('');
                                                noteInputRef.current?.focus();
                                            }}
                                            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                            aria-label="Clear note"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                    {isNoteFocused && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => noteInputRef.current?.blur()}
                                            className="p-1 rounded-lg bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 active:scale-95 transition-all"
                                            aria-label={t('done') || 'Done'}
                                            title={t('done') || 'Done'}
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <button
                                    type="button"
                                    onClick={handleOpenNote}
                                    className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-full justify-center py-1"
                                >
                                    <MessageSquare size={14} />
                                    <span>{t('note_placeholder')}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Amount validation error */}
                    <AnimatePresence>
                        {amountError && (
                            <motion.div
                                key="amount-error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="px-5 pb-2 flex-shrink-0"
                            >
                                <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-xl">
                                    <AlertCircle size={12} />
                                    <span>{amountError}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tool Strip — voice, scan, bulk */}
                    {!isNoteFocused && (
                        <div className="px-5 lg:px-8 pb-3 lg:pb-5 flex justify-center gap-3 lg:gap-4 flex-shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={startListening}
                                className="flex items-center gap-1.5 text-xs lg:text-sm font-bold px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-md shadow-red-200/50 dark:shadow-red-900/30"
                            >
                                <Mic size={15} />
                                {t('voice')}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => {
                                    if (!isPro) {
                                        openUpgradeModal('scanner');
                                        return;
                                    }
                                    setShowScanner(true);
                                }}
                                className="flex items-center gap-1.5 text-xs lg:text-sm font-bold px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20"
                            >
                                <Camera size={15} />
                                {t('scan')}
                                {!isPro && <ShieldCheck size={13} className="text-amber-500 ml-1 inline-block" />}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => {
                                    if (!isPro) {
                                        openUpgradeModal('scanner');
                                        return;
                                    }
                                    setShowBulkScanner(true);
                                }}
                                className="flex items-center gap-1.5 text-xs lg:text-sm font-bold px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-violet-600 dark:text-violet-300 bg-violet-50 dark:violet-500/20"
                            >
                                <Layers size={15} />
                                {t('bulk')}
                                {!isPro && <ShieldCheck size={13} className="text-amber-500 ml-1 inline-block" />}
                            </motion.button>
                        </div>
                    )}

                    {/* Batch Skip */}
                    {inBatchMode && !isNoteFocused && (
                        <div className="px-5 pb-2 flex-shrink-0">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={handleSkipBatchItem}
                                className="w-full py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-surface-dark3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                                {t('skip')}
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* ── Numpad ── */}
                {!isNoteFocused && (
                    <div className="bg-gray-50 dark:bg-surface-dark border-t border-gray-200 dark:border-transparent p-3 lg:p-6 lg:pb-8 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex-shrink-0">
                        {/* Digits 1-9 */}
                        <div className="grid grid-cols-3 gap-2 lg:gap-3.5 max-w-xs lg:max-w-lg mx-auto">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(key => (
                                <motion.button
                                    key={key}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => handleNumpadPress(key)}
                                    className="h-14 lg:h-[72px] xl:h-[76px] rounded-2xl text-xl lg:text-3xl font-bold flex items-center justify-center transition-all bg-white dark:bg-surface-dark2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-transparent"
                                >
                                    {key}
                                </motion.button>
                            ))}
                        </div>
                        {/* Bottom row: .  0  ⌫  ✓ */}
                        <div className="grid grid-cols-4 gap-2 lg:gap-3.5 max-w-xs lg:max-w-lg mx-auto mt-2 lg:mt-3.5">
                            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => handleNumpadPress('.')} className="h-14 lg:h-[72px] xl:h-[76px] rounded-2xl text-xl lg:text-3xl font-bold flex items-center justify-center transition-all bg-white dark:bg-surface-dark2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-transparent">.</motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => handleNumpadPress('0')} className="h-14 lg:h-[72px] xl:h-[76px] rounded-2xl text-xl lg:text-3xl font-bold flex items-center justify-center transition-all bg-white dark:bg-surface-dark2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-transparent">0</motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => handleNumpadPress('backspace')} className="h-14 lg:h-[72px] xl:h-[76px] rounded-2xl text-xl lg:text-3xl font-bold flex items-center justify-center transition-all bg-gray-200 dark:bg-surface-dark3 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                                <Delete size={24} />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={handleSubmit}
                                disabled={!amount || !category || isSubmitting}
                                className={`h-14 lg:h-[72px] xl:h-[76px] rounded-2xl text-xl lg:text-3xl font-bold flex items-center justify-center transition-all ${!amount || !category
                                    ? 'bg-gray-200 dark:bg-surface-dark3 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:bg-indigo-700'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Check size={26} />
                                )}
                            </motion.button>
                        </div>
                    </div>
                )}

                {showScanner && <ScannerModal onClose={() => setShowScanner(false)} onScanComplete={handleScanComplete} />}
                {showBulkScanner && <BulkScannerModal onClose={() => setShowBulkScanner(false)} onScanComplete={handleBulkScanComplete} />}
            </motion.div>
        </motion.div>
    );
};

export default AddModal;