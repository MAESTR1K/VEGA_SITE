const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vega_secret';

// Достаём user_id из токена, если он есть (не обязательно)
function getUserIdFromToken(req) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) return null;
        const token = auth.slice(7);
        const payload = jwt.verify(token, JWT_SECRET);
        return payload.id || null;
    } catch {
        return null;
    }
}

// POST /api/orders — создать заказ
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, phone, email, address, comment, items } = req.body;
        const userId = getUserIdFromToken(req);

        if (!name || !phone || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Заполните имя, телефон и добавьте товары' });
        }

        await client.query('BEGIN');

        // Считаем сумму
        let total = 0;
        const validItems = [];

        for (const item of items) {
            const prod = await client.query('SELECT id, name, price FROM products WHERE id = $1', [item.product_id]);
            if (prod.rows.length === 0) {
                console.warn(`⚠️ Товар id=${item.product_id} не найден в БД, пропускаем`);
                continue;
            }
            const p = prod.rows[0];
            const qty = item.qty || 1;
            total += p.price * qty;
            validItems.push({ id: p.id, name: p.name, price: p.price, qty });
        }

        if (validItems.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Ни один товар из корзины не найден в базе' });
        }

        // Создаём заказ
        const orderRes = await client.query(
            `INSERT INTO orders (user_id, name, phone, email, address, comment, total, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')
             RETURNING *`,
            [userId, name, phone, email || null, address || null, comment || null, total]
        );
        const order = orderRes.rows[0];

        // Позиции
        for (const it of validItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, name, price, qty)
                 VALUES ($1, $2, $3, $4, $5)`,
                [order.id, it.id, it.name, it.price, it.qty]
            );
        }

        await client.query('COMMIT');
        console.log(`✅ Создан заказ #${order.id}, позиций: ${validItems.length}, сумма: ${total}`);
        res.json({ order });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка создания заказа:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        client.release();
    }
});

// GET /api/orders — для админки
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*,
                COALESCE(json_agg(json_build_object(
                    'name', oi.name, 'price', oi.price, 'qty', oi.qty
                )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
             FROM orders o
             LEFT JOIN order_items oi ON oi.order_id = o.id
             GROUP BY o.id
             ORDER BY o.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка загрузки заказов:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: 'Не указан статус' });

        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка смены статуса:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;