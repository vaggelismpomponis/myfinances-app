import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, RotateCw, Check, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../utils/canvasUtils';

const ScannerModal = ({ onClose, onScanComplete }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Waiting for image...');

    // ReactCrop State
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const [isCropping, setIsCropping] = useState(false);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
                setIsCropping(true); // Start cropping mode
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const onImageLoad = (e) => {
        imgRef.current = e.currentTarget;
        const { width, height } = e.currentTarget;

        // Default crop: Center 80%
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 80,
                },
                undefined, // free aspect
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
        setCompletedCrop(crop);
    };

    const handleCropConfirm = async () => {
        if (!image) return;

        try {
            // If crop exists and is valid, crop it. Else use full image.
            if (completedCrop && completedCrop.width && completedCrop.height && imgRef.current) {
                // Determine scale (displayed vs natural)
                const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
                const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

                // Convert to natural pixels if crop is in % or displayed pixels
                // react-image-crop % logic handles conversion if we use percentCrop, 
                // but completedCrop is usually pixels relative to display if unit is 'px'
                // default is px.
                // But we used % init. 

                let finalCrop = completedCrop;

                if (finalCrop.unit === '%') {
                    const width = imgRef.current.width;
                    const height = imgRef.current.height;
                    finalCrop = {
                        x: (finalCrop.x / 100) * width,
                        y: (finalCrop.y / 100) * height,
                        width: (finalCrop.width / 100) * width,
                        height: (finalCrop.height / 100) * height,
                    };
                }

                const naturalCrop = {
                    x: finalCrop.x * scaleX,
                    y: finalCrop.y * scaleY,
                    width: finalCrop.width * scaleX,
                    height: finalCrop.height * scaleY,
                };

                const croppedImage = await getCroppedImg(image, naturalCrop);
                setImage(croppedImage);
                setIsCropping(false);
                processImage(croppedImage);
            } else {
                // Use original
                setIsCropping(false);
                processImage(image);
            }

        } catch (e) {
            console.error(e);
            alert("Σφάλμα κατά την επεξεργασία της εικόνας.");
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

        const moneyRegex = /(\d+[.,]\d{2})/g;
        const potentialAmounts = [];
        const totalKeywords = ['total', 'synolo', 'pliroteo', 'amount', 'poso', 'sum', 'euro', 'eur', '€'];

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            const hasKeyword = totalKeywords.some(k => lowerLine.includes(k));
            const matches = line.match(moneyRegex);
            if (matches) {
                matches.forEach(match => {
                    const val = parseFloat(match.replace(',', '.'));
                    if (!isNaN(val)) {
                        potentialAmounts.push({ val, hasKeyword, line });
                    }
                });
            }
        });

        potentialAmounts.sort((a, b) => {
            if (a.hasKeyword && !b.hasKeyword) return -1;
            if (!a.hasKeyword && b.hasKeyword) return 1;
            return b.val - a.val;
        });

        if (potentialAmounts.length > 0) {
            amount = potentialAmounts[0].val;
        }

        const dateRegex = /\b(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})\b/;
        const dateMatch = text.match(dateRegex);

        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const month = dateMatch[2].padStart(2, '0');
            let year = dateMatch[3];
            if (year.length === 2) year = '20' + year;
            const now = new Date();
            const time = now.toTimeString().slice(0, 5);
            date = `${year}-${month}-${day}T${time}`;
        } else {
            const now = new Date();
            date = now.toISOString().slice(0, 16);
        }

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
            <div className={`bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md ${isCropping ? 'h-[90vh]' : 'max-h-[85vh]'} overflow-hidden shadow-2xl relative flex flex-col transition-all`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isCropping ? 'Περικοπή Εικόνας' : 'Σάρωση Απόδειξης'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto flex flex-col">

                    {isCropping ? (
                        <div className="flex flex-col h-full">
                            <div className="relative flex-1 bg-black/90 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    className="max-h-full w-auto"
                                >
                                    <img
                                        src={image}
                                        alt="To Crop"
                                        onLoad={onImageLoad}
                                        style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }}
                                    />
                                </ReactCrop>
                            </div>

                            <p className="text-center text-xs text-gray-400 mb-4">
                                Σύρετε τις γωνίες για να επιλέξετε την περιοχή
                            </p>

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button
                                    onClick={() => { setIsCropping(false); setImage(null); }}
                                    className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Ακύρωση
                                </button>
                                <button
                                    onClick={handleCropConfirm}
                                    className="px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    Σάρωση
                                </button>
                            </div>
                        </div>
                    ) : image ? (
                        /* Processing View */
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
                        /* Start Screen */
                        <div className="grid grid-cols-2 gap-4 mb-6 mt-4">
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

                    {/* Inputs */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={cameraInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                    />

                    {!image && !isCropping && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto text-center">
                            Το σύστημα θα προσπαθήσει να αναγνωρίσει αυτόματα την ημερομηνία και το ποσό.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScannerModal;
