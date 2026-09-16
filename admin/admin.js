// ============================================================
// КОНФИГ
// ============================================================
const API_BASE = '/api';
const TOKEN_KEY = 'vega_token';
const USER_KEY = 'vega_user';

// ============================================================
// ХЕЛПЕРЫ
// ============================================================
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(API_BASE + url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
        if (res.status === 401) {
            logout();
            throw new Error('Сессия истекла');
        }
        throw new Error(data.error || 'Доступ запрещён');
    }

    if (!res.ok) {
        throw new Error(data.error || 'Ошибка запроса');
    }

    return data;
}

function showToast(message, type = 'info') {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatPrice(n) {
    return (n || 0).toLocaleString('ru-RU') + ' ₽';
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================================
// ДАШБОРД
// ============================================================
const dashboardRoot = document.querySelector('.admin-main');

if (dashboardRoot) {
    const user = getUser();
    if (!user || user.role !== 'admin' || !getToken()) {
        window.location.href = 'login.html';
    }

    // Заголовок с именем
    const headerUser = document.getElementById('headerUser');
    if (headerUser) headerUser.innerHTML = `Привет, <strong>${escapeHtml(user.name)}</strong>`;

    // Кнопка выхода
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Выйти из админки?')) logout();
    });

    // Табы
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.toggle('active', t === tab));
            panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
        });
    });

    // ============================================================
    // СТАТУСЫ — справочники
    // ============================================================
    const ORDER_STATUSES = {
        new: 'Новый',
        processing: 'В обработке',
        shipped: 'Отправлен',
        done: 'Выполнен',
        canceled: 'Отменён'
    };

    const CONTACT_STATUSES = {
        new: 'Новая',
        processed: 'Обработана'
    };

    function statusSelect(status, dict, entity, id) {
        const options = Object.entries(dict)
            .map(([k, v]) => `<option value="${k}" ${k === status ? 'selected' : ''}>${v}</option>`)
            .join('');
        return `<select class="status-select" data-entity="${entity}" data-id="${id}">${options}</select>`;
    }

    // ============================================================
    // СТАТИСТИКА
    // ============================================================
    async function loadStats() {
        try {
            const stats = await apiFetch('/admin/stats');

            const ordersTotal = document.getElementById('statOrdersTotal');
            const ordersNew = document.getElementById('statOrdersNew');
            if (ordersTotal) ordersTotal.textContent = stats.orders.total;
            if (ordersNew) ordersNew.textContent = stats.orders.new;

            const revenue = document.getElementById('statRevenue');
            if (revenue) revenue.textContent = (stats.orders.sum || 0).toLocaleString('ru-RU') + ' ₽';

            const contactsTotal = document.getElementById('statContactsTotal');
            const contactsNew = document.getElementById('statContactsNew');
            if (contactsTotal) contactsTotal.textContent = stats.contacts.total;
            if (contactsNew) contactsNew.textContent = stats.contacts.new;

            const users = document.getElementById('statUsers');
            if (users) users.textContent = stats.users;

            const products = document.getElementById('statProducts');
            if (products) products.textContent = stats.products;

            const ordersCount = document.getElementById('ordersCount');
            const contactsCount = document.getElementById('contactsCount');
            const productsCount = document.getElementById('productsCount');
            if (ordersCount) ordersCount.textContent = stats.orders.total;
            if (contactsCount) contactsCount.textContent = stats.contacts.total;
            if (productsCount) productsCount.textContent = stats.products;
        } catch (err) {
            console.error('Ошибка статистики:', err);
        }
    }

    // ============================================================
    // МОДАЛКА ТОВАРА
    // ============================================================
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const productModalTitle = document.getElementById('productModalTitle');

    function openProductModal(product = null) {
        if (!productModal) return;

        if (product) {
    productModalTitle.textContent = 'Редактировать товар';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productPrice').value = product.price || 0;
    document.getElementById('productCategory').value = product.category || 'films';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productActive').checked = product.is_active !== false;

    // Изображение: если есть — показываем превью
    document.getElementById('productImg').value = product.img || '';
    showFilePreview(product.img);
} else {
    productModalTitle.textContent = 'Добавить товар';
    productForm.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productActive').checked = true;
    document.getElementById('productImg').value = '';
    hideFilePreview();
}

        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        if (productModal) {
            productModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    // ============================================================
    // ЗАГРУЗКА ИЗОБРАЖЕНИЯ
    // ============================================================
    const fileInput = document.getElementById('productImgFile');
    const filePreview = document.getElementById('filePreview');
    const filePreviewImg = document.getElementById('filePreviewImg');
    const fileRemoveBtn = document.getElementById('fileRemoveBtn');
    const fileUploadText = document.getElementById('fileUploadText');
    const productImgHidden = document.getElementById('productImg');

    function showFilePreview(url) {
        if (!url) return hideFilePreview();

        filePreviewImg.src = url;
        filePreview.style.display = 'block';
        if (fileUploadText) fileUploadText.textContent = 'Заменить файл';
    }

    function hideFilePreview() {
        filePreview.style.display = 'none';
        filePreviewImg.src = '';
        if (fileInput) fileInput.value = '';
        if (fileUploadText) fileUploadText.textContent = 'Выбрать файл';
        if (productImgHidden) productImgHidden.value = '';
    }

    if (fileInput) {
        fileInput.addEventListener('change', async function() {
            const file = this.files[0];
            if (!file) return;

            // Проверка размера
            if (file.size > 5 * 1024 * 1024) {
                showToast('Файл больше 5 МБ', 'error');
                this.value = '';
                return;
            }

            // Локальный предпросмотр (мгновенно)
            const reader = new FileReader();
            reader.onload = (e) => {
                filePreviewImg.src = e.target.result;
                filePreview.style.display = 'block';
                if (fileUploadText) fileUploadText.textContent = 'Загрузка...';
            };
            reader.readAsDataURL(file);

            // Отправка на сервер
            try {
                const formData = new FormData();
                formData.append('image', file);

                const token = getToken();
                const res = await fetch(API_BASE + '/admin/upload', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token },
                    body: formData
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');

                // Сохраняем путь
                if (productImgHidden) productImgHidden.value = data.path;
                if (fileUploadText) fileUploadText.textContent = 'Заменить файл';

                showToast('Изображение загружено', 'success');
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                showToast(err.message, 'error');
                hideFilePreview();
            }
        });
    }

    if (fileRemoveBtn) {
        fileRemoveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideFilePreview();
        });
    }
    
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal());
    }

    document.getElementById('productModalClose')?.addEventListener('click', closeProductModal);
    document.getElementById('productCancel')?.addEventListener('click', closeProductModal);

    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) closeProductModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && productModal.classList.contains('active')) {
                closeProductModal();
            }
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const id = document.getElementById('productId').value;
            const payload = {
                name: document.getElementById('productName').value.trim(),
                price: parseInt(document.getElementById('productPrice').value) || 0,
                img: document.getElementById('productImg').value.trim() || null,
                category: document.getElementById('productCategory').value,
                description: document.getElementById('productDescription').value.trim() || null,
                is_active: document.getElementById('productActive').checked
            };

            if (!payload.name) {
                showToast('Укажите название товара', 'error');
                return;
            }

            const submitBtn = document.getElementById('productSubmit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Сохранение...';

            try {
                if (id) {
                    await apiFetch(`/admin/products/${id}`, {
                        method: 'PATCH',
                        body: JSON.stringify(payload)
                    });
                    showToast('Товар обновлён', 'success');
                } else {
                    await apiFetch('/admin/products', {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });
                    showToast('Товар добавлен', 'success');
                }

                closeProductModal();
                loadProducts();
                loadStats();
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Сохранить';
            }
        });
    }

    // ============================================================
    // МОДАЛКА УДАЛЕНИЯ
    // ============================================================
    const deleteModal = document.getElementById('deleteModal');
    const deleteModalTitle = document.getElementById('deleteModalTitle');
    const deleteModalText = document.getElementById('deleteModalText');
    const deleteConfirmBtn = document.getElementById('deleteConfirm');
    const deleteCancelBtn = document.getElementById('deleteCancel');
    const deleteModalCloseBtn = document.getElementById('deleteModalClose');

    let pendingDelete = null;

    function openDeleteModal(entity, id, label) {
        if (!deleteModal) return;

        pendingDelete = { entity, id };

        const entityLabels = {
            order: 'заказ',
            contact: 'заявку',
            product: 'товар'
        };

        deleteModalTitle.textContent = `Удалить ${entityLabels[entity] || 'запись'} #${id}?`;
        deleteModalText.textContent = label || 'Это действие нельзя отменить.';
        deleteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDeleteModal() {
        if (deleteModal) {
            deleteModal.classList.remove('active');
            document.body.style.overflow = '';
            pendingDelete = null;
        }
    }

    if (deleteModal) {
        deleteCancelBtn?.addEventListener('click', closeDeleteModal);
        deleteModalCloseBtn?.addEventListener('click', closeDeleteModal);

        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && deleteModal.classList.contains('active')) {
                closeDeleteModal();
            }
        });

        deleteConfirmBtn?.addEventListener('click', async () => {
            if (!pendingDelete) return;

            const { entity, id } = pendingDelete;

            const urls = {
                order: `/admin/orders/${id}`,
                contact: `/admin/contacts/${id}`,
                product: `/admin/products/${id}`
            };

            try {
                await apiFetch(urls[entity], { method: 'DELETE' });
                showToast('Удалено', 'success');
                closeDeleteModal();

                if (entity === 'order') loadOrders();
                if (entity === 'contact') loadContacts();
                if (entity === 'product') loadProducts();
                loadStats();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    // ============================================================
    // ОБРАБОТЧИКИ
    // ============================================================
    function bindStatusSelects() {
        document.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', async function() {
                const entity = this.dataset.entity;
                const id = this.dataset.id;
                const status = this.value;

                const urls = {
                    order: `/admin/orders/${id}/status`,
                    contact: `/admin/contacts/${id}/status`
                };

                try {
                    await apiFetch(urls[entity], {
                        method: 'PATCH',
                        body: JSON.stringify({ status })
                    });
                    showToast('Статус обновлён', 'success');
                    loadStats();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        });
    }

    function bindDeleteButtons() {
        document.querySelectorAll('[data-delete-entity]').forEach(btn => {
            btn.onclick = function() {
                const entity = this.dataset.deleteEntity;
                const id = this.dataset.id;

                const item = this.closest('.admin-item');
                const title = item?.querySelector('.admin-item__title')?.textContent || '';
                const label = title ? `«${title}» будет удалён навсегда.` : 'Это действие нельзя отменить.';

                openDeleteModal(entity, id, label);
            };
        });
    }

    function bindToggleProductButtons() {
        document.querySelectorAll('[data-toggle-product]').forEach(btn => {
            btn.onclick = async function() {
                const id = this.dataset.toggleProduct;
                const currentActive = this.dataset.active === 'true';

                try {
                    await apiFetch(`/admin/products/${id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ is_active: !currentActive })
                    });
                    showToast(currentActive ? 'Товар скрыт' : 'Товар показан', 'success');
                    loadProducts();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
        });
    }

    function bindEditProductButtons(products) {
        document.querySelectorAll('[data-edit-product]').forEach(btn => {
            btn.onclick = function() {
                const id = parseInt(this.dataset.editProduct);
                const product = products.find(p => p.id === id);
                if (!product) return;
                openProductModal(product);
            };
        });
    }

    // ============================================================
    // ЗАКАЗЫ
    // ============================================================
    let ordersData = [];
    let ordersSearch = '';
    let ordersStatusFilter = 'all';

    async function loadOrders() {
        const list = document.getElementById('ordersList');
        const loading = document.getElementById('ordersLoading');
        loading.style.display = 'block';
        list.innerHTML = '';

        try {
            ordersData = await apiFetch('/admin/orders');
            loading.style.display = 'none';
            renderOrders();
        } catch (err) {
            loading.style.display = 'none';
            list.innerHTML = `<div class="admin-empty"><span class="admin-empty__icon">❌</span><div class="admin-empty__text">${escapeHtml(err.message)}</div></div>`;
        }
    }

    function renderOrders() {
        const list = document.getElementById('ordersList');

        let filtered = ordersData;

        if (ordersStatusFilter !== 'all') {
            filtered = filtered.filter(o => o.status === ordersStatusFilter);
        }

        if (ordersSearch) {
            const q = ordersSearch.toLowerCase();
            filtered = filtered.filter(o =>
                (o.name || '').toLowerCase().includes(q) ||
                (o.phone || '').toLowerCase().includes(q) ||
                (o.email || '').toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            list.innerHTML = `
                <div class="admin-empty">
                    <span class="admin-empty__icon">🔍</span>
                    <div class="admin-empty__text">${ordersData.length === 0 ? 'Заказов пока нет' : 'Ничего не найдено'}</div>
                </div>`;
            return;
        }

        list.innerHTML = filtered.map(o => {
            const items = (o.items || []).map(it =>
                `<li><span>${escapeHtml(it.name)} × ${it.qty}</span><span>${formatPrice(it.price * it.qty)}</span></li>`
            ).join('');

            return `
                <div class="admin-item">
                    <div class="admin-item__id">#${o.id}</div>
                    <div class="admin-item__body">
                        <div class="admin-item__title">${escapeHtml(o.name)}</div>
                        <div class="admin-item__meta">
                            <span>📞 ${escapeHtml(o.phone)}</span>
                            ${o.email ? `<span>✉️ ${escapeHtml(o.email)}</span>` : ''}
                            <span>🕒 ${formatDate(o.created_at)}</span>
                            ${o.user_id ? `<span>👤 user_id: ${o.user_id}</span>` : '<span>👤 Гость</span>'}
                        </div>
                        ${o.address ? `<div class="admin-item__meta"><span>📍 ${escapeHtml(o.address)}</span></div>` : ''}
                        ${items ? `<div class="admin-item__details"><strong>Состав:</strong><ul>${items}</ul></div>` : ''}
                        ${o.comment ? `<div class="admin-item__details"><strong>Комментарий:</strong> ${escapeHtml(o.comment)}</div>` : ''}
                    </div>
                    <div class="admin-item__actions">
                        <div class="admin-item__total">${formatPrice(o.total)}</div>
                        ${statusSelect(o.status, ORDER_STATUSES, 'order', o.id)}
                        <button class="btn btn-danger btn-sm" data-delete-entity="order" data-id="${o.id}">Удалить</button>
                    </div>
                </div>
            `;
        }).join('');

        bindStatusSelects();
        bindDeleteButtons();
    }

    document.getElementById('ordersSearch')?.addEventListener('input', function() {
        ordersSearch = this.value.trim();
        renderOrders();
    });

    document.getElementById('ordersFilter')?.addEventListener('change', function() {
        ordersStatusFilter = this.value;
        renderOrders();
    });

    // ============================================================
    // ЗАЯВКИ
    // ============================================================
    let contactsData = [];
    let contactsSearch = '';
    let contactsStatusFilter = 'all';

    async function loadContacts() {
        const list = document.getElementById('contactsList');
        const loading = document.getElementById('contactsLoading');
        loading.style.display = 'block';
        list.innerHTML = '';

        try {
            contactsData = await apiFetch('/admin/contacts');
            loading.style.display = 'none';
            renderContacts();
        } catch (err) {
            loading.style.display = 'none';
            list.innerHTML = `<div class="admin-empty"><span class="admin-empty__icon">❌</span><div class="admin-empty__text">${escapeHtml(err.message)}</div></div>`;
        }
    }

    function renderContacts() {
        const list = document.getElementById('contactsList');

        let filtered = contactsData;

        if (contactsStatusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === contactsStatusFilter);
        }

        if (contactsSearch) {
            const q = contactsSearch.toLowerCase();
            filtered = filtered.filter(c =>
                (c.name || '').toLowerCase().includes(q) ||
                (c.phone || '').toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            list.innerHTML = `
                <div class="admin-empty">
                    <span class="admin-empty__icon">🔍</span>
                    <div class="admin-empty__text">${contactsData.length === 0 ? 'Заявок пока нет' : 'Ничего не найдено'}</div>
                </div>`;
            return;
        }

        list.innerHTML = filtered.map(c => `
            <div class="admin-item">
                <div class="admin-item__id">#${c.id}</div>
                <div class="admin-item__body">
                    <div class="admin-item__title">${escapeHtml(c.name)}</div>
                    <div class="admin-item__meta">
                        <span>📞 ${escapeHtml(c.phone)}</span>
                        <span>🕒 ${formatDate(c.created_at)}</span>
                    </div>
                    ${c.message ? `<div class="admin-item__details">${escapeHtml(c.message)}</div>` : ''}
                </div>
                <div class="admin-item__actions">
                    ${statusSelect(c.status, CONTACT_STATUSES, 'contact', c.id)}
                    <button class="btn btn-danger btn-sm" data-delete-entity="contact" data-id="${c.id}">Удалить</button>
                </div>
            </div>
        `).join('');

        bindStatusSelects();
        bindDeleteButtons();
    }

    document.getElementById('contactsSearch')?.addEventListener('input', function() {
        contactsSearch = this.value.trim();
        renderContacts();
    });

    document.getElementById('contactsFilter')?.addEventListener('change', function() {
        contactsStatusFilter = this.value;
        renderContacts();
    });

    // ============================================================
    // ТОВАРЫ
    // ============================================================
    let productsData = [];
    let productsSearch = '';
    let productsCategoryFilter = 'all';
    let productsStatusFilter = 'all';

    async function loadProducts() {
        const list = document.getElementById('productsList');
        const loading = document.getElementById('productsLoading');
        loading.style.display = 'block';
        list.innerHTML = '';

        try {
            productsData = await apiFetch('/admin/products');
            loading.style.display = 'none';
            renderProducts();
        } catch (err) {
            loading.style.display = 'none';
            list.innerHTML = `<div class="admin-empty"><span class="admin-empty__icon">❌</span><div class="admin-empty__text">${escapeHtml(err.message)}</div></div>`;
        }
    }

    function renderProducts() {
        const list = document.getElementById('productsList');

        let filtered = productsData;

        if (productsCategoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === productsCategoryFilter);
        }

        if (productsStatusFilter !== 'all') {
            const wantActive = productsStatusFilter === 'active';
            filtered = filtered.filter(p => (p.is_active === true) === wantActive);
        }

        if (productsSearch) {
            const q = productsSearch.toLowerCase();
            filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(q));
        }

        if (filtered.length === 0) {
            list.innerHTML = `
                <div class="admin-empty">
                    <span class="admin-empty__icon">🔍</span>
                    <div class="admin-empty__text">${productsData.length === 0 ? 'Товаров пока нет' : 'Ничего не найдено'}</div>
                </div>`;
            return;
        }

        list.innerHTML = filtered.map(p => `
            <div class="admin-item">
                <div class="admin-item__id">#${p.id}</div>
                <div class="admin-item__body">
                    <div class="admin-item__title">${escapeHtml(p.name)}</div>
                    <div class="admin-item__meta">
                        <span>💰 ${formatPrice(p.price)}</span>
                        ${p.category ? `<span>📁 ${escapeHtml(p.category)}</span>` : ''}
                        <span>${p.is_active ? '✅ Активен' : '❌ Скрыт'}</span>
                    </div>
                    ${p.description ? `<div class="admin-item__details">${escapeHtml(p.description)}</div>` : ''}
                </div>
                <div class="admin-item__actions">
                    <button class="btn btn-outline btn-sm" data-edit-product="${p.id}">Изменить</button>
                    <button class="btn btn-outline btn-sm" data-toggle-product="${p.id}" data-active="${p.is_active}">
                        ${p.is_active ? 'Скрыть' : 'Показать'}
                    </button>
                    <button class="btn btn-danger btn-sm" data-delete-entity="product" data-id="${p.id}">Удалить</button>
                </div>
            </div>
        `).join('');

        bindDeleteButtons();
        bindToggleProductButtons();
        bindEditProductButtons(productsData);
    }

    document.getElementById('productsSearch')?.addEventListener('input', function() {
        productsSearch = this.value.trim();
        renderProducts();
    });

    document.getElementById('productsCategoryFilter')?.addEventListener('change', function() {
        productsCategoryFilter = this.value;
        renderProducts();
    });

    document.getElementById('productsStatusFilter')?.addEventListener('change', function() {
        productsStatusFilter = this.value;
        renderProducts();
    });

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================================
    loadStats();
    loadOrders();
    loadContacts();
    loadProducts();
}

// ============================================================
// СТРАНИЦА ЛОГИНА
// ============================================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const errorBox = document.getElementById('loginError');
    const submitBtn = document.getElementById('submitBtn');

    const user = getUser();
    if (user && user.role === 'admin' && getToken()) {
        window.location.href = 'index.html';
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorBox.classList.remove('visible');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Вход...';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const res = await fetch(API_BASE + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Ошибка входа');

            if (data.user.role !== 'admin') {
                throw new Error('У вас нет прав администратора');
            }

            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));

            window.location.href = 'index.html';
        } catch (err) {
            console.error('Ошибка входа:', err);
            errorBox.textContent = err.message;
            errorBox.classList.add('visible');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти';
        }
    });
}