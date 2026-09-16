const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача статики — фронт лежит на уровень выше
app.use(express.static(path.join(__dirname, '..')));

// API-роуты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/colors', require('./routes/colors'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// SPA-фолбэк
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
    }

    // /admin/ и /admin — отдаём страницу логина админки
    if (req.path === '/admin' || req.path === '/admin/') {
        return res.sendFile(path.join(__dirname, '..', 'admin', 'login.html'));
    }

    // Всё остальное — index.html
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Запуск
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`📦 API: http://localhost:${PORT}/api/health`);
});