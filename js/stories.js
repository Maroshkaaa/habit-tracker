//Истории успеха пользователей

let stories = [];
let currentFilter = 'all';
let currentSort = 'popular';
let displayedStories = 0;
const STORIES_PER_PAGE = 6;

// Инициализация страницы историй
function initStoriesPage() {
    loadStories();
    setupEventListeners();
    renderQuoteOfDay();
}

// Загрузка историй
function loadStories() {
    const savedStories = localStorage.getItem('habitStories');
    
    if (savedStories) {
        stories = JSON.parse(savedStories);
    } else {
        // Истории по умолчанию
        stories = [
            {
                id: 1,
                authorId: 1,
                authorName: 'Екатерина',
                authorAvatar: null,
                title: '30 дней без сахара: как я изменила свою жизнь',
                content: 'Я всегда была сладкоежкой. Конфеты, печенье, шоколад - без этого не проходил ни один день. Но постоянная усталость, проблемы с кожей и лишний вес заставили меня задуматься. Я решила попробовать отказаться от сахара на 30 дней. Первая неделя была настоящим испытанием. Голова болела, хотелось сладкого постоянно. Но я держалась. На второй неделе стало легче, появилась энергия. К концу месяца я похудела на 3 кг, кожа очистилась, а сон стал крепче. Теперь прошло уже полгода, и я не представляю свою жизнь без этого опыта!',
                category: 'health',
                habits: ['Пить воду вместо сладких напитков', 'Есть фрукты вместо конфет', 'Читать состав продуктов'],
                likes: 245,
                saves: 78,
                shares: 34,
                date: new Date(Date.now() - 15 * 86400000).toISOString(),
                featured: true,
                comments: 12
            },
            {
                id: 2,
                authorId: 2,
                authorName: 'Алексей',
                authorAvatar: null,
                title: 'От дивана до полумарафона за год',
                content: 'Раньше я думал, что бег - это не для меня. После работы хотелось только лечь на диван и смотреть телевизор. Но однажды друг позвал на пробежку, и я согласился. Пробежал 500 метров и чуть не умер. Это было унизительно! Я решил, что должен измениться. Начал с 10-минутных пробежек через день. Постепенно увеличивал время. Через 3 месяца бегал уже 30 минут без остановки. А через год пробежал свой первый полумарафон! Сейчас бегаю 4 раза в неделю, чувствую себя лучше, чем в 20 лет.',
                category: 'fitness',
                habits: ['Утренняя пробежка', 'Планка каждый день', 'Отжимания утром'],
                likes: 567,
                saves: 234,
                shares: 89,
                date: new Date(Date.now() - 30 * 86400000).toISOString(),
                featured: true,
                comments: 45
            },
            {
                id: 3,
                authorId: 3,
                authorName: 'Мария',
                authorAvatar: null,
                title: 'Английский за чашкой кофе',
                content: 'В школе я учила английский 10 лет, но говорила только "London is the capital". Когда устроилась в IT-компанию, поняла, что без языка не обойтись. Но как учить, если после работы совсем нет сил? Я придумала систему: каждое утро за завтраком учила 10 новых слов. Просто записывала их на стикерах и клеила на холодильник. Через месяц знала уже 300 слов. Через полгода смогла смотреть сериалы в оригинале. А через год свободно общалась с иностранными коллегами. Главное - маленькие шаги каждый день!',
                category: 'education',
                habits: ['10 новых слов в день', 'Смотреть видео на английском', 'Читать новости на английском'],
                likes: 189,
                saves: 67,
                shares: 23,
                date: new Date(Date.now() - 7 * 86400000).toISOString(),
                featured: false,
                comments: 8
            },
            {
                id: 4,
                authorId: 4,
                authorName: 'Дмитрий',
                authorAvatar: null,
                title: 'Как медитация изменила мою карьеру',
                content: 'Я работал в режиме 24/7, постоянный стресс, недосып, выгорание. Дошло до того, что не мог уснуть без снотворного. Друг посоветовал попробовать медитацию. Честно, я думал, что это какая-то эзотерика. Но решил попробовать - 5 минут утром просто сидеть и дышать. Первую неделю было сложно, мысли разбегались. Но потом привык. Через месяц заметил, что стал спокойнее, лучше концентрироваться на работе. Через полгода убрал снотворное, сплю как младенец. Теперь медитирую по 20 минут утром и вечером. Это лучшее, что случилось со мной в жизни!',
                category: 'mindfulness',
                habits: ['Утренняя медитация', 'Вечерняя медитация', 'Дневник благодарности'],
                likes: 432,
                saves: 156,
                shares: 67,
                date: new Date(Date.now() - 45 * 86400000).toISOString(),
                featured: true,
                comments: 23
            },
            {
                id: 5,
                authorId: 5,
                authorName: 'Анна',
                authorAvatar: null,
                title: 'Правило 5 утра: как стать продуктивнее',
                content: 'Раньше я вставала в 8 утра, еле доползала до работы и чувствовала себя разбитой. Потом прочитала книгу "Магия утра" и решила попробовать. Первые дни были кошмаром. Но я завела будильник на 5 утра и поставила его в другой конец комнаты. Вставала, умывалась, делала зарядку, медитировала, читала. Через месяц заметила, что успеваю сделать больше до 9 утра, чем раньше за весь день. Сейчас в 5 утра - мое любимое время. Тишина, никого нет, можно спокойно поработать над собой.',
                category: 'productivity',
                habits: ['Ранний подъем', 'План на день', 'Чтение утром'],
                likes: 678,
                saves: 289,
                shares: 123,
                date: new Date(Date.now() - 10 * 86400000).toISOString(),
                featured: false,
                comments: 34
            },
            {
                id: 6,
                authorId: 6,
                authorName: 'Сергей',
                authorAvatar: null,
                title: 'Как я перестал есть фастфуд и похудел на 15 кг',
                content: 'Я работаю водителем, постоянно в дороге, поэтому питался фастфудом. Вес рос, здоровье ухудшалось. Врач сказал, что если не изменю питание, будут серьезные проблемы. Я начал с малого - перестал пить газировку, заменил на воду. Потом перестал есть булочки. Стал брать с собой домашнюю еду. Через полгода минус 15 кг! Сейчас готовлю дома всегда, чувствую себя отлично. А главное - привычка готовить еду с собой стала такой же естественной, как чистить зубы.',
                category: 'health',
                habits: ['Готовить еду с собой', 'Пить 2 литра воды', 'Не есть после 20:00'],
                likes: 321,
                saves: 98,
                shares: 45,
                date: new Date(Date.now() - 20 * 86400000).toISOString(),
                featured: false,
                comments: 15
            }
        ];
        saveStories();
    }
    
    renderStories();
}

