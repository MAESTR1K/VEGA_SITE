// ============================================================
// БУРГЕР-МЕНЮ
// ============================================================
const burger = document.getElementById('burgerBtn');
const nav = document.getElementById('mobileNav');

if (burger && nav) {
    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('active');
        burger.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') &&
            !nav.contains(e.target) &&
            !burger.contains(e.target)) {
            nav.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            nav.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ============================================================
// КРАСИВЫЕ УВЕДОМЛЕНИЯ (TOAST)
// ============================================================
function showToast(message, type = 'info') {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span class="toast__icon">${icons[type] || 'ℹ️'}</span>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// ПЛАВНАЯ ПРОКРУТКА
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// ============================================================
// ФОРМА ОБРАТНОЙ СВЯЗИ
// ============================================================
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const message = document.getElementById('message')?.value.trim();

        if (!name || !phone) {
            showToast('Заполните имя и телефон', 'error');
            return;
        }

        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, message })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Ошибка отправки');
            }

            showToast('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
            form.reset();
        } catch (err) {
            console.error('Ошибка:', err);
            showToast(err.message || 'Не удалось отправить заявку', 'error');
        }
    });
}

// ============================================================
// МАСКА ТЕЛЕФОНА
// ============================================================
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        let formatted = '';
        if (value.length > 0) {
            formatted = '+7 (';
            if (value.length > 1) formatted += value.slice(1, 4);
            if (value.length > 4) formatted += ') ' + value.slice(4, 7);
            if (value.length > 7) formatted += '-' + value.slice(7, 9);
            if (value.length > 9) formatted += '-' + value.slice(9, 11);
        }
        this.value = formatted;
    });
});

// ============================================================
// МОДАЛЬНЫЕ ОКНА БЛОГА
// ============================================================
const modals = document.querySelectorAll('.modal-overlay:not(.confirm-overlay)');
const openTriggers = document.querySelectorAll('.open-modal, .blog__post');

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    modals.forEach(modal => modal.classList.remove('active'));
    document.body.style.overflow = '';
}

openTriggers.forEach(el => {
    el.addEventListener('click', function(e) {
        const modalId = this.dataset.modal || this.closest('.blog__post')?.dataset.modal;
        if (modalId) {
            e.preventDefault();
            openModal(modalId);
        }
    });
});

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal(this.closest('.modal-overlay'));
    });
});

modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) closeModal(this);
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAllModals();
});

// ============================================================
// АНИМАЦИЯ ПРИ СКРОЛЛЕ
// ============================================================
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card, .advantage, .about__grid, .history__grid, .steps__grid, .blog__grid, .contacts__grid, .school__inner')
    .forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

// ============================================================
// ГАЛЕРЕИ
// ============================================================
function initGallery(trackId, prevId, nextId, dotsId) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsContainer = document.getElementById(dotsId);

    if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

    const slides = track.querySelectorAll('img');
    const totalSlides = slides.length;
    if (totalSlides === 0) return;

    let currentIndex = 0;
    let autoplayInterval = null;

    dotsContainer.innerHTML = '';

    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('span');

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 4000);
    }

    function stopAutoplay() {
        if (autoplayInterval) { clearInterval(autoplayInterval); autoplayInterval = null; }
    }

    prevBtn.addEventListener('click', () => { goToSlide(currentIndex - 1); stopAutoplay(); setTimeout(startAutoplay, 5000); });
    nextBtn.addEventListener('click', () => { goToSlide(currentIndex + 1); stopAutoplay(); setTimeout(startAutoplay, 5000); });

    const gallery = track.closest('.gallery');
    if (gallery) {
        gallery.addEventListener('mouseenter', stopAutoplay);
        gallery.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
}

