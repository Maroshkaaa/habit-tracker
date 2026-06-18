// Инициализация страницы профиля
function initProfilePage() {
    console.log('Инициализация страницы профиля...');
    
    if (!authData.currentUser) {
        showNotification('⚠️ Пожалуйста, войдите в систему', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    loadUserData();
    renderProfile();
    renderTodayStats();
    renderRecentBadges();
    renderFavoriteCategories();
    setupProfileListeners();
    setupAvatarHandlers();
}

// Функция для отображения аватара
function displayAvatar() {
    const avatarContainer = document.getElementById('profileAvatar');
    if (!avatarContainer) return;
    
    const avatarUrl = userData.avatarUrl;
    const avatarLetter = userData.avatarLetter || (userData.name || authData.currentUser?.name || 'Пользователь').charAt(0).toUpperCase();
    
    if (avatarUrl) {
        // Показываем загруженное изображение
        avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="Avatar">`;
    } else {
        // Показываем букву или эмодзи
        avatarContainer.innerHTML = `<span id="avatarText">${avatarLetter}</span>`;
    }
}

function renderProfile() {
    try {
        document.getElementById('profileName').textContent = userData.name || authData.currentUser?.name || 'Пользователь';
        document.getElementById('profileUsername').textContent = '@' + (userData.username || authData.currentUser?.username || 'user');
        document.getElementById('profileBio').textContent = userData.bio || 'Пока ничего не рассказал(а) о себе.';
        
        // Отображаем аватар
        displayAvatar();
        
        const habits = (userData.habits || []).filter(h => h && h.status === 'approved');
        const earnedAchievements = (userData.achievements || []).filter(a => a && a.earned).length || 0;
        const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
        
        document.getElementById('statHabits').textContent = habits.length;
        document.getElementById('statStreak').textContent = maxStreak;
        document.getElementById('statAchievements').textContent = `${earnedAchievements}/${userData.achievements?.length || 12}`;
        
        const createdAt = authData.currentUser?.createdAt || userData.createdAt;
        if (createdAt) {
            const date = new Date(createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('memberSince').textContent = date;
        } else {
            document.getElementById('memberSince').textContent = '—';
        }
        
        document.getElementById('userLevelProfile').textContent = userData.level || 1;
    } catch (error) {
        console.error('Ошибка при отображении профиля:', error);
    }
}

// Статистика за сегодня
function renderTodayStats() {
    const container = document.getElementById('activityContainer');
    if (!container) return;
    
    try {
        const habits = (userData.habits || []).filter(h => h && h.status === 'approved');
        const today = new Date().toISOString().split('T')[0];
        
        const completedToday = habits.filter(h => h.history && h.history.includes(today)).length;
        const totalHabits = habits.length;
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        
        let todayPoints = 0;
        habits.forEach(habit => {
            if (habit.history && habit.history.includes(today)) {
                const difficultyPoints = { 1: 10, 2: 20, 3: 30 };
                todayPoints += difficultyPoints[habit.difficulty] || 20;
            }
        });
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const activeHabits = habits.filter(habit => {
            if (habit.history && habit.history.includes(today)) return false;
            if (habit.timeRange) {
                const end = habit.timeRange.end;
                return currentTime <= end;
            }
            if (habit.time) {
                const [hours, minutes] = habit.time.split(':').map(Number);
                const habitTime = hours * 60 + minutes;
                return currentTime <= habitTime + 60;
            }
            return true;
        }).length;
        
        const points = userData.points || 0;
        const currentLevel = userData.level || 1;
        const pointsInCurrentLevel = points - ((currentLevel - 1) * 100);
        const levelProgress = Math.min(100, Math.max(0, Math.round((pointsInCurrentLevel / 100) * 100)));
        
        container.innerHTML = `
            <div class="today-stats-grid">
                <div class="today-stat-card">
                    <div class="today-stat-icon" style="background: rgba(181, 201, 160, 0.15); color: var(--secondary-dark);">
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <div class="today-stat-info">
                        <div class="today-stat-value">${completedToday}/${totalHabits}</div>
                        <div class="today-stat-label">Выполнено привычек</div>
                    </div>
                </div>
                
                <div class="today-stat-card">
                    <div class="today-stat-icon" style="background: rgba(217, 179, 130, 0.15); color: var(--accent);">
                        <i class="bi bi-star-fill"></i>
                    </div>
                    <div class="today-stat-info">
                        <div class="today-stat-value">+${todayPoints}</div>
                        <div class="today-stat-label">Очков сегодня</div>
                    </div>
                </div>
                
                <div class="today-stat-card">
                    <div class="today-stat-icon" style="background: rgba(58, 44, 41, 0.1); color: var(--primary);">
                        <i class="bi bi-hourglass-split"></i>
                    </div>
                    <div class="today-stat-info">
                        <div class="today-stat-value">${activeHabits}</div>
                        <div class="today-stat-label">Активных привычек</div>
                    </div>
                </div>
            </div>
            
            <div class="today-progress-card">
                <div class="today-progress-header">
                    <span><i class="bi bi-graph-up me-1"></i> Прогресс дня</span>
                    <span class="fw-bold">${completionRate}%</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar" style="width: ${completionRate}%; background: var(--secondary);"></div>
                </div>
            </div>
            
            <div class="today-progress-card">
                <div class="today-progress-header">
                    <span><i class="bi bi-trophy me-1"></i> До следующего уровня</span>
                    <span class="fw-bold">${levelProgress}%</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar" style="width: ${levelProgress}%; background: var(--accent);"></div>
                </div>
                <div class="today-progress-footer text-muted">
                    <small>${pointsInCurrentLevel}/100 очков до ${currentLevel + 1} уровня</small>
                </div>
            </div>
            
            ${totalHabits === 0 ? `
                <div class="alert alert-light text-center py-3 mt-2 mb-0" style="background: var(--light); border: none;">
                    <i class="bi bi-plus-circle me-2"></i>
                    <a href="habits.html" class="text-decoration-none">Добавьте первую привычку</a>, чтобы начать отслеживать прогресс
                </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('Ошибка при отображении статистики дня:', error);
        container.innerHTML = '<div class="text-center py-3 text-muted" style="font-size: var(--font-size-small);">Ошибка загрузки статистики</div>';
    }
}

function renderRecentBadges() {
    const container = document.getElementById('recentBadgesContainer');
    if (!container) return;
    
    try {
        const achievements = userData.achievements || [];
        const earned = achievements.filter(a => a && a.earned).slice(0, 3);
        
        if (earned.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="badge-preview">
                        <i class="bi bi-star" style="font-size: 2rem; color: var(--text-light);"></i>
                        <span class="d-block mt-2 text-muted" style="font-size: var(--font-size-small);">Пока нет достижений</span>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = earned.map(a => `
            <div class="col-4">
                <div class="badge-preview earned">
                    <div class="badge-icon">
                        <i class="bi bi-trophy-fill"></i>
                    </div>
                    <span>${a.name || 'Достижение'}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка при отображении достижений:', error);
        container.innerHTML = '<div class="col-12 text-center text-muted" style="font-size: var(--font-size-small);">Ошибка загрузки</div>';
    }
}

function renderFavoriteCategories() {
    const container = document.getElementById('categoryTags');
    if (!container) return;
    
    try {
        const habits = (userData.habits || []).filter(h => h && h.status === 'approved');
        const categoryCount = {};
        
        habits.forEach(h => {
            const cat = h.category || 'other';
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        
        const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
        
        if (sorted.length === 0) {
            container.innerHTML = '<span class="text-muted" style="font-size: var(--font-size-small);">Нет данных</span>';
            return;
        }
        
        const categoryNames = {
            health: '🏃 Здоровье', education: '📚 Образование', work: '💼 Работа',
            hobby: '🎨 Хобби', mindfulness: '🧘 Осознанность', productivity: '⚡ Продуктивность',
            fitness: '💪 Спорт', other: '📦 Другое'
        };
        
        container.innerHTML = sorted.slice(0, 3).map(([cat, count]) => `
            <span class="badge" style="background: var(--accent); color: var(--primary); padding: 0.5rem 1rem; font-size: var(--font-size-small);">
                ${categoryNames[cat] || cat} (${count})
            </span>
        `).join('');
    } catch (error) {
        console.error('Ошибка при отображении категорий:', error);
        container.innerHTML = '<span class="text-muted" style="font-size: var(--font-size-small);">Ошибка загрузки</span>';
    }
}

function setupProfileListeners() {
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        const newBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newBtn, saveBtn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }
    
    const editModal = document.getElementById('editProfileModal');
    if (editModal) {
        editModal.addEventListener('show.bs.modal', function() {
            document.getElementById('editName').value = userData.name || authData.currentUser?.name || '';
            document.getElementById('editBio').value = userData.bio || '';
            document.getElementById('editUsername').value = authData.currentUser?.username || '';
        });
    }
    
    // Кнопка выхода из аккаунта
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        newLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                logout();
            }
        });
    }
}

