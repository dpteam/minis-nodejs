// ===== Основной JavaScript файл =====

// Глобальные переменные
let currentUser = null;
let websocket = null;
let notificationTimeout = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeEventListeners();
    initializeTooltips();
    initializeModals();
    loadCurrentUser();
});

// Инициализация приложения
function initializeApp() {
    // Проверка поддержки браузера
    checkBrowserSupport();
    
    // Инициализация темы
    initializeTheme();
    
    // Инициализация анимаций
    initializeAnimations();
    
    // Загрузка непрочитанных уведомлений
    loadUnreadNotifications();
    
    // Инициализация WebSocket
    initializeWebSocket();
    
    // Настройка автоматического обновления сессии
    setupSessionRefresh();
}

// Проверка поддержки браузера
function checkBrowserSupport() {
    const requiredFeatures = [
        'fetch',
        'Promise',
        'localStorage',
        'sessionStorage',
        'WebSocket'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => !(feature in window));
    
    if (missingFeatures.length > 0) {
        showBrowserError(missingFeatures);
    }
}

// Показ ошибки совместимости браузера
function showBrowserError(missingFeatures) {
    const errorHtml = `
        <div class="browser-error">
            <h3>Browser Not Supported</h3>
            <p>Your browser is missing the following required features:</p>
            <ul>
                ${missingFeatures.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <p>Please update your browser or use a modern browser like Chrome, Firefox, Safari, or Edge.</p>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', errorHtml);
}

// Инициализация темы
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const theme = savedTheme === 'auto' ? systemTheme : savedTheme;
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Слушатель изменений системной темы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === 'auto') {
            document.body.classList.toggle('dark-theme', e.matches);
        }
    });
}

// Инициализация анимаций
function initializeAnimations() {
    // Анимация появления элементов
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Наблюдение за элементами с классом .animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Инициализация event listeners
function initializeEventListeners() {
    // Навигация
    setupNavigationListeners();
    
    // Формы
    setupFormListeners();
    
    // Модальные окна
    setupModalListeners();
    
    // Уведомления
    setupNotificationListeners();
    
    // Профиль пользователя
    setupProfileListeners();
    
    // Сообщения
    setupMessageListeners();
    
    // Админ панель
    setupAdminListeners();
    
    // Клавиатурные сокращения
    setupKeyboardShortcuts();
    
    // Автосохранение
    setupAutoSave();
    
    // Ленивая загрузка изображений
    setupLazyLoading();
}

// Настройка навигации
function setupNavigationListeners() {
    // Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
    
    // Закрытие мобильного меню при клике вне его
    document.addEventListener('click', (e) => {
        if (mobileMenu && mobileMenuBtn && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target) &&
            mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
    
    // Выпадающие меню
    setupDropdownListeners();
}

// Настройка выпадающих меню
function setupDropdownListeners() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (trigger && menu) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Закрыть другие выпадающие меню
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.querySelector('.dropdown-menu')?.classList.remove('active');
                    }
                });
                
                menu.classList.toggle('active');
            });
        }
    });
    
    // Закрытие выпадающих меню при клике вне их
    document.addEventListener('click', () => {
        dropdowns.forEach(dropdown => {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.classList.remove('active');
            }
        });
    });
}

// Настройка форм
function setupFormListeners() {
    // Валидация форм
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        setupFormValidation(form);
    });
    
    // Автосохранение
    setupAutoSaveForms();
    
    // Загрузка файлов
    setupFileUploads();
    
    // Поиск с автодополнением
    setupAutocomplete();
}

// Обработка отправки формы
function handleFormSubmit(e) {
    const form = e.target;
    
    // Проверка валидации
    if (!form.checkValidity()) {
        e.preventDefault();
        showFormErrors(form);
        return;
    }
    
    // Показ индикатора загрузки
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Loading...';
    }
    
    // Если это AJAX форма
    if (form.dataset.ajax === 'true') {
        e.preventDefault();
        submitFormAjax(form);
    }
}

// Показ ошибок формы
function showFormErrors(form) {
    const invalidFields = form.querySelectorAll(':invalid');
    
    invalidFields.forEach(field => {
        field.classList.add('error');
        
        // Показать сообщение об ошибке
        const errorMsg = field.validationMessage;
        showFieldError(field, errorMsg);
    });
    
    // Фокус на первом невалидном поле
    if (invalidFields.length > 0) {
        invalidFields[0].focus();
    }
}

// Показ ошибки поля
function showFieldError(field, message) {
    // Удалить существующее сообщение об ошибке
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Создать новое сообщение об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    
    // Удалить ошибку при изменении поля
    field.addEventListener('input', () => {
        errorDiv.remove();
        field.classList.remove('error');
    }, { once: true });
}

// Настройка валидации формы
function setupFormValidation(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
        // Валидация в реальном времени
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        // Очистка ошибок при вводе
        field.addEventListener('input', () => {
            if (field.classList.contains('error')) {
                field.classList.remove('error');
                const error = field.parentNode.querySelector('.field-error');
                if (error) error.remove();
            }
        });
    });
}

// Валидация поля
function validateField(field) {
    if (field.validity.valid) {
        field.classList.remove('error');
        const error = field.parentNode.querySelector('.field-error');
        if (error) error.remove();
        return true;
    } else {
        field.classList.add('error');
        showFieldError(field, field.validationMessage);
        return false;
    }
}

// AJAX отправка формы
async function submitFormAjax(form) {
    try {
        const formData = new FormData(form);
        const url = form.action || window.location.pathname;
        const method = form.method || 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            handleFormSuccess(form, data);
        } else {
            handleFormError(form, data);
        }
    } catch (error) {
        handleFormError(form, { error: 'Network error occurred' });
    } finally {
        // Восстановить кнопку отправки
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
        }
    }
}

// Обработка успешной отправки формы
function handleFormSuccess(form, data) {
    // Показать сообщение об успехе
    if (data.message) {
        showNotification('success', data.message);
    }
    
    // Перенаправление, если указано
    if (data.redirect) {
        setTimeout(() => {
            window.location.href = data.redirect;
        }, 1000);
        return;
    }
    
    // Обновление данных, если указано
    if (data.reload) {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        return;
    }
    
    // Сброс формы
    form.reset();
    
    // Вызов колбэка, если указан
    if (form.dataset.successCallback) {
        const callback = window[form.dataset.successCallback];
        if (typeof callback === 'function') {
            callback(data);
        }
    }
}

// Обработка ошибки отправки формы
function handleFormError(form, data) {
    // Показать сообщение об ошибке
    if (data.error) {
        showNotification('error', data.error);
    }
    
    // Показать ошибки полей, если есть
    if (data.errors) {
        Object.entries(data.errors).forEach(([fieldName, errors]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('error');
                showFieldError(field, errors[0]);
            }
        });
    }
}

// Настройка модальных окон
function setupModalListeners() {
    // Открытие модальных окон
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.dataset.modal;
            openModal(modalId);
        });
    });
    
    // Закрытие модальных окон
    const closeButtons = document.querySelectorAll('.modal .close-btn, .modal .cancel-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Закрытие при клике вне модального окна
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.active');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

// Открытие модального окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Фокус на первый элемент
    const firstFocusable = modal.querySelector('input, button, [href]');
    if (firstFocusable) {
        firstFocusable.focus();
    }
    
    // Вызов колбэка
    if (modal.dataset.onOpen) {
        const callback = window[modal.dataset.onOpen];
        if (typeof callback === 'function') {
            callback(modal);
        }
    }
}

// Закрытие модального окна
function closeModal(modal) {
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Вызов колбэка
    if (modal.dataset.onClose) {
        const callback = window[modal.dataset.onClose];
        if (typeof callback === 'function') {
            callback(modal);
        }
    }
}

// Настройка уведомлений
function setupNotificationListeners() {
    // Кнопка уведомлений
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationMenu = document.getElementById('notificationMenu');
    
    if (notificationBtn && notificationMenu) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationMenu();
        });
    }
    
    // Закрытие меню уведомлений при клике вне его
    document.addEventListener('click', (e) => {
        if (notificationMenu && !notificationBtn?.contains(e.target) && !notificationMenu.contains(e.target)) {
            notificationMenu.classList.remove('active');
        }
    });
}

// Переключение меню уведомлений
function toggleNotificationMenu() {
    const notificationMenu = document.getElementById('notificationMenu');
    if (!notificationMenu) return;
    
    notificationMenu.classList.toggle('active');
    
    if (notificationMenu.classList.contains('active')) {
        loadNotifications();
    }
}

// Загрузка уведомлений
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications?limit=5', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderNotifications(data.data.notifications);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Отображение уведомлений
function renderNotifications(notifications) {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<p class="no-notifications">No notifications</p>';
        return;
    }
    
    notificationList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.isRead ? '' : 'unread'}" data-id="${notification.id}">
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <span class="notification-time">${formatRelativeTime(notification.createdAt)}</span>
            </div>
            ${!notification.isRead ? '<button class="mark-read-btn" onclick="markNotificationRead(' + notification.id + ')">Mark as read</button>' : ''}
        </div>
    `).join('');
}

