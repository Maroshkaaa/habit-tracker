// auth.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!username || !password) {
                showNotification('❌ Заполните все поля', 'warning');
                return;
            }
            
            if (typeof window.login === 'function') {
                window.login(username, password);
            } else {
                console.error('Функция login не найдена');
                showNotification('❌ Ошибка входа', 'danger');
            }
        });
    }
    
    // Добавляем обработчики для карточек тестовых аккаунтов
    document.querySelectorAll('.border.rounded-3').forEach(card => {
        card.addEventListener('click', function() {
            const text = this.querySelector('strong').textContent;
            const [username, password] = text.split(' / ');
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
        });
    });
}

// Функция для страницы регистрации
function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        const newForm = registerForm.cloneNode(true);
        registerForm.parentNode.replaceChild(newForm, registerForm);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regPasswordConfirm').value;
            const agree = document.getElementById('agreeTerms').checked;
            
            if (!name || !email || !username || !password || !confirm) {
                showNotification('❌ Заполните все поля', 'warning');
                return;
            }
            
            if (!agree) {
                showNotification('❌ Примите условия использования', 'danger');
                return;
            }
            
            if (password !== confirm) {
                showNotification('❌ Пароли не совпадают', 'danger');
                return;
            }
            
            if (password.length < 6) {
                showNotification('❌ Пароль должен содержать минимум 6 символов', 'danger');
                return;
            }
            
            if (!email.includes('@') || !email.includes('.')) {
                showNotification('❌ Введите корректный email', 'danger');
                return;
            }
            
            const userData = {
                name: name,
                email: email,
                username: username,
                password: password
            };
            
            if (typeof window.register === 'function') {
                window.register(userData);
            } else {
                console.error('Функция register не найдена');
                showNotification('❌ Ошибка регистрации', 'danger');
            }
        });
    }
}

// Функции для заполнения тестовых данных
window.fillUserData = function() {
    document.getElementById('username').value = 'user';
    document.getElementById('password').value = 'user123';
};

window.fillAdminData = function() {
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = 'qwertyui';
};

// Проверка надежности пароля
window.checkPasswordStrength = function() {
    const password = document.getElementById('regPassword').value;
    const bar = document.getElementById('passwordStrengthBar');
    const text = document.getElementById('passwordStrengthText');
    
    let strength = 0;
    let color = '#c97c5d';
    let strengthText = 'Слабый';
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) {
        color = '#c97c5d';
        strengthText = 'Слабый';
    } else if (strength <= 4) {
        color = '#d9b382';
        strengthText = 'Средний';
    } else {
        color = '#b5c9a0';
        strengthText = 'Надежный';
    }
    
    const width = (strength / 5) * 100;
    if (bar) {
        bar.style.width = width + '%';
        bar.style.background = color;
    }
    if (text) {
        text.textContent = strengthText;
        text.style.color = color;
    }
};

window.fillDemoData = function() {
    document.getElementById('regName').value = 'Новый пользователь';
    document.getElementById('regEmail').value = 'newuser@example.com';
    document.getElementById('regUsername').value = 'newuser';
    document.getElementById('regPassword').value = 'password123';
    document.getElementById('regPasswordConfirm').value = 'password123';
    document.getElementById('agreeTerms').checked = true;
    if (typeof window.checkPasswordStrength === 'function') {
        window.checkPasswordStrength();
    }
};

window.clearForm = function() {
    document.getElementById('registerForm').reset();
    const bar = document.getElementById('passwordStrengthBar');
    const text = document.getElementById('passwordStrengthText');
    if (bar) bar.style.width = '0%';
    if (text) {
        text.textContent = 'Слабый';
        text.style.color = '#c97c5d';
    }
};

// Делаем функции глобальными
window.initLoginPage = initLoginPage;
window.initRegisterPage = initRegisterPage;