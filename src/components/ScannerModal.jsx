import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, RotateCw, Check, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

const ScannerModal = ({ onClose, onScanComplete }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Waiting for image...');
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
                processImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (imgData) => {
        setLoading(true);
        setStatus('Initializing engine...');
        try {
            const result = await Tesseract.recognize(
                imgData,
                'eng+ell', // English and Greek
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                            setStatus(`Processing: ${Math.round(m.progress * 100)}%`);
                        } else {
                            setStatus(m.status);
                        }
                    }
                }
            );

            const text = result.data.text;
            console.log("OCR Result:", text);
            extractData(text);
        } catch (error) {
            console.error("OCR Error:", error);
            alert("Σφάλμα κατά την αναγνώριση κειμένου.");
            setLoading(false);
        }
    };

    const extractData = (text) => {
        const lines = text.split('\n');
        let amount = null;
        let date = null;

        // Smart Extraction Logic
        // 1. Amount: Look for patterns like "Total 12.34", "Amount: 50.00", "€ 10.50"
        // Try to find the largest number on the receipt, usually the total
        const moneyRegex = /(\d+[.,]\d{2})/g;
        const potentialAmounts = [];

        // Keywords that usually precede the total
        const totalKeywords = ['total', 'synolo', 'pliroteo', 'amount', 'poso', 'sum', 'euro', 'eur', '€'];

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();

            // Check if line contains a total keyword
            const hasKeyword = totalKeywords.some(k => lowerLine.includes(k));

            const matches = line.match(moneyRegex);
            if (matches) {
                matches.forEach(match => {
                    // Normalize decimal separator (comma to dot)
                    const val = parseFloat(match.replace(',', '.'));
                    if (!isNaN(val)) {
                        potentialAmounts.push({ val, hasKeyword, line });
                    }
                });
            }
        });

        // Heuristic: If we found numbers near "Total" keywords, pick the best one. 
        // Otherwise, pick the largest number found (risky but often works for receipts).
        potentialAmounts.sort((a, b) => {
            if (a.hasKeyword && !b.hasKeyword) return -1; // Keyword first
            if (!a.hasKeyword && b.hasKeyword) return 1;
            return b.val - a.val; // Then largest value
        });

        if (potentialAmounts.length > 0) {
            amount = potentialAmounts[0].val;
        }

        // 2. Date: Look for DD/MM/YYYY or DD-MM-YYYY
        // Simple regex for date dd/mm/yyyy or dd-mm-yyyy. 
        // Note: Year might be 2 or 4 digits.
        const dateRegex = /\b(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})\b/;
        const dateMatch = text.match(dateRegex);

        if (dateMatch) {
            // Need to parse this carefully
            // Assuming Day-Month-Year order common in EU/Greece
            const day = dateMatch[1].padStart(2, '0');
            const month = dateMatch[2].padStart(2, '0');
            let year = dateMatch[3];
            if (year.length === 2) year = '20' + year;

            // Format for datetime-local input: YYYY-MM-DDTHH:MM
            const now = new Date();
            const time = now.toTimeString().slice(0, 5); // HH:MM
            date = `${year}-${month}-${day}T${time}`;
        } else {
            // Defaults to now if not found
            const now = new Date();
            date = now.toISOString().slice(0, 16);
        }

        // 3. Merchant/Note (First valid line usually)
        let note = "";
        for (let i = 0; i < lines.length; i++) {
            const l = lines[i].trim();
            if (l.length > 3 && !l.match(moneyRegex) && !l.match(dateRegex)) {
                note = l;
                break;
            }
        }
        if (!note) note = "Απόδειξη";

        console.log("Extracted:", { amount, date, note });

        onScanComplete({ amount, date, note });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Σάρωση Απόδειξης</h2>

                    {image ? (
                        <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-[3/4] mb-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <img src={image} alt="Receipt" className="w-full h-full object-contain" />

                            {loading && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                    <Loader2 size={48} className="animate-spin mb-4 text-indigo-400" />
                                    <p className="font-bold text-lg">{status}</p>
                                    <div className="w-48 h-2 bg-gray-700 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-8 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-2xl transition-colors border-2 border-indigo-100 dark:border-indigo-800"
                            >
                                <Camera size={32} className="text-indigo-600 dark:text-indigo-400 mb-3" />
                                <span className="font-bold text-indigo-900 dark:text-indigo-200">Κάμερα</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors border-2 border-gray-100 dark:border-gray-600"
                            >
                                <Upload size={32} className="text-gray-600 dark:text-gray-400 mb-3" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">Αρχείο</span>
                            </button>
                        </div>
                    )}

                    {/* Input for File Selection */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                    />

                    {/* Input for Camera Capture */}
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={cameraInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                    />

                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                        Το σύστημα θα προσπαθήσει να αναγνωρίσει αυτόματα την ημερομηνία και το ποσό.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScannerModal;
