// Управление привычками с учетом времени и прогрессий

// ============ ИНИЦИАЛИЗАЦИЯ ============
function initHabitsPage() {
    console.log('Инициализация страницы привычек...');
    
    if (!authData.currentUser) {
        showNotification('⚠️ Пожалуйста, войдите в систему', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    loadUserData();
    renderHabits();
    updateProgress();
    setupEventListeners();
    renderUserPublicHabits();
    loadPublicCatalog();
}

function setupEventListeners() {
    const filter = document.getElementById('categoryFilter');
    if (filter) {
        const newFilter = filter.cloneNode(true);
        filter.parentNode.replaceChild(newFilter, filter);
        newFilter.addEventListener('change', () => renderHabits());
    }

    const savePersonalBtn = document.getElementById('savePersonalHabitBtn');
    if (savePersonalBtn) {
        const newBtn = savePersonalBtn.cloneNode(true);
        savePersonalBtn.parentNode.replaceChild(newBtn, savePersonalBtn);
        newBtn.addEventListener('click', (e) => { e.preventDefault(); addPersonalHabit(); });
    }

    const savePublicBtn = document.getElementById('savePublicHabitBtn');
    if (savePublicBtn) {
        const newBtn = savePublicBtn.cloneNode(true);
        savePublicBtn.parentNode.replaceChild(newBtn, savePublicBtn);
        newBtn.addEventListener('click', (e) => { e.preventDefault(); addPublicHabit(); });
    }
    
    const addHabitModal = document.getElementById('addHabitModal');
    if (addHabitModal) {
        addHabitModal.addEventListener('hidden.bs.modal', () => {
            document.getElementById('addHabitForm')?.reset();
        });
    }
}

// ============ ОСНОВНЫЕ ФУНКЦИИ ============
function renderHabits() {
    const container = document.getElementById('habitsContainer');
    if (!container) return;

    const filter = document.getElementById('categoryFilter')?.value || 'all';
    
    let habits = userData.habits?.filter(h => h.status === 'approved' && !h.isPublic) || [];
    
    if (filter !== 'all') {
        habits = habits.filter(h => h.category === filter);
    }

    updateCompletionStatus(habits);

    habits.sort((a, b) => {
        const aAvailable = isHabitAvailable(a);
        const bAvailable = isHabitAvailable(b);
        if (a.completedToday && !b.completedToday) return 1;
        if (!a.completedToday && b.completedToday) return -1;
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        return 0;
    });

    if (habits.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-inbox display-1 text-muted mb-4"></i>
                    <h5 class="text-muted">У вас пока нет привычек</h5>
                    <p class="text-muted">Добавьте первую привычку, чтобы начать</p>
                    <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#addHabitModal">
                        <i class="bi bi-plus-lg me-2"></i>Добавить привычку
                    </button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    habits.forEach(habit => {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 col-12';
        col.appendChild(createHabitCard(habit));
        container.appendChild(col);
    });
}

function createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = `habit-card ${habit.completedToday ? 'completed' : ''}`;
    card.dataset.id = habit.id;

    const difficultyText = ['', 'Легкая', 'Средняя', 'Сложная'][habit.difficulty] || 'Средняя';
    const difficultyClass = ['', 'easy', 'medium', 'hard'][habit.difficulty] || 'medium';
    
    const categoryIcons = {
        health: 'bi-heart-pulse', education: 'bi-book', work: 'bi-briefcase',
        hobby: 'bi-palette', mindfulness: 'bi-cup-hot', productivity: 'bi-lightning-charge',
        fitness: 'bi-bicycle', other: 'bi-tag'
    };
    const categoryIcon = categoryIcons[habit.category] || 'bi-tag';

    const isAvailable = isHabitAvailable(habit);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const start = habit.timeRange?.start || 0;
    const end = habit.timeRange?.end || 24 * 60;
    
    // Определяем текст статуса доступности (без дублирования "Выполнено")
    let statusText = '';
    let statusClass = '';
    if (habit.completedToday) {
        // НЕ показываем "✅ Выполнено" - оно будет только на кнопке
        statusText = '';  // Пусто, чтобы не дублировать
        statusClass = '';
    } else if (currentTime > end) {
        statusText = '⏰ Время вышло';
        statusClass = 'text-danger';
    } else if (currentTime < start) {
        const startHour = Math.floor(start / 60);
        const startMin = start % 60;
        statusText = `🕒 Доступно с ${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
        statusClass = 'text-muted';
    } else {
        statusText = '⚡ Доступно сейчас';
        statusClass = 'text-success';
    }

    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                    <h5 class="habit-title">
                        <i class="bi ${categoryIcon} me-2" style="color: var(--accent);"></i>
                        ${habit.name}
                    </h5>
                    <button class="btn-delete-habit" onclick="event.stopPropagation(); deleteHabit(${habit.id})" title="Удалить привычку">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="habit-time">
                    <i class="bi bi-clock"></i> ${habit.timeRange ? `${Math.floor(habit.timeRange.start/60)}:${(habit.timeRange.start%60).toString().padStart(2,'0')} - ${Math.floor(habit.timeRange.end/60)}:${(habit.timeRange.end%60).toString().padStart(2,'0')}` : habit.time || '08:00'}
                </div>
            </div>
            <div class="habit-streak-badge ms-2">
                <i class="bi bi-fire"></i> ${habit.streak || 0}
            </div>
        </div>
        
        <p class="habit-description">${habit.description || 'Нет описания'}</p>
        
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="difficulty-badge difficulty-${difficultyClass}">
                ${difficultyText}
            </span>
            <span class="text-muted small">
                <i class="bi bi-tag"></i> ${getCategoryName(habit.category)}
            </span>
        </div>
        
        ${statusText ? `<div class="d-flex justify-content-between align-items-center mb-2">
            <small class="${statusClass}">${statusText}</small>
        </div>` : ''}
        
        <button class="btn w-100 ${habit.completedToday ? 'btn-completed' : (isAvailable ? 'btn-complete' : 'btn-secondary')}" 
                ${!isAvailable ? 'disabled' : ''}
                onclick="toggleHabit(${habit.id})">
            <i class="bi ${habit.completedToday ? 'bi-x-lg' : (isAvailable ? 'bi-check-circle' : 'bi-clock-history')} me-2"></i>
            ${habit.completedToday ? 'Отменить выполнение' : (isAvailable ? 'Отметить выполненным' : 'Недоступно')}
        </button>
    `;

    return card;
}

function isHabitAvailable(habit) {
    if (habit.completedToday) return true; // Разрешаем отмену даже если время вышло
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    if (habit.timeRange) {
        const start = habit.timeRange.start;
        const end = habit.timeRange.end;
        return currentTime >= start && currentTime <= end;
    }
    
    if (habit.time) {
        const [hours, minutes] = habit.time.split(':').map(Number);
        const habitTime = hours * 60 + minutes;
        return currentTime >= habitTime && currentTime <= habitTime + 60;
    }
    
    return true;
}

function updateCompletionStatus(habits) {
    const today = new Date().toISOString().split('T')[0];
    
    habits.forEach(habit => {
        habit.completedToday = habit.history && habit.history.includes(today);
        
        if (!habit.completedToday && !isHabitAvailable(habit)) {
            if (!habit.missedDays) habit.missedDays = [];
            if (!habit.missedDays.includes(today)) {
                habit.missedDays.push(today);
                habit.streak = 0;
            }
        }
    });
}

function toggleHabit(habitId) {
    const habit = userData.habits?.find(h => h.id == habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Если привычка уже выполнена - отменяем выполнение
    if (habit.completedToday) {
        // Убираем выполнение
        habit.completedToday = false;
        
        // Уменьшаем streak (серию)
        if (habit.streak > 0) {
            habit.streak = (habit.streak || 1) - 1;
        }
        
        // Возвращаем очки (отнимаем то, что было начислено)
        const pointsEarned = (habit.difficulty || 2) * 10;
        userData.points = Math.max(0, (userData.points || 0) - pointsEarned);
        
        // Удаляем сегодняшнюю дату из истории
        if (habit.history) {
            const index = habit.history.indexOf(today);
            if (index !== -1) {
                habit.history.splice(index, 1);
            }
        }
        
        // Добавляем в активность отмену
        if (!userData.activity) userData.activity = [];
        userData.activity.unshift({
            id: Date.now(),
            type: 'undo',
            habitId: habit.id,
            habitName: habit.name,
            date: new Date().toISOString()
        });
        
        showNotification(`↩️ Выполнение привычки "${habit.name}" отменено. -${pointsEarned} очков`, 'warning');
        
        saveUserData();
        renderHabits();
        updateProgress();
        checkAchievements();
        return;
    }
    
    // Проверяем доступность для выполнения (только для нового выполнения)
    if (!isHabitAvailable(habit)) {
        showNotification('⏰ Время выполнения этой привычки вышло', 'warning');
        return;
    }

    // Выполняем привычку
    habit.completedToday = true;
    habit.streak = (habit.streak || 0) + 1;
    const pointsEarned = (habit.difficulty || 2) * 10;
    userData.points = (userData.points || 0) + pointsEarned;
    
    if (!habit.history) habit.history = [];
    if (!habit.history.includes(today)) {
        habit.history.push(today);
    }
    
    if (!userData.activity) userData.activity = [];
    userData.activity.unshift({
        id: Date.now(),
        type: 'complete',
        habitId: habit.id,
        habitName: habit.name,
        date: new Date().toISOString()
    });

    showNotification(`✅ +${pointsEarned} очков за "${habit.name}"`, 'success');
    
    saveUserData();
    renderHabits();
    updateProgress();
    checkAchievements();
}

function deleteHabit(habitId) {
    const habit = userData.habits?.find(h => h.id == habitId);
    if (!habit) return;
    
    if (!confirm(`Вы уверены, что хотите удалить привычку "${habit.name}"?`)) {
        return;
    }
    
    // Если это публичная привычка, уменьшаем счетчик usedCount
    if (habit.source === 'public' && habit.sourceId) {
        const publicCatalog = JSON.parse(localStorage.getItem('habitPublicCatalog')) || [];
        const publicHabitIndex = publicCatalog.findIndex(h => h.id == habit.sourceId);
        if (publicHabitIndex !== -1) {
            publicCatalog[publicHabitIndex].usedCount = Math.max(0, (publicCatalog[publicHabitIndex].usedCount || 1) - 1);
            localStorage.setItem('habitPublicCatalog', JSON.stringify(publicCatalog));
        }
    }
    
    const habitIndex = userData.habits.findIndex(h => h.id == habitId);
    if (habitIndex !== -1) {
        userData.habits.splice(habitIndex, 1);
    }
    
    if (!userData.activity) userData.activity = [];
    userData.activity.unshift({
        id: Date.now(),
        type: 'delete',
        habitName: habit.name,
        date: new Date().toISOString()
    });
    
    saveUserData();
    
    showNotification(`🗑️ Привычка "${habit.name}" удалена`, 'info');
    
    renderHabits();
    loadPublicCatalog();
    updateProgress();
    checkAchievements();
}

// ============ ДОБАВЛЕНИЕ ПРИВЫЧЕК ============
function addPersonalHabit() {
    const name = document.getElementById('habitName')?.value.trim();
    if (!name) {
        showNotification('❌ Введите название привычки', 'warning');
        return;
    }

    const timeStart = document.getElementById('habitTimeStart')?.value || '08:00';
    const timeEnd = document.getElementById('habitTimeEnd')?.value || '20:00';
    
    const [startHour, startMin] = timeStart.split(':').map(Number);
    const [endHour, endMin] = timeEnd.split(':').map(Number);
    
    const newHabit = {
        id: Date.now(),
        name: name,
        description: document.getElementById('habitDescription')?.value.trim() || '',
        timeRange: {
            start: startHour * 60 + startMin,
            end: endHour * 60 + endMin
        },
        time: timeStart,
        difficulty: parseInt(document.getElementById('habitDifficulty')?.value) || 2,
        category: document.getElementById('habitCategory')?.value || 'other',
        streak: 0,
        completedToday: false,
        history: [],
        missedDays: [],
        status: 'approved',
        isPublic: false,
        userId: authData.currentUser?.id,
        userName: authData.currentUser?.name || authData.currentUser?.username,
        createdAt: new Date().toISOString()
    };

    if (!userData.habits) userData.habits = [];
    userData.habits.push(newHabit);
    
    userData.activity = userData.activity || [];
    userData.activity.unshift({
        id: Date.now() + 1,
        type: 'add',
        habitId: newHabit.id,
        habitName: newHabit.name,
        date: new Date().toISOString()
    });
    
    saveUserData();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addHabitModal'));
    if (modal) modal.hide();
    
    document.getElementById('addHabitForm')?.reset();
    
    showNotification('✅ Личная привычка успешно добавлена!', 'success');
    
    renderHabits();
    updateProgress();
    checkAchievements();
}

function addPublicHabit() {
    const name = document.getElementById('publicHabitName')?.value.trim();
    if (!name) {
        showNotification('❌ Введите название привычки', 'warning');
        return;
    }

    const timeStart = document.getElementById('publicHabitTimeStart')?.value || '08:00';
    const timeEnd = document.getElementById('publicHabitTimeEnd')?.value || '20:00';
    
    const [startHour, startMin] = timeStart.split(':').map(Number);
    const [endHour, endMin] = timeEnd.split(':').map(Number);

    const newHabit = {
        id: Date.now(),
        name: name,
        description: document.getElementById('publicHabitDescription')?.value.trim() || '',
        timeRange: {
            start: startHour * 60 + startMin,
            end: endHour * 60 + endMin
        },
        time: timeStart,
        difficulty: parseInt(document.getElementById('publicHabitDifficulty')?.value) || 2,
        category: document.getElementById('publicHabitCategory')?.value || 'other',
        userId: authData.currentUser?.id,
        userName: authData.currentUser?.name || authData.currentUser?.username,
        userEmail: authData.currentUser?.email || '',
        createdAt: new Date().toISOString(),
        isPublic: true,
        status: 'pending'
    };

    moderationData.pendingHabits = moderationData.pendingHabits || [];
    moderationData.pendingHabits.push(newHabit);
    
    saveUserData();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addPublicHabitModal'));
    if (modal) modal.hide();
    
    document.getElementById('addPublicHabitForm')?.reset();
    
    showNotification('📨 Публичная привычка отправлена на модерацию', 'info');
    
    renderUserPublicHabits();
}

// ============ ПУБЛИЧНЫЙ КАТАЛОГ ============
function loadPublicCatalog() {
    const publicCatalog = JSON.parse(localStorage.getItem('habitPublicCatalog')) || [];
    createPublicCatalogSection();
    renderPublicCatalog(publicCatalog);
}

function createPublicCatalogSection() {
    let catalogSection = document.querySelector('.public-catalog-section');
    if (catalogSection) return;
    
    const habitsContainer = document.getElementById('habitsContainer');
    if (!habitsContainer) return;
    
    catalogSection = document.createElement('div');
    catalogSection.className = 'public-catalog-section';
    catalogSection.innerHTML = `
        <h5 class="public-catalog-title">
            <i class="bi bi-globe text-info me-2"></i>Публичные привычки
            <small class="text-muted ms-2">(одобренные сообществом)</small>
        </h5>
        <div class="row g-3" id="publicCatalogContainer"></div>
    `;
    
    habitsContainer.parentNode.insertBefore(catalogSection, habitsContainer.nextSibling);
}

function renderPublicCatalog(publicHabits) {
    const container = document.getElementById('publicCatalogContainer');
    if (!container) return;
    
    if (publicHabits.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-4">
                    <i class="bi bi-inbox display-1 text-muted mb-3"></i>
                    <p class="text-muted">Пока нет публичных привычек</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    publicHabits.sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0));
    
    publicHabits.forEach(habit => {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 col-12';
        col.appendChild(createPublicHabitCard(habit));
        container.appendChild(col);
    });
}

function createPublicHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.dataset.id = habit.id;

    const difficultyText = ['', 'Легкая', 'Средняя', 'Сложная'][habit.difficulty] || 'Средняя';
    const difficultyClass = ['', 'easy', 'medium', 'hard'][habit.difficulty] || 'medium';
    
    const categoryIcons = {
        health: 'bi-heart-pulse', education: 'bi-book', work: 'bi-briefcase',
        hobby: 'bi-palette', mindfulness: 'bi-cup-hot', productivity: 'bi-lightning-charge',
        fitness: 'bi-bicycle', other: 'bi-tag'
    };
    const categoryIcon = categoryIcons[habit.category] || 'bi-tag';

    const isAdded = userData.habits?.some(h => 
        h.source === 'public' && h.sourceId == habit.id && h.status === 'approved'
    );

    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
                <h5 class="habit-title">
                    <i class="bi ${categoryIcon} me-2" style="color: var(--accent);"></i>
                    ${habit.name}
                </h5>
                <div class="habit-time">
                    <i class="bi bi-clock"></i> ${habit.time || '08:00'}
                </div>
            </div>
            <span class="badge bg-info text-white">
                <i class="bi bi-people me-1"></i> ${habit.usedCount || 0}
            </span>
        </div>
        
        <p class="habit-description">${habit.description || 'Нет описания'}</p>
        
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="difficulty-badge difficulty-${difficultyClass}">${difficultyText}</span>
            <span class="text-muted small">
                <i class="bi bi-tag"></i> ${getCategoryName(habit.category)}
            </span>
        </div>
        
        <button class="btn btn-outline-success w-100 add-public-btn" ${isAdded ? 'disabled' : ''}>
            <i class="bi ${isAdded ? 'bi-check-circle' : 'bi-plus-circle'} me-2"></i>
            ${isAdded ? 'Уже добавлена' : 'Добавить себе'}
        </button>
    `;

    if (!isAdded) {
        card.querySelector('.add-public-btn').addEventListener('click', () => {
            addPublicToPersonal(habit.id);
        });
    }

    return card;
}

function addPublicToPersonal(publicHabitId) {
    const publicCatalog = JSON.parse(localStorage.getItem('habitPublicCatalog')) || [];
    const publicHabit = publicCatalog.find(h => h.id == publicHabitId);
    
    if (!publicHabit) {
        showNotification('❌ Привычка не найдена', 'danger');
        return;
    }
    
    const exists = userData.habits?.some(h => 
        h.source === 'public' && h.sourceId == publicHabit.id && h.status === 'approved'
    );
    
    if (exists) {
        showNotification('⚠️ Эта привычка уже есть у вас', 'warning');
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: publicHabit.name,
        description: publicHabit.description,
        time: publicHabit.time || '08:00',
        timeRange: publicHabit.timeRange,
        difficulty: publicHabit.difficulty || 2,
        category: publicHabit.category || 'other',
        streak: 0,
        completedToday: false,
        history: [],
        missedDays: [],
        status: 'approved',
        isPublic: false,
        source: 'public',
        sourceId: publicHabit.id,
        userId: authData.currentUser?.id,
        userName: authData.currentUser?.name || authData.currentUser?.username,
        createdAt: new Date().toISOString()
    };
    
    userData.habits = userData.habits || [];
    userData.habits.push(newHabit);
    
    publicHabit.usedCount = (publicHabit.usedCount || 0) + 1;
    const index = publicCatalog.findIndex(h => h.id == publicHabitId);
    if (index !== -1) {
        publicCatalog[index] = publicHabit;
        localStorage.setItem('habitPublicCatalog', JSON.stringify(publicCatalog));
    }
    
    userData.activity = userData.activity || [];
    userData.activity.unshift({
        id: Date.now() + 1,
        type: 'add',
        habitId: newHabit.id,
        habitName: newHabit.name,
        date: new Date().toISOString(),
        source: 'public'
    });
    
    saveUserData();
    showNotification('✅ Публичная привычка добавлена в ваши', 'success');
    renderHabits();
    loadPublicCatalog();
    updateProgress();
}

// ============ ПРИВЫЧКИ НА МОДЕРАЦИИ ============
function renderUserPublicHabits() {
    const section = document.getElementById('publicPendingSection');
    const container = document.getElementById('publicPendingContainer');
    
    if (!section || !container) return;

    const pending = moderationData.pendingHabits?.filter(h => 
        h.userId === authData.currentUser?.id && h.isPublic === true
    ) || [];

    if (pending.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = '';

    pending.forEach(habit => {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 col-12';
        
        const categoryIcons = {
            health: 'bi-heart-pulse', education: 'bi-book', work: 'bi-briefcase',
            hobby: 'bi-palette', mindfulness: 'bi-cup-hot', productivity: 'bi-lightning-charge',
            fitness: 'bi-bicycle', other: 'bi-tag'
        };
        const categoryIcon = categoryIcons[habit.category] || 'bi-tag';

        col.innerHTML = `
            <div class="habit-card opacity-75">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="habit-title">
                            <i class="bi ${categoryIcon} me-2" style="color: var(--accent);"></i>
                            ${habit.name}
                        </h5>
                        <p class="habit-description small">${habit.description || 'Нет описания'}</p>
                        <small class="text-muted">
                            <i class="bi bi-globe me-1"></i>Публичная привычка
                        </small>
                    </div>
                    <span class="badge bg-warning">На модерации</span>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

// ============ ПРОГРЕСС И ДОСТИЖЕНИЯ ============
function updateProgress() {
    const habits = userData.habits?.filter(h => h.status === 'approved' && !h.isPublic) || [];
    updateCompletionStatus(habits);
    
    const completed = habits.filter(h => h.completedToday).length;
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const progressText = document.getElementById('progress-text');
    if (progressText) progressText.textContent = `Выполнено ${completed} из ${total} привычек`;

    const progressPercentage = document.getElementById('progress-percentage');
    if (progressPercentage) progressPercentage.textContent = percentage + '%';

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = percentage + '%';
    
    updateLevel();
}

function updateLevel() {
    const points = userData.points || 0;
    const level = Math.floor(points / 100) + 1;
    userData.level = level;
    
    const levelElem = document.getElementById('userLevel');
    if (levelElem) levelElem.textContent = level;
}

function getCategoryName(category) {
    const names = { 
        health: 'Здоровье', 
        education: 'Образование', 
        work: 'Работа',
        hobby: 'Хобби', 
        mindfulness: 'Осознанность', 
        productivity: 'Продуктивность',
        fitness: 'Спорт', 
        other: 'Другое' 
    };
    return names[category] || category;
}

// Глобальные функции
window.initHabitsPage = initHabitsPage;
window.toggleHabit = toggleHabit;
window.deleteHabit = deleteHabit;
window.addPersonalHabit = addPersonalHabit;
window.addPublicHabit = addPublicHabit;
window.addPublicToPersonal = addPublicToPersonal;

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('habits.html')) {
        setTimeout(() => {
            if (typeof initHabitsPage === 'function') initHabitsPage();
        }, 100);
    }
});