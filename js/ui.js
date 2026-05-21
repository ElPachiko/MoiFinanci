import { loadTransactions, deleteTransaction } from './storage.js';
import { getCategories, createTransaction } from './models.js';

export function renderBalance() {
    const transactions = loadTransactions();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    document.getElementById('currentBalance').textContent = `${balance.toLocaleString()} ₽`;
    document.getElementById('totalIncome').textContent = `${totalIncome.toLocaleString()} ₽`;
    document.getElementById('totalExpense').textContent = `${totalExpense.toLocaleString()} ₽`;
}

export function populateCategorySelect(selectId, type = 'expense') {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const categories = getCategories(type);
    select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

export function renderRecentTransactions(limit = 5) {
    const container = document.getElementById('recentTransactionsList');
    if (!container) return;

    const transactions = loadTransactions();
    const recent = transactions.slice(-limit).reverse();

    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-state">Транзакций пока нет. Добавьте первую!</p>';
        return;
    }

    container.innerHTML = recent.map(t => `
        <div class="transaction-item transaction-item--${t.type}">
            <div class="transaction-item__left">
                <span class="transaction-item__category">${t.category}</span>
                <span class="transaction-item__date">${formatDate(t.date)}</span>
                ${t.comment ? `<small>${t.comment}</small>` : ''}
            </div>
            <div class="transaction-item__right">
                <span class="transaction-item__amount transaction-item__amount--${t.type}">
                    ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()} ₽
                </span>
                <button class="transaction-item__delete" data-id="${t.id}" title="Удалить">🗑️</button>
            </div>
        </div>
    `).join('');

    // Навешиваем обработчики удаления
    container.querySelectorAll('.transaction-item__delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            deleteTransaction(id);
            renderBalance();
            renderRecentTransactions();
        });
    });
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function showMessage(elementId, text, type = 'success') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = `form__message form__message--${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}