// ============================================================
// ДАННЫЕ ТОВАРОВ
// ============================================================
// const PRODUCTS = [
//     { id: 1, name: 'VEGA® PREMIUM 190 ST', price: 66000, img: 'фото/plenki/190prem.jpg', desc: 'Глянцевая плёнка для тёмных авто. Толщина 190 мкм.' },
//     { id: 2, name: 'VEGA® PREMIUM 230 ST', price: 83000, img: 'фото/plenki/230prem.jpg', desc: 'Глянцевая плёнка для тёмных авто. Толщина 230 мкм.' },
//     { id: 3, name: 'VEGA® PREMIUM 290 ST', price: 129000, img: 'фото/plenki/290prem.jpg', desc: 'Глянцевая плёнка для тёмных авто. Толщина 290 мкм.' },
//     { id: 4, name: 'VEGA® PREMIUM 350 HT', price: 190000, img: 'фото/plenki/350prem.jpg', desc: 'Сверхпрочная глянцевая плёнка. Толщина 350 мкм.' },
//     { id: 5, name: 'VEGA® PREMIUM 190 HT 1.82', price: 110000, img: 'фото/plenki/190_182gloss.jpg', desc: 'Глянцевая плёнка шириной 1.82 м.' },
//     { id: 6, name: 'VEGA® ULTIMA GLOSS 200', price: 65000, img: 'фото/plenki/ultima200.png', desc: 'Глянцевая плёнка для светлых авто. Толщина 200 мкм.' },
//     { id: 7, name: 'VEGA® ULTIMA GLOSS 215', price: 70000, img: 'фото/plenki/ultima215.png', desc: 'Глянцевая плёнка для светлых авто. Толщина 215 мкм.' },
//     { id: 8, name: 'VEGA® PREMIUM 190 MATTE HT', price: 74000, img: 'фото/plenki/matt190.jpg', desc: 'Матовая плёнка, высокая термостойкость. 190 мкм.' },
//     { id: 9, name: 'VEGA® PREMIUM 190 SATIN HT', price: 74000, img: 'фото/plenki/satin190.jpg', desc: 'Сатиновая плёнка, уникальный блеск. 190 мкм.' },
//     { id: 10, name: 'VEGA® 190 SATIN PRO', price: 54000, img: 'фото/plenki/satin_pro190.jpeg', desc: 'Сатиновая плёнка Pro-серии. 190 мкм.' },
//     { id: 11, name: 'VEGA® 190 ST PRO', price: 46000, img: 'фото/plenki/pro190.jpg', desc: 'Глянцевая плёнка Pro-серии для тёмных авто.' },
//     { id: 12, name: 'VEGA® 190 HT PRO', price: 46000, img: 'фото/plenki/ht_pro190.jpg', desc: 'Глянцевая плёнка Pro-серии для светлых авто.' },
//     { id: 13, name: 'VEGA® COLOR PPF PREMIUM', price: 0, img: 'фото/plenki/color_ppf.jpg', desc: 'Цветная плёнка. Более 60 оттенков. 200 мкм.' },
//     { id: 14, name: 'VEGA® COLOR PPF', price: 0, img: 'фото/plenki/red_color_ppf.jpg', desc: 'Цветная полиуретановая плёнка. Более 70 оттенков.' },
//     { id: 15, name: 'VEGA® ULTIMA COLOR PPF', price: 0, img: 'фото/plenki/ultima_color_ppf.png', desc: 'Цветная плёнка премиум-класса. Более 80 цветов.' },
//     { id: 16, name: 'Образцы VEGA® COLOR PREMIUM', price: 0, img: 'фото/plenki/veer_color_prem.jpg', desc: 'Веер с образцами цветов премиальной линейки.' },
//     { id: 17, name: 'Образцы VEGA® COLOR', price: 0, img: 'фото/plenki/color.png', desc: 'Веер с образцами цветов. Более 60 вариантов.' },
//     { id: 18, name: 'Установочный концентрат', price: 800, img: 'фото/accsesuar/ust_konc.jpg', desc: 'Для приготовления рабочего раствора при установке плёнок.' },
//     { id: 19, name: 'Установочный гель', price: 800, img: 'фото/accsesuar/gel.jpg', desc: 'Для быстрой локальной адгезии при оклейке сложных деталей.' },
//     { id: 20, name: 'Ракель VEGA', price: 500, img: 'фото/accsesuar/rakel.jpg', desc: 'Для удаления влаги из-под плёнки при установке.' },
//     { id: 21, name: 'Лопатка VEGA', price: 0, img: 'фото/accsesuar/lopata.jpg', desc: 'Для точечной работы с плёнкой на углах.' },
//     { id: 22, name: 'Футболка бежевая', price: 5000, img: 'фото/merch/bej.jpg', desc: 'Фирменная футболка VEGA. Цвет: бежевый.' },
//     { id: 23, name: 'Футболка зелёная', price: 5000, img: 'фото/merch/green.jpg', desc: 'Фирменная футболка VEGA. Цвет: зелёный.' },
//     { id: 24, name: 'Футболка красная', price: 5000, img: 'фото/merch/red.jpg', desc: 'Фирменная футболка VEGA. Цвет: красный.' },
//     { id: 25, name: 'Футболка серая', price: 5000, img: 'фото/merch/grey.jpg', desc: 'Фирменная футболка VEGA. Цвет: серый.' },
// ];
// ============================================================
// ЗАГРУЗКА ТОВАРОВ ИЗ API
// ============================================================
let PRODUCTS = [];
let productsLoaded = false;
let productsLoadingPromise = null;

