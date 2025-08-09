// ===== JavaScript для админ панели =====

class AdminManager {
    constructor() {
        this.charts = new Map();
        this.realTimeData = new Map();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.setupRealTimeUpdates();
        this.setupDataTables();
        this.setupBatchActions();
        this.setupFilters();
        this.setupExport();
    }
    
    // Настройка event listeners
    setupEventListeners() {
        // Переключение статуса пользователей
        document.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-user-status')) {
                e.preventDefault();
                const userId = e.target.closest('.toggle-user-status').dataset.userId;
                this.toggleUserStatus(userId);
            }
        });
        
        // Удаление пользователей
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-user-btn')) {
                e.preventDefault();
                const userId = e.target.closest('.delete-user-btn').dataset.userId;
                this.deleteUser(userId);
            }
        });
        
        // Удаление сообщений
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-message-btn')) {
                e.preventDefault();
                const messageId = e.target.closest('.delete-message-btn').dataset.messageId;
                this.deleteMessage(messageId);
            }
        });
        
        // Управление приложениями
        document.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-app-status')) {
                e.preventDefault();
                const appId = e.target.closest('.toggle-app-status').dataset.appId;
                this.toggleAppStatus(appId);
            }
            
            if (e.target.closest('.delete-app-btn')) {
                e.preventDefault();
                const appId = e.target.closest('.delete-app-btn').dataset.appId;
                this.deleteApp(appId);
            }
            
            if (e.target.closest('.regenerate-keys-btn')) {
                e.preventDefault();
                const appId = e.target.closest('.regenerate-keys-btn').dataset.appId;
                this.regenerateAppKeys(appId);
            }
        });
        
        // Рассылка сообщений
        const broadcastForm = document.getElementById('broadcastForm');
        if (broadcastForm) {
            broadcastForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendBroadcast(e.target);
            });
        }
        
        // Экспорт данных
        document.addEventListener('click', (e) => {
            if (e.target.closest('.export-btn')) {
                e.preventDefault();
                const format = e.target.closest('.export-btn').dataset.format;
                this.exportData(format);
            }
        });
        
        // Очистка системы
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cleanup-btn')) {
                e.preventDefault();
                const type = e.target.closest('.cleanup-btn').dataset.type;
                this.cleanup(type);
            }
        });
        
        // Поиск и фильтры
        this.setupSearchListeners();
        this.setupFilterListeners();
        
        // Массовые действия
        document.addEventListener('click', (e) => {
            if (e.target.closest('.batch-action-btn')) {
                e.preventDefault();
                const action = e.target.closest('.batch-action-btn').dataset.action;
                this.executeBatchAction(action);
            }
        });
    }
    
    // Настройка поиска
    setupSearchListeners() {
        const searchInputs = document.querySelectorAll('.admin-search-input');
        
        searchInputs.forEach(input => {
            let timeout;
            
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.performSearch(e.target);
                }, 500);
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target);
                }
            });
        });
    }
    
    // Настройка фильтров
    setupFilterListeners() {
        const filterSelects = document.querySelectorAll('.admin-filter-select');
        
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.applyFilters();
            });
        });
        
        // Кнопка сброса фильтров
        const resetFiltersBtn = document.querySelector('.reset-filters-btn');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }
    
    // Выполнить поиск
    async performSearch(searchInput) {
        const query = searchInput.value.trim();
        const target = searchInput.dataset.searchTarget;
        
        if (!target) return;
        
        try {
            const params = new URLSearchParams(window.location.search);
            if (query) {
                params.set('q', query);
            } else {
                params.delete('q');
            }
            
            const response = await fetch(`${window.location.pathname}?${params}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const html = await response.text();
            
            // Обновить контент
            const contentContainer = document.querySelector(target);
            if (contentContainer) {
                contentContainer.innerHTML = html;
                this.initializeCharts();
                this.setupDataTables();
            }
        } catch (error) {
            console.error('Search failed:', error);
            showNotification('error', 'Search failed');
        }
    }
    
    // Применить фильтры
    async applyFilters() {
        const filterSelects = document.querySelectorAll('.admin-filter-select');
        const params = new URLSearchParams();
        
        filterSelects.forEach(select => {
            if (select.value) {
                params.set(select.name, select.value);
            }
        });
        
        try {
            const response = await fetch(`${window.location.pathname}?${params}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const html = await response.text();
            
            // Обновить контент
            const contentContainer = document.querySelector('.admin-content');
            if (contentContainer) {
                contentContainer.innerHTML = html;
                this.initializeCharts();
                this.setupDataTables();
            }
        } catch (error) {
            console.error('Filter application failed:', error);
            showNotification('error', 'Failed to apply filters');
        }
    }
    
    // Сбросить фильтры
    resetFilters() {
        const filterSelects = document.querySelectorAll('.admin-filter-select');
        filterSelects.forEach(select => {
            select.value = '';
        });
        
        const searchInputs = document.querySelectorAll('.admin-search-input');
        searchInputs.forEach(input => {
            input.value = '';
        });
        
        // Перезагрузить страницу без параметров
        window.location.href = window.location.pathname;
    }
    
    // Переключить статус пользователя
    async toggleUserStatus(userId) {
        try {
            const response = await fetch(`/admin/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', 'User status updated successfully');
                
                // Обновить UI
                const statusBadge = document.querySelector(`[data-user-id="${userId}"] .status-badge`);
                if (statusBadge) {
                    statusBadge.textContent = data.data.isActive ? 'Active' : 'Inactive';
                    statusBadge.className = `status-badge ${data.data.isActive ? 'active' : 'inactive'}`;
                }
                
                const toggleBtn = document.querySelector(`[data-user-id="${userId}"] .toggle-user-status`);
                if (toggleBtn) {
                    toggleBtn.textContent = data.data.isActive ? 'Disable' : 'Enable';
                }
            } else {
                showNotification('error', data.error || 'Failed to update user status');
            }
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Удалить пользователя
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', 'User deleted successfully');
                
                // Удалить строку из таблицы
                const userRow = document.querySelector(`tr[data-user-id="${userId}"]`);
                if (userRow) {
                    userRow.style.transition = 'all 0.3s ease';
                    userRow.style.opacity = '0';
                    userRow.style.transform = 'translateX(-100%)';
                    
                    setTimeout(() => {
                        userRow.remove();
                        this.updateStats();
                    }, 300);
                }
            } else {
                showNotification('error', data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Удалить сообщение
    async deleteMessage(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }
        
        try {
            const response = await fetch(`/admin/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', 'Message deleted successfully');
                
                // Удалить из DOM
                const messageCard = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageCard) {
                    messageCard.style.transition = 'all 0.3s ease';
                    messageCard.style.opacity = '0';
                    messageCard.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        messageCard.remove();
                        this.updateStats();
                    }, 300);
                }
            } else {
                showNotification('error', data.error || 'Failed to delete message');
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Переключить статус приложения
    async toggleAppStatus(appId) {
        try {
            const response = await fetch(`/admin/apps/${appId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', 'App status updated successfully');
                
                // Обновить UI
                const statusBadge = document.querySelector(`[data-app-id="${appId}"] .status-badge`);
                if (statusBadge) {
                    statusBadge.textContent = data.data.isActive ? 'Active' : 'Inactive';
                    statusBadge.className = `status-badge ${data.data.isActive ? 'active' : 'inactive'}`;
                }
                
                const toggleBtn = document.querySelector(`[data-app-id="${appId}"] .toggle-app-status`);
                if (toggleBtn) {
                    toggleBtn.textContent = data.data.isActive ? 'Disable' : 'Enable';
                }
            } else {
                showNotification('error', data.error || 'Failed to update app status');
            }
        } catch (error) {
            console.error('Failed to toggle app status:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Удалить приложение
    async deleteApp(appId) {
        if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`/admin/apps/${appId}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', 'App deleted successfully');
                
                // Удалить строку из таблицы
                const appRow = document.querySelector(`tr[data-app-id="${appId}"]`);
                if (appRow) {
                    appRow.style.transition = 'all 0.3s ease';
                    appRow.style.opacity = '0';
                    appRow.style.transform = 'translateX(-100%)';
                    
                    setTimeout(() => {
                        appRow.remove();
                        this.updateStats();
                    }, 300);
                }
            } else {
                showNotification('error', data.error || 'Failed to delete app');
            }
        } catch (error) {
            console.error('Failed to delete app:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Перегенерировать ключи приложения
    async regenerateAppKeys(appId) {
        if (!confirm('Are you sure you want to regenerate API keys? This will invalidate all existing tokens.')) {
            return;
        }
        
        try {
            const response = await fetch(`/admin/apps/${appId}/regenerate-keys`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', 'API keys regenerated successfully');
                
                // Показать новые ключи
                this.showNewAppKeys(data.data);
            } else {
                showNotification('error', data.error || 'Failed to regenerate keys');
            }
        } catch (error) {
            console.error('Failed to regenerate app keys:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Показать новые ключи приложения
    showNewAppKeys(appData) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>New API Keys</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>API Key:</label>
                        <div class="api-key-container">
                            <input type="text" value="${appData.apiKey}" readonly class="form-control">
                            <button class="btn btn-sm" onclick="this.previousElementSibling.select(); document.execCommand('copy');">Copy</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>API Secret:</label>
                        <div class="api-key-container">
                            <input type="text" value="${appData.apiSecret}" readonly class="form-control">
                            <button class="btn btn-sm" onclick="this.previousElementSibling.select(); document.execCommand('copy');">Copy</button>
                        </div>
                    </div>
                    <div class="alert alert-warning">
                        <strong>Important:</strong> Save these keys immediately. They won't be shown again.
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">I've Saved the Keys</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Отправить рассылку
    async sendBroadcast(form) {
        const formData = new FormData(form);
        const broadcastData = {
            title: formData.get('title'),
            message: formData.get('message'),
            type: formData.get('type')
        };
        
        try {
            const response = await fetch('/admin/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(broadcastData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', 'Broadcast sent successfully');
                
                // Закрыть модальное окно
                const modal = form.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
                
                // Сбросить форму
                form.reset();
            } else {
                showNotification('error', data.error || 'Failed to send broadcast');
            }
        } catch (error) {
            console.error('Failed to send broadcast:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Экспорт данных
    exportData(format) {
        const params = new URLSearchParams(window.location.search);
        params.set('format', format);
        params.set('export', 'true');
        
        window.location.href = `${window.location.pathname}?${params}`;
    }
    
    // Очистка системы
    async cleanup(type) {
        const confirmMessages = {
            'notifications': 'Are you sure you want to clean up old notifications?',
            'logs': 'Are you sure you want to clean up old logs?',
            'cache': 'Are you sure you want to clear the cache?',
            'sessions': 'Are you sure you want to clean up expired sessions?'
        };
        
        if (!confirm(confirmMessages[type] || 'Are you sure?')) {
            return;
        }
        
        try {
            const response = await fetch(`/admin/cleanup/${type}`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', data.message || 'Cleanup completed successfully');
                
                // Обновить статистику
                this.updateStats();
            } else {
                showNotification('error', data.error || 'Cleanup failed');
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Инициализация графиков
    initializeCharts() {
        // График регистраций пользователей
        this.initUserRegistrationChart();
        
        // График активности
        this.initActivityChart();
        
        // График сообщений
        this.initMessagesChart();
        
        // График приложений
        this.initAppsChart();
    }
    
    // График регистраций пользователей
    initUserRegistrationChart() {
        const canvas = document.getElementById('userRegistrationChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Здесь должна быть интеграция с Chart.js или другой библиотекой графиков
        // Для примера просто создаем placeholder
        
        this.charts.set('userRegistration', {
            canvas: canvas,
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'New Users',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            }
        });
    }
    
    // График активности
    initActivityChart() {
        const canvas = document.getElementById('activityChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.set('activity', {
            canvas: canvas,
            type: 'bar',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'Active Users',
                    data: [65, 45, 80, 120, 95, 85],
                    backgroundColor: '#10b981'
                }]
            }
        });
    }
    
    // График сообщений
    initMessagesChart() {
        const canvas = document.getElementById('messagesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.set('messages', {
            canvas: canvas,
            type: 'doughnut',
            data: {
                labels: ['Public', 'Friends', 'Private'],
                datasets: [{
                    data: [300, 150, 50],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
                }]
            }
        });
    }
    
    // График приложений
    initAppsChart() {
        const canvas = document.getElementById('appsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.set('apps', {
            canvas: canvas,
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Active Apps',
                    data: [10, 15, 12, 20, 25, 30],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4
                }]
            }
        });
    }
    
    // Настройка реальных обновлений
    setupRealTimeUpdates() {
        if (!window.WebSocket) return;
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/admin`;
        
        const websocket = new WebSocket(wsUrl);
        
        websocket.onopen = () => {
            console.log('Admin WebSocket connected');
            this.authenticateWebSocket(websocket);
        };
        
        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealTimeUpdate(data);
        };
        
        websocket.onclose = () => {
            console.log('Admin WebSocket disconnected');
            // Попытка переподключения
            setTimeout(() => {
                this.setupRealTimeUpdates();
            }, 5000);
        };
        
        websocket.onerror = (error) => {
            console.error('Admin WebSocket error:', error);
        };
        
        this.websocket = websocket;
    }
    
    // Аутентификация WebSocket
    authenticateWebSocket(websocket) {
        const token = this.getAuthToken();
        if (token && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'auth',
                token: token,
                role: 'admin'
            }));
        }
    }
    
    // Обработка реальных обновлений
    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'user_registered':
                this.handleNewUser(data.user);
                break;
            case 'message_created':
                this.handleNewMessage(data.message);
                break;
            case 'app_created':
                this.handleNewApp(data.app);
                break;
            case 'stats_update':
                this.handleStatsUpdate(data.stats);
                break;
            case 'system_alert':
                this.handleSystemAlert(data.alert);
                break;
            default:
                console.log('Unknown admin update type:', data.type);
        }
    }
    
    // Обработка нового пользователя
    handleNewUser(user) {
        // Обновить счетчик пользователей
        this.updateStatValue('totalUsers', 1);
        
        // Показать уведомление
        showNotification('info', `New user registered: ${user.firstName} ${user.lastName}`);
        
        // Обновить график регистраций
        this.updateChart('userRegistration', user.registrationTime);
    }
    
    // Обработка нового сообщения
    handleNewMessage(message) {
        // Обновить счетчик сообщений
        this.updateStatValue('totalMessages', 1);
        
        // Показать уведомление
        showNotification('info', `New message posted by ${message.authorName}`);
        
        // Обновить график сообщений
        this.updateChart('messages', message.postTime);
    }
    
    // Обработка нового приложения
    handleNewApp(app) {
        // Обновить счетчик приложений
        this.updateStatValue('totalApps', 1);
        
        // Показать уведомление
        showNotification('info', `New app created: ${app.name}`);
        
        // Обновить график приложений
        this.updateChart('apps', app.createdAt);
    }
    
    // Обработка обновления статистики
    handleStatsUpdate(stats) {
        Object.entries(stats).forEach(([key, value]) => {
            this.updateStatValue(key, value);
        });
    }
    
    // Обработка системного предупреждения
    handleSystemAlert(alert) {
        showNotification('warning', alert.message, 10000);
        
        // Показать системное предупреждение в UI
        this.showSystemAlert(alert);
    }
    
    // Показать системное предупреждение
    showSystemAlert(alert) {
        const alertContainer = document.querySelector('.system-alerts');
        if (!alertContainer) return;
        
        const alertElement = document.createElement('div');
        alertElement.className = `system-alert alert-${alert.level}`;
        alertElement.innerHTML = `
            <div class="alert-content">
                <strong>System Alert:</strong> ${alert.message}
                <span class="alert-time">${this.formatRelativeTime(alert.timestamp)}</span>
            </div>
            <button class="alert-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        alertContainer.insertBefore(alertElement, alertContainer.firstChild);
        
        // Автоматическое удаление
        setTimeout(() => {
            alertElement.remove();
        }, 30000);
    }
    
    // Настройка таблиц данных
    setupDataTables() {
        const tables = document.querySelectorAll('.admin-data-table');
        
        tables.forEach(table => {
            this.setupDataTable(table);
        });
    }
    
    // Настройка конкретной таблицы
    setupDataTable(table) {
        // Сортировка
        this.setupTableSorting(table);
        
        // Пагинация
        this.setupTablePagination(table);
        
        // Поиск в таблице
        this.setupTableSearch(table);
        
        // Выбор строк
        this.setupTableSelection(table);
    }
    
    // Настройка сортировки таблицы
    setupTableSorting(table) {
        const headers = table.querySelectorAll('th[data-sortable]');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.dataset.sortable;
                const currentSort = header.dataset.sort || 'asc';
                const newSort = currentSort === 'asc' ? 'desc' : 'asc';
                
                // Обновить заголовки
                headers.forEach(h => {
                    h.dataset.sort = '';
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                
                header.dataset.sort = newSort;
                header.classList.add(`sort-${newSort}`);
                
                // Сортировать таблицу
                this.sortTable(table, field, newSort);
            });
        });
    }
    
    // Сортировать таблицу
    sortTable(table, field, order) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aValue = a.querySelector(`[data-field="${field}"]`)?.textContent || '';
            const bValue = b.querySelector(`[data-field="${field}"]`)?.textContent || '';
            
            if (order === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
        
        // Обновить tbody
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    }
    
    // Настройка пагинации таблицы
    setupTablePagination(table) {
        const pagination = table.querySelector('.table-pagination');
        if (!pagination) return;
        
        const pageButtons = pagination.querySelectorAll('.page-btn');
        
        pageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(button.dataset.page);
                this.loadTablePage(table, page);
            });
        });
    }
    
    // Загрузить страницу таблицы
    async loadTablePage(table, page) {
        const endpoint = table.dataset.endpoint;
        if (!endpoint) return;
        
        try {
            const response = await fetch(`${endpoint}?page=${page}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const html = await response.text();
            
            // Обновить tbody
            const tbody = table.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = html;
            }
            
            // Обновить пагинацию
            this.setupTablePagination(table);
        } catch (error) {
            console.error('Failed to load table page:', error);
            showNotification('error', 'Failed to load data');
        }
    }
    
    // Настройка поиска в таблице
    setupTableSearch(table) {
        const searchInput = table.querySelector('.table-search-input');
        if (!searchInput) return;
        
        let timeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.searchTable(table, e.target.value);
            }, 300);
        });
    }
    
    // Поиск в таблице
    searchTable(table, query) {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            
            row.style.display = matches ? '' : 'none';
        });
    }
    
    // Настройка выбора строк таблицы
    setupTableSelection(table) {
        const checkboxes = table.querySelectorAll('.row-checkbox');
        const selectAll = table.querySelector('.select-all-checkbox');
        
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    checkbox.closest('tr').classList.toggle('selected', e.target.checked);
                });
                this.updateBatchActions(table);
            });
        }
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.target.closest('tr').classList.toggle('selected', e.target.checked);
                this.updateBatchActions(table);
            });
        });
    }
    
    // Обновить массовые действия
    updateBatchActions(table) {
        const selectedRows = table.querySelectorAll('.row-checkbox:checked');
        const batchActions = table.querySelector('.batch-actions');
        
        if (batchActions) {
            if (selectedRows.length > 0) {
                batchActions.style.display = 'flex';
                batchActions.querySelector('.selected-count').textContent = selectedRows.length;
            } else {
                batchActions.style.display = 'none';
            }
        }
    }
    
    // Настройка массовых действий
    setupBatchActions() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.batch-action-btn')) {
                e.preventDefault();
                const action = e.target.closest('.batch-action-btn').dataset.action;
                this.executeBatchAction(action);
            }
        });
    }
    
    // Выполнить массовое действие
    async executeBatchAction(action) {
        const table = document.querySelector('.admin-data-table');
        if (!table) return;
        
        const selectedRows = table.querySelectorAll('.row-checkbox:checked');
        const selectedIds = Array.from(selectedRows).map(cb => cb.value);
        
        if (selectedIds.length === 0) {
            showNotification('warning', 'No items selected');
            return;
        }
        
        const confirmMessages = {
            'delete': `Are you sure you want to delete ${selectedIds.length} items?`,
            'disable': `Are you sure you want to disable ${selectedIds.length} items?`,
            'enable': `Are you sure you want to enable ${selectedIds.length} items?`
        };
        
        if (!confirm(confirmMessages[action] || 'Are you sure?')) {
            return;
        }
        
        try {
            const response = await fetch(`/admin/batch/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    ids: selectedIds,
                    resource: table.dataset.resource
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('success', data.message || 'Batch action completed successfully');
                
                // Удалить обработанные строки
                selectedRows.forEach(checkbox => {
                    const row = checkbox.closest('tr');
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-100%)';
                    
                    setTimeout(() => {
                        row.remove();
                    }, 300);
                });
                
                // Обновить статистику
                this.updateStats();
            } else {
                showNotification('error', data.error || 'Batch action failed');
            }
        } catch (error) {
            console.error('Batch action failed:', error);
            showNotification('error', 'Network error occurred');
        }
    }
    
    // Настройка экспорта
    setupExport() {
        const exportButtons = document.querySelectorAll('.export-btn');
        
        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const format = button.dataset.format;
                this.exportData(format);
            });
        });
    }
    
    // Обновить значение статистики
    updateStatValue(statName, value) {
        const statElement = document.querySelector(`[data-stat="${statName}"]`);
        if (statElement) {
            const currentValue = parseInt(statElement.textContent) || 0;
            const newValue = currentValue + value;
            
            statElement.textContent = newValue;
            
            // Анимация изменения
            statElement.style.transition = 'all 0.3s ease';
            statElement.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                statElement.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    // Обновить график
    updateChart(chartName, dataPoint) {
        const chart = this.charts.get(chartName);
        if (!chart) return;
        
        // Здесь должна быть логика обновления графика
        // Для примера просто логируем
        console.log(`Updating chart ${chartName} with data:`, dataPoint);
    }
    
    // Обновить всю статистику
    updateStats() {
        // Загрузить свежую статистику с сервера
        this.loadStats();
    }
    
    // Загрузить статистику
    async loadStats() {
        try {
            const response = await fetch('/admin/stats', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                Object.entries(data.data.stats).forEach(([key, value]) => {
                    const statElement = document.querySelector(`[data-stat="${key}"]`);
                    if (statElement) {
                        statElement.textContent = value;
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
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
}

// Инициализация менеджера админ панели
const adminManager = new AdminManager();

// Экспорт для глобального использования
window.adminManager = adminManager;