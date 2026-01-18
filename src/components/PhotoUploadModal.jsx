import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, ZoomIn, ZoomOut, Check, Move } from 'lucide-react';

const PhotoUploadModal = ({ isOpen, onClose, onUpload }) => {
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    // dragStart is no longer needed in state as it's captured in the closure of the effect event handler if we used that, 
    // but here we use the event handler closure.

    const imgRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result);
                setZoom(1);
                setOffset({ x: 0, y: 0 });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX || e.touches?.[0].clientX;
        const startY = e.clientY || e.touches?.[0].clientY;
        const initialOffsetX = offset.x;
        const initialOffsetY = offset.y;

        setIsDragging(true);

        const handleMove = (moveEvent) => {
            const clientX = moveEvent.clientX || moveEvent.touches?.[0].clientX;
            const clientY = moveEvent.clientY || moveEvent.touches?.[0].clientY;

            if (clientX === undefined || clientY === undefined) return;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            setOffset({
                x: initialOffsetX + deltaX,
                y: initialOffsetY + deltaY
            });
        };

        const handleUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleUp);
    };

    const handleSave = () => {
        if (!image || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const size = 300; // Output size
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Visual container properties
        const containerSize = 256; // 64 * 4 = 256px

        ctx.clearRect(0, 0, size, size);

        // Circular Clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw Math
        // We need to map visual transformations to the canvas 
        // 1. Translate to center
        ctx.translate(size / 2, size / 2);
        // 2. Apply offset (scaled to output size)
        ctx.translate(offset.x * (size / containerSize), offset.y * (size / containerSize));
        // 3. Apply Zoom
        ctx.scale(zoom, zoom);
        // 4. Draw Image Centered
        ctx.drawImage(
            imgRef.current,
            -imgRef.current.naturalWidth / 2,
            -imgRef.current.naturalHeight / 2
        );

        ctx.restore();

        onUpload(canvas.toDataURL('image/jpeg', 0.8));
        onClose();
        // Reset state for next time
        setImage(null);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in text-gray-900 dark:text-gray-100">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-gray-100 dark:border-gray-700 font-sans">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold">Αλλαγή Φωτογραφίας</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {!image ? (
                        <div
                            className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
                            onClick={() => document.getElementById('modal-upload').click()}
                        >
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:text-indigo-500 rounded-full flex items-center justify-center mb-4 transition-colors">
                                <Upload size={32} />
                            </div>
                            <p className="font-bold text-gray-700 dark:text-gray-300">Πάτησε εδώ για μεταφόρτωση</p>
                            <p className="text-sm text-gray-400 mt-1">ή σύρε μια εικόνα εδώ</p>
                            <input
                                type="file"
                                id="modal-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="relative w-64 h-64 bg-gray-100 dark:bg-gray-950 rounded-full overflow-hidden shadow-inner border-4 border-indigo-500/20 mb-6 cursor-move group touch-none">
                                {/* Image Container */}
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    onMouseDown={handleMouseDown}
                                    onTouchStart={handleMouseDown}
                                >
                                    <img
                                        ref={imgRef}
                                        src={image}
                                        className={`max-w-none pointer-events-none select-none ${isDragging ? '' : 'transition-transform duration-75 ease-linear'}`}
                                        style={{
                                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
                                        }}
                                        alt="Preview"
                                        draggable="false"
                                    />
                                </div>

                                {/* Overlay Hint */}
                                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity bg-black/20 text-white ${isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <Move size={24} />
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="w-full space-y-4 px-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-gray-400 hover:text-indigo-500">
                                        <ZoomOut size={20} />
                                    </button>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.05"
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                        className="flex-1 accent-indigo-600 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-gray-400 hover:text-indigo-500">
                                        <ZoomIn size={20} />
                                    </button>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setImage(null)}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Ακύρωση
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-transform active:scale-95"
                                    >
                                        <Check size={18} /> Αποθήκευση
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoUploadModal;
