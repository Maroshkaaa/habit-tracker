// Глобальные данные
let userData = {
    userId: null,
    name: "Пользователь",
    username: "user",
    bio: "Привет! Я использую Habit для развития полезных привычек.",
    points: 0,
    level: 1,
    habits: [],
    achievements: [
        { id: 1, name: "Новичок", description: "Создана первая привычка", earned: false, icon: "bi-star-fill", progress: 0, total: 1, reward: 50 },
        { id: 2, name: "Стратег", description: "5 активных привычек", earned: false, icon: "bi-grid-3x3-gap-fill", progress: 0, total: 5, reward: 100 },
        { id: 3, name: "Мастер", description: "10 активных привычек", earned: false, icon: "bi-trophy-fill", progress: 0, total: 10, reward: 200 },
        { id: 4, name: "7 дней серии", description: "Непрерывное выполнение 7 дней", earned: false, icon: "bi-lightning-charge-fill", progress: 0, total: 7, reward: 150 },
        { id: 5, name: "30 дней", description: "Месяц без пропусков", earned: false, icon: "bi-calendar-check-fill", progress: 0, total: 30, reward: 500 },
        { id: 6, name: "100 дней", description: "100 дней непрерывно", earned: false, icon: "bi-award-fill", progress: 0, total: 100, reward: 1000 },
        { id: 7, name: "Ранняя пташка", description: "Выполнить 10 утренних привычек до 9 утра", earned: false, icon: "bi-brightness-high-fill", progress: 0, total: 10, reward: 150 },
        { id: 8, name: "Спортсмен", description: "Выполнить 50 спортивных привычек", earned: false, icon: "bi-bicycle", progress: 0, total: 50, reward: 300 },
        { id: 9, name: "Книжный червь", description: "Выполнить 30 привычек по чтению", earned: false, icon: "bi-book-fill", progress: 0, total: 30, reward: 200 },
        { id: 10, name: "Продуктивный", description: "Выполнить все привычки за день 7 раз", earned: false, icon: "bi-check2-all", progress: 0, total: 7, reward: 250 },
        { id: 11, name: "ЗОЖ-марафон", description: "Накопить 1000 очков здоровья", earned: false, icon: "bi-heart-fill", progress: 0, total: 1000, reward: 400 },
        { id: 12, name: "Всесторонний", description: "Иметь привычки из 5 разных категорий", earned: false, icon: "bi-globe", progress: 0, total: 5, reward: 300 }
    ],
    activity: [],
    dailyChallengesCompleted: 0,
    friends: [],
    storiesShared: 0,
    storiesLiked: 0,
    settings: { notifications: true, darkMode: false, language: 'ru' }
};

let authData = { currentUser: null, users: [] };
let moderationData = { pendingHabits: [], approvedHabits: [], rejectedHabits: [] };

// Глобальный обработчик ошибок
window.addEventListener('error', function(e) {
    console.error('Поймана ошибка:', e.error);
    if (typeof showNotification === 'function') {
        showNotification('⚠️ Произошла ошибка. Пожалуйста, обновите страницу.', 'warning');
    }
    return false;
});

// Обработка непойманных промисов
window.addEventListener('unhandledrejection', function(e) {
    console.error('Необработанный промис:', e.reason);
    if (typeof showNotification === 'function') {
        showNotification('⚠️ Произошла ошибка. Пожалуйста, обновите страницу.', 'warning');
    }
});