// Загрузка количества непрочитанных уведомлений
async function loadUnreadNotifications() {
    try {
        const response = await fetch('/api/notifications/unread-count', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateNotificationBadge(data.data.unreadCount);
        }
    } catch (error) {
        console.error('Error loading unread notifications count:', error);
    }
}

// Обновление бейджа уведомлений
function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;
    
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Показать уведомление
function showNotification(type, message, duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Настройка профиля
function setupProfileListeners() {
    // Загрузка аватара
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    // Редактирование профиля
    const editProfileForm = document.getElementById('profileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Смена пароля
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
}

// Обработка загрузки аватара
async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Валидация файла
    if (!validateImageFile(file)) {
        showNotification('error', 'Invalid file type or size');
        return;
    }
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
        const response = await fetch('/api/me/avatar', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Обновить аватар на странице
            const avatars = document.querySelectorAll('.user-avatar, .profile-avatar, .author-avatar');
            avatars.forEach(avatar => {
                if (avatar.src.includes('/uploads/avatars/')) {
                    avatar.src = data.data.avatarUrl + '?t=' + Date.now();
                }
            });
            
            showNotification('success', 'Avatar updated successfully');
        } else {
            showNotification('error', data.error || 'Failed to upload avatar');
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Валидация изображения
function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        return false;
    }
    
    if (file.size > maxSize) {
        return false;
    }
    
    return true;
}

// Обработка обновления профиля
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/me', {
            method: 'PUT',
            body: formData,
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('success', 'Profile updated successfully');
            // Обновить данные на странице
            updateProfileData(data.data);
        } else {
            handleFormError(e.target, data);
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Обработка смены пароля
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/me/change-password', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('success', 'Password changed successfully');
            closeModal(e.target.closest('.modal'));
            e.target.reset();
        } else {
            handleFormError(e.target, data);
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Настройка сообщений
function setupMessageListeners() {
    // Лайки
    document.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.like-btn');
            const messageId = btn.dataset.messageId;
            toggleLike(messageId);
        }
    });
    
    // Ответы
    document.addEventListener('click', (e) => {
        if (e.target.closest('.reply-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.reply-btn');
            const messageId = btn.dataset.messageId;
            showReplyForm(messageId);
        }
    });
    
    // Удаление сообщений
    document.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.delete-btn');
            const messageId = btn.dataset.messageId;
            deleteMessage(messageId);
        }
    });
    
    // Создание сообщений
    const newMessageForm = document.getElementById('newMessageForm');
    if (newMessageForm) {
        newMessageForm.addEventListener('submit', handleNewMessage);
    }
}