// Настройка обработчиков для аватара
function setupAvatarHandlers() {
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarUploadTrigger = document.getElementById('avatarUploadTrigger');
    const avatarUpload = document.getElementById('avatarUpload');
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');
    const avatarPreview = document.getElementById('avatarPreview');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const avatarModal = new bootstrap.Modal(document.getElementById('avatarModal'));
    const presetAvatars = document.querySelectorAll('.avatar-preset');
    
    let selectedImageData = null;
    let selectedLetter = null;
    
    // Открытие модального окна
    const openModal = () => avatarModal.show();
    if (changeAvatarBtn) changeAvatarBtn.addEventListener('click', openModal);
    if (avatarUploadTrigger) avatarUploadTrigger.addEventListener('click', openModal);
    
    // Загрузка файла
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    selectedImageData = event.target.result;
                    selectedLetter = null;
                    avatarPreview.src = selectedImageData;
                    avatarPreview.style.display = 'block';
                    if (previewPlaceholder) previewPlaceholder.style.display = 'none';
                    // Убираем выделение с preset
                    presetAvatars.forEach(p => p.classList.remove('selected'));
                };
                reader.readAsDataURL(file);
            } else if (file) {
                showNotification('❌ Пожалуйста, выберите изображение (JPG, PNG, GIF)', 'warning');
            }
        });
    }
    
    // Выбор preset аватара (эмодзи)
    presetAvatars.forEach(preset => {
        preset.addEventListener('click', function() {
            presetAvatars.forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            selectedLetter = this.getAttribute('data-letter') || this.textContent.trim();
            selectedImageData = null;
            // Показываем превью
            avatarPreview.style.display = 'none';
            if (previewPlaceholder) {
                previewPlaceholder.style.display = 'flex';
                previewPlaceholder.textContent = selectedLetter;
                previewPlaceholder.style.fontSize = '4rem';
            }
        });
    });
    
    // Сохранение аватара
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', function() {
            if (selectedImageData) {
                // Сохраняем изображение
                userData.avatarUrl = selectedImageData;
                userData.avatarLetter = null;
            } else if (selectedLetter) {
                // Сохраняем эмодзи
                userData.avatarUrl = null;
                userData.avatarLetter = selectedLetter;
            } else {
                showNotification('❌ Выберите фото или значок', 'warning');
                return;
            }
            
            saveUserData();
            displayAvatar();
            avatarModal.hide();
            showNotification('✅ Фото профиля обновлено!', 'success');
            
            // Сброс
            selectedImageData = null;
            selectedLetter = null;
            avatarUpload.value = '';
            avatarPreview.src = '';
            avatarPreview.style.display = 'none';
            if (previewPlaceholder) {
                previewPlaceholder.style.display = 'flex';
                previewPlaceholder.textContent = '📷';
                previewPlaceholder.style.fontSize = '4rem';
            }
            presetAvatars.forEach(p => p.classList.remove('selected'));
        });
    }
}

