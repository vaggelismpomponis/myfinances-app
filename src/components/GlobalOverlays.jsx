import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AddModal from './AddModal';
import ConfirmationModal from './ConfirmationModal';
import WhatsNewModal from './WhatsNewModal';
import BroadcastModal from './BroadcastModal';
import UpgradeModal from './UpgradeModal';
import NotificationPanel from './NotificationPanel';
import RegretCheckinModal from './RegretCheckinModal';

export default function GlobalOverlays({
    // AddModal props
    showAddModal,
    setShowAddModal,
    editingTransaction,
    setEditingTransaction,
    fabInitialType,
    setFabInitialType,
    addTransaction,
    isDesktop,

    // ConfirmationModal props
    showDeleteModal,
    setShowDeleteModal,
    confirmDelete,

    // WhatsNew / Broadcast props
    showWhatsNew,
    setShowWhatsNew,
    latestUpdate,
    showBroadcast,
    setShowBroadcast,
    currentBroadcast,
    user,

    // Notification Panel
    showNotificationPanel,
    setShowNotificationPanel,

    // Regret Check-in
    showRegretModal,
    setShowRegretModal,
    activeRegretTxId,
    setActiveRegretTxId
}) {
    return (
        <>
            {/* Regret Check-in Modal */}
            <RegretCheckinModal
                isOpen={showRegretModal}
                onClose={() => {
                    setShowRegretModal(false);
                    setActiveRegretTxId(null);
                }}
                transactionId={activeRegretTxId}
            />

            {/* Add Transaction Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddModal
                        key={isDesktop ? "desktop-add-modal" : "mobile-add-modal"}
                        onClose={() => { 
                            setShowAddModal(false); 
                            setEditingTransaction(null);
                            if (setFabInitialType) setFabInitialType(null);
                        }}
                        onAdd={addTransaction}
                        initialData={editingTransaction}
                        initialType={fabInitialType}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                onConfirm={confirmDelete} 
                title="Διαγραφή Συναλλαγής" 
                message="Θέλεις σίγουρα να διαγράψεις αυτή τη συναλλαγή;" 
                confirmText="Διαγραφή" 
                type="danger" 
            />

            {/* System Updates & Broadcasts */}
            <WhatsNewModal 
                isOpen={showWhatsNew} 
                onClose={() => { 
                    if (latestUpdate) {
                        localStorage.setItem(`whatsnew_seen_${latestUpdate.version}_${user?.id}`, 'true'); 
                    }
                    setShowWhatsNew(false); 
                }} 
                data={latestUpdate} 
            />
            
            <BroadcastModal 
                isOpen={showBroadcast} 
                onClose={() => { 
                    if (currentBroadcast) {
                        localStorage.setItem(`broadcast_seen_${user?.id}`, currentBroadcast.id); 
                    }
                    setShowBroadcast(false); 
                }} 
                data={currentBroadcast} 
            />

            {/* Paywall / Upgrade Modal */}
            <UpgradeModal />

            {/* Notification Panel */}
            <NotificationPanel 
                isOpen={showNotificationPanel} 
                onClose={() => setShowNotificationPanel(false)} 
            />
        </>
    );
}