// Переключение лайка
async function toggleLike(messageId) {
    try {
        const response = await fetch(`/api/messages/${messageId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Обновить UI
            const likeBtn = document.querySelector(`[data-message-id="${messageId}"] .like-btn`);
            if (likeBtn) {
                likeBtn.classList.toggle('liked');
                const likeCount = likeBtn.querySelector('.like-count');
                if (likeCount) {
                    likeCount.textContent = data.data.likesCount;
                }
            }
        } else {
            showNotification('error', data.error || 'Failed to toggle like');
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Показать форму ответа
function showReplyForm(messageId) {
    const replyForm = document.getElementById(`reply-form-${messageId}`);
    if (replyForm) {
        replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
        
        if (replyForm.style.display === 'block') {
            const textarea = replyForm.querySelector('textarea');
            if (textarea) {
                textarea.focus();
            }
        }
    }
}

// Удаление сообщения
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Удалить сообщение из DOM
            const messageCard = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageCard) {
                messageCard.style.opacity = '0';
                setTimeout(() => {
                    messageCard.remove();
                }, 300);
            }
            
            showNotification('success', 'Message deleted successfully');
        } else {
            showNotification('error', data.error || 'Failed to delete message');
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Обработка нового сообщения
async function handleNewMessage(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('success', 'Message posted successfully');
            e.target.reset();
            
            // Обновить ленту сообщений
            if (typeof loadMessages === 'function') {
                loadMessages();
            }
        } else {
            handleFormError(e.target, data);
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Настройка админ панели
function setupAdminListeners() {
    // Переключение статуса пользователя
    document.addEventListener('click', (e) => {
        if (e.target.closest('.toggle-user-status')) {
            e.preventDefault();
            const userId = e.target.closest('.toggle-user-status').dataset.userId;
            toggleUserStatus(userId);
        }
    });
    
    // Удаление пользователя
    document.addEventListener('click', (e) => {
        if (e.target.closest('.delete-user-btn')) {
            e.preventDefault();
            const userId = e.target.closest('.delete-user-btn').dataset.userId;
            deleteUser(userId);
        }
    });
    
    // Экспорт данных
    document.addEventListener('click', (e) => {
        if (e.target.closest('.export-data-btn')) {
            e.preventDefault();
            const format = e.target.closest('.export-data-btn').dataset.format;
            exportData(format);
        }
    });
    
    // Рассылка сообщений
    const broadcastForm = document.getElementById('broadcastForm');
    if (broadcastForm) {
        broadcastForm.addEventListener('submit', handleBroadcast);
    }
}

// Переключение статуса пользователя
async function toggleUserStatus(userId) {
    try {
        const response = await fetch(`/admin/users/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                isActive: true // Будет переключено на сервере
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('success', 'User status updated');
            // Обновить UI
            location.reload();
        } else {
            showNotification('error', data.error || 'Failed to update user status');
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Удаление пользователя
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('success', 'User deleted successfully');
            // Удалить из DOM
            const userRow = document.querySelector(`tr[data-user-id="${userId}"]`);
            if (userRow) {
                userRow.remove();
            }
        } else {
            showNotification('error', data.error || 'Failed to delete user');
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Экспорт данных
function exportData(format) {
    window.location.href = `/admin/export?format=${format}`;
}

// Обработка рассылки
async function handleBroadcast(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const broadcastData = {
        title: formData.get('title'),
        message: formData.get('message'),
        type: formData.get('broadcastType')
    };
    
    try {
        const response = await fetch('/admin/broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(broadcastData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('success', 'Broadcast sent successfully');
            closeModal(e.target.closest('.modal'));
            e.target.reset();
        } else {
            showNotification('error', data.error || 'Failed to send broadcast');
        }
    } catch (error) {
        showNotification('error', 'Network error occurred');
    }
}

// Настройка клавиатурных сокращений
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K для поиска
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"], .search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + N для нового сообщения
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const newMessageBtn = document.querySelector('[data-action="new-message"]');
            if (newMessageBtn) {
                newMessageBtn.click();
            }
        }
        
        // Escape для закрытия модальных окон
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

// Настройка автосохранения
function setupAutoSave() {
    const autoSaveElements = document.querySelectorAll('[data-auto-save]');
    
    autoSaveElements.forEach(element => {
        let timeout;
        
        element.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                autoSave(element);
            }, 2000);
        });
    });
}

