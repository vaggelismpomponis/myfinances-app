import React from 'react';
import TransactionItem from '../components/TransactionItem';

const HistoryView = ({ transactions, onDelete }) => (
    <div className="pb-24 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ιστορικό</h2>
        <div className="space-y-3">
            {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-10">Δεν υπάρχουν συναλλαγές ακόμη.</p>
            ) : (
                transactions.map(t => (
                    <TransactionItem key={t.id} transaction={t} onDelete={onDelete} />
                ))
            )}
        </div>
    </div>
);

export default HistoryView;
