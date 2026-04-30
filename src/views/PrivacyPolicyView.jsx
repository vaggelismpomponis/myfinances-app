import React from 'react';
import { ArrowLeft, ShieldAlert as Shield, Lock, Eye, Database, Globe, Mail } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-4 text-gray-600 dark:text-gray-400 text-[14px] leading-relaxed pl-1">
            {children}
        </div>
    </div>
);

const PrivacyPolicyView = ({ onBack }) => {
    const { language } = useSettings();

    const isEL = language === 'el';

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300">
            {/* Header */}
            <div className="shrink-0 bg-gray-50 dark:bg-surface-dark 
                            border-b border-gray-100 dark:border-transparent
                            px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 sticky top-0 z-10
                            backdrop-blur-xl transition-colors duration-300">
                <div className="flex items-center justify-center relative min-h-[36px]">
                    <button
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                                   flex items-center justify-center text-gray-500 dark:text-white/50
                                   hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                   active:scale-90 transition-all duration-150"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                            {isEL ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                        </h2>
                        <p className="text-[11px] text-gray-400 dark:text-white/35">
                            {isEL ? 'Τελευταία ενημέρωση: 16 Απριλίου 2026' : 'Last updated: April 16, 2026'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-12">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield size={32} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                            {isEL ? 'Το Απόρρητό σας είναι Προτεραιότητα' : 'Your Privacy is Priority'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isEL 
                                ? 'Καταλαβαίνουμε ότι τα οικονομικά σας δεδομένα είναι ευαίσθητα. Δείτε πώς τα προστατεύουμε.' 
                                : 'We understand that your financial data is sensitive. Here is how we protect it.'}
                        </p>
                    </div>

                    <Section icon={Eye} title={isEL ? 'Τι δεδομένα συλλέγουμε' : 'What Data We Collect'}>
                        {isEL ? (
                            <>
                                <p>Συλλέγουμε μόνο τα απαραίτητα δεδομένα για τη λειτουργία της εφαρμογής:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Πληροφορίες Λογαριασμού:</strong> Το email και το όνομά σας όταν συνδέεστε μέσω Google ή Email.</li>
                                    <li><strong>Οικονομικά Δεδομένα:</strong> Τις συναλλαγές, τους στόχους και τους προϋπολογισμούς που εισάγετε εσείς.</li>
                                    <li><strong>Δεδομένα Συσκευής:</strong> Βασικές πληροφορίες για τη συσκευή σας για τη διασφάλιση της συμβατότητας και της ασφάλειας.</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                <p>We only collect data that is essential for the application to function:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Account Information:</strong> Your email and name when you sign in via Google or Email.</li>
                                    <li><strong>Financial Data:</strong> Transactions, goals, and budgets that you manually enter.</li>
                                    <li><strong>Device Data:</strong> Basic information about your device to ensure compatibility and security.</li>
                                </ul>
                            </>
                        )}
                    </Section>

                    <Section icon={Database} title={isEL ? 'Πώς χρησιμοποιούμε τα δεδομένα' : 'How We Use Data'}>
                        {isEL ? (
                            <p>
                                Τα δεδομένα σας χρησιμοποιούνται αποκλειστικά για την παροχή των υπηρεσιών μας: εμφάνιση στατιστικών, διαχείριση προϋπολογισμών και συγχρονισμό μεταξύ των συσκευών σας. <strong>Δεν πουλάμε ούτε μοιραζόμαστε τα δεδομένα σας με διαφημιστικές εταιρείες.</strong>
                            </p>
                        ) : (
                            <p>
                                Your data is used exclusively to provide our services: displaying statistics, managing budgets, and syncing across your devices. <strong>We do not sell or share your data with advertising companies.</strong>
                            </p>
                        )}
                    </Section>

                    <Section icon={Lock} title={isEL ? 'Ασφάλεια Δεδομένων' : 'Data Security'}>
                        {isEL ? (
                            <p>
                                Χρησιμοποιούμε τη Supabase (υποδομή της Google Cloud) για την ασφαλή αποθήκευση των δεδομένων σας με κρυπτογράφηση. Επιπλέον, προσφέρουμε λειτουργίες όπως App PIN και Βιομετρικό Κλείδωμα για να προστατεύσουμε την πρόσβαση στη συσκεύη σας.
                            </p>
                        ) : (
                            <p>
                                We use Supabase (built on Google Cloud infrastructure) to securely store your data with encryption. Additionally, we provide features like App PIN and Biometric Lock to protect access on your device.
                            </p>
                        )}
                    </Section>

                    <Section icon={Globe} title={isEL ? 'Υπηρεσίες Τρίτων' : 'Third-Party Services'}>
                        {isEL ? (
                            <>
                                <p>Η εφαρμογή χρησιμοποιεί τις ακόλουθες υπηρεσίες:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Supabase:</strong> Για τη βάση δεδομένων και την αυθεντικοποίηση.</li>
                                    <li><strong>Google Auth:</strong> Για την εύκολη σύνδεση με τον λογαριασμό σας Google.</li>
                                    <li><strong>Capacitor:</strong> Για τη λειτουργία ως native εφαρμογή στο Android σας.</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                <p>The app uses the following services:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Supabase:</strong> For database and authentication.</li>
                                    <li><strong>Google Auth:</strong> For easy sign-in with your Google account.</li>
                                    <li><strong>Capacitor:</strong> To function as a native app on your Android device.</li>
                                </ul>
                            </>
                        )}
                    </Section>

                    <Section icon={Mail} title={isEL ? 'Επικοινωνία' : 'Contact Us'}>
                        {isEL ? (
                            <p>
                                Εάν έχετε οποιαδήποτε απορία σχετικά με την Πολιτική Απορρήτου μας, μπορείτε να επικοινωνήσετε μαζί μας μέσω της ενότητας "Σχόλια" στις ρυθμίσεις της εφαρμογής.
                            </p>
                        ) : (
                            <p>
                                If you have any questions regarding our Privacy Policy, you can contact us through the "Feedback" section in the app settings.
                            </p>
                        )}
                    </Section>

                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-transparent text-center">
                        <p className="text-[12px] text-gray-400 dark:text-white/40">
                            SpendWise Finance App &copy; 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;









