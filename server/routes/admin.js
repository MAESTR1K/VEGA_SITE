const express = require('express');
const pool = require('../db');

const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
// ============================================================
// ХЕЛПЕР: транслитерация + slug
// ============================================================
function slugify(str) {
    const map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y',
        'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
        'х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
    };

    const slug = str
        .toLowerCase()
        .split('')
        .map(ch => map[ch] !== undefined ? map[ch] : ch)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 180);

    return slug || 'product';
}
// Все роуты ниже защищены — только для админа
router.use(requireAdmin);

// ============================================================
// СТАТИСТИКА
// ============================================================
router.get('/stats', async (req, res) => {
    try {
        const ordersCount = await pool.query('SELECT COUNT(*) FROM orders');
        const ordersNew = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'new'");
        const ordersTotal = await pool.query('SELECT COALESCE(SUM(total), 0) AS sum FROM orders');
        const contactsCount = await pool.query('SELECT COUNT(*) FROM contacts');
        const contactsNew = await pool.query("SELECT COUNT(*) FROM contacts WHERE status = 'new'");
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const productsCount = await pool.query('SELECT COUNT(*) FROM products');

        res.json({
            orders: {
                total: parseInt(ordersCount.rows[0].count),
                new: parseInt(ordersNew.rows[0].count),
                sum: parseInt(ordersTotal.rows[0].sum)
            },
            contacts: {
                total: parseInt(contactsCount.rows[0].count),
                new: parseInt(contactsNew.rows[0].count)
            },
            users: parseInt(usersCount.rows[0].count),
            products: parseInt(productsCount.rows[0].count)
        });
    } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================================
// ЗАКАЗЫ
// ============================================================
router.get('/orders', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*,
                COALESCE(json_agg(json_build_object(
                    'id', oi.id,
                    'name', oi.name,
                    'price', oi.price,
                    'qty', oi.qty
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

router.patch('/orders/:id/status', async (req, res) => {
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

router.delete('/orders/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка удаления заказа:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================================
// ЗАЯВКИ (CONTACTS)
// ============================================================
router.get('/contacts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка загрузки заявок:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.patch('/contacts/:id/status', async (req, res) => {
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

router.delete('/contacts/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заявка не найдена' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка удаления заявки:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================================
// ТОВАРЫ — CRUD
// ============================================================
router.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY sort_order ASC, id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.post('/products', async (req, res) => {
    try {
        const { name, price, img, description, category, collection, is_active, sort_order } = req.body;

        if (!name) return res.status(400).json({ error: 'Укажите название' });

        // Генерируем slug из названия
        let slug = slugify(name);

        // Проверяем, что slug уникален. Если занят — добавляем суффикс
        const existing = await pool.query('SELECT id FROM products WHERE slug = $1', [slug]);
        if (existing.rows.length > 0) {
            slug = `${slug}-${Date.now().toString().slice(-5)}`;
        }

        const result = await pool.query(
            `INSERT INTO products (name, slug, price, img, description, category, collection, is_active, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [name, slug, price || 0, img || null, description || null, category || null, collection || null, is_active !== false, sort_order || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Ошибка создания товара:', err);
        res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
    }
});

router.patch('/products/:id', async (req, res) => {
    try {
        const { name, price, img, description, category, collection, is_active, sort_order } = req.body;

        const result = await pool.query(
            `UPDATE products SET
                name = COALESCE($1, name),
                price = COALESCE($2, price),
                img = COALESCE($3, img),
                description = COALESCE($4, description),
                category = COALESCE($5, category),
                collection = COALESCE($6, collection),
                is_active = COALESCE($7, is_active),
                sort_order = COALESCE($8, sort_order)
             WHERE id = $9
             RETURNING *`,
            [name, price, img, description, category, collection, is_active, sort_order, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(result.rows[0]);
       } catch (err) {
        console.error('❌ Ошибка обновления товара:', err);
        res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка удаления товара:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================================
// ПОЛЬЗОВАТЕЛИ
// ============================================================
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;