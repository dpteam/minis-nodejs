const moment = require('moment');

module.exports = {
  /**
   * Форматирует дату в человекочитаемый формат
   * @param {number|string|Date} date - Дата для форматирования
   * @param {string} format - Формат вывода (по умолчанию 'DD.MM.YYYY HH:mm')
   * @returns {string} Отформатированная дата
   */
  formatDate(date, format = 'DD.MM.YYYY HH:mm') {
    if (!date) return 'N/A';
    
    const momentDate = moment(date);
    if (!momentDate.isValid()) return 'Invalid date';
    
    return momentDate.format(format);
  },

  /**
   * Форматирует относительное время (например, "2 часа назад")
   * @param {number|string|Date} date - Дата
   * @returns {string} Относительное время
   */
  formatRelativeTime(date) {
    if (!date) return 'N/A';
    
    const momentDate = moment(date);
    if (!momentDate.isValid()) return 'Invalid date';
    
    return momentDate.fromNow();
  },

  /**
   * Форматирует размер файла
   * @param {number} bytes - Размер в байтах
   * @returns {string} Отформатированный размер
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Форматирует число с разделителями тысяч
   * @param {number} num - Число
   * @returns {string} Отформатированное число
   */
  formatNumber(num) {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString();
  },

  /**
   * Обрезает текст до указанной длины
   * @param {string} text - Текст
   * @param {number} length - Максимальная длина
   * @param {string} suffix - Суффикс (по умолчанию '...')
   * @returns {string} Обрезанный текст
   */
  truncateText(text, length = 100, suffix = '...') {
    if (!text || typeof text !== 'string') return '';
    
    if (text.length <= length) return text;
    
    return text.substring(0, length).trim() + suffix;
  },

  /**
   * Экранирует HTML для предотвращения XSS
   * @param {string} text - Текст для экранирования
   * @returns {string} Экранированный текст
   */
  escapeHtml(text) {
    if (!text || typeof text !== 'string') return '';
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  /**
   * Преобразует текст в URL-безопасный slug
   * @param {string} text - Текст
   * @returns {string} Slug
   */
  slugify(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Удаляем специальные символы
      .replace(/[\s_-]+/g, '-') // Заменяем пробелы и подчеркивания на дефисы
      .replace(/^-+|-+$/g, ''); // Удаляем дефисы в начале и конце
  },

  /**
   * Форматирует упоминания (@username) в HTML ссылки
   * @param {string} text - Текст
   * @returns {string} Текст с отформатированными упоминаниями
   */
  formatMentions(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.replace(/@(\w+)/g, '<a href="/profile/$1">@$1</a>');
  },

  /**
   * Форматирует хештеги (#topic) в HTML ссылки
   * @param {string} text - Текст
   * @returns {string} Текст с отформатированными хештегами
   */
  formatHashtags(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text.replace(/#(\w+)/g, '<a href="/hashtag/$1">#$1</a>');
  },

  /**
   * Форматирует URL в HTML ссылки
   * @param {string} text - Текст
   * @returns {string} Текст с отформатированными ссылками
   */
  formatUrls(text) {
    if (!text || typeof text !== 'string') return '';
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  },

  /**
   * Форматирует текст с поддержкой упоминаний, хештегов и ссылок
   * @param {string} text - Текст
   * @returns {string} Отформатированный HTML
   */
  formatMessage(text) {
    if (!text || typeof text !== 'string') return '';
    
    let formatted = this.escapeHtml(text);
    formatted = this.formatUrls(formatted);
    formatted = this.formatMentions(formatted);
    formatted = this.formatHashtags(formatted);
    
    return formatted;
  },

  /**
   * Форматирует статус дружбы
   * @param {string} status - Статус дружбы
   * @returns {string} Отформатированный статус
   */
  formatFriendshipStatus(status) {
    const statusMap = {
      'pending': 'Pending',
      'accepted': 'Friends',
      'rejected': 'Rejected',
      'blocked': 'Blocked',
    };
    
    return statusMap[status] || status;
  },

  /**
   * Форматирует роль пользователя
   * @param {string} role - Роль
   * @returns {string} Отформатированная роль
   */
  formatUserRole(role) {
    const roleMap = {
      'user': 'User',
      'moderator': 'Moderator',
      'admin': 'Administrator',
    };
    
    return roleMap[role] || role;
  },

  /**
   * Форматирует тип уведомления
   * @param {string} type - Тип уведомления
   * @returns {string} Отформатированный тип
   */
  formatNotificationType(type) {
    const typeMap = {
      'message': 'Message',
      'like': 'Like',
      'friend_request': 'Friend Request',
      'mention': 'Mention',
      'comment': 'Comment',
      'system': 'System',
    };
    
    return typeMap[type] || type;
  },

  /**
   * Форматирует видимость сообщения
   * @param {string} visibility - Видимость
   * @returns {string} Отформатированная видимость
   */
  formatMessageVisibility(visibility) {
    const visibilityMap = {
      'public': 'Public',
      'friends': 'Friends Only',
      'private': 'Private',
    };
    
    return visibilityMap[visibility] || visibility;
  },

  /**
   * Форматирует прогресс в процентах
   * @param {number} current - Текущее значение
   * @param {number} total - Общее значение
   * @returns {number} Процент
   */
  formatPercentage(current, total) {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  },

  /**
   * Форматирует длительность из секунд
   * @param {number} seconds - Секунды
   * @returns {string} Отформатированная длительность
   */
  formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (secs > 0 || result === '') result += `${secs}s`;
    
    return result.trim();
  },

  /**
   * Форматирует телефонный номер
   * @param {string} phone - Телефонный номер
   * @returns {string} Отформатированный номер
   */
  formatPhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    
    // Удаляем все нецифровые символы
    const cleaned = phone.replace(/\D/g, '');
    
    // Простое форматирование для российских номеров
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
      return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
    }
    
    return phone;
  },

  /**
   * Форматирует валюту
   * @param {number} amount - Сумма
   * @param {string} currency - Валюта (по умолчанию 'RUB')
   * @returns {string} Отформатированная сумма
   */
  formatCurrency(amount, currency = 'RUB') {
    if (typeof amount !== 'number') return '0';
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },
};