async function loadProductsFromAPI() {
    if (productsLoaded) return PRODUCTS;
    if (productsLoadingPromise) return productsLoadingPromise;

    productsLoadingPromise = (async () => {
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Ошибка загрузки товаров');
            const data = await res.json();

            PRODUCTS = data.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                img: p.img,
                desc: p.description,
                category: p.category
            }));

            productsLoaded = true;
            console.log(`✅ Загружено ${PRODUCTS.length} товаров из API`);
            return PRODUCTS;
        } catch (err) {
            console.error('❌ Не удалось загрузить товары:', err);
            // Фолбэк — пустой массив
            PRODUCTS = [];
            productsLoaded = true;
            return PRODUCTS;
        }
    })();

    return productsLoadingPromise;
}

// Автозагрузка при старте
loadProductsFromAPI();

// ============================================================
// КОРЗИНА (localStorage)
// ============================================================
function getCart() {
    try {
        const data = JSON.parse(localStorage.getItem('vega_cart') || '{}');
        if (Array.isArray(data)) {
            const newCart = {};
            data.forEach(id => {
                newCart[id] = (newCart[id] || 0) + 1;
            });
            localStorage.setItem('vega_cart', JSON.stringify(newCart));
            return newCart;
        }
        return data;
    } catch {
        return {};
    }
}

function saveCart(cart) {
    localStorage.setItem('vega_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    document.querySelectorAll('#cartCount').forEach(el => {
        el.textContent = count;
    });
}

function addToCart(productId) {
    const cart = getCart();
    const id = String(productId);
    cart[id] = (cart[id] || 0) + 1;
    saveCart(cart);
    showToast('Товар добавлен в корзину!', 'success');
}

function removeFromCart(productId) {
    const cart = getCart();
    const id = String(productId);
    delete cart[id];
    saveCart(cart);
}

function updateQuantity(productId, delta) {
    const cart = getCart();
    const id = String(productId);
    if (!cart[id]) return;

    cart[id] += delta;
    if (cart[id] <= 0) {
        delete cart[id];
    }
    saveCart(cart);
}

// ============================================================
// КНОПКИ "В КОРЗИНУ"
// ============================================================
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
        addToCart(this.dataset.id);
    });
});

// ============================================================
// СТРАНИЦА ТОВАРА
// ============================================================
const productContainer = document.getElementById('productContainer');
if (productContainer) {
    productContainer.innerHTML = '<div style="text-align:center; padding:60px; color:#888;">Загрузка товара...</div>';

    (async () => {
        await loadProductsFromAPI();

        const id = new URLSearchParams(window.location.search).get('id');
        const product = PRODUCTS.find(p => p.id == id);

        if (product) {
            productContainer.innerHTML = `
                <div class="product-page__image">
                    <img src="${product.img}" alt="${product.name}">
                </div>
                <div class="product-page__info">
                    <h1>${product.name}</h1>
                    <div class="product-page__price">${product.price > 0 ? product.price.toLocaleString('ru-RU') + ' ₽' : 'Цена по запросу'}</div>
                    <p class="product-page__desc">${product.desc}</p>
                    <div class="product-page__actions">
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">Добавить в корзину</button>
                        <a href="catalog.html" class="btn btn-outline">← Вернуться в каталог</a>
                    </div>
                </div>
            `;
            productContainer.querySelector('.add-to-cart').addEventListener('click', function() {
                addToCart(this.dataset.id);
            });
        } else {
            productContainer.innerHTML = '<p style="text-align:center; padding:60px;">Товар не найден</p>';
        }
    })();
}
// ============================================================
// КАТАЛОГ — РЕНДЕР ИЗ API
// ============================================================
const catalogContainer = document.getElementById('catalogContainer');

