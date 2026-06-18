let friends = [];
let challenges = [];

function initSocialPage() {
    loadFriends();
    loadChallenges();
    loadGlobalFeed();
    setupSocialEvents();
}

function loadFriends() {
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) return;
    
    friends = JSON.parse(localStorage.getItem('habitFriends')) || [
        { id: 2, name: 'Екатерина', username: 'katya', streak: 15, habits: 23, avatar: null },
        { id: 3, name: 'Дмитрий', username: 'dima', streak: 8, habits: 15, avatar: null },
        { id: 4, name: 'Анна', username: 'anna', streak: 23, habits: 31, avatar: null }
    ];
    
    if (friends.length === 0) {
        friendsList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-people"></i>
                <h5>Пока нет друзей</h5>
                <p>Найдите людей с похожими интересами</p>
                <button class="btn btn-primary btn-sm" onclick="searchFriends()">
                    <i class="bi bi-search me-1"></i>Найти друзей
                </button>
            </div>
        `;
        return;
    }
    
    friendsList.innerHTML = friends.map(friend => `
        <div class="friend-item">
            <div class="friend-avatar">
                ${friend.name.charAt(0)}
            </div>
            <div class="friend-info">
                <div class="friend-name">${friend.name}</div>
                <div class="friend-meta">
                    <span class="friend-streak">
                        <i class="bi bi-fire"></i> ${friend.streak}
                    </span>
                    <span class="friend-habits">
                        <i class="bi bi-check-circle"></i> ${friend.habits}
                    </span>
                </div>
            </div>
            <button class="friend-action" onclick="viewFriendProfile(${friend.id})">
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>
    `).join('');
}

function loadChallenges() {
    const container = document.getElementById('challengesList');
    if (!container) return;
    
    challenges = JSON.parse(localStorage.getItem('habitChallenges')) || [
        {
            id: 1,
            name: '🏃 Утренний бег',
            description: 'Пробежка по утрам в течение 30 дней',
            participants: 12,
            daysLeft: 23,
            totalDays: 30,
            category: 'health',
            reward: 500
        },
        {
            id: 2,
            name: '📚 Читай каждый день',
            description: '30 минут чтения ежедневно',
            participants: 45,
            daysLeft: 15,
            totalDays: 30,
            category: 'education',
            reward: 300
        },
        {
            id: 3,
            name: '🧘 Медитация',
            description: '10 минут осознанности каждый день',
            participants: 28,
            daysLeft: 7,
            totalDays: 21,
            category: 'mindfulness',
            reward: 400
        }
    ];
    
    if (challenges.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-trophy"></i>
                <h5>Нет активных челленджей</h5>
                <p>Создайте свой первый челлендж</p>
                <button class="btn btn-success btn-sm" onclick="openCreateChallengeModal()">
                    <i class="bi bi-plus-circle me-1"></i>Создать
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = challenges.map(challenge => {
        const progress = Math.round(((challenge.totalDays - challenge.daysLeft) / challenge.totalDays) * 100);
        
        return `
            <div class="challenge-card">
                <div class="challenge-header">
                    <h6 class="challenge-title">${challenge.name}</h6>
                    <span class="challenge-reward">+${challenge.reward}</span>
                </div>
                <p class="challenge-desc">${challenge.description}</p>
                
                <div class="challenge-progress">
                    <div class="progress-label">
                        <span>Прогресс</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-custom">
                        <div class="progress-custom-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="challenge-footer">
                    <div class="challenge-meta">
                        <i class="bi bi-people"></i>
                        <span>${challenge.participants}</span>
                        <i class="bi bi-calendar ms-2"></i>
                        <span>${challenge.daysLeft} дн.</span>
                    </div>
                    <button class="btn-join" onclick="joinChallenge(${challenge.id})">
                        Присоединиться
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadGlobalFeed() {
    const container = document.getElementById('globalFeed');
    if (!container) return;
    
    const feed = [
        {
            id: 1,
            user: 'Мария',
            username: '@maria',
            avatar: null,
            action: 'выполнила привычку "Утренняя йога" 🧘‍♀️',
            time: '5 минут назад',
            likes: 3,
            comments: 1,
            liked: false
        },
        {
            id: 2,
            user: 'Алексей',
            username: '@alex',
            avatar: null,
            action: 'достиг 30-дневной серии в "Чтение книг" 📚',
            time: '1 час назад',
            likes: 12,
            comments: 4,
            liked: true
        },
        {
            id: 3,
            user: 'София',
            username: '@sofia',
            avatar: null,
            action: 'добавила новую привычку "Медитация" 🧘‍♀️',
            time: '3 часа назад',
            likes: 7,
            comments: 2,
            liked: false
        },
        {
            id: 4,
            user: 'Дмитрий',
            username: '@dima',
            avatar: null,
            action: 'завершил челлендж "Утренний бег" 🏃‍♂️',
            time: '5 часов назад',
            likes: 24,
            comments: 8,
            liked: false
        }
    ];
    
    container.innerHTML = feed.map(item => `
        <div class="feed-post" data-id="${item.id}">
            <div class="post-header">
                <div class="post-avatar">
                    ${item.user.charAt(0)}
                </div>
                <div class="post-user">
                    <h5>${item.user}</h5>
                    <small>${item.username} • ${item.time}</small>
                </div>
            </div>
            <div class="post-content">
                <p class="post-text">${item.action}</p>
            </div>
            <div class="post-actions">
                <button class="post-action ${item.liked ? 'liked' : ''}" onclick="toggleLike(${item.id})">
                    <i class="bi ${item.liked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    <span>${item.likes}</span>
                </button>
                <button class="post-action" onclick="commentPost(${item.id})">
                    <i class="bi bi-chat"></i>
                    <span>${item.comments}</span>
                </button>
            </div>
        </div>
    `).join('');
}

function toggleLike(postId) {
    const post = document.querySelector(`.feed-post[data-id="${postId}"]`);
    if (post) {
        const likeBtn = post.querySelector('.post-action:first-child');
        const likeIcon = likeBtn.querySelector('i');
        const likeCount = likeBtn.querySelector('span');
        
        if (likeIcon.classList.contains('bi-heart')) {
            likeIcon.className = 'bi bi-heart-fill';
            likeBtn.classList.add('liked');
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
        } else {
            likeIcon.className = 'bi bi-heart';
            likeBtn.classList.remove('liked');
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        }
    }
}

function commentPost(postId) {
    showNotification('💬 Скоро появится возможность комментировать!', 'info');
}

function setupSocialEvents() {
    document.getElementById('addFriendBtn')?.addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('addFriendModal')).show();
    });
    
    document.getElementById('searchFriendBtn')?.addEventListener('click', searchFriends);
    document.getElementById('createChallengeBtn')?.addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('createChallengeModal')).show();
    });
}

