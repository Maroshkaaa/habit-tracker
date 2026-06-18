// Расширенная аналитика
function initAdvancedAnalytics() {
    renderHeatmap();
    renderPredictionChart();
    calculateInsights();
    loadRecommendations();
}

function renderHeatmap() {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;
    
    const year = new Date().getFullYear();
    const data = generateHeatmapData();
    
    let heatmap = '<div class="heatmap">';
    
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    heatmap += '<div class="heatmap-months">';
    months.forEach(month => { heatmap += `<div class="heatmap-month">${month}</div>`; });
    heatmap += '</div>';
    
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    heatmap += '<div class="heatmap-weeks">';
    
    for (let week = 0; week < 52; week++) {
        heatmap += '<div class="heatmap-week">';
        days.forEach(day => {
            const dayData = data[week * 7 + day] || { count: 0, date: '' };
            const intensity = getHeatmapIntensity(dayData.count);
            heatmap += `<div class="heatmap-day intensity-${intensity}" title="${dayData.date}: ${dayData.count} привычек"></div>`;
        });
        heatmap += '</div>';
    }
    
    heatmap += '</div></div>';
    container.innerHTML = heatmap;
}

function generateHeatmapData() {
    const data = {};
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const count = habits.filter(h => h.history?.includes(dateStr)).length;
        const dayOfWeek = d.getDay();
        const weekNumber = Math.floor((d - startDate) / (7 * 24 * 60 * 60 * 1000));
        const index = weekNumber * 7 + (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
        data[index] = { count, date: d.toLocaleDateString('ru-RU') };
    }
    return data;
}

function getHeatmapIntensity(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
}

function renderPredictionChart() {
    const ctx = document.getElementById('predictionChart')?.getContext('2d');
    if (!ctx) return;
    
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    const predictions = generatePredictions(habits);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: predictions.map(p => p.date),
            datasets: [
                { label: 'Прогноз выполнения', data: predictions.map(p => p.prediction), borderColor: '#d9b382', backgroundColor: 'rgba(217, 179, 130, 0.1)', borderDash: [5, 5], fill: true },
                { label: 'Фактическое выполнение', data: predictions.map(p => p.actual), borderColor: '#3a2c29', backgroundColor: 'rgba(58, 44, 41, 0.1)', fill: true }
            ]
        },
        options: { responsive: true, plugins: { title: { display: true, text: 'Прогноз на следующие 7 дней' } } }
    });
}

function generatePredictions(habits) {
    const predictions = [];
    const today = new Date();
    for (let i = -7; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const actual = habits.filter(h => h.history?.includes(dateStr)).length;
        const avgCompletion = getAverageCompletion(habits);
        const dayOfWeek = date.getDay();
        const dayFactor = getDayFactor(dayOfWeek);
        const prediction = Math.round(avgCompletion * dayFactor);
        predictions.push({ date: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), actual: i <= 0 ? actual : null, prediction: i > 0 ? prediction : null });
    }
    return predictions;
}

function getAverageCompletion(habits) {
    if (habits.length === 0) return 0;
    let total = 0; let days = 0;
    for (let i = 0; i < 30; i++) {
        const date = new Date(); date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        total += habits.filter(h => h.history?.includes(dateStr)).length;
        days++;
    }
    return total / days;
}

function getDayFactor(dayOfWeek) { return dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1; }

function calculateInsights() {
    const container = document.getElementById('insightsContainer');
    if (!container) return;
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    const insights = [];
    const bestHabit = habits.reduce((best, current) => (current.streak || 0) > (best?.streak || 0) ? current : best, null);
    if (bestHabit) insights.push({ icon: 'bi-trophy', color: 'warning', text: `Лучшая привычка: "${bestHabit.name}" (${bestHabit.streak} дней)` });
    container.innerHTML = insights.map(i => `<div class="insight-item"><i class="bi ${i.icon} text-${i.color} me-3"></i><span>${i.text}</span></div>`).join('');
}

function loadRecommendations() {
    const container = document.getElementById('recommendationsList');
    if (!container) return;
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    const categories = habits.map(h => h.category);
    const recommendations = generateRecommendations(categories);
    container.innerHTML = recommendations.map(rec => `<div class="recommendation-item"><div class="d-flex align-items-center"><i class="bi ${rec.icon} text-primary me-3" style="font-size: 1.5rem;"></i><div><h6 class="mb-1">${rec.title}</h6><p class="text-muted small mb-2">${rec.description}</p><button class="btn btn-sm btn-outline-success" onclick="addRecommendedHabit('${rec.title}')">Добавить привычку</button></div></div></div>`).join('');
}

function generateRecommendations(categories) {
    const recommendations = [
        { icon: 'bi-heart-pulse', title: 'Пить больше воды', description: 'Выпивайте 8 стаканов воды каждый день', category: 'health' },
        { icon: 'bi-book', title: 'Ежедневное чтение', description: 'Читайте 20 минут перед сном', category: 'education' },
        { icon: 'bi-cup-hot', title: 'Утренняя медитация', description: '5 минут осознанности после пробуждения', category: 'mindfulness' }
    ];
    return recommendations.filter(rec => !categories.includes(rec.category)).slice(0, 3);
}

function addRecommendedHabit(title) {
    const habitName = prompt('Введите название привычки:', title);
    if (habitName) {
        const newHabit = { id: Date.now(), name: habitName, description: title, time: '08:00', difficulty: 2, category: 'other', userId: authData.currentUser?.id || 1, userName: authData.currentUser?.username || 'user', createdAt: new Date().toISOString() };
        moderationData.pendingHabits.push(newHabit);
        saveUserData();
        showNotification('✅ Привычка добавлена в модерацию', 'success');
    }
}