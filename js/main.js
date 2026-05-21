import { addTransaction, loadTransactions } from './storage.js';
import { createTransaction } from './models.js';
import { renderBalance, populateCategorySelect, renderRecentTransactions, showMessage } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Первичная отрисовка
    renderBalance();
    populateCategorySelect('category', 'expense');
    renderRecentTransactions();

    // Переключение категорий при смене типа транзакции
    document.getElementById('type').addEventListener('change', (e) => {
        populateCategorySelect('category', e.target.value);
    });

    // Установка сегодняшней даты по умолчанию
    document.getElementById('date').valueAsDate = new Date();

    // Обработка отправки формы
    document.getElementById('transactionForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const type = document.getElementById('type').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const comment = document.getElementById('comment').value;

        // Валидация
        if (!amount || amount <= 0) {
            showMessage('formMessage', 'Сумма должна быть положительным числом!', 'error');
            return;
        }
        if (!date) {
            showMessage('formMessage', 'Выберите дату!', 'error');
            return;
        }

        const transaction = createTransaction(type, amount, category, date, comment);
        addTransaction(transaction);

        // Обновление интерфейса
        renderBalance();
        renderRecentTransactions();
        showMessage('formMessage', 'Транзакция добавлена!', 'success');

        // Сброс формы (кроме даты и типа)
        document.getElementById('amount').value = '';
        document.getElementById('comment').value = '';
        document.getElementById('date').valueAsDate = new Date();
    });

    // Переключение темы
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
});