if (catalogContainer) {
    let catalogProducts = [];

    const CATEGORY_TITLES = {
        films: 'Плёнки VEGA PPF',
        accessories: 'Аксессуары и химия',
        merch: 'Мерч VEGA'
    };

    const CATEGORY_ORDER = ['films', 'accessories', 'merch'];

    function renderCatalog() {
        if (catalogProducts.length === 0) {
            catalogContainer.innerHTML = `
                <div style="text-align:center; padding:60px; color:#888;">
                    <p style="font-size:1.2rem;">Товаров пока нет</p>
                </div>
            `;
            return;
        }

        // Группируем по категориям
        const groups = {};

        catalogProducts.forEach(p => {
            const cat = p.category || 'other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });

        let html = '';

        CATEGORY_ORDER.forEach(cat => {
            if (!groups[cat] || groups[cat].length === 0) return;

            html += `<h3 class="category-title" data-category="${cat}">${CATEGORY_TITLES[cat] || cat}</h3>`;
            html += `<div class="products__grid" data-category="${cat}">`;

            groups[cat].forEach(p => {
                html += `
                    <div class="product-card" data-id="${p.id}">
                        <div class="product-card__image">
                            <img src="${p.img}" alt="${escapeHtml(p.name)}">
                        </div>
                        <h3 class="product-card__title">${escapeHtml(p.name)}</h3>
                        <p class="product-card__desc">${escapeHtml(p.desc || '')}</p>
                        <div class="product-card__price">${p.price > 0 ? p.price.toLocaleString('ru-RU') + ' ₽' : 'Цена по запросу'}</div>
                        <div class="product-card__actions">
                            <a href="product.html?id=${p.id}" class="btn btn-outline btn-sm">Подробнее</a>
                            <button class="btn btn-primary btn-sm add-to-cart" data-id="${p.id}">В корзину</button>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        });

        catalogContainer.innerHTML = html;

        // Навешиваем обработчики на кнопки "В корзину"
        catalogContainer.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                addToCart(this.dataset.id);
            });
        });

    }

    // Хелпер — экранирование (если ещё нет)
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Загружаем товары и рендерим
    (async () => {
        await loadProductsFromAPI();
        catalogProducts = PRODUCTS;
        renderCatalog();
    })();
}

// ============================================================
// СТРАНИЦА КОРЗИНЫ
// ============================================================
const cartContainer = document.getElementById('cartContainer');
if (cartContainer) {
    (async () => {
        await loadProductsFromAPI();
        renderCart();
    })();

    function renderCart() {
        const cart = getCart();
        const items = Object.entries(cart);

        if (items.length === 0) {
            cartContainer.innerHTML = `
                <div class="cart-empty">
                    <p>Корзина пуста</p>
                    <a href="catalog.html" class="btn btn-primary" style="margin-top:20px;">Перейти в каталог</a>
                </div>
            `;
            return;
        }

        let html = '';
        let total = 0;

        items.forEach(([id, qty]) => {
            const product = PRODUCTS.find(p => p.id == id);
            if (!product) return;

            const itemTotal = product.price * qty;
            total += itemTotal;

            const priceDisplay = product.price > 0 ? product.price.toLocaleString('ru-RU') + ' ₽ / шт' : 'Цена по запросу';

            html += `
                <div class="cart-item" data-id="${product.id}">
                    <div class="cart-item__image">
                        <img src="${product.img}" alt="${product.name}">
                    </div>
                    <div class="cart-item__info">
                        <div class="cart-item__title">${product.name}</div>
                        <div class="cart-item__unit-price">${priceDisplay}</div>
                    </div>
                    <div class="cart-item__qty">
                        <button class="qty-btn qty-btn--minus" data-id="${product.id}">−</button>
                        <span class="qty-value">${qty}</span>
                        <button class="qty-btn qty-btn--plus" data-id="${product.id}">+</button>
                    </div>
                    <div class="cart-item__price">${itemTotal > 0 ? itemTotal.toLocaleString('ru-RU') + ' ₽' : '—'}</div>
                    <button class="cart-item__remove" data-id="${product.id}">✕</button>
                </div>
            `;
        });

        html += `
            <div class="cart-total">
                <span>Итого:</span>
                <span>${total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div style="text-align:center; margin-top:24px;">
                <button class="btn btn-primary btn-large" id="checkoutBtn">Оформить заказ</button>
            </div>
        `;

        cartContainer.innerHTML = html;

        cartContainer.querySelectorAll('.qty-btn--plus').forEach(btn => {
            btn.addEventListener('click', () => {
                updateQuantity(btn.dataset.id, 1);
                renderCart();
            });
        });

        cartContainer.querySelectorAll('.qty-btn--minus').forEach(btn => {
            btn.addEventListener('click', () => {
                updateQuantity(btn.dataset.id, -1);
                renderCart();
            });
        });

        cartContainer.querySelectorAll('.cart-item__remove').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFromCart(btn.dataset.id);
                showToast('Товар удалён из корзины', 'info');
                renderCart();
            });
        });

        const checkoutBtn = document.getElementById('checkoutBtn');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => {
                    const cart = getCart();
                    if (Object.keys(cart).length === 0) {
                        showToast('Корзина пуста', 'error');
                        return;
                    }
                    window.location.href = 'checkout.html';
                });
            }
    }
}

// ============================================================
// ФИЛЬТР КАТАЛОГА
// ============================================================
function filterCatalog(category) {
    // Берём элементы В МОМЕНТ вызова — они динамические
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categoryTitles = document.querySelectorAll('.category-title');
    const productGrids = document.querySelectorAll('.products__grid[data-category]');

    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    categoryTitles.forEach(title => {
        if (category === 'all' || title.dataset.category === category) {
            title.classList.remove('hidden');
        } else {
            title.classList.add('hidden');
        }
    });

    productGrids.forEach(grid => {
        if (category === 'all' || grid.dataset.category === category) {
            grid.classList.remove('hidden');
        } else {
            grid.classList.add('hidden');
        }
    });
}

// Обработчики на кнопки фильтра — вешаем ОДИН РАЗ на document
// (делегирование, работает даже для динамических элементов)
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    e.preventDefault();
    filterCatalog(btn.dataset.category);
});

// Применяем фильтр из URL при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category') || 'all';
        // Небольшая задержка — ждём, пока каталог отрисуется
        setTimeout(() => filterCatalog(categoryFromUrl), 100);
    }
});

// ============================================================
// РЕГИСТРАЦИЯ / ВХОД
// ============================================================
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const switchToLogin = document.getElementById('switchToLogin');
const switchToRegister = document.getElementById('switchToRegister');

if (registerForm && loginForm) {
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            authTitle.textContent = 'Вход';
            authSubtitle.textContent = 'Войдите в свой аккаунт';
        });
    }

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authTitle.textContent = 'Регистрация';
            authSubtitle.textContent = 'Создайте аккаунт, чтобы отслеживать заказы';
        });
    }

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value.trim();

        if (!name || !email || !phone || !password) {
            showToast('Заполните все поля', 'error');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Ошибка регистрации');
            }

            localStorage.setItem('vega_token', data.token);
            localStorage.setItem('vega_user', JSON.stringify(data.user));

            showToast(`Спасибо, ${data.user.name}! Регистрация прошла успешно.`, 'success');
            registerForm.reset();

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (err) {
            console.error('Ошибка регистрации:', err);
            showToast(err.message || 'Не удалось зарегистрироваться', 'error');
        }
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !password) {
            showToast('Заполните все поля', 'error');
            return;
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Ошибка входа');
            }

            localStorage.setItem('vega_token', data.token);
            localStorage.setItem('vega_user', JSON.stringify(data.user));

            showToast(`Добро пожаловать, ${data.user.name}!`, 'success');
            loginForm.reset();

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (err) {
            console.error('Ошибка входа:', err);
            showToast(err.message || 'Не удалось войти', 'error');
        }
    });
}

// ============================================================
// АККАУНТ В ШАПКЕ — выпадашка и выход
// ============================================================
function updateAuthUI() {
    const headerUser = document.getElementById('headerUser');
    const loginBtn = document.getElementById('loginBtn');
    const dropdown = document.getElementById('userDropdown');
    const dropdownName = document.getElementById('dropdownName');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutConfirm = document.getElementById('logoutConfirm');
    const logoutCancel = document.getElementById('logoutCancel');
    const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');

    if (!headerUser || !loginBtn || !dropdown) return;

    const token = localStorage.getItem('vega_token');
    const userRaw = localStorage.getItem('vega_user');

    if (token && userRaw) {
        const user = JSON.parse(userRaw);

        loginBtn.textContent = user.name;
        loginBtn.href = '#';
        loginBtn.style.padding = '8px 18px';
        loginBtn.style.background = 'rgba(250,85,63,0.12)';
        loginBtn.style.borderColor = 'transparent';
        loginBtn.style.color = '#fa553f';
        loginBtn.style.fontWeight = '600';

        if (dropdownName) dropdownName.textContent = user.name;
        // Показываем пункт "Админка" только для админов
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            if (user.role === 'admin') {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        }

        loginBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        };

        document.addEventListener('click', function closeDropdown(e) {
            if (!headerUser.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                dropdown.classList.remove('active');
                if (logoutConfirm) logoutConfirm.classList.add('active');
            };
        }

        if (logoutConfirmBtn) {
            logoutConfirmBtn.onclick = () => {
                localStorage.removeItem('vega_token');
                localStorage.removeItem('vega_user');
                logoutConfirm.classList.remove('active');
                showToast('Вы вышли из аккаунта', 'info');
                setTimeout(() => window.location.reload(), 800);
            };
        }

        if (logoutCancel) {
            logoutCancel.onclick = () => {
                logoutConfirm.classList.remove('active');
            };
        }

        if (logoutConfirm) {
            logoutConfirm.addEventListener('click', (e) => {
                if (e.target === logoutConfirm) {
                    logoutConfirm.classList.remove('active');
                }
            });
        }

    } else {
        loginBtn.textContent = 'Войти';
        loginBtn.href = 'register.html';
        loginBtn.style.cssText = '';
        loginBtn.onclick = null;
            const adminLink = document.getElementById('adminLink');
        if (adminLink) adminLink.style.display = 'none';
    }
}

// ============================================================
// 3D-TILT НА КАРТОЧКАХ
// ============================================================
function initTilt() {
    const cards = document.querySelectorAll('.product-card, .catalog-preview__item');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ============================================================
// ПРОГРЕСС-БАР СКРОЛЛА
// ============================================================
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';
    });
}


// ============================================================
// СТРАНИЦА ОФОРМЛЕНИЯ ЗАКАЗА
// ============================================================
const checkoutForm = document.getElementById('checkoutForm');
const checkoutItems = document.getElementById('checkoutItems');
const checkoutTotal = document.getElementById('checkoutTotal');

if (checkoutForm && checkoutItems) {
    (async () => {
        await loadProductsFromAPI();

        const cart = getCart();
        const items = Object.entries(cart);

        if (items.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        const userRaw = localStorage.getItem('vega_user');
        if (userRaw) {
            const user = JSON.parse(userRaw);
            if (user.name) document.getElementById('checkoutName').value = user.name;
            if (user.phone) document.getElementById('checkoutPhone').value = user.phone;
            if (user.email) document.getElementById('checkoutEmail').value = user.email;
        }

        let total = 0;
        let html = '';

        items.forEach(([id, qty]) => {
            const product = PRODUCTS.find(p => p.id == id);
            if (!product) return;

            const itemTotal = product.price * qty;
            total += itemTotal;

            html += `
                <div class="checkout-item">
                    <span class="checkout-item__name">${product.name}</span>
                    <span class="checkout-item__qty">× ${qty}</span>
                    <span class="checkout-item__price">${itemTotal > 0 ? itemTotal.toLocaleString('ru-RU') + ' ₽' : '—'}</span>
                </div>
            `;
        });

        checkoutItems.innerHTML = html;
        checkoutTotal.innerHTML = `
            <span>Итого:</span>
            <span>${total.toLocaleString('ru-RU')} ₽</span>
        `;

        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('checkoutName').value.trim();
            const phone = document.getElementById('checkoutPhone').value.trim();
            const email = document.getElementById('checkoutEmail').value.trim();
            const address = document.getElementById('checkoutAddress').value.trim();
            const comment = document.getElementById('checkoutComment').value.trim();

            if (!name || !phone) {
                showToast('Заполните имя и телефон', 'error');
                return;
            }

            const orderItems = items.map(([id, qty]) => ({
                product_id: parseInt(id),
                qty: qty
            }));

            const token = localStorage.getItem('vega_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            try {
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        name,
                        phone,
                        email: email || null,
                        address: address || null,
                        comment: comment || null,
                        items: orderItems
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Ошибка оформления заказа');
                }

                localStorage.removeItem('vega_cart');
                updateCartCount();

                showToast('Заказ оформлен! Мы свяжемся с вами.', 'success');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } catch (err) {
                console.error('Ошибка заказа:', err);
                showToast(err.message || 'Не удалось оформить заказ', 'error');
            }
        });
    })();
}
// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateAuthUI();
    initGallery('galleryTrack', 'galleryPrev', 'galleryNext', 'galleryDots');
    initGallery('historyGalleryTrack', 'historyGalleryPrev', 'historyGalleryNext', 'historyGalleryDots');
    initTilt();
});






console.log('VEGA PPF — сайт загружен!');