const validator = require('validator');
const constants = require('./constants');

module.exports = {
  /**
   * Валидирует email
   * @param {string} email - Email для валидации
   * @returns {boolean} Результат валидации
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return validator.isEmail(email);
  },

  /**
   * Валидирует пароль
   * @param {string} password - Пароль для валидации
   * @returns {Object} Результат валидации { isValid: boolean, errors: string[] }
   */
  validatePassword(password) {
    const errors = [];
    
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Валидирует имя пользователя
   * @param {string} username - Имя пользователя
   * @returns {boolean} Результат валидации
   */
  isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    return constants.REGEX.USERNAME.test(username);
  },

  /**
   * Валидирует URL
   * @param {string} url - URL для валидации
   * @returns {boolean} Результат валидации
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return validator.isURL(url);
  },

  /**
   * Валидирует длину строки
   * @param {string} str - Строка
   * @param {number} min - Минимальная длина
   * @param {number} max - Максимальная длина
   * @returns {boolean} Результат валидации
   */
  isValidLength(str, min, max) {
    if (!str || typeof str !== 'string') return false;
    return str.length >= min && str.length <= max;
  },

  /**
   * Валидирует ID (должен быть положительным числом)
   * @param {number|string} id - ID для валидации
   * @returns {boolean} Результат валидации
   */
  isValidId(id) {
    const numId = parseInt(id);
    return !isNaN(numId) && numId > 0;
  },

  /**
   * Валидирует роль пользователя
   * @param {string} role - Роль
   * @returns {boolean} Результат валидации
   */
  isValidRole(role) {
    if (!role || typeof role !== 'string') return false;
    return Object.values(constants.USER_ROLES).includes(role);
  },

  /**
   * Валидирует тип уведомления
   * @param {string} type - Тип уведомления
   * @returns {boolean} Результат валидации
   */
  isValidNotificationType(type) {
    if (!type || typeof type !== 'string') return false;
    return Object.values(constants.NOTIFICATION_TYPES).includes(type);
  },

  /**
   * Валидирует тип лайка
   * @param {string} type - Тип лайка
   * @returns {boolean} Результат валидации
   */
  isValidLikeType(type) {
    if (!type || typeof type !== 'string') return false;
    return Object.values(constants.LIKE_TYPES).includes(type);
  },

  /**
   * Валидирует статус дружбы
   * @param {string} status - Статус дружбы
   * @returns {boolean} Результат валидации
   */
  isValidFriendshipStatus(status) {
    if (!status || typeof status !== 'string') return false;
    return Object.values(constants.FRIENDSHIP_STATUS).includes(status);
  },

  /**
   * Валидирует видимость сообщения
   * @param {string} visibility - Видимость сообщения
   * @returns {boolean} Результат валидации
   */
  isValidMessageVisibility(visibility) {
    if (!visibility || typeof visibility !== 'string') return false;
    return Object.values(constants.MESSAGE_VISIBILITY).includes(visibility);
  },

  /**
   * Валидирует разрешения приложения
   * @param {string[]} permissions - Массив разрешений
   * @returns {Object} Результат валидации { isValid: boolean, invalidPermissions: string[] }
   */
  validateAppPermissions(permissions) {
    if (!Array.isArray(permissions)) {
      return { isValid: false, invalidPermissions: [] };
    }
    
    const validPermissions = Object.values(constants.APP_PERMISSIONS);
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    return {
      isValid: invalidPermissions.length === 0,
      invalidPermissions,
    };
  },

  /**
   * Валидирует размер файла
   * @param {number} size - Размер файла в байтах
   * @param {number} maxSize - Максимальный размер в байтах
   * @returns {boolean} Результат валидации
   */
  isValidFileSize(size, maxSize = constants.LIMITS.MAX_UPLOAD_SIZE) {
    if (typeof size !== 'number' || size < 0) return false;
    return size <= maxSize;
  },

  /**
   * Валидирует тип файла
   * @param {string} mimeType - MIME тип файла
   * @param {string[]} allowedTypes - Разрешенные типы
   * @returns {boolean} Результат валидации
   */
  isValidFileType(mimeType, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) {
    if (!mimeType || typeof mimeType !== 'string') return false;
    return allowedTypes.includes(mimeType);
  },

  /**
   * Валидирует JSON
   * @param {string} str - JSON строка
   * @returns {boolean} Результат валидации
   */
  isValidJSON(str) {
    if (!str || typeof str !== 'string') return false;
    
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Валидирует номер телефона
   * @param {string} phone - Номер телефона
   * @returns {boolean} Результат валидации
   */
  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    // Простая валидация для российских номеров
    return /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/.test(phone);
  },

  /**
   * Валидирует дату
   * @param {string|Date} date - Дата
   * @returns {boolean} Результат валидации
   */
  isValidDate(date) {
    if (!date) return false;
    return !isNaN(new Date(date).getTime());
  },

  /**
   * Валидирует возраст
   * @param {number} age - Возраст
   * @param {number} min - Минимальный возраст
   * @param {number} max - Максимальный возраст
   * @returns {boolean} Результат валидации
   */
  isValidAge(age, min = 13, max = 120) {
    if (typeof age !== 'number' || age < min || age > max) return false;
    return true;
  },

  /**
   * Валидирует биографию
   * @param {string} bio - Биография
   * @returns {Object} Результат валидации { isValid: boolean, errors: string[] }
   */
  validateBio(bio) {
    const errors = [];
    
    if (bio && typeof bio !== 'string') {
      errors.push('Bio must be a string');
      return { isValid: false, errors };
    }
    
    if (bio && bio.length > constants.LIMITS.MAX_BIO_LENGTH) {
      errors.push(`Bio must be less than ${constants.LIMITS.MAX_BIO_LENGTH} characters`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Валидирует сообщение
   * @param {string} message - Сообщение
   * @returns {Object} Результат валидации { isValid: boolean, errors: string[] }
   */
  validateMessage(message) {
    const errors = [];
    
    if (!message || typeof message !== 'string') {
      errors.push('Message is required');
      return { isValid: false, errors };
    }
    
    if (message.trim().length === 0) {
      errors.push('Message cannot be empty');
    }
    
    if (message.length > constants.LIMITS.MAX_MESSAGE_LENGTH) {
      errors.push(`Message must be less than ${constants.LIMITS.MAX_MESSAGE_LENGTH} characters`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Валидирует данные приложения
   * @param {Object} appData - Данные приложения
   * @returns {Object} Результат валидации { isValid: boolean, errors: string[] }
   */
  validateAppData(appData) {
    const errors = [];
    
    if (!appData || typeof appData !== 'object') {
      errors.push('App data must be an object');
      return { isValid: false, errors };
    }
    
    if (!appData.name || typeof appData.name !== 'string') {
      errors.push('App name is required');
    } else if (!this.isValidLength(appData.name, 2, constants.LIMITS.MAX_APP_NAME_LENGTH)) {
      errors.push(`App name must be between 2 and ${constants.LIMITS.MAX_APP_NAME_LENGTH} characters`);
    }
    
    if (appData.description && typeof appData.description !== 'string') {
      errors.push('App description must be a string');
    } else if (appData.description && appData.description.length > constants.LIMITS.MAX_APP_DESCRIPTION_LENGTH) {
      errors.push(`App description must be less than ${constants.LIMITS.MAX_APP_DESCRIPTION_LENGTH} characters`);
    }
    
    if (appData.permissions) {
      const permissionValidation = this.validateAppPermissions(appData.permissions);
      if (!permissionValidation.isValid) {
        errors.push(`Invalid permissions: ${permissionValidation.invalidPermissions.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Валидирует настройки пользователя
   * @param {Object} preferences - Настройки
   * @returns {Object} Результат валидации { isValid: boolean, errors: string[] }
   */
  validateUserPreferences(preferences) {
    const errors = [];
    
    if (!preferences || typeof preferences !== 'object') {
      errors.push('Preferences must be an object');
      return { isValid: false, errors };
    }
    
    const validKeys = ['emailNotifications', 'pushNotifications', 'showEmail', 'theme', 'language'];
    const invalidKeys = Object.keys(preferences).filter(key => !validKeys.includes(key));
    
    if (invalidKeys.length > 0) {
      errors.push(`Invalid preference keys: ${invalidKeys.join(', ')}`);
    }
    
    if (preferences.theme && !['light', 'dark', 'auto'].includes(preferences.theme)) {
      errors.push('Invalid theme value');
    }
    
    if (preferences.language && !['en', 'ru', 'es'].includes(preferences.language)) {
      errors.push('Invalid language value');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Комплексная валидация данных пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Object} Результат валидации { isValid: boolean, errors: string[] }
   */
  validateUserData(userData) {
    const errors = [];
    
    if (!userData || typeof userData !== 'object') {
      errors.push('User data must be an object');
      return { isValid: false, errors };
    }
    
    // Валидация имени
    if (!userData.firstName || typeof userData.firstName !== 'string') {
      errors.push('First name is required');
    } else if (!this.isValidLength(userData.firstName, 2, 100)) {
      errors.push('First name must be between 2 and 100 characters');
    }
    
    // Валидация фамилии
    if (!userData.lastName || typeof userData.lastName !== 'string') {
      errors.push('Last name is required');
    } else if (!this.isValidLength(userData.lastName, 2, 100)) {
      errors.push('Last name must be between 2 and 100 characters');
    }
    
    // Валидация email
    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }
    
    // Валидация пароля (если предоставлен)
    if (userData.password) {
      const passwordValidation = this.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }
    
    // Валидация биографии
    if (userData.bio) {
      const bioValidation = this.validateBio(userData.bio);
      if (!bioValidation.isValid) {
        errors.push(...bioValidation.errors);
      }
    }
    
    // Валидация роли
    if (userData.role && !this.isValidRole(userData.role)) {
      errors.push('Invalid user role');
    }
    
    // Валидация настроек
    if (userData.preferences) {
      const preferencesValidation = this.validateUserPreferences(userData.preferences);
      if (!preferencesValidation.isValid) {
        errors.push(...preferencesValidation.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};