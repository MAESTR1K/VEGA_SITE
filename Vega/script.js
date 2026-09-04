// 1. БУРГЕР-МЕНЮ
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.classList.toggle('active');
    });
}

// 2. ПЛАВНАЯ ПРОКРУТКА
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Закрываем бургер-меню (если есть)
            const nav = document.querySelector('.nav');
            const burger = document.querySelector('.burger');
            if (nav) nav.classList.remove('active');
            if (burger) burger.classList.remove('active');
        }
    });
});

// 3. ФОРМА ОБРАТНОЙ СВЯЗИ
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        if (!name || !phone) {
            alert('Пожалуйста, заполните имя и телефон');
            return;
        }
        alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
        form.reset();
    });
}

// 4. МАСКА ТЕЛЕФОНА
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
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
}

// 5. МОДАЛЬНЫЕ ОКНА
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
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
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
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// 5.1. КНОПКИ ВНУТРИ МОДАЛОК — закрывают модалку и переходят по ссылке
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
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300); 
            }
        }
    });
});

// 6. АНИМАЦИЯ ПРИ СКРОЛЛЕ
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card, .advantage, .about__grid, .history__grid, .steps__grid, .blog__grid, .contacts__grid')
    .forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

// 7. ГАЛЕРЕИ (ABOUT + HISTORY)
function initGallery(trackId, prevId, nextId, dotsId) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsContainer = document.getElementById(dotsId);

    if (!track || !prevBtn || !nextBtn || !dotsContainer) {
        console.warn('⚠️ Галерея не найдена:', trackId);
        return;
    }

    const slides = track.querySelectorAll('img');
    const totalSlides = slides.length;
    if (totalSlides === 0) {
        console.warn('⚠️ В галерее нет фото:', trackId);
        return;
    }

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
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 4000);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        stopAutoplay();
        setTimeout(startAutoplay, 5000);
    });

    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        stopAutoplay();
        setTimeout(startAutoplay, 5000);
    });

    const gallery = track.closest('.gallery');
    if (gallery) {
        gallery.addEventListener('mouseenter', stopAutoplay);
        gallery.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();

    return { goToSlide, startAutoplay, stopAutoplay };
}

// 8. ЗАПУСК ГАЛЕРЕЙ ПОСЛЕ ЗАГРУЗКИ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    initGallery('galleryTrack', 'galleryPrev', 'galleryNext', 'galleryDots');
    
    initGallery('historyGalleryTrack', 'historyGalleryPrev', 'historyGalleryNext', 'historyGalleryDots');
});

console.log('✅ VEGA PPF — сайт загружен!');