// Автосохранение элемента
async function autoSave(element) {
    const value = element.value;
    const field = element.name || element.id;
    
    try {
        const response = await fetch('/api/auto-save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ field, value })
        });
        
        const data = await response.json();
        
        if (data.success) {
            element.classList.add('auto-saved');
            setTimeout(() => {
                element.classList.remove('auto-saved');
            }, 2000);
        }
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

// Настройка ленивой загрузки
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Настройка автодополнения
function setupAutocomplete() {
    const searchInputs = document.querySelectorAll('[data-autocomplete]');
    
    searchInputs.forEach(input => {
        let timeout;
        let currentRequest = null;
        
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(timeout);
            
            if (query.length < 2) {
                hideAutocompleteResults(input);
                return;
            }
            
            timeout = setTimeout(() => {
                // Отменить предыдущий запрос
                if (currentRequest) {
                    currentRequest.abort();
                }
                
                currentRequest = fetchAutocompleteResults(input, query);
            }, 300);
        });
        
        // Скрытие результатов при клике вне
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !e.target.closest('.autocomplete-results')) {
                hideAutocompleteResults(input);
            }
        });
    });
}

// Получение результатов автодополнения
async function fetchAutocompleteResults(input, query) {
    try {
        const endpoint = input.dataset.autocomplete;
        const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
            showAutocompleteResults(input, data.data.results);
        }
    } catch (error) {
        console.error('Autocomplete error:', error);
    }
}

