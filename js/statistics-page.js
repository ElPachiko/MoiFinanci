import { loadTransactions } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // Элементы
    const monthlyCtx = document.getElementById('monthlyChart')?.getContext('2d');
    const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');
    const statsSummary = document.getElementById('statsSummary');
    const themeToggle = document.getElementById('themeToggle');

    let monthlyChartInstance = null;
    let categoryChartInstance = null;

    // --- ФУНКЦИИ ДЛЯ ГРАФИКОВ ---
    function getMonthlyData() {
        const transactions = loadTransactions();
        const monthly = {};

        transactions.forEach(t => {
            const month = t.date.slice(0, 7); // YYYY-MM
            if (!monthly[month]) {
                monthly[month] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                monthly[month].income += t.amount;
            } else {
                monthly[month].expense += t.amount;
            }
        });

        const sortedKeys = Object.keys(monthly).sort();
        return {
            labels: sortedKeys.map(k => {
                const [y, m] = k.split('-');
                return `${m}.${y}`;
            }),
            income: sortedKeys.map(k => monthly[k].income),
            expense: sortedKeys.map(k => monthly[k].expense)
        };
    }

    function getCategoryData() {
        const transactions = loadTransactions().filter(t => t.type === 'expense');
        const categories = {};

        transactions.forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });

        return {
            labels: Object.keys(categories),
            data: Object.values(categories)
        };
    }

    function renderMonthlyChart() {
        if (!monthlyCtx) return;
        if (monthlyChartInstance) monthlyChartInstance.destroy();

        const { labels, income, expense } = getMonthlyData();

        if (labels.length === 0) {
            statsSummary.innerHTML += '<p>Нет данных для отображения.</p>';
            return;
        }

        monthlyChartInstance = new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Доходы',
                        data: income,
                        backgroundColor: 'rgba(39, 174, 96, 0.7)',
                        borderColor: '#27ae60',
                        borderWidth: 1
                    },
                    {
                        label: 'Расходы',
                        data: expense,
                        backgroundColor: 'rgba(231, 76, 60, 0.7)',
                        borderColor: '#e74c3c',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: (value) => value.toLocaleString() + ' ₽' }
                    }
                }
            }
        });
    }

    function renderCategoryChart() {
        if (!categoryCtx) return;
        if (categoryChartInstance) categoryChartInstance.destroy();

        const { labels, data } = getCategoryData();

        if (labels.length === 0) return;

        categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#e74c3c', '#3498db', '#f1c40f', '#2ecc71',
                        '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    function renderSummary() {
        const transactions = loadTransactions();
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpense;

        statsSummary.innerHTML = `
            <div class="balance-widget" style="margin-top: 20px;">
                <h3>Итого за всё время</h3>
                <p class="balance__amount" style="font-size: 2rem;">${balance.toLocaleString()} ₽</p>
                <div class="balance__details">
                    <span class="balance__income">Доходы: <strong>${totalIncome.toLocaleString()} ₽</strong></span>
                    <span class="balance__expense">Расходы: <strong>${totalExpense.toLocaleString()} ₽</strong></span>
                </div>
            </div>
        `;
    }

    // --- ТЕМА ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // --- ИНИЦИАЛИЗАЦИЯ ---
    renderMonthlyChart();
    renderCategoryChart();
    renderSummary();
});