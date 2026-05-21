import { loadTransactions, deleteTransaction, saveTransactions } from './storage.js';
import { getCategories } from './models.js';
import { formatDate } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Элементы
    const tableBody = document.getElementById('transactionsTableBody');
    const noMessage = document.getElementById('noTransactionsMessage');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const filterPeriod = document.getElementById('filterPeriod');
    const exportBtn = document.getElementById('exportCsv');
    const themeToggle = document.getElementById('themeToggle');

    // --- ФУНКЦИИ ОТРИСОВКИ ---
    function populateCategoryFilter() {
        const allCategories = new Set();
        loadTransactions().forEach(t => allCategories.add(t.category));
        filterCategory.innerHTML = '<option value="all">Все</option>';
        allCategories.forEach(cat => {
            filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }

    function getFilteredTransactions() {
        let transactions = loadTransactions();
        const now = new Date();

        // Фильтр по типу
        if (filterType.value !== 'all') {
            transactions = transactions.filter(t => t.type === filterType.value);
        }

        // Фильтр по категории
        if (filterCategory.value !== 'all') {
            transactions = transactions.filter(t => t.category === filterCategory.value);
        }

        // Фильтр по периоду
        switch (filterPeriod.value) {
            case 'week':
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                transactions = transactions.filter(t => new Date(t.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                transactions = transactions.filter(t => new Date(t.date) >= monthAgo);
                break;
            case 'year':
                const yearAgo = new Date(now);
                yearAgo.setFullYear(now.getFullYear() - 1);
                transactions = transactions.filter(t => new Date(t.date) >= yearAgo);
                break;
        }

        return transactions.reverse(); // Новые сверху
    }

    function renderTable() {
        const transactions = getFilteredTransactions();
        
        if (transactions.length === 0) {
            tableBody.innerHTML = '';
            noMessage.style.display = 'block';
            return;
        }

        noMessage.style.display = 'none';
        tableBody.innerHTML = transactions.map(t => `
            <tr>
                <td>${formatDate(t.date)}</td>
                <td class="${t.type === 'income' ? 'text-income' : 'text-expense'}">
                    ${t.type === 'income' ? 'Доход' : 'Расход'}
                </td>
                <td>${t.category}</td>
                <td class="${t.type === 'income' ? 'text-income' : 'text-expense'}">
                    ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()} ₽
                </td>
                <td>${t.comment || '—'}</td>
                <td>
                    <button class="btn btn--small btn--danger delete-btn" data-id="${t.id}">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Навешиваем обработчики удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm('Удалить эту транзакцию?')) {
                    deleteTransaction(id);
                    populateCategoryFilter();
                    renderTable();
                }
            });
        });
    }

    // --- ЭКСПОРТ CSV ---
    function exportToCSV() {
        const transactions = getFilteredTransactions();
        if (transactions.length === 0) {
            alert('Нет данных для экспорта.');
            return;
        }

        let csvContent = 'Дата,Тип,Категория,Сумма,Комментарий\n';
        transactions.forEach(t => {
            const type = t.type === 'income' ? 'Доход' : 'Расход';
            const amount = t.type === 'income' ? t.amount : -t.amount;
            csvContent += `${t.date},${type},${t.category},${amount},${t.comment || ''}\n`;
        });

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM для Excel
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- ПЕРЕКЛЮЧЕНИЕ ТЕМЫ ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // --- ИНИЦИАЛИЗАЦИЯ ---
    populateCategoryFilter();
    renderTable();

    filterType.addEventListener('change', renderTable);
    filterCategory.addEventListener('change', renderTable);
    filterPeriod.addEventListener('change', renderTable);
    exportBtn.addEventListener('click', exportToCSV);
});