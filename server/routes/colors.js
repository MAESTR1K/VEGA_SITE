const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const router = express.Router();

// GET /api/colors — все активные цвета
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM colors WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC'
        );

        // Если БД пустая — отдаём из JSON-файла
        if (result.rows.length === 0) {
            const jsonPath = path.join(__dirname, '..', '..', 'data', 'colors.json');
            if (fs.existsSync(jsonPath)) {
                const colors = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                return res.json(colors);
            }
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка загрузки цветов:', err);
        // Фолбэк на JSON
        try {
            const jsonPath = path.join(__dirname, '..', '..', 'data', 'colors.json');
            const colors = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            res.json(colors);
        } catch {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
});

module.exports = router;