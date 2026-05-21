const STORAGE_KEY = 'myFinances';

export function loadTransactions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(transaction) {
    const transactions = loadTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);
    return transactions;
}

export function deleteTransaction(id) {
    let transactions = loadTransactions();
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions(transactions);
    return transactions;
}