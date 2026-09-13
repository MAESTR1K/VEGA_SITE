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
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        if (!name || !phone) {
            showToast('Заполните имя и телефон', 'error');
            return;
        }
        showToast('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
        form.reset();
    });
}

// ============================================================
// МАСКА ТЕЛЕФОНА (универсальная — для всех tel-полей)
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
// МОДАЛЬНЫЕ ОКНА
// ============================================================
const modals = document.querySelectorAll('.modal-overlay');
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

// Кнопки внутри модалок
document.querySelectorAll('.modal-window .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const modal = this.closest('.modal-overlay');
        if (modal) {
            closeModal(modal);
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                setTimeout(() => {
                    const target = document.querySelector(href);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }
    });
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
const PRODUCTS = [
    { id: 1, name: 'VEGA® PREMIUM 190 ST', price: 66000, img: 'фото/plenki/190prem.jpg', desc: 'Глянцевая плёнка для тёмных авто. Толщина 190 мкм.' },
    { id: 2, name: 'VEGA® PREMIUM 230 ST', price: 83000, img: 'фото/plenki/230prem.jpg', desc: 'Глянцевая плёнка для тёмных авто. Толщина 230 мкм.' },
    { id: 3, name: 'VEGA® PREMIUM 290 ST', price: 129000, img: 'фото/plenki/290prem.jpg', desc: 'Глянцевая плёнка для тёмных авто. Толщина 290 мкм.' },
    { id: 4, name: 'VEGA® PREMIUM 350 HT', price: 190000, img: 'фото/plenki/350prem.jpg', desc: 'Сверхпрочная глянцевая плёнка. Толщина 350 мкм.' },
    { id: 5, name: 'VEGA® PREMIUM 190 HT 1.82', price: 110000, img: 'фото/plenki/190_182gloss.jpg', desc: 'Глянцевая плёнка шириной 1.82 м.' },
    { id: 6, name: 'VEGA® ULTIMA GLOSS 200', price: 65000, img: 'фото/plenki/ultima200.png', desc: 'Глянцевая плёнка для светлых авто. Толщина 200 мкм.' },
    { id: 7, name: 'VEGA® ULTIMA GLOSS 215', price: 70000, img: 'фото/plenki/ultima215.png', desc: 'Глянцевая плёнка для светлых авто. Толщина 215 мкм.' },
    { id: 8, name: 'VEGA® PREMIUM 190 MATTE HT', price: 74000, img: 'фото/plenki/matt190.jpg', desc: 'Матовая плёнка, высокая термостойкость. 190 мкм.' },
    { id: 9, name: 'VEGA® PREMIUM 190 SATIN HT', price: 74000, img: 'фото/plenki/satin190.jpg', desc: 'Сатиновая плёнка, уникальный блеск. 190 мкм.' },
    { id: 10, name: 'VEGA® 190 SATIN PRO', price: 54000, img: 'фото/plenki/satin_pro190.jpeg', desc: 'Сатиновая плёнка Pro-серии. 190 мкм.' },
    { id: 11, name: 'VEGA® 190 ST PRO', price: 46000, img: 'фото/plenki/pro190.jpg', desc: 'Глянцевая плёнка Pro-серии для тёмных авто.' },
    { id: 12, name: 'VEGA® 190 HT PRO', price: 46000, img: 'фото/plenki/ht_pro190.jpg', desc: 'Глянцевая плёнка Pro-серии для светлых авто.' },
    { id: 13, name: 'VEGA® COLOR PPF PREMIUM', price: 0, img: 'фото/plenki/color_ppf.jpg', desc: 'Цветная плёнка. Более 60 оттенков. 200 мкм.' },
    { id: 14, name: 'VEGA® COLOR PPF', price: 0, img: 'фото/plenki/red_color_ppf.jpg', desc: 'Цветная полиуретановая плёнка. Более 70 оттенков.' },
    { id: 15, name: 'VEGA® ULTIMA COLOR PPF', price: 0, img: 'фото/plenki/ultima_color_ppf.png', desc: 'Цветная плёнка премиум-класса. Более 80 цветов.' },
    { id: 16, name: 'Образцы VEGA® COLOR PREMIUM', price: 0, img: 'фото/plenki/veer_color_prem.jpg', desc: 'Веер с образцами цветов премиальной линейки.' },
    { id: 17, name: 'Образцы VEGA® COLOR', price: 0, img: 'фото/plenki/color.png', desc: 'Веер с образцами цветов. Более 60 вариантов.' },
    { id: 18, name: 'Установочный концентрат', price: 800, img: 'фото/accsesuar/ust_konc.jpg', desc: 'Для приготовления рабочего раствора при установке плёнок.' },
    { id: 19, name: 'Установочный гель', price: 800, img: 'фото/accsesuar/gel.jpg', desc: 'Для быстрой локальной адгезии при оклейке сложных деталей.' },
    { id: 20, name: 'Ракель VEGA', price: 500, img: 'фото/accsesuar/rakel.jpg', desc: 'Для удаления влаги из-под плёнки при установке.' },
    { id: 21, name: 'Лопатка VEGA', price: 0, img: 'фото/accsesuar/lopata.jpg', desc: 'Для точечной работы с плёнкой на углах.' },
    { id: 22, name: 'Футболка бежевая', price: 5000, img: 'фото/merch/bej.jpg', desc: 'Фирменная футболка VEGA. Цвет: бежевый.' },
    { id: 23, name: 'Футболка зелёная', price: 5000, img: 'фото/merch/green.jpg', desc: 'Фирменная футболка VEGA. Цвет: зелёный.' },
    { id: 24, name: 'Футболка красная', price: 5000, img: 'фото/merch/red.jpg', desc: 'Фирменная футболка VEGA. Цвет: красный.' },
    { id: 25, name: 'Футболка серая', price: 5000, img: 'фото/merch/grey.jpg', desc: 'Фирменная футболка VEGA. Цвет: серый.' },
];

// ============================================================
// КОРЗИНА (localStorage) — с количеством
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
// ОБРАБОТКА КНОПОК "В КОРЗИНУ"
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
        productContainer.innerHTML = '<p>Товар не найден</p>';
    }
}

