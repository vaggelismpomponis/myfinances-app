import React from 'react';
import { Sparkles, CheckCircle2, Shield, HardDriveDownload, Zap, X, Star } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const WhatsNewModal = ({ isOpen, onClose, data }) => {
    const { language } = useSettings();
    if (!isOpen || !data) return null;

    const isEL = language === 'el';

    // Map icon names to components
    const iconMap = {
        shield: Shield,
        download: HardDriveDownload,
        zap: Zap,
        check: CheckCircle2,
        star: Star,
        sparkles: Sparkles
    };

    // If data.features exists use it, otherwise show a simplified version
    const title = isEL ? data.title_el : data.title_en;
    const features = data.features || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-sm bg-white dark:bg-surface-dark2 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-transparent animate-slide-up flex flex-col max-h-[90vh]">
                
                {/* Header Decoration */}
                <div className="relative h-28 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 dark:from-[#2a1060] dark:via-[#1e0d45] dark:to-[#0d1a3a] flex items-center justify-center flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white/80 hover:bg-black/40 hover:text-white flex items-center justify-center transition-colors"
                    >
                        <X size={16} />
                    </button>
                    
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-400/20 blur-xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1 text-center px-4">
                            <Sparkles size={20} className="text-amber-300 flex-shrink-0" />
                            <h2 className="text-xl font-black text-white leading-tight">
                                {title || (isEL ? 'Τι νέο υπάρχει;' : "What's New?")}
                            </h2>
                        </div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 border border-white/10 text-white/90 text-xs font-bold tracking-wider">
                            V {data.version}
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {features.length > 0 ? (
                        features.map((feature, i) => {
                            const Icon = iconMap[feature.icon] || Star;
                            return (
                                <div key={i} className="flex gap-4 p-3 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-transparent dark:border-white/[0.02]">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${feature.bg || 'bg-violet-50 dark:bg-violet-500/10'}`}>
                                        <Icon size={20} className={feature.color || 'text-violet-500'} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <h3 className="text-[14px] font-bold text-gray-900 dark:text-white mb-1 leading-none">
                                            {isEL ? feature.title_el : feature.title_en}
                                        </h3>
                                        <p className="text-[12px] text-gray-500 dark:text-white/50 leading-snug">
                                            {isEL ? feature.desc_el : feature.desc_en}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-10 text-center">
                            <Star size={40} className="mx-auto text-amber-500/20 mb-3" />
                            <p className="text-sm text-gray-400">
                                {isEL ? 'Νέες βελτιώσεις και διορθώσεις σφαλμάτων.' : 'New improvements and bug fixes.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-2 shrink-0 bg-white dark:bg-surface-dark2">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-[15px] shadow-[0_4px_16px_rgba(124,58,237,0.35)] active:scale-95 transition-all text-center"
                    >
                        {isEL ? 'Συνέχεια στο app' : 'Continue to App'}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-3 opacity-50">
                        {isEL ? 'Ημερομηνία ενημέρωσης' : 'Update Date'}: {new Date(data.created_at).toLocaleDateString()}
                    </p>
                </div>
                
            </div>
        </div>
    );
};

export default WhatsNewModal;