function saveProfileChanges() {
    try {
        const newName = document.getElementById('editName').value.trim();
        const newBio = document.getElementById('editBio').value.trim();
        const newUsername = document.getElementById('editUsername').value.trim();
        
        if (!newName || !newUsername) {
            showNotification('❌ Имя и логин не могут быть пустыми', 'warning');
            return;
        }
        
        if (newUsername !== authData.currentUser.username) {
            const userExists = authData.users.some(u => u.username === newUsername && u.id !== authData.currentUser.id);
            if (userExists) {
                showNotification('❌ Пользователь с таким логином уже существует', 'danger');
                return;
            }
        }
        
        userData.name = newName;
        userData.bio = newBio;
        userData.username = newUsername;
        
        const userIndex = authData.users.findIndex(u => u.id === authData.currentUser.id);
        if (userIndex !== -1) {
            authData.users[userIndex].name = newName;
            authData.users[userIndex].username = newUsername;
            authData.currentUser.name = newName;
            authData.currentUser.username = newUsername;
        }
        
        if (!userData.activity) userData.activity = [];
        userData.activity.unshift({
            id: Date.now(),
            type: 'profile_update',
            date: new Date().toISOString()
        });
        
        saveUserData();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        if (modal) modal.hide();
        
        renderProfile();
        renderTodayStats();
        updateNavigation();
        
        showNotification('✅ Профиль успешно обновлен', 'success');
        
    } catch (error) {
        console.error('Ошибка при сохранении профиля:', error);
        showNotification('❌ Ошибка при сохранении', 'danger');
    }
}

window.initProfilePage = initProfilePage;