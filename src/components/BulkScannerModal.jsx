import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Plus, Trash2, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import Tesseract from 'tesseract.js';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../utils/canvasUtils';
import { useToast } from '../contexts/ToastContext';

const BulkScannerModal = ({ onClose, onScanComplete }) => {
    // Array of images: { id, src, croppedSrc, status: 'pending' | 'cropping' | 'ready' | 'processing' | 'done', result: null | {amount, date, note} }
    const [images, setImages] = useState([]);
    const { showToast } = useToast();
    const [activeIndex, setActiveIndex] = useState(null); // Index of image being cropped
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });

    // ReactCrop State
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const generateId = () => Math.random().toString(36).substring(2, 9);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImages(prev => [...prev, {
                    id: generateId(),
                    src: event.target.result,
                    croppedSrc: null,
                    status: 'pending',
                    result: null
                }]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input to allow re-selecting same file
        e.target.value = '';
    };

    const onImageLoad = (e) => {
        imgRef.current = e.currentTarget;
        const { width, height } = e.currentTarget;
        const naturalWidth = e.currentTarget.naturalWidth;
        const naturalHeight = e.currentTarget.naturalHeight;

        // Default crop: Center 80%
        // We use pixels for react-image-crop consistency usually, or %
        // Let's use % for responsiveness
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

    const handleStartCrop = (index) => {
        setActiveIndex(index);
        setCrop(undefined);
        setCompletedCrop(null);
    };

    const handleExtractCrop = async () => {
        if (activeIndex === null || !completedCrop || !imgRef.current) return;

        try {
            let finalCrop = completedCrop;

            if (finalCrop.unit === '%') {
                const width = imgRef.current.width;
                const height = imgRef.current.height;
                finalCrop = {
                    x: (finalCrop.x / 100) * width,
                    y: (finalCrop.y / 100) * height,
                    width: (finalCrop.width / 100) * width,
                    height: (finalCrop.height / 100) * height,
                    unit: 'px'
                };
            }

            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

            const naturalCrop = {
                x: finalCrop.x * scaleX,
                y: finalCrop.y * scaleY,
                width: finalCrop.width * scaleX,
                height: finalCrop.height * scaleY,
            };

            const croppedImage = await getCroppedImg(images[activeIndex].src, naturalCrop);

            // Create new item with the crop
            setImages(prev => [...prev, {
                id: generateId(),
                src: croppedImage, // The extracted crop becomes the source for the new item
                croppedSrc: croppedImage,
                status: 'ready',
                result: null
            }]);

        } catch (e) {
            console.error(e);
            alert("Σφάλμα κατά την εξαγωγή της εικόνας.");
        }
    };

    const handleCropConfirm = async () => {
        if (activeIndex === null) return;

        // If image hasn't loaded or no crop set, treat as "use whole image" or "skip"
        if (!imgRef.current && images[activeIndex]) {
            // Just use original if we can't crop
            setImages(prev => prev.map((item, idx) =>
                idx === activeIndex
                    ? { ...item, croppedSrc: item.src, status: 'ready' }
                    : item
            ));
            setActiveIndex(null);
            return;
        }

        try {
            // completedCrop might be in % or px depending on what we set. 
            // If we used %, we need to convert to pixels for getCroppedImg or let getCroppedImg handle it?
            // canvasUtils.js getCroppedImg expects pixel values (x, y, width, height).
            // react-image-crop 'completedCrop' is usually in pixels if we didn't force %. 
            // Actually checks: if crop.unit is '%', it is percent.

            let finalCrop = completedCrop;

            // Converter helper if needed
            if (finalCrop && finalCrop.unit === '%') {
                // Convert to pixels relative to the displayed image
                const width = imgRef.current.width;
                const height = imgRef.current.height;
                finalCrop = {
                    x: (finalCrop.x / 100) * width,
                    y: (finalCrop.y / 100) * height,
                    width: (finalCrop.width / 100) * width,
                    height: (finalCrop.height / 100) * height,
                    unit: 'px'
                };
            }

            // Also we need to scale this to NATURAL dimensions because getCroppedImg usually expects that 
            // or we pass the displayed image and let it handle scaling?
            // Looking at canvasUtils.js step 114:
            // "const image = await createImage(imageSrc)" -> loads a new Image (natural size)
            // "ctx.drawImage(image, pixelCrop.x, ..., pixelCrop.width, ...)"
            // This implies pixelCrop should be relative to NATURAL size if we pass the original src.
            // BUT if we pass the displayed image element to a different function... 
            // The existing getCroppedImg takes imageSrc (url). So it creates a NEW image object which has natural dimensions.
            // So our pixelCrop MUST be scaled to natural dimensions.

            if (finalCrop && imgRef.current) {
                const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
                const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

                const naturalCrop = {
                    x: finalCrop.x * scaleX,
                    y: finalCrop.y * scaleY,
                    width: finalCrop.width * scaleX,
                    height: finalCrop.height * scaleY,
                };

                const croppedImage = await getCroppedImg(images[activeIndex].src, naturalCrop);

                setImages(prev => prev.map((item, idx) =>
                    idx === activeIndex
                        ? { ...item, croppedSrc: croppedImage, status: 'ready' }
                        : item
                ));
            } else {
                // Fallback
                setImages(prev => prev.map((item, idx) =>
                    idx === activeIndex
                        ? { ...item, croppedSrc: item.src, status: 'ready' }
                        : item
                ));
            }

            setActiveIndex(null);
        } catch (e) {
            console.error(e);
            alert("Σφάλμα κατά την επεξεργασία της εικόνας.");
        }
    };

    const handleCropCancel = () => {
        setActiveIndex(null);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, idx) => idx !== index));
        if (activeIndex === index) {
            setActiveIndex(null);
        }
    };

    const handleSkipCrop = (index) => {
        // Use original image without cropping
        setImages(prev => prev.map((item, idx) =>
            idx === index
                ? { ...item, croppedSrc: item.src, status: 'ready' }
                : item
        ));
    };

    const extractData = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const results = [];

        // Regex for money: € 15,73 or 15,73 or - € 15,73
        // Captures: 1=negative?, 2=amount
        const moneyRegexLine = /([+-])?\s*€?\s*(\d+[.,]\d{2})/;
        const dateRegex = /\b(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})\b/;

        // We will loop through lines and try to group them into transactions.
        // Strategy: An amount usually signifies the end or important part of a transaction row.
        // We'll look for lines containing amounts.

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const moneyMatch = line.match(moneyRegexLine);

            if (moneyMatch) {
                // Found an amount line.
                // It's likely a transaction.
                // val is the number. 'sign' might be - or +.
                let val = parseFloat(moneyMatch[2].replace(',', '.'));

                // If we see explicit negative sign, or it says "Χρεωθήκατε" (Charged) nearby?
                // For now, let's trust the sign if present, else default to positive (or expense logic elsewhere).
                // Actually, let's keep it simple: Extracts absolute amount.
                // The user confirms sign in UI usually, or we detect 'minus'.

                // Look for Date in this line or previous 1-2 lines
                let date = null;
                // Check current line for date
                let dateMatch = line.match(dateRegex);

                // If not in current, check previous 2 lines
                if (!dateMatch && i > 0) dateMatch = lines[i - 1].match(dateRegex);
                if (!dateMatch && i > 1) dateMatch = lines[i - 2].match(dateRegex);

                if (dateMatch) {
                    const day = dateMatch[1].padStart(2, '0');
                    const month = dateMatch[2].padStart(2, '0');
                    let year = dateMatch[3];
                    if (year.length === 2) year = '20' + year;
                    const now = new Date();
                    const time = now.toTimeString().slice(0, 5); // Default time
                    date = `${year}-${month}-${day}T${time}`; // ISO format for form
                } else {
                    // Default to today if not found
                    date = new Date().toISOString().slice(0, 16);
                }

                // Look for Note/Merchant
                // Usually the line BEFORE the amount, or the text on the SAME line before amount.
                let note = "";

                // Text on the same line before the amount?
                const textBeforeAmount = line.split(moneyMatch[0])[0].trim();

                if (textBeforeAmount.length > 3) {
                    note = textBeforeAmount;
                } else if (i > 0) {
                    // Check previous line
                    const prevLine = lines[i - 1];
                    // Avoid using the date line as note if possible, but simplest is just take it
                    if (!prevLine.match(dateRegex) && !prevLine.match(moneyRegexLine)) {
                        note = prevLine;
                    }
                }

                if (!note) note = "Απόδειξη/Συναλλαγή";

                // Clean up note
                note = note.replace(/[€]/g, '').trim();

                // Avoid duplicates: 
                // Sometimes OCR reads "Total 15.00" and then "15.00" on next line.
                // Check if we just added a similar transaction (same amount, almost same time index)
                const isDuplicate = results.some(r =>
                    Math.abs(r.amount - val) < 0.01 &&
                    (r.note === note || r.date === date)
                );

                if (!isDuplicate) {
                    results.push({ amount: val, date, note });
                }
            }
        }

        // If we found nothing with the strict loop, verify with the old loose "max amount" strategy?
        // No, user explicitly wants list scanning. If single receipt fails, it might be due to this.
        // Fallback: If results is empty, try single-amount extraction from whole text.
        if (results.length === 0) {
            let amount = null;
            let date = null;
            let note = "Απόδειξη";

            // Old Logic fallback
            const moneyRegex = /(\d+[.,]\d{2})/g;
            const potentialAmounts = [];
            lines.forEach(l => {
                const m = l.match(moneyRegex);
                if (m) m.forEach(v => potentialAmounts.push(parseFloat(v.replace(',', '.'))));
            });
            potentialAmounts.sort((a, b) => b - a); // Largest
            if (potentialAmounts.length > 0) amount = potentialAmounts[0];

            // Date logic (same as above essentially)
            const dM = text.match(dateRegex);
            if (dM) {
                // ... extract date
                const day = dM[1].padStart(2, '0');
                const month = dM[2].padStart(2, '0');
                let year = dM[3];
                if (year.length === 2) year = '20' + year;
                date = `${year}-${month}-${day}T12:00`;
            } else {
                date = new Date().toISOString().slice(0, 16);
            }

            if (amount) return [{ amount, date, note }];
            return []; // Nothing found
        }

        return results;
    };

    const processAllImages = async () => {
        const readyImages = images.filter(img => img.status === 'ready' || img.status === 'pending');
        if (readyImages.length === 0) return;

        setProcessing(true);
        setProgress({ current: 0, total: readyImages.length, percent: 0 });

        const results = [];

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (img.status !== 'ready' && img.status !== 'pending') continue;

            const imgToProcess = img.croppedSrc || img.src;

            setImages(prev => prev.map((item, idx) =>
                idx === i ? { ...item, status: 'processing' } : item
            ));

            try {
                const result = await Tesseract.recognize(
                    imgToProcess,
                    'eng+ell',
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                setProgress(prev => ({
                                    ...prev,
                                    percent: Math.round(((prev.current + m.progress) / prev.total) * 100)
                                }));
                            }
                        }
                    }
                );

                const text = result.data.text;
                // Now returns an ARRAY of objects
                const extractedItems = extractData(text);

                if (extractedItems.length > 1) {
                    showToast(`Βρέθηκαν ${extractedItems.length} συναλλαγές!`, 'success');
                }

                // We need to associate these results with the current image ID.
                // If multiple items found, we might want to "expand" the images list?
                // OR simpler: Just store the array in the result field and BulkScannerModal handles it.
                // BUT the 'images' state expects result to be ONE object?
                // Let's modify the onScanComplete to flatten everything.

                // For the UI "Status", if we found items, show "Done (N items)"?

                setImages(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'done', result: extractedItems } : item
                ));

                extractedItems.forEach(item => results.push(item));

                setProgress(prev => ({ ...prev, current: prev.current + 1 }));

            } catch (error) {
                console.error("OCR Error:", error);
                setImages(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'done', result: { amount: null, date: null, note: 'Σφάλμα OCR' } } : item
                ));
                results.push({ amount: null, date: null, note: 'Σφάλμα OCR' });
                setProgress(prev => ({ ...prev, current: prev.current + 1 }));
            }
        }

        setProcessing(false);
        onScanComplete(results);
        onClose();
    };

    const readyCount = images.filter(img => img.status === 'ready' || img.status === 'pending').length;
    const hasImages = images.length > 0;
    const isCropping = activeIndex !== null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md ${isCropping ? 'h-[90vh]' : 'max-h-[85vh]'} overflow-hidden shadow-2xl relative flex flex-col transition-all duration-300`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isCropping ? 'Περικοπή Εικόνας' : 'Μαζική Σάρωση'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col">

                    {isCropping ? (
                        /* Cropper View */
                        <div className="flex flex-col h-full">
                            <div className="relative flex-1 bg-black/90 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                                {images[activeIndex] && (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        className="max-h-full"
                                    >
                                        <img
                                            ref={imgRef}
                                            src={images[activeIndex].src}
                                            alt="Crop"
                                            onLoad={onImageLoad}
                                            style={{ maxHeight: '60vh', objectFit: 'contain' }}
                                        />
                                    </ReactCrop>
                                )}
                            </div>

                            <p className="text-center text-xs text-gray-400 mb-4">
                                Σύρετε τις γωνίες για να επιλέξετε την περιοχή
                            </p>

                            <div className="grid grid-cols-3 gap-3 mt-auto">
                                <button
                                    onClick={handleCropCancel}
                                    className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Ακύρωση
                                </button>
                                <button
                                    onClick={handleExtractCrop}
                                    className="px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    title="Προσθήκη ως νέο απόκομμα"
                                >
                                    <Plus size={18} />
                                    Προσθήκη
                                </button>
                                <button
                                    onClick={handleCropConfirm}
                                    className="px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    OK
                                </button>
                            </div>
                        </div>
                    ) : processing ? (
                        /* Processing View */
                        <div className="flex flex-col items-center justify-center py-12 flex-1">
                            <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
                            <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Επεξεργασία {progress.current + 1} από {progress.total}
                            </p>
                            <div className="w-full max-w-xs h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${progress.percent}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{progress.percent}%</p>
                        </div>
                    ) : (
                        /* Image Selection View */
                        <>
                            {/* Image Grid */}
                            {hasImages && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {images.map((img, idx) => (
                                        <div
                                            key={img.id}
                                            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 group"
                                        >
                                            <img
                                                src={img.croppedSrc || img.src}
                                                alt={`Receipt ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Status Badge */}
                                            <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${img.status === 'ready' ? 'bg-green-500 text-white' :
                                                img.status === 'processing' ? 'bg-yellow-500 text-white' :
                                                    img.status === 'done' ? 'bg-indigo-600 text-white' :
                                                        'bg-gray-500 text-white'
                                                }`}>
                                                {img.status === 'ready' ? 'Ready' :
                                                    img.status === 'processing' ? '...' :
                                                        img.status === 'done' ? 'Done' : idx + 1}
                                            </div>

                                            {/* Actions */}
                                            <div className="absolute bottom-1 right-1 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                {img.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStartCrop(idx)}
                                                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                        title="Περικοπή"
                                                    >
                                                        <ImageIcon size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                                    title="Αφαίρεση"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>

                                            {/* Skip Crop Option */}
                                            {img.status === 'pending' && (
                                                <button
                                                    onClick={() => handleSkipCrop(idx)}
                                                    className="absolute bottom-1 left-1 p-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-[10px] font-bold shadow-sm"
                                                    title="Χρήση χωρίς περικοπή"
                                                >
                                                    OK
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Image Buttons */}
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-6 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-2xl transition-colors border-2 border-indigo-100 dark:border-indigo-800"
                                >
                                    <Camera size={28} className="text-indigo-600 dark:text-indigo-400 mb-2" />
                                    <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200">
                                        {hasImages ? 'Άλλη Φωτό' : 'Κάμερα'}
                                    </span>
                                </button>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl transition-colors border-2 border-gray-100 dark:border-gray-600"
                                >
                                    <Upload size={28} className="text-gray-600 dark:text-gray-400 mb-2" />
                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                                        {hasImages ? 'Άλλα Αρχεία' : 'Αρχεία'}
                                    </span>
                                </button>
                            </div>

                            {/* Hidden Inputs */}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
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
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isCropping && !processing && hasImages && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={processAllImages}
                            disabled={readyCount === 0}
                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${readyCount > 0
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Check size={20} />
                            Σάρωση {readyCount} {readyCount === 1 ? 'Εικόνας' : 'Εικόνων'}
                        </button>
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
                            Πατήστε OK για όσες εικόνες θέλετε να σαρώσετε
                        </p>
                    </div>
                )}

                {!isCropping && !processing && !hasImages && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                            Προσθέστε αποδείξεις για μαζική σάρωση
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkScannerModal;