// Загрузка данных из localStorage
function loadUserData() {
    try {
        console.log('Загрузка данных...');
        
        const savedAuth = localStorage.getItem('habitTrackerAuth');
        if (savedAuth) {
            authData = JSON.parse(savedAuth);
            console.log('Auth данные загружены:', authData);
        } else {
            // Инициализируем authData с тестовыми пользователями
            authData = {
                currentUser: null,
                users: [
                    {
                        id: 1,
                        username: 'user',
                        password: 'user123',
                        email: 'user@example.com',
                        role: 'user',
                        name: 'Пользователь',
                        avatar: null,
                        createdAt: new Date().toISOString(),
                        settings: { notifications: true, darkMode: false, language: 'ru' }
                    },
                    {
                        id: 2,
                        username: 'admin',
                        password: 'qwertyui',
                        email: 'admin@example.com',
                        role: 'admin',
                        name: 'Администратор',
                        avatar: null,
                        createdAt: new Date().toISOString(),
                        settings: { notifications: true, darkMode: false, language: 'ru' }
                    }
                ]
            };
            localStorage.setItem('habitTrackerAuth', JSON.stringify(authData));
            console.log('Созданы тестовые пользователи');
        }

        // Загружаем данные текущего пользователя
        if (authData.currentUser) {
            const allData = JSON.parse(localStorage.getItem('habitTrackerData')) || {};
            userData = allData[authData.currentUser.id] || {
                userId: authData.currentUser.id,
                name: authData.currentUser.name || authData.currentUser.username,
                username: authData.currentUser.username,
                bio: 'Привет! Я использую Habit для развития полезных привычек.',
                points: 0,
                level: 1,
                habits: [],
                achievements: [
                    { id: 1, name: "Новичок", description: "Создана первая привычка", earned: false, icon: "bi-star-fill", progress: 0, total: 1, reward: 50 },
                    { id: 2, name: "Стратег", description: "5 активных привычек", earned: false, icon: "bi-grid-3x3-gap-fill", progress: 0, total: 5, reward: 100 },
                    { id: 3, name: "Мастер", description: "10 активных привычек", earned: false, icon: "bi-trophy-fill", progress: 0, total: 10, reward: 200 },
                    { id: 4, name: "7 дней серии", description: "Непрерывное выполнение 7 дней", earned: false, icon: "bi-lightning-charge-fill", progress: 0, total: 7, reward: 150 },
                    { id: 5, name: "30 дней", description: "Месяц без пропусков", earned: false, icon: "bi-calendar-check-fill", progress: 0, total: 30, reward: 500 },
                    { id: 6, name: "100 дней", description: "100 дней непрерывно", earned: false, icon: "bi-award-fill", progress: 0, total: 100, reward: 1000 },
                    { id: 7, name: "Ранняя пташка", description: "Выполнить 10 утренних привычек до 9 утра", earned: false, icon: "bi-brightness-high-fill", progress: 0, total: 10, reward: 150 },
                    { id: 8, name: "Спортсмен", description: "Выполнить 50 спортивных привычек", earned: false, icon: "bi-bicycle", progress: 0, total: 50, reward: 300 },
                    { id: 9, name: "Книжный червь", description: "Выполнить 30 привычек по чтению", earned: false, icon: "bi-book-fill", progress: 0, total: 30, reward: 200 },
                    { id: 10, name: "Продуктивный", description: "Выполнить все привычки за день 7 раз", earned: false, icon: "bi-check2-all", progress: 0, total: 7, reward: 250 },
                    { id: 11, name: "ЗОЖ-марафон", description: "Накопить 1000 очков здоровья", earned: false, icon: "bi-heart-fill", progress: 0, total: 1000, reward: 400 },
                    { id: 12, name: "Всесторонний", description: "Иметь привычки из 5 разных категорий", earned: false, icon: "bi-globe", progress: 0, total: 5, reward: 300 }
                ],
                activity: [],
                dailyChallengesCompleted: 0,
                friends: [],
                storiesShared: 0,
                storiesLiked: 0,
                settings: { notifications: true, darkMode: false, language: 'ru' }
            };
            console.log('User данные загружены для пользователя:', authData.currentUser.id);
        }

        // Загружаем данные модерации
        const savedModeration = localStorage.getItem('habitTrackerModeration');
        if (savedModeration) {
            moderationData = JSON.parse(savedModeration);
        } else {
            moderationData = { pendingHabits: [], approvedHabits: [], rejectedHabits: [] };
        }
        
        console.log('Модерация загружена:', moderationData);
        
        // Инициализируем публичный каталог
        initPublicCatalog();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Инициализация публичного каталога с готовыми привычками
function initPublicCatalog() {
    let catalog = JSON.parse(localStorage.getItem('habitPublicCatalog')) || [];
    if (catalog.length === 0) {
        catalog = [
            { id: 1001, name: "Ранний подъем", description: "Просыпайся до 9 утра и начинай день с энергией", time: "06:00", timeRange: { start: 360, end: 540 }, difficulty: 2, category: "health", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1002, name: "Утренняя зарядка", description: "10 минут легкой разминки после пробуждения", time: "07:00", timeRange: { start: 420, end: 540 }, difficulty: 1, category: "health", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1003, name: "Чтение 15 минут", description: "Читай книгу 15 минут каждый день", time: "21:00", timeRange: { start: 1260, end: 1380 }, difficulty: 1, category: "education", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1004, name: "Питьевой режим", description: "Выпивай 2 литра воды в течение дня", time: "09:00", timeRange: { start: 540, end: 1320 }, difficulty: 2, category: "health", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1005, name: "Медитация", description: "5 минут осознанности в тишине", time: "08:00", timeRange: { start: 480, end: 600 }, difficulty: 1, category: "mindfulness", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1006, name: "Планирование дня", description: "Записывай задачи на день утром", time: "08:30", timeRange: { start: 510, end: 570 }, difficulty: 1, category: "work", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1007, name: "Вечерний дневник", description: "Записывай 3 хороших события за день", time: "22:00", timeRange: { start: 1320, end: 1410 }, difficulty: 1, category: "mindfulness", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1008, name: "Изучение языка", description: "10 новых слов иностранного языка", time: "19:00", timeRange: { start: 1140, end: 1260 }, difficulty: 2, category: "education", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1009, name: "Прогулка на свежем воздухе", description: "30 минут пешком", time: "18:00", timeRange: { start: 1080, end: 1260 }, difficulty: 2, category: "health", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1010, name: "Отказ от соцсетей", description: "Не заходить в соцсети 1 час до сна", time: "21:00", timeRange: { start: 1260, end: 1410 }, difficulty: 3, category: "productivity", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1011, name: "Уборка 10 минут", description: "Быстрая уборка в доме", time: "20:00", timeRange: { start: 1200, end: 1320 }, difficulty: 1, category: "hobby", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1012, name: "Растяжка", description: "5 минут растяжки после сна", time: "07:30", timeRange: { start: 450, end: 540 }, difficulty: 1, category: "health", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1013, name: "Здоровый завтрак", description: "Приготовь полезный завтрак", time: "08:00", timeRange: { start: 480, end: 600 }, difficulty: 2, category: "health", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1014, name: "Нет сладкому", description: "День без сахара и сладостей", time: "00:00", timeRange: { start: 0, end: 1440 }, difficulty: 3, category: "health", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() },
            { id: 1015, name: "Зарядка для глаз", description: "Упражнения для глаз при работе за компьютером", time: "15:00", timeRange: { start: 540, end: 1080 }, difficulty: 1, category: "health", usedCount: 0, createdByName: "Система", createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('habitPublicCatalog', JSON.stringify(catalog));
        console.log('Публичный каталог инициализирован с 15 привычками');
    }
}

// Сохранение данных
function saveUserData() {
    try {
        if (authData.currentUser) {
            const allData = JSON.parse(localStorage.getItem('habitTrackerData')) || {};
            allData[authData.currentUser.id] = userData;
            localStorage.setItem('habitTrackerData', JSON.stringify(allData));
        }
        
        localStorage.setItem('habitTrackerAuth', JSON.stringify(authData));
        localStorage.setItem('habitTrackerModeration', JSON.stringify(moderationData));
        
        console.log('Данные сохранены');
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
    }
}

// Функция входа
function login(username, password) {
    try {
        console.log('Попытка входа:', username);
        
        loadUserData();
        
        const user = authData.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            authData.currentUser = { ...user };
            delete authData.currentUser.password;
            
            const allData = JSON.parse(localStorage.getItem('habitTrackerData')) || {};
            userData = allData[user.id] || {
                userId: user.id,
                name: user.name || user.username,
                username: user.username,
                bio: 'Привет! Я использую Habit для развития полезных привычек.',
                points: 0,
                level: 1,
                habits: [],
                achievements: [
                    { id: 1, name: "Новичок", description: "Создана первая привычка", earned: false, icon: "bi-star-fill", progress: 0, total: 1, reward: 50 },
                    { id: 2, name: "Стратег", description: "5 активных привычек", earned: false, icon: "bi-grid-3x3-gap-fill", progress: 0, total: 5, reward: 100 },
                    { id: 3, name: "Мастер", description: "10 активных привычек", earned: false, icon: "bi-trophy-fill", progress: 0, total: 10, reward: 200 },
                    { id: 4, name: "7 дней серии", description: "Непрерывное выполнение 7 дней", earned: false, icon: "bi-lightning-charge-fill", progress: 0, total: 7, reward: 150 },
                    { id: 5, name: "30 дней", description: "Месяц без пропусков", earned: false, icon: "bi-calendar-check-fill", progress: 0, total: 30, reward: 500 },
                    { id: 6, name: "100 дней", description: "100 дней непрерывно", earned: false, icon: "bi-award-fill", progress: 0, total: 100, reward: 1000 },
                    { id: 7, name: "Ранняя пташка", description: "Выполнить 10 утренних привычек до 9 утра", earned: false, icon: "bi-brightness-high-fill", progress: 0, total: 10, reward: 150 },
                    { id: 8, name: "Спортсмен", description: "Выполнить 50 спортивных привычек", earned: false, icon: "bi-bicycle", progress: 0, total: 50, reward: 300 },
                    { id: 9, name: "Книжный червь", description: "Выполнить 30 привычек по чтению", earned: false, icon: "bi-book-fill", progress: 0, total: 30, reward: 200 },
                    { id: 10, name: "Продуктивный", description: "Выполнить все привычки за день 7 раз", earned: false, icon: "bi-check2-all", progress: 0, total: 7, reward: 250 },
                    { id: 11, name: "ЗОЖ-марафон", description: "Накопить 1000 очков здоровья", earned: false, icon: "bi-heart-fill", progress: 0, total: 1000, reward: 400 },
                    { id: 12, name: "Всесторонний", description: "Иметь привычки из 5 разных категорий", earned: false, icon: "bi-globe", progress: 0, total: 5, reward: 300 }
                ],
                activity: [],
                dailyChallengesCompleted: 0,
                friends: [],
                storiesShared: 0,
                storiesLiked: 0,
                settings: { notifications: true, darkMode: false, language: 'ru' }
            };
            
            saveUserData();
            
            showNotification(`👋 Добро пожаловать, ${user.name || user.username}!`, 'success');
            
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'habits.html';
                }
            }, 1000);
            
            return true;
        } else {
            showNotification('❌ Неверный логин или пароль', 'danger');
            return false;
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
        showNotification('❌ Ошибка при входе в систему', 'danger');
        return false;
    }
}

// Функция регистрации
function register(userDataInput) {
    try {
        console.log('Начало регистрации:', userDataInput);
        
        if (!authData.users) {
            authData.users = [];
        }
        
        const existingUser = authData.users.find(u => 
            u.username === userDataInput.username || u.email === userDataInput.email
        );
        
        if (existingUser) {
            showNotification('❌ Пользователь с таким логином или email уже существует', 'danger');
            return false;
        }
        
        const newId = authData.users.length > 0 ? Math.max(...authData.users.map(u => u.id)) + 1 : 1;
        
        const newUser = {
            id: newId,
            username: userDataInput.username,
            password: userDataInput.password,
            email: userDataInput.email,
            name: userDataInput.name,
            role: 'user',
            avatar: null,
            createdAt: new Date().toISOString(),
            settings: { notifications: true, darkMode: false, language: 'ru' }
        };
        
        authData.users.push(newUser);
        
        const newUserData = {
            userId: newUser.id,
            name: userDataInput.name,
            username: userDataInput.username,
            bio: 'Привет! Я использую Habit для развития полезных привычек.',
            points: 0,
            level: 1,
            habits: [],
            achievements: [
                { id: 1, name: "Новичок", description: "Создана первая привычка", earned: false, icon: "bi-star-fill", progress: 0, total: 1, reward: 50 },
                { id: 2, name: "Стратег", description: "5 активных привычек", earned: false, icon: "bi-grid-3x3-gap-fill", progress: 0, total: 5, reward: 100 },
                { id: 3, name: "Мастер", description: "10 активных привычек", earned: false, icon: "bi-trophy-fill", progress: 0, total: 10, reward: 200 },
                { id: 4, name: "7 дней серии", description: "Непрерывное выполнение 7 дней", earned: false, icon: "bi-lightning-charge-fill", progress: 0, total: 7, reward: 150 },
                { id: 5, name: "30 дней", description: "Месяц без пропусков", earned: false, icon: "bi-calendar-check-fill", progress: 0, total: 30, reward: 500 },
                { id: 6, name: "100 дней", description: "100 дней непрерывно", earned: false, icon: "bi-award-fill", progress: 0, total: 100, reward: 1000 },
                { id: 7, name: "Ранняя пташка", description: "Выполнить 10 утренних привычек до 9 утра", earned: false, icon: "bi-brightness-high-fill", progress: 0, total: 10, reward: 150 },
                { id: 8, name: "Спортсмен", description: "Выполнить 50 спортивных привычек", earned: false, icon: "bi-bicycle", progress: 0, total: 50, reward: 300 },
                { id: 9, name: "Книжный червь", description: "Выполнить 30 привычек по чтению", earned: false, icon: "bi-book-fill", progress: 0, total: 30, reward: 200 },
                { id: 10, name: "Продуктивный", description: "Выполнить все привычки за день 7 раз", earned: false, icon: "bi-check2-all", progress: 0, total: 7, reward: 250 },
                { id: 11, name: "ЗОЖ-марафон", description: "Накопить 1000 очков здоровья", earned: false, icon: "bi-heart-fill", progress: 0, total: 1000, reward: 400 },
                { id: 12, name: "Всесторонний", description: "Иметь привычки из 5 разных категорий", earned: false, icon: "bi-globe", progress: 0, total: 5, reward: 300 }
            ],
            activity: [],
            dailyChallengesCompleted: 0,
            friends: [],
            storiesShared: 0,
            storiesLiked: 0,
            createdAt: new Date().toISOString(),
            settings: { notifications: true, darkMode: false, language: 'ru' }
        };
        
        const allData = JSON.parse(localStorage.getItem('habitTrackerData')) || {};
        allData[newUser.id] = newUserData;
        localStorage.setItem('habitTrackerData', JSON.stringify(allData));
        localStorage.setItem('habitTrackerAuth', JSON.stringify(authData));
        
        console.log('Регистрация успешна:', newUser);
        showNotification('✅ Регистрация успешна! Перенаправление на страницу входа...', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
        return true;
        
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        showNotification('❌ Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.', 'danger');
        return false;
    }
}

// Выход
function logout() {
    try {
        authData.currentUser = null;
        userData = {
            userId: null,
            name: "Пользователь",
            username: "user",
            bio: "",
            points: 0,
            level: 1,
            habits: [],
            achievements: [],
            activity: [],
            dailyChallengesCompleted: 0,
            friends: [],
            storiesShared: 0,
            storiesLiked: 0,
            settings: { notifications: true, darkMode: false, language: 'ru' }
        };
        
        localStorage.setItem('habitTrackerAuth', JSON.stringify(authData));
        showNotification('👋 Вы вышли из системы', 'info');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    }
}

// Проверка авторизации
function checkAuth() {
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    const publicPages = ['login.html', 'index.html', '', 'register.html', 'stories.html', 'social.html'];
    
    if (publicPages.includes(currentPage)) {
        return true;
    }
    
    if (!authData.currentUser) {
        showNotification('⚠️ Пожалуйста, войдите в систему', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return false;
    }
    
    if (currentPage === 'admin.html' && authData.currentUser.role !== 'admin') {
        showNotification('⛔ Доступ запрещен', 'danger');
        setTimeout(() => {
            window.location.href = 'habits.html';
        }, 1000);
        return false;
    }
    
    return true;
}

// Обновление навигации
function updateNavigation() {
    const nav = document.querySelector('.navbar-nav');
    if (!nav) return;

    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    
    nav.innerHTML = '';

    if (authData.currentUser) {
        // Для администратора
        if (authData.currentUser.role === 'admin') {
            const adminTextLi = document.createElement('li');
            adminTextLi.className = 'nav-item';
            adminTextLi.innerHTML = `
                <span class="nav-link" style="cursor: default; opacity: 0.7;">
                    <i class="bi bi-shield-lock me-1"></i>Админ панель
                </span>
            `;
            nav.appendChild(adminTextLi);
            
            const logoutLi = document.createElement('li');
            logoutLi.className = 'nav-item';
            logoutLi.innerHTML = `
                <a class="nav-link" href="#" onclick="logout(); return false;">
                    <i class="bi bi-box-arrow-right me-1"></i>Выйти
                </a>
            `;
            nav.appendChild(logoutLi);
            
            return;
        }
        
        // Для обычного пользователя
        const userLinks = [
            { href: 'habits.html', text: 'Привычки', icon: 'bi-check-circle' },
            { href: 'calendar.html', text: 'Календарь', icon: 'bi-calendar' },
            { href: 'stats.html', text: 'Статистика', icon: 'bi-graph-up' },
            { href: 'stories.html', text: 'Истории', icon: 'bi-journal-text' },
            { href: 'social.html', text: 'Сообщество', icon: 'bi-people' }
        ];

        userLinks.forEach(link => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `
                <a class="nav-link ${currentPage === link.href ? 'active' : ''}" href="${link.href}">
                    <i class="bi ${link.icon} me-1"></i>${link.text}
                </a>
            `;
            nav.appendChild(li);
        });

        const profileLi = document.createElement('li');
        profileLi.className = 'nav-item';
        profileLi.innerHTML = `
            <a class="nav-link ${currentPage === 'profile.html' ? 'active' : ''}" href="profile.html">
                <i class="bi bi-person-circle me-1"></i>${authData.currentUser.name || authData.currentUser.username}
            </a>
        `;
        nav.appendChild(profileLi);

        const logoutLi = document.createElement('li');
        logoutLi.className = 'nav-item';
        logoutLi.innerHTML = `
            <a class="nav-link" href="#" onclick="logout(); return false;">
                <i class="bi bi-box-arrow-right me-1"></i>Выйти
            </a>
        `;
        nav.appendChild(logoutLi);

    } else {
        // Для неавторизованных пользователей
        const publicLinks = [
            { href: 'habits.html', text: 'Привычки', icon: 'bi-check-circle' },
            { href: 'stats.html', text: 'Статистика', icon: 'bi-graph-up' },
            { href: 'stories.html', text: 'Истории', icon: 'bi-journal-text' },
            { href: 'social.html', text: 'Сообщество', icon: 'bi-people' }
        ];

        publicLinks.forEach(link => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `
                <a class="nav-link ${currentPage === link.href ? 'active' : ''}" href="${link.href}">
                    <i class="bi ${link.icon} me-1"></i>${link.text}
                </a>
            `;
            nav.appendChild(li);
        });

        const authLi = document.createElement('li');
        authLi.className = 'nav-item';
        authLi.innerHTML = `
            <div class="d-flex">
                <a class="nav-link ${currentPage === 'login.html' ? 'active' : ''}" href="login.html">
                    <i class="bi bi-box-arrow-in-right me-1"></i>Войти
                </a>
                <a class="nav-link ${currentPage === 'register.html' ? 'active' : ''}" href="register.html">
                    <i class="bi bi-person-plus me-1"></i>Регистрация
                </a>
            </div>
        `;
        nav.appendChild(authLi);
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    
    const iconMap = {
        success: 'bi-check-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        danger: 'bi-x-circle-fill',
        info: 'bi-info-circle-fill'
    };
    
    notification.innerHTML = `
        <div class="notification-icon ${type}">
            <i class="bi ${iconMap[type] || 'bi-bell-fill'}"></i>
        </div>
        <div class="notification-content">${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
        </button>
    `;

    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Проверка и обновление достижений
function checkAchievements() {
    const habits = userData.habits?.filter(h => h.status === 'approved' && !h.isPublic) || [];
    let newAchievementUnlocked = false;
    
    const morningHabits = habits.filter(h => {
        if (!h.history) return false;
        return h.history.some(dateStr => {
            const date = new Date(dateStr);
            return date.getHours() < 9;
        });
    }).length;
    
    const sportHabits = habits.filter(h => 
        h.category === 'health' && h.history?.length > 0
    ).reduce((sum, h) => sum + h.history.length, 0);
    
    const readingHabits = habits.filter(h => 
        h.category === 'education' && h.history?.length > 0
    ).reduce((sum, h) => sum + h.history.length, 0);
    
    const allCompletedDays = countAllCompletedDays(habits);
    
    const healthPoints = userData.points || 0;
    
    const categories = new Set(habits.map(h => h.category).filter(c => c));
    
    userData.achievements.forEach(achievement => {
        if (achievement.earned) return;
        
        let progress = 0;
        switch(achievement.id) {
            case 1: progress = habits.length >= 1 ? 1 : 0; break;
            case 2: progress = Math.min(habits.length, 5); break;
            case 3: progress = Math.min(habits.length, 10); break;
            case 4: 
                const maxStreak = Math.max(...habits.map(h => h.streak || 0), 0);
                progress = Math.min(maxStreak, 7); 
                break;
            case 5: 
                const maxStreak30 = Math.max(...habits.map(h => h.streak || 0), 0);
                progress = Math.min(maxStreak30, 30); 
                break;
            case 6: 
                const maxStreak100 = Math.max(...habits.map(h => h.streak || 0), 0);
                progress = Math.min(maxStreak100, 100); 
                break;
            case 7: progress = Math.min(morningHabits, 10); break;
            case 8: progress = Math.min(sportHabits, 50); break;
            case 9: progress = Math.min(readingHabits, 30); break;
            case 10: progress = Math.min(allCompletedDays, 7); break;
            case 11: progress = Math.min(healthPoints, 1000); break;
            case 12: progress = Math.min(categories.size, 5); break;
        }
        
        achievement.progress = progress;
        
        if (progress >= achievement.total && !achievement.earned) {
            achievement.earned = true;
            achievement.earnedAt = new Date().toISOString();
            userData.points = (userData.points || 0) + (achievement.reward || 0);
            
            userData.activity = userData.activity || [];
            userData.activity.unshift({
                id: Date.now(),
                type: 'achievement',
                achievementId: achievement.id,
                name: achievement.name,
                date: new Date().toISOString()
            });
            
            newAchievementUnlocked = true;
            showNotification(`🏆 Получено достижение: "${achievement.name}" +${achievement.reward} очков`, 'success');
        }
    });

    if (newAchievementUnlocked) {
        saveUserData();
    }
}

function countAllCompletedDays(habits) {
    if (habits.length === 0) return 0;
    
    const completionsByDay = {};
    habits.forEach(habit => {
        if (habit.history) {
            habit.history.forEach(date => {
                completionsByDay[date] = (completionsByDay[date] || 0) + 1;
            });
        }
    });
    
    return Object.values(completionsByDay).filter(count => count === habits.length).length;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM загружен, инициализация...');
        loadUserData();
        updateNavigation();
        
        if (!checkAuth()) return;
        
        const currentPage = window.location.pathname.split("/").pop() || 'index.html';
        console.log('Текущая страница:', currentPage);
        
        if (currentPage === "habits.html" && typeof initHabitsPage === 'function') {
            initHabitsPage();
        } else if (currentPage === "stats.html" && typeof initStatsPage === 'function') {
            initStatsPage();
        } else if (currentPage === "profile.html" && typeof initProfilePage === 'function') {
            initProfilePage();
        } else if (currentPage === "admin.html" && typeof initAdminPage === 'function') {
            initAdminPage();
        } else if (currentPage === "login.html" && typeof initLoginPage === 'function') {
            initLoginPage();
        } else if (currentPage === "calendar.html" && typeof initCalendarPage === 'function') {
            initCalendarPage();
        } else if (currentPage === "stories.html" && typeof initStoriesPage === 'function') {
            initStoriesPage();
        } else if (currentPage === "social.html" && typeof initSocialPage === 'function') {
            initSocialPage();
        } else if (currentPage === "register.html" && typeof initRegisterPage === 'function') {
            initRegisterPage();
        }
        
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showNotification('⚠️ Произошла ошибка при загрузке страницы', 'warning');
    }
});

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
});

// Делаем функции глобальными
window.login = login;
window.register = register;
window.logout = logout;
window.showNotification = showNotification;
window.loadUserData = loadUserData;
window.saveUserData = saveUserData;
window.authData = authData;
window.userData = userData;
window.moderationData = moderationData;
window.checkAchievements = checkAchievements;