// Показ результатов автодополнения
function showAutocompleteResults(input, results) {
    // Удалить существующие результаты
    hideAutocompleteResults(input);
    
    if (results.length === 0) {
        return;
    }
    
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'autocomplete-results';
    
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = result.label;
        item.addEventListener('click', () => {
            input.value = result.value;
            hideAutocompleteResults(input);
            
            // Вызов колбэка выбора
            if (input.dataset.onSelect) {
                const callback = window[input.dataset.onSelect];
                if (typeof callback === 'function') {
                    callback(result);
                }
            }
        });
        
        resultsContainer.appendChild(item);
    });
    
    input.parentNode.appendChild(resultsContainer);
}

// Скрытие результатов автодополнения
function hideAutocompleteResults(input) {
    const resultsContainer = input.parentNode.querySelector('.autocomplete-results');
    if (resultsContainer) {
        resultsContainer.remove();
    }
}

// Настройка загрузки файлов
function setupFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            handleFileSelect(e.target);
        });
    });
}

// Обработка выбора файла
function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Показать информацию о файле
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-size">${formatFileSize(file.size)}</span>
        <button type="button" class="remove-file" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Вставить после input
    input.parentNode.insertBefore(fileInfo, input.nextSibling);
    
    // Валидация файла
    if (!validateFile(input, file)) {
        fileInfo.classList.add('error');
        return;
    }
    
    // Предпросмотр изображения, если это изображение
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('img');
            preview.src = e.target.result;
            preview.className = 'file-preview';
            fileInfo.appendChild(preview);
        };
        reader.readAsDataURL(file);
    }
}

// Валидация файла
function validateFile(input, file) {
    const allowedTypes = input.dataset.allowedTypes?.split(',') || [];
    const maxSize = parseInt(input.dataset.maxSize) || 5 * 1024 * 1024; // 5MB
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        showNotification('error', 'File type not allowed');
        return false;
    }
    
    if (file.size > maxSize) {
        showNotification('error', 'File too large');
        return false;
    }
    
    return true;
}

// Настройка WebSocket
function initializeWebSocket() {
    if (!window.WebSocket) {
        console.warn('WebSocket not supported');
        return;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
        console.log('WebSocket connected');
        
        // Аутентификация
        const token = getAuthToken();
        if (token) {
            websocket.send(JSON.stringify({
                type: 'auth',
                token: token
            }));
        }
    };
    
    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    websocket.onclose = () => {
        console.log('WebSocket disconnected');
        // Попытка переподключения
        setTimeout(() => {
            initializeWebSocket();
        }, 5000);
    };
    
    websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Обработка WebSocket сообщений
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'notification':
            handleWebSocketNotification(data);
            break;
        case 'message':
            handleWebSocketMessage(data);
            break;
        case 'friend_request':
            handleWebSocketFriendRequest(data);
            break;
        case 'like':
            handleWebSocketLike(data);
            break;
        case 'system':
            handleWebSocketSystem(data);
            break;
        default:
            console.log('Unknown WebSocket message type:', data.type);
    }
}

// Обработка WebSocket уведомления
function handleWebSocketNotification(data) {
    // Обновить бейдж
    updateNotificationBadge(data.unreadCount);
    
    // Показать всплывающее уведомление
    showNotification('info', data.message);
    
    // Обновить список уведомлений, если он открыт
    const notificationMenu = document.getElementById('notificationMenu');
    if (notificationMenu && notificationMenu.classList.contains('active')) {
        loadNotifications();
    }
}