// Сохранение историй
function saveStories() {
    localStorage.setItem('habitStories', JSON.stringify(stories));
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Фильтры по категориям
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            displayedStories = 0;
            renderStories();
        });
    });
    
    // Сортировка
    document.getElementById('sortStories')?.addEventListener('change', function(e) {
        currentSort = e.target.value;
        displayedStories = 0;
        renderStories();
    });
}

// Отображение историй
function renderStories() {
    const container = document.getElementById('storiesContainer');
    if (!container) return;
    
    // Фильтрация
    let filteredStories = [...stories];
    if (currentFilter !== 'all') {
        filteredStories = filteredStories.filter(s => s.category === currentFilter);
    }
    
    // Сортировка
    filteredStories.sort((a, b) => {
        if (currentSort === 'popular') return b.likes - a.likes;
        if (currentSort === 'recent') return new Date(b.date) - new Date(a.date);
        if (currentSort === 'inspiring') return (b.saves + b.shares) - (a.saves + a.shares);
        return 0;
    });
    
    // Обновляем счетчик
    document.getElementById('storiesCount').textContent = `Найдено ${filteredStories.length} историй`;
    
    // Пагинация
    const storiesToShow = filteredStories.slice(0, STORIES_PER_PAGE);
    displayedStories = STORIES_PER_PAGE;
    
    if (filteredStories.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-journal-x display-1 text-muted mb-4"></i>
                    <h5 class="text-muted">Нет историй в этой категории</h5>
                    <p class="text-muted">Будьте первым, кто поделится своей историей!</p>
                    <button class="btn btn-primary mt-3" onclick="openShareStoryModal()">
                        <i class="bi bi-pencil-square me-2"></i>Рассказать историю
                    </button>
                </div>
            </div>
        `;
        document.getElementById('loadMoreContainer').style.display = 'none';
        return;
    }
    
    container.innerHTML = storiesToShow.map(story => createStoryCard(story)).join('');
    
    // Показываем кнопку "Загрузить еще", если есть еще истории
    document.getElementById('loadMoreContainer').style.display = 
        filteredStories.length > STORIES_PER_PAGE ? 'block' : 'none';
}

// Создание карточки истории
function createStoryCard(story) {
    const date = new Date(story.date).toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    const categoryNames = {
        health: 'Здоровье',
        education: 'Образование',
        work: 'Работа',
        mindfulness: 'Осознанность',
        fitness: 'Спорт',
        productivity: 'Продуктивность'
    };
    
    return `
        <div class="story-card ${story.featured ? 'featured' : ''}">
            <div class="story-header">
                <div class="story-avatar">
                    ${story.authorName.charAt(0)}
                </div>
                <div class="story-author-info">
                    <h3>${story.authorName}</h3>
                    <div class="story-meta">
                        <i class="bi bi-calendar"></i> ${date}
                    </div>
                </div>
            </div>
            
            <div class="story-badge">${categoryNames[story.category] || story.category}</div>
            
            <h4 class="story-title">${story.title}</h4>
            <p class="story-content">${story.content.substring(0, 150)}...</p>
            
            <div class="story-stats">
                <div class="stat-item">
                    <div class="value">${story.likes}</div>
                    <div class="label">❤️ Лайки</div>
                </div>
                <div class="stat-item">
                    <div class="value">${story.saves}</div>
                    <div class="label">💾 Сохранения</div>
                </div>
                <div class="stat-item">
                    <div class="value">${story.comments || 0}</div>
                    <div class="label">💬 Комментарии</div>
                </div>
            </div>
            
            <div class="habits-list">
                <h6>Привычки, которые помогли:</h6>
                ${story.habits.map(habit => 
                    `<span class="habit-tag">${habit}</span>`
                ).join('')}
            </div>
            
            <div class="story-actions">
                <button class="btn-save-habits" onclick="openSaveHabitsModal(${story.id})">
                    <i class="bi bi-plus-circle me-2"></i>Добавить привычки
                </button>
                <button class="btn-like ${story.liked ? 'liked' : ''}" onclick="toggleStoryLike(${story.id})">
                    <i class="bi ${story.liked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
            </div>
        </div>
    `;
}

// Загрузить еще истории
function loadMoreStories() {
    const container = document.getElementById('storiesContainer');
    
    let filteredStories = [...stories];
    if (currentFilter !== 'all') {
        filteredStories = filteredStories.filter(s => s.category === currentFilter);
    }
    
    filteredStories.sort((a, b) => {
        if (currentSort === 'popular') return b.likes - a.likes;
        if (currentSort === 'recent') return new Date(b.date) - new Date(a.date);
        if (currentSort === 'inspiring') return (b.saves + b.shares) - (a.saves + a.shares);
        return 0;
    });
    
    const nextStories = filteredStories.slice(displayedStories, displayedStories + STORIES_PER_PAGE);
    displayedStories += STORIES_PER_PAGE;
    
    nextStories.forEach(story => {
        container.insertAdjacentHTML('beforeend', createStoryCard(story));
    });
    
    // Скрываем кнопку, если больше нет историй
    if (displayedStories >= filteredStories.length) {
        document.getElementById('loadMoreContainer').style.display = 'none';
    }
}

// Открыть модальное окно для сохранения привычек
function openSaveHabitsModal(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    document.getElementById('saveHabitsModalTitle').textContent = story.title;
    document.getElementById('saveHabitsModalDesc').textContent = story.content.substring(0, 100) + '...';
    
    const container = document.getElementById('habitsToSave');
    container.innerHTML = story.habits.map(habit => `
        <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" value="${habit}" id="habit_${habit}" checked>
            <label class="form-check-label" for="habit_${habit}">
                ${habit}
            </label>
        </div>
    `).join('');
    
    window.currentStoryForSave = story;
    new bootstrap.Modal(document.getElementById('saveHabitsModal')).show();
}

// Подтвердить сохранение привычек
function confirmSaveHabits() {
    if (!authData.currentUser) {
        showNotification('❌ Пожалуйста, войдите в систему', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const checkboxes = document.querySelectorAll('#habitsToSave input:checked');
    const selectedHabits = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedHabits.length === 0) {
        showNotification('❌ Выберите хотя бы одну привычку', 'warning');
        return;
    }
    
    // Добавляем привычки в модерацию
    selectedHabits.forEach(habitName => {
        const newHabit = {
            id: Date.now() + Math.random(),
            name: habitName,
            description: `Вдохновлено историей "${window.currentStoryForSave.title}"`,
            time: '08:00',
            difficulty: 2,
            category: window.currentStoryForSave.category,
            userId: authData.currentUser.id,
            userName: authData.currentUser.name || authData.currentUser.username,
            createdAt: new Date().toISOString(),
            fromStory: window.currentStoryForSave.id,
            storyAuthor: window.currentStoryForSave.authorName
        };
        
        moderationData.pendingHabits.push(newHabit);
    });
    
    // Увеличиваем счетчик сохранений истории
    window.currentStoryForSave.saves++;
    saveStories();
    
    saveUserData();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('saveHabitsModal'));
    if (modal) modal.hide();
    
    showNotification(`✅ ${selectedHabits.length} привычек добавлено в модерацию!`, 'success');
}

// Лайкнуть историю
function toggleStoryLike(storyId) {
    if (!authData.currentUser) {
        showNotification('❌ Войдите, чтобы ставить лайки', 'warning');
        return;
    }
    
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    if (story.liked) {
        story.likes--;
        story.liked = false;
    } else {
        story.likes++;
        story.liked = true;
    }
    
    saveStories();
    renderStories();
}

// Открыть модальное окно для добавления своей истории
function openShareStoryModal() {
    if (!authData.currentUser) {
        showNotification('❌ Войдите, чтобы поделиться историей', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Загружаем привычки пользователя
    const habits = userData.habits?.filter(h => h.status === 'approved') || [];
    const container = document.getElementById('userHabitsForStory');
    
    if (habits.length === 0) {
        container.innerHTML = '<p class="text-muted">У вас пока нет привычек</p>';
    } else {
        container.innerHTML = habits.map(habit => `
            <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" value="${habit.name}" id="storyHabit_${habit.id}">
                <label class="form-check-label" for="storyHabit_${habit.id}">
                    ${habit.name}
                </label>
            </div>
        `).join('');
    }
    
    new bootstrap.Modal(document.getElementById('shareStoryModal')).show();
}

// Отправить историю
function submitStory() {
    const title = document.getElementById('storyTitle').value.trim();
    const content = document.getElementById('storyText').value.trim();
    const category = document.getElementById('storyCategory').value;
    
    if (!title || !content) {
        showNotification('❌ Заполните все поля', 'warning');
        return;
    }
    
    // Получаем выбранные привычки
    const selectedHabits = [];
    document.querySelectorAll('#userHabitsForStory input:checked').forEach(cb => {
        selectedHabits.push(cb.value);
    });
    
    const newStory = {
        id: Date.now(),
        authorId: authData.currentUser.id,
        authorName: authData.currentUser.name || authData.currentUser.username,
        authorAvatar: null,
        title: title,
        content: content,
        category: category,
        habits: selectedHabits,
        likes: 0,
        saves: 0,
        shares: 0,
        date: new Date().toISOString(),
        featured: false,
        comments: 0
    };
    
    stories.unshift(newStory);
    saveStories();
    
    // Награждаем пользователя
    userData.points = (userData.points || 0) + 50;
    userData.storiesShared = (userData.storiesShared || 0) + 1;
    
    // Обновляем достижения
    updateAchievements();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('shareStoryModal'));
    if (modal) modal.hide();
    
    document.getElementById('shareStoryForm').reset();
    
    showNotification('✅ История опубликована! Спасибо, что делитесь опытом!', 'success');
    
    renderStories();
}

// Обновление достижений
function updateAchievements() {
    // Достижение "Социальный" - поделиться историей
    if (userData.storiesShared >= 1) {
        const achievement = userData.achievements?.find(a => a.id === 5);
        if (achievement && !achievement.earned) {
            achievement.earned = true;
            achievement.earnedAt = new Date().toISOString();
            showNotification('🏆 Получено достижение: "Социальный"', 'success');
        }
    }
    
    // Достижение "Мотиватор" - лайки на историях
    const totalLikes = stories
        .filter(s => s.authorId === authData.currentUser.id)
        .reduce((sum, s) => sum + s.likes, 0);
    
    if (totalLikes >= 10) {
        const achievement = userData.achievements?.find(a => a.id === 6);
        if (achievement && !achievement.earned) {
            achievement.earned = true;
            achievement.earnedAt = new Date().toISOString();
            achievement.progress = 10;
            showNotification('🏆 Получено достижение: "Мотиватор"', 'success');
        }
    } else {
        const achievement = userData.achievements?.find(a => a.id === 6);
        if (achievement) {
            achievement.progress = totalLikes;
        }
    }
    
    saveUserData();
}

// Цитата дня
function renderQuoteOfDay() {
    const quotes = [
        { text: 'Маленькие шаги каждый день приводят к большим результатам.', author: 'Лао Цзы' },
        { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
        { text: 'Ты не обязан быть великим, чтобы начать. Но ты должен начать, чтобы стать великим.', author: 'Зиг Зиглар' },
        { text: 'Успех — это сумма маленьких усилий, повторяющихся день за днем.', author: 'Роберт Кольер' },
        { text: 'Лучшее время посадить дерево было 20 лет назад. Следующее лучшее время — сегодня.', author: 'Китайская пословица' },
        { text: 'Твоя жизнь не улучшится случайно, она улучшится только от изменений.', author: 'Джим Рон' }
    ];
    
    const today = new Date().toDateString();
    const lastQuoteDate = localStorage.getItem('lastQuoteDate');
    
    let quote;
    if (lastQuoteDate !== today) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quote = quotes[randomIndex];
        localStorage.setItem('lastQuoteDate', today);
        localStorage.setItem('dailyQuote', JSON.stringify(quote));
    } else {
        quote = JSON.parse(localStorage.getItem('dailyQuote')) || quotes[0];
    }
    
    document.getElementById('dailyQuoteText').textContent = `"${quote.text}"`;
    document.getElementById('dailyQuoteAuthor').textContent = `— ${quote.author}`;
}

// Глобальные функции
window.initStoriesPage = initStoriesPage;
window.openSaveHabitsModal = openSaveHabitsModal;
window.confirmSaveHabits = confirmSaveHabits;
window.toggleStoryLike = toggleStoryLike;
window.openShareStoryModal = openShareStoryModal;
window.submitStory = submitStory;
window.loadMoreStories = loadMoreStories;