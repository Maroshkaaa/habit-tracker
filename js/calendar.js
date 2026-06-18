let calendarView = 'month';
let currentDate = new Date();

function initCalendarPage() {
    renderCalendar();
    setupCalendarEvents();
    loadUpcomingHabits();
    updateCalendarStats();
}

function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Обновляем название месяца
    document.getElementById('currentMonth').textContent = 
        new Date(year, month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    // Получаем первый день месяца (0 - воскресенье, 1 - понедельник, ...)
    let firstDay = new Date(year, month, 1).getDay();
    // Преобразуем для понедельника как первого дня (0 = воскресенье -> 6, 1 = понедельник -> 0)
    if (firstDay === 0) firstDay = 6; // воскресенье
    else firstDay = firstDay - 1; // понедельник = 0, вторник = 1 и т.д.
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Получаем все привычки пользователя
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    
    let calendarHTML = '';
    
    // Добавляем пустые ячейки до первого дня
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Ячейки дней
    for (let day = 1; day <= daysInMonth; day++) {
        // СОЗДАЕМ ДАТУ ПРАВИЛЬНО - используем локальное время
        const date = new Date(year, month, day);
        // Форматируем дату в YYYY-MM-DD с учетом локального времени
        const dateStr = formatLocalDate(date);
        
        const today = new Date();
        const todayStr = formatLocalDate(today);
        
        const isToday = dateStr === todayStr;
        
        // Получаем привычки на этот день
        let completedCount = 0;
        let totalCount = 0;
        
        habits.forEach(habit => {
            if (habit.history && habit.history.includes(dateStr)) {
                completedCount++;
            }
            totalCount++;
        });
        
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        // Определяем класс для дня
        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' today';
        if (completedCount > 0) {
            if (completionRate === 100) dayClass += ' fully-completed';
            else dayClass += ' partially-completed';
        }
        
        calendarHTML += `
            <div class="${dayClass}" data-date="${dateStr}">
                <span class="day-number">${day}</span>
                ${completedCount > 0 ? `
                    <div class="day-habits">
                        <div class="habit-indicator completed">
                            <span>${completedCount} выполн.</span>
                        </div>
                    </div>
                ` : ''}
                ${totalCount > 0 && completedCount === 0 ? `
                    <div class="day-habits">
                        <div class="habit-indicator">
                            <span>${totalCount} план.</span>
                        </div>
                    </div>
                ` : ''}
                ${completionRate > 0 ? `<div class="completion-badge">${completionRate}%</div>` : ''}
            </div>
        `;
    }
    
    container.innerHTML = calendarHTML;
    
    // Добавляем обработчики
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
        day.addEventListener('click', () => showDayDetails(day.dataset.date));
    });
}

// Функция для правильного форматирования даты в локальном времени
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showDayDetails(dateStr) {
    // Создаем дату из строки, добавляя время чтобы избежать проблем с часовым поясом
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const habits = getHabitsForDate(dateStr);
    
    const modal = new bootstrap.Modal(document.getElementById('dayDetailsModal'));
    document.getElementById('dayDetailsDate').textContent = 
        date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const container = document.getElementById('dayHabitsList');
    
    if (habits.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calendar-x display-1" style="color: var(--text-light); opacity: 0.3; margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light);">Нет привычек на этот день</p>
            </div>
        `;
    } else {
        container.innerHTML = habits.map(h => `
            <div class="d-flex justify-content-between align-items-center p-2 mb-2" style="background: var(--light); border-radius: 8px;">
                <div>
                    <strong style="color: var(--primary); font-size: 0.9rem;">${h.name}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-light);">${h.time || 'Не указано'}</div>
                </div>
                <span class="badge ${h.completed ? 'bg-success' : 'bg-warning'}">
                    ${h.completed ? '✅ Выполнено' : '⏳ Ожидает'}
                </span>
            </div>
        `).join('');
    }
    
    modal.show();
}

function getHabitsForDate(dateStr) {
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    
    return habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        description: habit.description,
        completed: habit.history?.includes(dateStr) || false,
        time: habit.time,
        category: habit.category,
        difficulty: habit.difficulty
    }));
}

function setupCalendarEvents() {
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        updateCalendarStats();
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        updateCalendarStats();
    });
    
    document.getElementById('todayBtn')?.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
        updateCalendarStats();
    });
}

function loadUpcomingHabits() {
    const container = document.getElementById('upcomingHabits');
    if (!container) return;
    
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const upcoming = habits
        .filter(h => !h.completedToday)
        .map(h => {
            const [hours, minutes] = (h.time || '08:00').split(':').map(Number);
            const habitTime = hours * 60 + minutes;
            return { ...h, timeValue: habitTime };
        })
        .filter(h => h.timeValue > currentTime)
        .sort((a, b) => a.timeValue - b.timeValue)
        .slice(0, 5);
    
    if (upcoming.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-check-circle" style="color: var(--secondary); font-size: 3rem; margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light);">На сегодня всё выполнено!</p>
                <p style="color: var(--text-light); font-size: 0.9rem;">Отличная работа! 👏</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = upcoming.map(h => {
        const timeUntil = getTimeUntil(h.timeValue, currentTime);
        const isSoon = h.timeValue - currentTime <= 60;
        
        return `
            <div class="upcoming-item ${isSoon ? 'soon' : ''}">
                <div class="upcoming-info">
                    <h6>${h.name}</h6>
                    <small>${h.time || '08:00'}</small>
                </div>
                <div class="upcoming-time">
                    через ${timeUntil}
                </div>
            </div>
        `;
    }).join('');
}

function getTimeUntil(habitTime, currentTime) {
    const diff = habitTime - currentTime;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours > 0) return `${hours} ч ${minutes} мин`;
    if (minutes > 0) return `${minutes} мин`;
    return 'меньше минуты';
}

function updateCalendarStats() {
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalCompleted = 0;
    let totalPossible = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatLocalDate(date);
        
        habits.forEach(habit => {
            if (habit.history?.includes(dateStr)) {
                totalCompleted++;
            }
            totalPossible++;
        });
    }
    
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    const maxStreak = Math.max(...habits.map(h => h.streak || 0), 0);
    
    document.getElementById('monthStats').textContent = completionRate + '%';
    document.getElementById('totalCompleted').textContent = totalCompleted;
    document.getElementById('currentStreakCalendar').textContent = maxStreak;
}

// Экспорт функций
window.initCalendarPage = initCalendarPage;