function searchFriends() {
    const query = document.getElementById('friendSearch').value.toLowerCase();
    if (query.length < 3) {
        showNotification('Введите минимум 3 символа', 'warning');
        return;
    }
    showNotification('🔍 Поиск в разработке', 'info');
}

function viewFriendProfile(friendId) {
    window.location.href = `profile.html?id=${friendId}`;
}

function joinChallenge(challengeId) {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
        showNotification(`✅ Вы присоединились к "${challenge.name}"`, 'success');
        userData.points = (userData.points || 0) + 50;
        challenge.participants++;
        saveUserData();
        loadChallenges();
    }
}

function createChallenge() {
    const name = document.getElementById('challengeName').value;
    const desc = document.getElementById('challengeDesc').value;
    const category = document.getElementById('challengeCategory').value;
    const duration = parseInt(document.getElementById('challengeDuration').value);
    const reward = parseInt(document.getElementById('challengeReward').value);

    if (!name || !desc) {
        showNotification('Заполните все поля', 'warning');
        return;
    }

    const categoryIcons = {
        health: '🏃',
        education: '📚',
        fitness: '💪',
        mindfulness: '🧘',
        other: '🎯'
    };

    const newChallenge = {
        id: Date.now(),
        name: `${categoryIcons[category] || '🎯'} ${name}`,
        description: desc,
        participants: 1,
        daysLeft: duration,
        totalDays: duration,
        category: category,
        reward: reward,
        createdBy: authData.currentUser?.id || 1,
        createdAt: new Date().toISOString()
    };
    
    challenges.unshift(newChallenge);
    localStorage.setItem('habitChallenges', JSON.stringify(challenges));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('createChallengeModal'));
    modal.hide();
    
    document.getElementById('createChallengeForm').reset();
    
    loadChallenges();
    showNotification('🎉 Челлендж создан!', 'success');
}

function openCreateChallengeModal() {
    new bootstrap.Modal(document.getElementById('createChallengeModal')).show();
}

// Глобальные функции
window.toggleLike = toggleLike;
window.commentPost = commentPost;
window.openCreateChallengeModal = openCreateChallengeModal;
window.createChallenge = createChallenge;