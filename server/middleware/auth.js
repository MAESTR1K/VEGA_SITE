const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'vega_secret';

// Проверка токена — обязательна
function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        const token = auth.slice(7);
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
}

// Проверка админа — токен + роль
function requireAdmin(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        const token = auth.slice(7);
        const payload = jwt.verify(token, JWT_SECRET);

        if (payload.role !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещён. Нужны права админа' });
        }

        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
}

module.exports = { requireAuth, requireAdmin };