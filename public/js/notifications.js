// ===== JavaScript для работы с уведомлениями =====

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.websocket = null;
        this.initialized = false;
        
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.loadNotifications();
        this.setupWebSocket();
        this.setupAutoRefresh();
        
        this.initialized = true;
    }
    
    // Настройка event listeners
    setupEventListeners() {
        // Кнопка уведомлений
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationMenu();
            });
        }
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            const notificationMenu = document.getElementById('notificationMenu');
            if (notificationMenu && 
                !notificationBtn?.contains(e.target) && 
                !notificationMenu.contains(e.target)) {
                this.hideNotificationMenu();
            }
        });
        
        // Кнопки действий с уведомлениями
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mark-read-btn')) {
                e.preventDefault();
                const notificationId = e.target.closest('.mark-read-btn').dataset.notificationId;
                this.markAsRead(notificationId);
            }
            
            if (e.target.closest('.delete-notification-btn')) {
                e.preventDefault();
                const notificationId = e.target.closest('.delete-notification-btn').dataset.notificationId;
                this.deleteNotification(notificationId);
            }
            
            if (e.target.closest('.mark-all-read-btn')) {
                e.preventDefault();
                this.markAllAsRead();
            }
        });
        
        // Кнопка настроек уведомлений
        const notificationSettingsBtn = document.getElementById('notificationSettingsBtn');
        if (notificationSettingsBtn) {
            notificationSettingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        // Форма настроек уведомлений
        const notificationSettingsForm = document.getElementById('notificationSettingsForm');
        if (notificationSettingsForm) {
            notificationSettingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings(e.target);
            });
        }
    }
    
    // Настройка WebSocket
    setupWebSocket() {
        if (!window.WebSocket) {
            console.warn('WebSocket not supported');
            return;
        }
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('Notification WebSocket connected');
            this.authenticate();
        };
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.websocket.onclose = () => {
            console.log('Notification WebSocket disconnected');
            // Попытка переподключения
            setTimeout(() => {
                this.setupWebSocket();
            }, 5000);
        };
        
        this.websocket.onerror = (error) => {
            console.error('Notification WebSocket error:', error);
        };
    }
    
    // Аутентификация WebSocket
    authenticate() {
        const token = this.getAuthToken();
        if (token && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'auth',
                token: token
            }));
        }
    }
    
    // Обработка WebSocket сообщений
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'notification':
                this.handleNewNotification(data.notification);
                break;
            case 'notification_read':
                this.handleNotificationRead(data.notificationId);
                break;
            case 'notification_deleted':
                this.handleNotificationDeleted(data.notificationId);
                break;
            case 'unread_count':
                this.updateUnreadCount(data.count);
                break;
            default:
                console.log('Unknown notification message type:', data.type);
        }
    }
    
    // Обработка нового уведомления
    handleNewNotification(notification) {
        // Добавить в список
        this.notifications.unshift(notification);
        
        // Обновить счетчик
        this.unreadCount++;
        this.updateUnreadCount(this.unreadCount);
        
        // Показать всплывающее уведомление
        this.showPopupNotification(notification);
        
        // Обновить UI, если меню открыто
        if (this.isNotificationMenuOpen()) {
            this.renderNotifications();
        }
        
        // Проиграть звук, если включено
        if (this.isSoundEnabled()) {
            this.playNotificationSound();
        }
        
        // Вибрация, если поддерживается
        if (this.isVibrationEnabled() && 'vibrate' in navigator) {
            navigator.vibrate(200);
        }
    }
    
    // Обработка прочтения уведомления
    handleNotificationRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateUnreadCount(this.unreadCount);
            
            if (this.isNotificationMenuOpen()) {
                this.renderNotifications();
            }
        }
    }
    
    // Обработка удаления уведомления
    handleNotificationDeleted(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            const notification = this.notifications[index];
            if (!notification.isRead) {
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.updateUnreadCount(this.unreadCount);
            }
            
            this.notifications.splice(index, 1);
            
            if (this.isNotificationMenuOpen()) {
                this.renderNotifications();
            }
        }
    }
    
    // Загрузка уведомлений
    async loadNotifications() {
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.notifications = data.data.notifications;
                this.unreadCount = data.data.notifications.filter(n => !n.isRead).length;
                this.updateUnreadCount(this.unreadCount);
                
                if (this.isNotificationMenuOpen()) {
                    this.renderNotifications();
                }
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    // Отображение уведомлений
    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;
        
        if (this.notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="no-notifications">
                    <p>No notifications</p>
                </div>
            `;
            return;
        }
        
        notificationList.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.isRead ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-content" onclick="notificationManager.openNotification(${notification.id})">
                    <div class="notification-header">
                        <h4>${this.escapeHtml(notification.title)}</h4>
                        <span class="notification-time">${this.formatRelativeTime(notification.createdAt)}</span>
                    </div>
                    <p class="notification-message">${this.escapeHtml(notification.message)}</p>
                    ${notification.data && notification.data.type ? `
                        <div class="notification-type">${this.formatNotificationType(notification.data.type)}</div>
                    ` : ''}
                </div>
                <div class="notification-actions">
                    ${!notification.isRead ? `
                        <button class="action-btn mark-read-btn" data-notification-id="${notification.id}" title="Mark as read">
                            ✓
                        </button>
                    ` : ''}
                    <button class="action-btn delete-notification-btn" data-notification-id="${notification.id}" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Переключение меню уведомлений
    toggleNotificationMenu() {
        const notificationMenu = document.getElementById('notificationMenu');
        if (!notificationMenu) return;
        
        if (notificationMenu.classList.contains('active')) {
            this.hideNotificationMenu();
        } else {
            this.showNotificationMenu();
        }
    }
    
    // Показ меню уведомлений
    showNotificationMenu() {
        const notificationMenu = document.getElementById('notificationMenu');
        if (!notificationMenu) return;
        
        notificationMenu.classList.add('active');
        this.renderNotifications();
        
        // Отметить все как просмотренные (не как прочитанные)
        this.markAsViewed();
    }
    
    // Скрытие меню уведомлений
    hideNotificationMenu() {
        const notificationMenu = document.getElementById('notificationMenu');
        if (notificationMenu) {
            notificationMenu.classList.remove('active');
        }
    }
    
    // Проверка, открыто ли меню уведомлений
    isNotificationMenuOpen() {
        const notificationMenu = document.getElementById('notificationMenu');
        return notificationMenu && notificationMenu.classList.contains('active');
    }
    
    // Отметить как прочитанное
    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.handleNotificationRead(notificationId);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    
    // Отметить все как прочитанные
    async markAllAsRead() {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.notifications.forEach(notification => {
                    notification.isRead = true;
                });
                this.unreadCount = 0;
                this.updateUnreadCount(0);
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
    
    // Удалить уведомление
    async deleteNotification(notificationId) {
        if (!confirm('Are you sure you want to delete this notification?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.handleNotificationDeleted(notificationId);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }
    
    // Открыть уведомление
    openNotification(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        // Отметить как прочитанное
        if (!notification.isRead) {
            this.markAsRead(notificationId);
        }
        
        // Обработка действия в зависимости от типа уведомления
        if (notification.data) {
            this.handleNotificationAction(notification.data);
        }
    }
    
    // Обработка действия уведомления
    handleNotificationAction(data) {
        switch (data.type) {
            case 'message':
                if (data.messageId) {
                    window.location.href = `/messages#${data.messageId}`;
                }
                break;
            case 'like':
                if (data.messageId) {
                    window.location.href = `/messages#${data.messageId}`;
                }
                break;
            case 'friend_request':
                if (data.senderId) {
                    window.location.href = `/profile/${data.senderId}`;
                }
                break;
            case 'mention':
                if (data.messageId) {
                    window.location.href = `/messages#${data.messageId}`;
                }
                break;
            case 'system':
                // Системные уведомления могут не иметь действия
                break;
            default:
                console.log('Unknown notification action type:', data.type);
        }
    }
    
    // Показать всплывающее уведомление
    showPopupNotification(notification) {
        const popup = document.createElement('div');
        popup.className = 'popup-notification';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h4>${this.escapeHtml(notification.title)}</h4>
                    <button class="popup-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <p class="popup-message">${this.escapeHtml(notification.message)}</p>
                <div class="popup-time">${this.formatRelativeTime(notification.createdAt)}</div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Анимация появления
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }, 5000);
        
        // Клик для закрытия
        popup.addEventListener('click', () => {
            this.openNotification(notification.id);
            popup.remove();
        });
    }
    
    // Обновить счетчик непрочитанных уведомлений
    updateUnreadCount(count) {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        });
        
        // Обновить title страницы
        this.updatePageTitle(count);
    }
    
    // Обновить заголовок страницы
    updatePageTitle(unreadCount) {
        const baseTitle = document.title.replace(/^\(\d+\)\s*/, '');
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }
    
    // Отметить как просмотренные
    async markAsViewed() {
        // Отправить запрос на сервер для отметки времени последнего просмотра
        try {
            await fetch('/api/notifications/viewed', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
        } catch (error) {
            console.error('Error marking notifications as viewed:', error);
        }
    }
    
    // Показать настройки уведомлений
    showSettings() {
        const modal = document.getElementById('notificationSettingsModal');
        if (modal) {
            this.loadSettings();
            modal.classList.add('active');
        }
    }
    
    // Загрузить настройки
    async loadSettings() {
        try {
            const response = await fetch('/api/notifications/settings', {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.populateSettingsForm(data.data.settings);
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
        }
    }
    
    // Заполнить форму настроек
    populateSettingsForm(settings) {
        const form = document.getElementById('notificationSettingsForm');
        if (!form) return;
        
        // Email уведомления
        const emailNotifications = form.querySelector('input[name="emailNotifications"]');
        if (emailNotifications) {
            emailNotifications.checked = settings.emailNotifications !== false;
        }
        
        // Push уведомления
        const pushNotifications = form.querySelector('input[name="pushNotifications"]');
        if (pushNotifications) {
            pushNotifications.checked = settings.pushNotifications !== false;
        }
        
        // Browser уведомления
        const browserNotifications = form.querySelector('input[name="browserNotifications"]');
        if (browserNotifications) {
            browserNotifications.checked = settings.browserNotifications || false;
        }
        
        // Звуковые уведомления
        const soundEnabled = form.querySelector('input[name="soundEnabled"]');
        if (soundEnabled) {
            soundEnabled.checked = settings.soundEnabled !== false;
        }
        
        // Вибрация
        const vibrationEnabled = form.querySelector('input[name="vibrationEnabled"]');
        if (vibrationEnabled) {
            vibrationEnabled.checked = settings.vibrationEnabled || false;
        }
    }
    
    // Сохранить настройки
    async saveSettings(form) {
        const formData = new FormData(form);
        const settings = {
            emailNotifications: formData.get('emailNotifications') === 'on',
            pushNotifications: formData.get('pushNotifications') === 'on',
            browserNotifications: formData.get('browserNotifications') === 'on',
            soundEnabled: formData.get('soundEnabled') === 'on',
            vibrationEnabled: formData.get('vibrationEnabled') === 'on'
        };
        
        try {
            const response = await fetch('/api/notifications/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', 'Settings saved successfully');
                
                // Запросить разрешение на browser уведомления, если включено
                if (settings.browserNotifications) {
                    this.requestBrowserNotificationPermission();
                }
                
                // Закрыть модальное окно
                const modal = form.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            } else {
                showNotification('error', data.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving notification settings:', error);
            showNotification('error', 'Failed to save settings');
        }
    }
    
    // Запросить разрешение на browser уведомления
    requestBrowserNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification('success', 'Browser notifications enabled');
                } else if (permission === 'denied') {
                    showNotification('warning', 'Browser notifications denied');
                }
            });
        }
    }
    
    // Показать browser уведомление
    showBrowserNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: options.body,
                icon: options.icon || '/images/favicon.ico',
                badge: options.badge || '/images/favicon.ico',
                tag: options.tag || 'minis-notification',
                requireInteraction: options.requireInteraction || false,
                silent: options.silent || false
            });
            
            notification.onclick = () => {
                if (options.onClick) {
                    options.onClick();
                }
                notification.close();
            };
            
            // Автоматическое закрытие
            if (!options.requireInteraction) {
                setTimeout(() => {
                    notification.close();
                }, 5000);
            }
        }
    }
    
    // Проиграть звук уведомления
    playNotificationSound() {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(error => {
            console.error('Error playing notification sound:', error);
        });
    }
    
    // Проверить, включен ли звук
    isSoundEnabled() {
        return localStorage.getItem('notificationSoundEnabled') !== 'false';
    }
    
    // Проверить, включена ли вибрация
    isVibrationEnabled() {
        return localStorage.getItem('notificationVibrationEnabled') !== 'false';
    }
    
    // Настройка автообновления
    setupAutoRefresh() {
        // Обновлять каждые 30 секунд
        setInterval(() => {
            if (!this.isNotificationMenuOpen()) {
                this.loadUnreadCount();
            }
        }, 30000);
    }
    
    // Загрузить количество непрочитанных уведомлений
    async loadUnreadCount() {
        try {
            const response = await fetch('/api/notifications/unread-count', {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.updateUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error('Error loading unread notifications count:', error);
        }
    }
    
    // Настройка browser push уведомлений
    setupPushNotifications() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: this.urlBase64ToUint8Array(
                            'YOUR_VAPID_PUBLIC_KEY'
                        )
                    });
                })
                .then(subscription => {
                    // Отправить subscription на сервер
                    this.savePushSubscription(subscription);
                })
                .catch(error => {
                    console.error('Push notification setup failed:', error);
                });
        }
    }
    
    // Сохранить push subscription
    async savePushSubscription(subscription) {
        try {
            await fetch('/api/notifications/push-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(subscription)
            });
        } catch (error) {
            console.error('Error saving push subscription:', error);
        }
    }
    
    // Вспомогательные функции
    getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
    
    formatRelativeTime(timestamp) {
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
    
    formatNotificationType(type) {
        const types = {
            'message': 'Message',
            'like': 'Like',
            'friend_request': 'Friend Request',
            'mention': 'Mention',
            'comment': 'Comment',
            'system': 'System'
        };
        
        return types[type] || type;
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
}

// Инициализация менеджера уведомлений
const notificationManager = new NotificationManager();

// Экспорт для глобального использования
window.notificationManager = notificationManager;