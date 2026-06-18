// users.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

let users = [];

function initAuth() {
    loadUsers();
    setupAuthForms();
}

function loadUsers() {
    try {
        const savedAuth = localStorage.getItem('habitTrackerAuth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            users = authData.users || [];
            
            if (users.length === 0) {
                users = [
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
                ];
            }
            
            if (window.authData) {
                window.authData.users = users;
                if (!window.authData.currentUser) {
                    window.authData.currentUser = null;
                }
                localStorage.setItem('habitTrackerAuth', JSON.stringify(window.authData));
            }
        } else {
            users = [
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
            ];
            
            const authData = {
                currentUser: null,
                users: users
            };
            localStorage.setItem('habitTrackerAuth', JSON.stringify(authData));
            
            if (window.authData) {
                window.authData.users = users;
                window.authData.currentUser = null;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
}

function saveUsers() {
    try {
        if (window.authData) {
            window.authData.users = users;
            localStorage.setItem('habitTrackerAuth', JSON.stringify(window.authData));
        }
    } catch (error) {
        console.error('Ошибка сохранения пользователей:', error);
    }
}

function registerUser(userData) {
    if (!userData.username || !userData.password || !userData.email || !userData.name) {
        showNotification('❌ Заполните все поля', 'danger');
        return false;
    }
    
    if (userData.password.length < 6) {
        showNotification('❌ Пароль должен содержать минимум 6 символов', 'danger');
        return false;
    }
    
    const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
        showNotification('❌ Пользователь с таким логином или email уже существует', 'danger');
        return false;
    }
    
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser = {
        id: newId,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        name: userData.name,
        role: 'user',
        avatar: null,
        createdAt: new Date().toISOString(),
        settings: {
            notifications: true,
            darkMode: false,
            language: 'ru'
        }
    };
    
    users.push(newUser);
    saveUsers();
    
    createUserData(newUser.id, newUser.name);
    
    showNotification('✅ Регистрация успешна! Теперь вы можете войти', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
    
    return true;
}

function createUserData(userId, userName) {
    const userData = {
        userId: userId,
        name: userName || 'Пользователь',
        username: users.find(u => u.id === userId)?.username || 'user',
        bio: 'Привет! Я использую Habit для развития полезных привычек.',
        points: 0,
        level: 1,
        habits: [],
        achievements: [
            { id: 1, name: "Новичок", description: "Создана первая привычка", earned: false, icon: "bi-star-fill", progress: 0, total: 1 },
            { id: 2, name: "Стратег", description: "5 активных привычек", earned: false, icon: "bi-grid-3x3-gap-fill", progress: 0, total: 5 },
            { id: 3, name: "7 дней серии", description: "Непрерывное выполнение 7 дней", earned: false, icon: "bi-lightning-charge-fill", progress: 0, total: 7 },
            { id: 4, name: "30 дней", description: "Месяц без пропусков", earned: false, icon: "bi-calendar-check-fill", progress: 0, total: 30 },
            { id: 5, name: "Социальный", description: "Поделитесь своей историей", earned: false, icon: "bi-people-fill", progress: 0, total: 1 },
            { id: 6, name: "Мотиватор", description: "Вдохновите 10 человек", earned: false, icon: "bi-star-fill", progress: 0, total: 10 }
        ],
        activity: [],
        dailyChallengesCompleted: 0,
        friends: [],
        createdAt: new Date().toISOString(),
        storiesShared: 0,
        storiesLiked: 0,
        settings: {
            notifications: true,
            darkMode: false,
            language: 'ru'
        }
    };
    
    const allData = JSON.parse(localStorage.getItem('habitTrackerData')) || {};
    allData[userId] = userData;
    localStorage.setItem('habitTrackerData', JSON.stringify(allData));
}

function setupAuthForms() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const newForm = registerForm.cloneNode(true);
        registerForm.parentNode.replaceChild(newForm, registerForm);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regPasswordConfirm').value;
            
            if (password !== confirm) {
                showNotification('❌ Пароли не совпадают', 'danger');
                return;
            }
            
            const userData = {
                username: document.getElementById('regUsername').value,
                password: password,
                email: document.getElementById('regEmail').value,
                name: document.getElementById('regName').value
            };
            
            registerUser(userData);
        });
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (typeof window.login === 'function') {
                window.login(username, password);
            } else {
                console.error('Функция login не найдена');
                showNotification('❌ Ошибка входа', 'danger');
            }
        });
    }
}

function loadUserData(userId) {
    const allData = JSON.parse(localStorage.getItem('habitTrackerData')) || {};
    const userData = allData[userId];
    
    if (userData && window.userData) {
        Object.assign(window.userData, userData);
        return userData;
    } else {
        const user = users.find(u => u.id === userId);
        createUserData(userId, user?.name);
        return allData[userId];
    }
}

function updateUserData(userId, newData) {
    const allData = JSON.parse(localStorage.getItem('habitTrackerData')) || {};
    allData[userId] = { ...allData[userId], ...newData };
    localStorage.setItem('habitTrackerData', JSON.stringify(allData));
    
    if (window.userData) {
        Object.assign(window.userData, newData);
    }
    
    showNotification('✅ Данные обновлены', 'success');
    return allData[userId];
}

function getCurrentUser() {
    return window.authData?.currentUser || null;
}

function isAuthenticated() {
    return !!window.authData?.currentUser;
}

function logout() {
    if (typeof window.logout === 'function') {
        window.logout();
    } else {
        if (window.authData) {
            window.authData.currentUser = null;
            localStorage.setItem('habitTrackerAuth', JSON.stringify(window.authData));
        }
        showNotification('👋 Вы вышли из системы', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

window.initAuth = initAuth;
window.registerUser = registerUser;
window.loadUserData = loadUserData;
window.updateUserData = updateUserData;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.logout = logout;

document.addEventListener('DOMContentLoaded', function() {
    if (!window.authData || !window.authData.users || window.authData.users.length === 0) {
        initAuth();
    }
});