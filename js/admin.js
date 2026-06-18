// admin.js - Админ панель (только модерация публичных привычек)

function initAdminPage() {
    if (!authData.currentUser || authData.currentUser.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    // Загружаем данные
    loadUserData();
    
    // Обновляем статистику и рендерим
    updateAdminStats();
    renderPendingHabits();
    renderApprovedHabits();
    
    // Автообновление каждые 30 секунд
    setInterval(() => {
        updateAdminStats();
        renderPendingHabits();
        renderApprovedHabits();
    }, 30000);
}

// Обновление статистики
function updateAdminStats() {
    const pendingHabits = moderationData.pendingHabits?.filter(h => h.isPublic === true) || [];
    const approvedHabits = moderationData.approvedHabits?.filter(h => h.isPublic === true) || [];
    
    const pendingCountElem = document.getElementById('pendingCount');
    const approvedCountElem = document.getElementById('approvedCount');
    const pendingBadgeElem = document.getElementById('pendingBadge');
    const approvedBadgeElem = document.getElementById('approvedBadge');
    
    if (pendingCountElem) pendingCountElem.textContent = pendingHabits.length;
    if (approvedCountElem) approvedCountElem.textContent = approvedHabits.length;
    if (pendingBadgeElem) pendingBadgeElem.textContent = pendingHabits.length;
    if (approvedBadgeElem) approvedBadgeElem.textContent = approvedHabits.length;
}

// Рендер привычек на модерации
function renderPendingHabits() {
    const container = document.getElementById('pendingContainer');
    if (!container) return;
    
    const pendingHabits = moderationData.pendingHabits?.filter(h => h.isPublic === true) || [];
    
    if (pendingHabits.length === 0) {
        container.innerHTML = `<div class="text-center py-5"><i class="bi bi-inbox display-1 text-muted mb-4"></i><h5 class="text-muted">Нет публичных привычек для модерации</h5><p class="text-muted">Все публичные привычки проверены</p></div>`;
        return;
    }
    
    container.innerHTML = '';
    pendingHabits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    pendingHabits.forEach(habit => {
        container.appendChild(createPendingCard(habit));
    });
}

// Рендер одобренных привычек (библиотека)
function renderApprovedHabits() {
    const container = document.getElementById('approvedContainer');
    if (!container) return;
    
    const approvedHabits = moderationData.approvedHabits?.filter(h => h.isPublic === true) || [];
    
    if (approvedHabits.length === 0) {
        container.innerHTML = `<div class="text-center py-5"><i class="bi bi-book display-1 text-muted mb-4"></i><h5 class="text-muted">Нет одобренных публичных привычек</h5><p class="text-muted">Одобренные привычки появятся здесь</p></div>`;
        return;
    }
    
    container.innerHTML = '';
    approvedHabits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    approvedHabits.forEach(habit => {
        container.appendChild(createApprovedCard(habit));
    });
}

// Карточка для привычки на модерации
function createPendingCard(habit) {
    const card = document.createElement('div');
    card.className = 'moderation-card pending-card';
    
    const difficultyText = ['', 'Легкая', 'Средняя', 'Сложная'][habit.difficulty];
    const difficultyClass = ['', 'easy', 'medium', 'hard'][habit.difficulty];
    
    const categoryIcons = {
        health: 'bi-heart-pulse', education: 'bi-book', work: 'bi-briefcase',
        hobby: 'bi-palette', mindfulness: 'bi-cup-hot', productivity: 'bi-lightning-charge',
        fitness: 'bi-bicycle', other: 'bi-tag'
    };
    const categoryIcon = categoryIcons[habit.category] || 'bi-tag';
    
    const categoryNames = {
        health: 'Здоровье', education: 'Образование', work: 'Работа',
        hobby: 'Хобби', mindfulness: 'Осознанность', productivity: 'Продуктивность',
        fitness: 'Спорт', other: 'Другое'
    };
    
    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="d-flex align-items-center gap-3">
                <div class="habit-icon"><i class="bi ${categoryIcon} fs-4" style="color: var(--accent);"></i></div>
                <div>
                    <h5 class="fw-bold mb-1">${escapeHtml(habit.name)}</h5>
                    <div class="text-muted small">
                        <i class="bi bi-person me-1"></i>${escapeHtml(habit.userName || habit.userId || 'Аноним')}
                        <span class="mx-2">•</span><i class="bi bi-clock me-1"></i>${habit.time || 'Не указано'}
                    </div>
                </div>
            </div>
            <span class="badge bg-warning text-dark"><i class="bi bi-clock-history me-1"></i>На проверке</span>
        </div>
        <div class="habit-description-block mb-3"><p class="text-muted mb-0">${escapeHtml(habit.description || 'Нет описания')}</p></div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex gap-2">
                <span class="difficulty-badge difficulty-${difficultyClass}">${difficultyText}</span>
                <span class="category-badge">${categoryNames[habit.category] || habit.category}</span>
            </div>
            <small class="text-muted"><i class="bi bi-calendar me-1"></i>${new Date(habit.createdAt).toLocaleDateString('ru-RU')}</small>
        </div>
        <div class="moderation-actions d-flex gap-2">
            <button class="btn btn-success btn-sm flex-grow-1" onclick="approveHabit(${habit.id})"><i class="bi bi-check-lg me-1"></i>Одобрить</button>
            <button class="btn btn-danger btn-sm flex-grow-1" onclick="rejectHabit(${habit.id})"><i class="bi bi-x-lg me-1"></i>Отклонить</button>
        </div>
    `;
    return card;
}

// Карточка для одобренной привычки
function createApprovedCard(habit) {
    const card = document.createElement('div');
    card.className = 'moderation-card approved-card';
    
    const difficultyText = ['', 'Легкая', 'Средняя', 'Сложная'][habit.difficulty];
    const difficultyClass = ['', 'easy', 'medium', 'hard'][habit.difficulty];
    
    const categoryIcons = { health: 'bi-heart-pulse', education: 'bi-book', work: 'bi-briefcase', hobby: 'bi-palette', mindfulness: 'bi-cup-hot', productivity: 'bi-lightning-charge', fitness: 'bi-bicycle', other: 'bi-tag' };
    const categoryIcon = categoryIcons[habit.category] || 'bi-tag';
    const categoryNames = { health: 'Здоровье', education: 'Образование', work: 'Работа', hobby: 'Хобби', mindfulness: 'Осознанность', productivity: 'Продуктивность', fitness: 'Спорт', other: 'Другое' };
    const usedCount = getUsedCount(habit.id);
    
    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="d-flex align-items-center gap-3">
                <div class="habit-icon"><i class="bi ${categoryIcon} fs-4" style="color: var(--secondary);"></i></div>
                <div>
                    <h5 class="fw-bold mb-1">${escapeHtml(habit.name)}</h5>
                    <div class="text-muted small"><i class="bi bi-person me-1"></i>${escapeHtml(habit.userName || habit.userId || 'Аноним')}<span class="mx-2">•</span><i class="bi bi-clock me-1"></i>${habit.time || 'Не указано'}</div>
                </div>
            </div>
            <span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Одобрено</span>
        </div>
        <div class="habit-description-block mb-3"><p class="text-muted mb-0">${escapeHtml(habit.description || 'Нет описания')}</p></div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex gap-2">
                <span class="difficulty-badge difficulty-${difficultyClass}">${difficultyText}</span>
                <span class="category-badge">${categoryNames[habit.category] || habit.category}</span>
                <span class="usage-badge"><i class="bi bi-people me-1"></i>${usedCount} пользователей</span>
            </div>
            <small class="text-muted"><i class="bi bi-calendar me-1"></i>${new Date(habit.moderatedAt || habit.createdAt).toLocaleDateString('ru-RU')}</small>
        </div>
    `;
    return card;
}

function getUsedCount(habitId) {
    const publicCatalog = JSON.parse(localStorage.getItem('habitPublicCatalog')) || [];
    const publicHabit = publicCatalog.find(h => h.id == habitId);
    return publicHabit?.usedCount || 0;
}

function approveHabit(habitId) {
    const pendingHabits = moderationData.pendingHabits || [];
    const habitIndex = pendingHabits.findIndex(h => h.id == habitId);
    if (habitIndex === -1) { showNotification('❌ Привычка не найдена', 'danger'); return; }
    const habit = pendingHabits[habitIndex];
    if (!moderationData.approvedHabits) moderationData.approvedHabits = [];
    moderationData.approvedHabits.push({ ...habit, moderatedAt: new Date().toISOString(), moderatedBy: authData.currentUser?.id, status: 'approved' });
    savePublicHabitToCatalog(habit);
    pendingHabits.splice(habitIndex, 1);
    saveUserData();
    showNotification(`✅ Публичная привычка "${habit.name}" одобрена!`, 'success');
    updateAdminStats(); renderPendingHabits(); renderApprovedHabits();
}

function rejectHabit(habitId) {
    const pendingHabits = moderationData.pendingHabits || [];
    const habitIndex = pendingHabits.findIndex(h => h.id == habitId);
    if (habitIndex === -1) { showNotification('❌ Привычка не найдена', 'danger'); return; }
    const habit = pendingHabits[habitIndex];
    if (!moderationData.rejectedHabits) moderationData.rejectedHabits = [];
    moderationData.rejectedHabits.push({ ...habit, moderatedAt: new Date().toISOString(), moderatedBy: authData.currentUser?.id, status: 'rejected' });
    pendingHabits.splice(habitIndex, 1);
    saveUserData();
    showNotification(`❌ Публичная привычка "${habit.name}" отклонена`, 'warning');
    updateAdminStats(); renderPendingHabits(); renderApprovedHabits();
}

function savePublicHabitToCatalog(habit) {
    let publicCatalog = JSON.parse(localStorage.getItem('habitPublicCatalog')) || [];
    const exists = publicCatalog.some(h => h.name === habit.name && h.description === habit.description);
    if (exists) return;
    publicCatalog.push({ id: habit.id, name: habit.name, description: habit.description, time: habit.time, difficulty: habit.difficulty, category: habit.category, createdBy: habit.userId, createdByName: habit.userName, createdAt: habit.createdAt, approvedAt: new Date().toISOString(), usedCount: 0, likes: 0 });
    localStorage.setItem('habitPublicCatalog', JSON.stringify(publicCatalog));
}

function escapeHtml(str) { if (!str) return ''; return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

window.approveHabit = approveHabit;
window.rejectHabit = rejectHabit;
window.initAdminPage = initAdminPage;

document.addEventListener('DOMContentLoaded', function() { if (window.location.pathname.includes('admin.html')) initAdminPage(); });