const express = require('express');
const pool = require('../db');

const router = express.Router();

// POST /api/contacts — новая заявка
router.post('/', async (req, res) => {
    try {
        const { name, phone, message } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Заполните имя и телефон' });
        }

        const result = await pool.query(
            `INSERT INTO contacts (name, phone, message)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, phone, message || null]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка создания заявки:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// GET /api/contacts — для админки
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка загрузки заявок:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// PATCH /api/contacts/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const result = await pool.query(
            'UPDATE contacts SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заявка не найдена' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка смены статуса:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;