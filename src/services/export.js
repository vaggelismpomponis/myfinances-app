export const exportCSV = (transactions) => {
    if (!transactions || !transactions.length) return;
    const headers = ['date', 'amount', 'type', 'category', 'note'];
    const rows = transactions.map(t => [
        t.date,
        t.amount,
        t.type,
        t.category,
        `"${(t.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportJSON = (transactions) => {
    if (!transactions || !transactions.length) return;
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    downloadBlob(blob, `transactions_${new Date().toISOString().split('T')[0]}.json`);
};

export const exportPDF = (transactions) => {
    console.warn("PDF export requires jsPDF. Fallback to CSV.");
    exportCSV(transactions);
};

export const exportExcel = (transactions) => {
    console.warn("Excel export requires SheetJS. Fallback to CSV.");
    exportCSV(transactions);
};

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
