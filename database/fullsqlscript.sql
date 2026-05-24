-- =============================================
-- База данных «Мои финансы»
-- СУБД: SQLite
-- Автор: Макс Пачиков
-- Описание: Учебный проект для практики.
--           База данных для учёта личных доходов и расходов.
-- =============================================

/*
  1. ОПИСАНИЕ ТАБЛИЦ И СВЯЗЕЙ

  Таблица categories (Категории):
  Поля:
  - id    INTEGER (PK)   Уникальный идентификатор категории
  - name  TEXT            Название категории
  - type  TEXT            Тип категории: 'income' или 'expense'
  Ограничения:
  - Первичный ключ: id
  - CHECK для type: значение должно быть строго 'income' или 'expense'

  Таблица transactions (Транзакции):
  Поля:
  - id          INTEGER (PK)  Уникальный идентификатор операции
  - type        TEXT           Тип операции: 'income' или 'expense'
  - amount      REAL            Сумма операции
  - category_id INTEGER (FK)   Внешний ключ, ссылается на categories(id)
  - date        TEXT            Дата операции в формате YYYY-MM-DD
  - comment     TEXT            Комментарий (необязательное поле)
  Ограничения:
  - Первичный ключ: id
  - CHECK для type: значение должно быть строго 'income' или 'expense'
  - CHECK для amount: сумма должна быть строго больше 0
  - NOT NULL для всех полей, кроме comment
  - Внешний ключ: FOREIGN KEY (category_id) REFERENCES categories(id)

  СВЯЗЬ МЕЖДУ ТАБЛИЦАМИ: categories 1 ──── M transactions
  Одна категория может относиться ко многим транзакциям.
  Одна транзакция всегда привязана ровно к одной категории.
  Связь реализована через внешний ключ category_id в таблице transactions.
*/


-- =============================================
-- 2. УДАЛЕНИЕ СТАРЫХ ТАБЛИЦ (ЕСЛИ СУЩЕСТВУЮТ)
-- =============================================
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;


-- =============================================
-- 3. СОЗДАНИЕ ТАБЛИЦ (DDL)
-- =============================================

-- Таблица категорий
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
);

-- Таблица транзакций
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    category_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    comment TEXT DEFAULT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);


-- =============================================
-- 4. НАПОЛНЕНИЕ ТЕСТОВЫМИ ДАННЫМИ (SEED)
-- =============================================

-- Категории доходов
INSERT INTO categories (name, type) VALUES
    ('Зарплата', 'income'),
    ('Подработка', 'income'),
    ('Подарки', 'income'),
    ('Инвестиции', 'income'),
    ('Другое (доход)', 'income');

-- Категории расходов
INSERT INTO categories (name, type) VALUES
    ('Еда', 'expense'),
    ('Транспорт', 'expense'),
    ('Развлечения', 'expense'),
    ('Связь', 'expense'),
    ('Жильё', 'expense'),
    ('Здоровье', 'expense'),
    ('Одежда', 'expense'),
    ('Другое (расход)', 'expense');

-- Тестовые транзакции
INSERT INTO transactions (type, amount, category_id, date, comment) VALUES
    ('income', 50000, 1, '2026-05-01', 'Зарплата за май'),
    ('income', 50000, 1, '2026-04-01', 'Зарплата за апрель'),
    ('income', 50000, 1, '2026-03-01', 'Зарплата за март'),
    ('income', 15000, 2, '2026-05-15', 'Фриланс проект'),
    ('income', 5000,  3, '2026-05-20', 'День рождения'),
    ('expense', 15000, 10, '2026-05-02', 'Аренда квартиры'),
    ('expense', 15000, 10, '2026-04-02', 'Аренда квартиры'),
    ('expense', 15000, 10, '2026-03-02', 'Аренда квартиры'),
    ('expense', 5000,  6, '2026-05-10', 'Продукты на неделю'),
    ('expense', 3500,  6, '2026-05-17', 'Продукты'),
    ('expense', 2000,  7, '2026-05-12', 'Метро и автобус'),
    ('expense', 3000,  8, '2026-05-14', 'Кино и кафе'),
    ('expense', 1000,  9, '2026-05-01', 'Мобильная связь'),
    ('expense', 2500, 11, '2026-05-18', 'Лекарства'),
    ('expense', 4000, 12, '2026-04-25', 'Джинсы');


-- =============================================
-- 5. ОБЯЗАТЕЛЬНЫЕ SQL-ЗАПРОСЫ
-- =============================================

/* ========== 5.1. SELECT с условием (WHERE) ========== */
-- Все расходы за май 2026 года с сортировкой по дате
SELECT
    t.date,
    c.name AS category,
    t.amount,
    t.comment
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'expense'
  AND t.date BETWEEN '2026-05-01' AND '2026-05-31'
ORDER BY t.date DESC;

/* ========== 5.2. INSERT ========== */
-- Добавление новой транзакции (доход от подработки)
INSERT INTO transactions (type, amount, category_id, date, comment)
VALUES ('income', 8000, 2, '2026-05-22', 'Вёрстка лендинга');

-- Проверка добавления
SELECT * FROM transactions WHERE id = last_insert_rowid();

/* ========== 5.3. UPDATE ========== */
-- Изменение комментария у транзакции с id = 9
UPDATE transactions
SET comment = 'Продукты на неделю (Пятёрочка)'
WHERE id = 9;

-- Проверка обновления
SELECT * FROM transactions WHERE id = 9;

/* ========== 5.4. DELETE ========== */
-- Удаление последней добавленной транзакции
DELETE FROM transactions
WHERE id = (SELECT MAX(id) FROM transactions);

-- Проверка удаления: считаем оставшиеся записи
SELECT COUNT(*) AS total_transactions FROM transactions;

/* ========== 5.5. SELECT с JOIN ========== */
-- Сводка доходов и расходов по всем категориям
SELECT
    c.name AS category,
    c.type,
    COUNT(t.id) AS operations_count,
    SUM(t.amount) AS total_amount,
    ROUND(AVG(t.amount), 2) AS avg_amount
FROM categories c
LEFT JOIN transactions t ON c.id = t.category_id
GROUP BY c.id
ORDER BY c.type, total_amount DESC;