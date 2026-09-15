const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/products — все товары
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM products WHERE is_active = TRUE';
        const params = [];

        if (category && category !== 'all') {
            query += ' AND category = $1';
            params.push(category);
        }

        query += ' ORDER BY sort_order ASC, id ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка загрузки товара:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;