// stats.js - Полноценная статистика с графиками и аналитикой

let progressChart = null;
let categoryChart = null;
let weeklyChart = null;

function initStatsPage() {
    if (!checkAuth()) return;
    
    updateStatsCards();
    renderAchievements();
    renderDetailedStats();
    
    // Небольшая задержка для правильной инициализации canvas
    setTimeout(() => {
        createAllCharts();
    }, 200);
}

function checkAuth() {
    if (!authData.currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Обновление всех статистических карточек
function updateStatsCards() {
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    const today = new Date().toISOString().split('T')[0];
    
    // Основная статистика
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => {
        return h.history && h.history.includes(today);
    }).length;
    
    const totalCompletions = habits.reduce((sum, h) => sum + (h.history?.length || 0), 0);
    const totalDays = Math.max(...habits.map(h => h.streak || 0), 0);
    const currentStreak = Math.max(...habits.map(h => h.streak || 0), 0);
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    
    // Очки и уровень
    const points = userData.points || 0;
    const level = calculateLevel(points);
    const nextLevelPoints = level * 100;
    const currentLevelPoints = points - ((level - 1) * 100);
    
    // Обновляем отображение
    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('currentStreak').textContent = currentStreak;
    document.getElementById('totalPoints').textContent = points;
    document.getElementById('completionRate').textContent = completionRate + '%';
    
    // Дополнительная статистика
    document.getElementById('totalHabits').textContent = totalHabits;
    document.getElementById('totalCompletions').textContent = totalCompletions;
    document.getElementById('completedToday').textContent = completedToday;
    document.getElementById('userLevel').textContent = level;
    document.getElementById('levelProgress').style.width = (currentLevelPoints / 100 * 100) + '%';
}

// Расчет уровня на основе очков
function calculateLevel(points) {
    return Math.floor(points / 100) + 1;
}

// Создание всех графиков
function createAllCharts() {
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    
    createProgressChart(habits);
    createCategoryChart(habits);
    createWeeklyChart(habits);
    createHeatmap(habits);
}

// График прогресса за 30 дней
function createProgressChart(habits) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Устанавливаем размеры
    canvas.style.height = '300px';
    canvas.style.width = '100%';
    canvas.height = 300;
    
    // Уничтожаем предыдущий график
    if (progressChart) {
        progressChart.destroy();
    }

    // Получаем данные за последние 30 дней
    const labels = [];
    const data = [];
    const completionsByDay = {};
    
    // Инициализируем все дни последних 30 дней
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        completionsByDay[dateStr] = 0;
    }
    
    // Считаем выполнения по дням
    habits.forEach(habit => {
        if (habit.history) {
            habit.history.forEach(dateStr => {
                if (completionsByDay.hasOwnProperty(dateStr)) {
                    completionsByDay[dateStr]++;
                }
            });
        }
    });
    
    // Формируем данные для графика
    const sortedDates = Object.keys(completionsByDay).sort();
    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        labels.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
        data.push(completionsByDay[dateStr]);
    });

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Выполнено привычек',
                data: data,
                borderColor: '#3a2c29',
                backgroundColor: 'rgba(58, 44, 41, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#d9b382',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Выполнено: ${context.raw} привычек`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, callback: value => Math.floor(value) }
                }
            }
        }
    });

    // Обновляем статистику изменения
    updateProgressChange(data);
}

// График по категориям
function createCategoryChart(habits) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    canvas.style.height = '300px';
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    if (categoryChart) {
        categoryChart.destroy();
    }

    // Сбор данных по категориям
    const categories = {};
    habits.forEach(habit => {
        const category = habit.category || 'other';
        categories[category] = (categories[category] || 0) + 1;
    });

    if (Object.keys(categories).length === 0) {
        canvas.parentNode.innerHTML = '<div class="text-center py-5 text-muted">Нет данных для отображения</div>';
        return;
    }

    const categoryNames = {
        health: 'Здоровье',
        education: 'Образование',
        work: 'Работа',
        hobby: 'Хобби',
        mindfulness: 'Осознанность',
        other: 'Другое'
    };

    const colors = ['#b5c9a0', '#d9b382', '#3a2c29', '#5a4a47', '#9bb084', '#c9a372'];

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories).map(c => categoryNames[c] || c),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: colors.slice(0, Object.keys(categories).length),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 20, font: { size: 12 } } },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Недельный график
function createWeeklyChart(habits) {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    canvas.style.height = '200px';
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    if (weeklyChart) {
        weeklyChart.destroy();
    }

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const weeklyData = new Array(7).fill(0);
    const weeklyTotal = new Array(7).fill(0);

    habits.forEach(habit => {
        if (habit.history) {
            habit.history.forEach(dateStr => {
                const date = new Date(dateStr);
                const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1; // Преобразуем для Пн = 0
                weeklyData[dayOfWeek]++;
                weeklyTotal[dayOfWeek]++;
            });
        }
    });

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Выполнений',
                data: weeklyData,
                backgroundColor: '#d9b382',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// Тепловая карта активности
function createHeatmap(habits) {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;

    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let heatmapHTML = '<div class="heatmap-grid">';
    
    // Заголовки дней недели
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    heatmapHTML += '<div class="heatmap-weekdays">';
    weekdays.forEach(day => {
        heatmapHTML += `<div class="heatmap-weekday">${day}</div>`;
    });
    heatmapHTML += '</div>';
    
    // Создаем сетку тепловой карты
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    let dayCount = 1;
    let weekHTML = '<div class="heatmap-weeks">';
    
    for (let i = 0; i < 6; i++) {
        weekHTML += '<div class="heatmap-week">';
        for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < startOffset) || dayCount > daysInMonth) {
                weekHTML += '<div class="heatmap-day empty"></div>';
            } else {
                const date = new Date(year, month, dayCount);
                const dateStr = date.toISOString().split('T')[0];
                
                // Считаем количество выполненных привычек в этот день
                let completionCount = 0;
                habits.forEach(habit => {
                    if (habit.history && habit.history.includes(dateStr)) {
                        completionCount++;
                    }
                });
                
                const intensity = getIntensityLevel(completionCount, habits.length);
                weekHTML += `
                    <div class="heatmap-day intensity-${intensity}" 
                         title="${date.toLocaleDateString('ru-RU')}: ${completionCount} привычек">
                        <span class="heatmap-day-number">${dayCount}</span>
                    </div>
                `;
                dayCount++;
            }
        }
        weekHTML += '</div>';
    }
    
    weekHTML += '</div>';
    heatmapHTML += weekHTML + '</div>';
    
    // Легенда
    heatmapHTML += `
        <div class="heatmap-legend">
            <div class="legend-item"><span class="color-box intensity-0"></span> Нет</div>
            <div class="legend-item"><span class="color-box intensity-1"></span> 1-2</div>
            <div class="legend-item"><span class="color-box intensity-2"></span> 3-4</div>
            <div class="legend-item"><span class="color-box intensity-3"></span> 5-6</div>
            <div class="legend-item"><span class="color-box intensity-4"></span> 7+</div>
        </div>
    `;
    
    container.innerHTML = heatmapHTML;
}

// Определение уровня интенсивности для тепловой карты
function getIntensityLevel(count, totalHabits) {
    if (count === 0) return 0;
    if (count <= totalHabits * 0.25) return 1;
    if (count <= totalHabits * 0.5) return 2;
    if (count <= totalHabits * 0.75) return 3;
    return 4;
}

// Обновление индикатора изменения прогресса
function updateProgressChange(data) {
    const badge = document.getElementById('progressBadge');
    if (!badge || data.length < 2) return;

    const lastWeek = data.slice(-7);
    const previousWeek = data.slice(-14, -7);
    
    const avgLastWeek = lastWeek.reduce((a, b) => a + b, 0) / 7;
    const avgPreviousWeek = previousWeek.reduce((a, b) => a + b, 0) / 7;
    
    let change = 0;
    if (avgPreviousWeek > 0) {
        change = Math.round(((avgLastWeek - avgPreviousWeek) / avgPreviousWeek) * 100);
    }
    
    badge.textContent = change > 0 ? `+${change}%` : `${change}%`;
    badge.className = `badge ${change >= 0 ? 'bg-success' : 'bg-danger'}`;
}

// Детальная статистика
function renderDetailedStats() {
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    
    // Лучшая привычка
    const bestHabit = habits.reduce((best, current) => {
        return (current.streak || 0) > (best?.streak || 0) ? current : best;
    }, null);
    
    if (bestHabit) {
        document.getElementById('bestHabit').innerHTML = `
            <div class="stat-detail-item">
                <span class="stat-label">${bestHabit.name}</span>
                <span class="stat-value">${bestHabit.streak} дней</span>
            </div>
        `;
    }
    
    // Среднее выполнение
    const totalDays = habits.reduce((sum, h) => sum + (h.history?.length || 0), 0);
    const avgPerDay = habits.length > 0 ? (totalDays / habits.length).toFixed(1) : 0;
    document.getElementById('avgCompletion').textContent = avgPerDay;
    
    // Самая популярная категория
    const categories = {};
    habits.forEach(h => {
        categories[h.category] = (categories[h.category] || 0) + 1;
    });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
        const categoryNames = {
            health: 'Здоровье',
            education: 'Образование',
            work: 'Работа',
            hobby: 'Хобби',
            mindfulness: 'Осознанность',
            other: 'Другое'
        };
        document.getElementById('topCategory').textContent = categoryNames[topCategory[0]] || topCategory[0];
    }
}

// Отображение достижений
function renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    if (!container) return;

    const earnedCount = userData.achievements?.filter(a => a.earned).length || 0;
    const totalCount = userData.achievements?.length || 0;

    const countBadge = document.getElementById('achievementsCount');
    if (countBadge) {
        countBadge.textContent = `${earnedCount}/${totalCount}`;
    }

    container.innerHTML = '';

    (userData.achievements || []).forEach(achievement => {
        const progress = Math.min(100, (achievement.progress / achievement.total) * 100);
        
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.earned ? 'earned' : ''}`;
        
        card.innerHTML = `
            <div class="achievement-icon">
                <i class="bi ${achievement.earned ? 'bi-trophy-fill' : 'bi-trophy'}"></i>
            </div>
            <div class="achievement-info">
                <h6>${achievement.name}</h6>
                <p>${achievement.description}</p>
                ${!achievement.earned ? `
                    <div class="progress" style="height: 4px;">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <small class="text-muted">${achievement.progress}/${achievement.total}</small>
                ` : `
                    <small class="text-success">Получено ${new Date(achievement.earnedAt).toLocaleDateString()}</small>
                `}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Обновление статистики в реальном времени
function refreshStats() {
    updateStatsCards();
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    createAllCharts();
    renderDetailedStats();
}

// Автоматическое обновление каждые 30 секунд
setInterval(refreshStats, 30000);

// Глобальные функции
window.initStatsPage = initStatsPage;
window.refreshStats = refreshStats;