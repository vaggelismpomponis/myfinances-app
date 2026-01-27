import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Layers, Mic } from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import ScannerModal from './ScannerModal';
import BulkScannerModal from './BulkScannerModal';

const AddModal = ({ onClose, onAdd, initialData }) => {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showBulkScanner, setShowBulkScanner] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    // Batch mode state
    const [batchQueue, setBatchQueue] = useState([]);
    const [batchIndex, setBatchIndex] = useState(0);

    // Initialize form with initialData (for editing)
    // Initialize form with initialData (for editing)
    // Initialize form with initialData (for editing)
    useEffect(() => {
        // Cleanup listener on unmount
        return () => {
            if (Capacitor.isNativePlatform()) {
                SpeechRecognition.removeAllListeners();
            }
        };
    }, []);

    useEffect(() => {
        if (initialData) {
            console.log("AddModal received initialData:", initialData);
            setType(initialData.type || 'expense');
            setAmount(initialData.amount ? initialData.amount.toString() : '');
            setCategory(initialData.category || '');
            setNote(initialData.note || '');
        } else {
            // Reset if no data
            setAmount('');
            setCategory('');
            setNote('');
        }
    }, [initialData]);

    const categories = type === 'expense'
        ? ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Άλλο']
        : ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλο'];

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

                // Add listeners
                await SpeechRecognition.addListener('partialResults', (data) => {
                    if (data.matches && data.matches.length > 0) {
                        setTranscript(data.matches[0]);
                    }
                });

                // Some devices/versions return the final result in a 'result' event or only after stopping
                await SpeechRecognition.addListener('json', (data) => {
                    // Debugging: catch-all for other events if needed, usually partialResults is enough
                });

                // Start listening
                await SpeechRecognition.start({
                    language: 'el-GR',
                    maxResults: 1,
                    prompt: 'Πείτε το ποσό και την κατηγορία...',
                    partialResults: true,
                    popup: true, // Enable native Google popup as requested
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !category) return;

        setIsSubmitting(true);
        await onAdd({
            type,
            amount: parseFloat(amount),
            category,
            note
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up relative">

                {/* Voice Input Overlay */}
                {isListening && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-fade-in p-6 text-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                            <div className="relative bg-gradient-to-tr from-red-500 to-pink-500 p-6 rounded-full shadow-xl shadow-red-200">
                                <Mic size={40} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Σας ακούω...</h3>
                        <p className="text-lg text-gray-600 font-medium min-h-[4rem] flex items-center justify-center max-w-[80%]">
                            {transcript || "Πείτε π.χ. '23 ευρώ φαγητό'"}
                        </p>
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={stopListening}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full text-sm font-bold text-gray-500 transition-colors"
                            >
                                Ακύρωση
                            </button>
                            <button
                                onClick={() => {
                                    if (transcript) processVoiceInput(transcript);
                                    stopListening();
                                }}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-full text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all"
                            >
                                Ολοκλήρωση
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X size={24} />
                    </button>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {initialData ? 'Επεξεργασία' : 'Νέα Συναλλαγή'}
                        </h3>
                        {inBatchMode && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                {batchIndex + 1} από {batchQueue.length} αποδείξεις
                            </p>
                        )}
                    </div>
                    <div className="w-10"></div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                    {/* Type Switcher */}
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Έξοδο
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Έσοδο
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ΠΟΣΟ</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={startListening}
                                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300 active:scale-95"
                                >
                                    <Mic size={14} />
                                    Φωνή
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                >
                                    <Camera size={14} />
                                    Σάρωση
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBulkScanner(true)}
                                    className="flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                                >
                                    <Layers size={14} />
                                    Πολλά
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">€</span>
                            <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-gray-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Categories Grid */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ΚΑΤΗΓΟΡΙΑ</label>
                        <div className="grid grid-cols-3 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${category === cat
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note Input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ΣΗΜΕΙΩΣΗ (ΠΡΟΑΙΡΕΤΙΚΟ)</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="π.χ. Καφές με φίλους"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="mt-auto pt-4 space-y-2">
                        {inBatchMode && (
                            <button
                                type="button"
                                onClick={handleSkipBatchItem}
                                className="w-full py-3 rounded-xl text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Παράλειψη
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!amount || !category || isSubmitting}
                            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all flex justify-center items-center ${!amount || !category ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : inBatchMode ? (
                                batchIndex < batchQueue.length - 1 ? 'Επόμενο' : 'Αποθήκευση'
                            ) : initialData ? 'Ενημέρωση' : 'Αποθήκευση'}
                        </button>
                    </div>
                </form>

                {showScanner && <ScannerModal onClose={() => setShowScanner(false)} onScanComplete={handleScanComplete} />}
                {showBulkScanner && <BulkScannerModal onClose={() => setShowBulkScanner(false)} onScanComplete={handleBulkScanComplete} />}
            </div>
        </div>
    );
};

export default AddModal;