// Обработка WebSocket сообщения
function handleWebSocketMessage(data) {
    // Обновить ленту сообщений, если она открыта
    if (typeof loadMessages === 'function') {
        loadMessages();
    }
}

// Обработка WebSocket запроса в друзья
function handleWebSocketFriendRequest(data) {
    showNotification('info', `New friend request from ${data.senderName}`);
    
    // Обновить счетчик друзей
    const friendCount = document.querySelector('.friend-count');
    if (friendCount) {
        friendCount.textContent = parseInt(friendCount.textContent) + 1;
    }
}

// Обработка WebSocket лайка
function handleWebSocketLike(data) {
    // Обновить счетчик лайков
    const likeBtn = document.querySelector(`[data-message-id="${data.messageId}"] .like-btn`);
    if (likeBtn) {
        const likeCount = likeBtn.querySelector('.like-count');
        if (likeCount) {
            likeCount.textContent = data.likesCount;
        }
    }
}

// Обработка WebSocket системного сообщения
function handleWebSocketSystem(data) {
    showNotification('warning', data.message);
}

// Настройка обновления сессии
function setupSessionRefresh() {
    // Обновлять сессию каждые 15 минут
    setInterval(() => {
        refreshSession();
    }, 15 * 60 * 1000);
}

// Обновление сессии
async function refreshSession() {
    try {
        const response = await fetch('/api/refresh-session', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                updateAuthToken(data.token);
            }
        }
    } catch (error) {
        console.error('Session refresh failed:', error);
    }
}

// Загрузка текущего пользователя
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/me', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.data;
            
            // Обновить UI с данными пользователя
            updateUserData(currentUser);
        }
    } catch (error) {
        console.error('Failed to load current user:', error);
    }
}

// Обновление данных пользователя в UI
function updateUserData(user) {
    // Обновить имя пользователя
    const userNames = document.querySelectorAll('.user-name');
    userNames.forEach(el => {
        el.textContent = `${user.firstName} ${user.lastName}`;
    });
    
    // Обновить аватар
    const avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach(el => {
        if (!el.src || el.src.includes('default-avatar')) {
            el.src = user.avatar || '/images/default-avatar.png';
        }
    });
    
    // Обновить тему
    if (user.preferences?.theme) {
        applyTheme(user.preferences.theme);
    }
}

// Обновление данных профиля
function updateProfileData(profileData) {
    // Обновить имя
    const profileNames = document.querySelectorAll('.profile-name');
    profileNames.forEach(el => {
        el.textContent = `${profileData.firstName} ${profileData.lastName}`;
    });
    
    // Обновить био
    const profileBios = document.querySelectorAll('.profile-bio');
    profileBios.forEach(el => {
        el.textContent = profileData.bio || '';
    });
    
    // Обновить email
    const profileEmails = document.querySelectorAll('.profile-email');
    profileEmails.forEach(el => {
        el.textContent = profileData.email;
    });
}

// Применение темы
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        // Auto theme
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-theme', systemTheme);
    }
    
    localStorage.setItem('theme', theme);
}

// Настройка тултипов
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            showTooltip(e.target, e.target.dataset.tooltip);
        });
        
        element.addEventListener('mouseleave', () => {
            hideTooltip();
        });
    });
}

// Показ тултипа
function showTooltip(element, text) {
    hideTooltip(); // Удалить существующий тултип
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    // Позиционирование
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
    
    // Показать с анимацией
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
}

// Скрытие тултипа
function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Настройка модальных окон
function initializeModals() {
    // Инициализация уже открытых модальных окон
    const openModals = document.querySelectorAll('.modal.active');
    openModals.forEach(modal => {
        setupModalFocusTrap(modal);
    });
}

// Настройка ловушки фокуса для модальных окон
function setupModalFocusTrap(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
}

// Вспомогательные функции
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

function updateAuthToken(token) {
    localStorage.setItem('authToken', token);
    sessionStorage.setItem('authToken', token);
}

function formatRelativeTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function truncateText(text, length) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Экспорт функций для глобального использования
window.showNotification = showNotification;
window.openModal = openModal;
window.closeModal = closeModal;
window.formatRelativeTime = formatRelativeTime;
window.formatFileSize = formatFileSize;
window.truncateText = truncateText;
window.escapeHtml = escapeHtml;
window.debounce = debounce;
window.throttle = throttle;