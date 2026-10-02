<div align="center">

# 🏎️ VEGA PPF

**Сайт российского бренда антигравийных плёнок с 3D-конфигуратором**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-00FF00?style=for-the-badge)](https://maestr1k.github.io/vega-ppf/)
[![GitHub](https://img.shields.io/badge/📦_GitHub-181717?style=for-the-badge&logo=github)](https://github.com/MAESTR1K/vega-ppf)

</div>

---

## 📋 О проекте

Full-stack сайт для бренда **VEGA Paint Protection Film** — российского производителя полиуретановых защитных плёнок для автомобилей.

Проект включает полный цикл: от презентационного сайта до интернет-магазина с админ-панелью и 3D-визуализацией.

---

## ✨ Возможности

### 🎨 Frontend
- **3D-конфигуратор автомобиля** на Three.js — модель Lamborghini Urus с 100+ цветами плёнок, металлик и блёстки
- Адаптивный дизайн (desktop / tablet / mobile)
- Каталог товаров с фильтрами по категориям
- Карточка товара с описанием и характеристиками
- Корзина с сохранением в localStorage
- Модальные окна, галереи, тосты, анимации при скролле
- Формы: заявка, регистрация, вход, оформление заказа

### ⚙️ Backend
- REST API на **Node.js + Express**
- **PostgreSQL** для хранения товаров, заказов, пользователей, заявок
- JWT-авторизация
- Хэширование паролей (bcrypt)
- Загрузка изображений товаров (multer)

### 🛠️ Админ-панель
- Дашборд со статистикой (заказы, выручка, заявки, товары, пользователи)
- Управление заказами: список, поиск, фильтр по статусу, удаление
- Управление заявками с формы контактов
- CRUD товаров: добавление, редактирование, скрытие, удаление
- Загрузка фото через drag-and-drop

---

## 🧰 Стек

| Слой | Технологии |
|------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Three.js |
| **Backend** | Node.js, Express, JWT, bcrypt, multer |
| **База данных** | PostgreSQL |
| **Инструменты** | Git, Figma, VS Code |

---

## 🚀 Запуск локально

### 1. Клонировать репозиторий

```bash
git clone https://github.com/MAESTR1K/vega-ppf.git
cd vega-ppf
```

### 2. Установить PostgreSQL

Создать базу данных `vega_ppf`.

### 3. Настроить `.env`

В папке `server/` создать файл `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=ваш_пароль
DB_NAME=vega_ppf
JWT_SECRET=ваш_секретный_ключ
```

### 4. Установить зависимости и запустить сервер

```bash
cd server
npm install
node server.js
```

### 5. Открыть сайт

```
http://localhost:3000
```

---

## 📁 Структура

```
vega-ppf/
├── index.html           # Главная
├── catalog.html         # Каталог
├── product.html         # Карточка товара
├── cart.html            # Корзина
├── checkout.html        # Оформление заказа
├── register.html        # Регистрация / вход
├── configurator.html    # 3D-конфигуратор
├── admin/               # Админ-панель
├── data/
│   ├── products.json    # Демо-товары
│   └── colors.json      # Палитра плёнок
├── server/              # Backend
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   └── schema.sql
├── style.css
├── script.js
└── фото/                # Изображения
```

---

## 📸 Скриншоты

### Главная
[![Главная](https://github.com/MAESTR1K/VEGA_SITE/issues/1#issue-5681666727)

### 3D-конфигуратор
![Конфигуратор](https://github.com/MAESTR1K/VEGA_SITE/issues/2#issue-5681676895)

### Админ-панель
![Админка](https://github.com/MAESTR1K/VEGA_SITE/issues/3#issue-5681680258)

---

## 📝 Лицензия

Проект создан в учебных и коммерческих целях. Все права на бренд VEGA PPF принадлежат правообладателю.

---

<div align="center">

**Сделано Максимом Масловым**

</div>