// ============================================================
// СТРАНИЦА КОРЗИНЫ — с количеством
// ============================================================
const cartContainer = document.getElementById('cartContainer');
if (cartContainer) {
    renderCart();

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
                <a href="index.html#contacts" class="btn btn-primary btn-large">Оформить заказ</a>
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
    }
}

// ============================================================
// ФИЛЬТР КАТАЛОГА
// ============================================================
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryTitles = document.querySelectorAll('.category-title');
const productGrids = document.querySelectorAll('.products__grid[data-category]');

function filterCatalog(category) {
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

filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        filterCatalog(this.dataset.category);
    });
});

if (filterButtons.length > 0) {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category') || 'all';
    filterCatalog(categoryFromUrl);
}

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ РЕГИСТРАЦИЯ / ВХОД
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

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value.trim();

        if (!name || !email || !phone || !password) {
            showToast('Заполните все поля', 'error');
            return;
        }

        showToast(`Спасибо, ${name}! Регистрация прошла успешно (демо-режим).`, 'success');
        registerForm.reset();
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !password) {
            showToast('Заполните все поля', 'error');
            return;
        }

        showToast('Добро пожаловать! (демо-режим)', 'success');
        loginForm.reset();
    });
}

// ============================================================
// 3D-TILT НА КАРТОЧКАХ (исправленный — мягче)
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
// ИНИЦИАЛИЗАЦИЯ (всё в одном месте)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initGallery('galleryTrack', 'galleryPrev', 'galleryNext', 'galleryDots');
    initGallery('historyGalleryTrack', 'historyGalleryPrev', 'historyGalleryNext', 'historyGalleryDots');
    initTilt();
});

console.log('VEGA PPF — сайт загружен!');