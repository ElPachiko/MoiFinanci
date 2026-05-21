export function createTransaction(type, amount, category, date, comment) {
    return {
        id: Date.now().toString(),
        type,
        amount: parseInt(amount, 10),
        category,
        date,
        comment: comment || ''
    };
}

export const defaultCategories = {
    income: ['Зарплата', 'Подработка', 'Подарки', 'Инвестиции', 'Другое'],
    expense: ['Еда', 'Транспорт', 'Развлечения', 'Связь', 'Жильё', 'Здоровье', 'Одежда', 'Другое']
};

export function getCategories(type) {
    const stored = localStorage.getItem('customCategories');
    const custom = stored ? JSON.parse(stored) : {};
    const defaults = defaultCategories[type] || [];
    const customs = custom[type] || [];
    return [...new Set([...defaults, ...customs])];
}