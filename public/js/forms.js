// ===== JavaScript для работы с формами =====

class FormManager {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.autoSaveQueue = new Map();
        this.init();
    }
    
    init() {
        this.setupFormValidation();
        this.setupAutoSave();
        this.setupFileUploads();
        this.setupFormSubmission();
        this.setupDynamicForms();
    }
    
    // Настройка валидации форм
    setupFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            this.setupFormValidators(form);
        });
    }
    
    // Настройка валидаторов для конкретной формы
    setupFormValidators(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        const validators = {};
        
        fields.forEach(field => {
            const rules = this.parseValidationRules(field);
            if (rules.length > 0) {
                validators[field.name] = {
                    rules,
                    element: field,
                    errors: []
                };
                
                // Валидация в реальном времени
                field.addEventListener('blur', () => {
                    this.validateField(field.name);
                });
                
                // Валидация при вводе (для некоторых правил)
                field.addEventListener('input', this.debounce(() => {
                    this.validateField(field.name);
                }, 500));
                
                // Очистка ошибок при изменении
                field.addEventListener('input', () => {
                    this.clearFieldErrors(field.name);
                });
            }
        });
        
        this.validators.set(form, validators);
        
        // Валидация при отправке
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
            }
        });
    }
    
    // Парсинг правил валидации
    parseValidationRules(field) {
        const rules = [];
        const validationAttr = field.dataset.validate;
        
        if (!validationAttr) return rules;
        
        const ruleStrings = validationAttr.split('|');
        
        ruleStrings.forEach(ruleString => {
            const [rule, params] = ruleString.split(':');
            
            switch (rule) {
                case 'required':
                    rules.push({ type: 'required' });
                    break;
                case 'email':
                    rules.push({ type: 'email' });
                    break;
                case 'min':
                    rules.push({ type: 'min', value: parseInt(params) });
                    break;
                case 'max':
                    rules.push({ type: 'max', value: parseInt(params) });
                    break;
                case 'minlength':
                    rules.push({ type: 'minlength', value: parseInt(params) });
                    break;
                case 'maxlength':
                    rules.push({ type: 'maxlength', value: parseInt(params) });
                    break;
                case 'pattern':
                    rules.push({ type: 'pattern', value: params });
                    break;
                case 'same':
                    rules.push({ type: 'same', value: params });
                    break;
                case 'different':
                    rules.push({ type: 'different', value: params });
                    break;
                case 'url':
                    rules.push({ type: 'url' });
                    break;
                case 'numeric':
                    rules.push({ type: 'numeric' });
                    break;
                case 'alpha':
                    rules.push({ type: 'alpha' });
                    break;
                case 'alphanum':
                    rules.push({ type: 'alphanum' });
                    break;
                case 'accepted':
                    rules.push({ type: 'accepted' });
                    break;
            }
        });
        
        return rules;
    }
    
    // Валидация поля
    validateField(fieldName, form) {
        const targetForm = form || document.querySelector(`form:has([name="${fieldName}"])`);
        if (!targetForm) return false;
        
        const validators = this.validators.get(targetForm);
        if (!validators || !validators[fieldName]) return true;
        
        const field = validators[fieldName];
        const value = field.element.value.trim();
        let isValid = true;
        field.errors = [];
        
        // Очистить предыдущие ошибки
        this.clearFieldErrors(fieldName);
        
        // Проверить каждое правило
        field.rules.forEach(rule => {
            const result = this.validateRule(value, rule, targetForm);
            if (!result.valid) {
                isValid = false;
                field.errors.push(result.message);
            }
        });
        
        // Показать ошибки, если есть
        if (!isValid) {
            this.showFieldErrors(fieldName, field.errors);
        }
        
        return isValid;
    }
    
    // Валидация правила
    validateRule(value, rule, form) {
        switch (rule.type) {
            case 'required':
                return {
                    valid: value.length > 0,
                    message: 'This field is required'
                };
                
            case 'email':
                return {
                    valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                    message: 'Please enter a valid email address'
                };
                
            case 'min':
                return {
                    valid: parseFloat(value) >= rule.value,
                    message: `Value must be at least ${rule.value}`
                };
                
            case 'max':
                return {
                    valid: parseFloat(value) <= rule.value,
                    message: `Value must be no more than ${rule.value}`
                };
                
            case 'minlength':
                return {
                    valid: value.length >= rule.value,
                    message: `Minimum length is ${rule.value} characters`
                };
                
            case 'maxlength':
                return {
                    valid: value.length <= rule.value,
                    message: `Maximum length is ${rule.value} characters`
                };
                
            case 'pattern':
                try {
                    const regex = new RegExp(rule.value);
                    return {
                        valid: regex.test(value),
                        message: 'Invalid format'
                    };
                } catch (e) {
                    return { valid: false, message: 'Invalid pattern' };
                }
                
            case 'same':
                const otherField = form.querySelector(`[name="${rule.value}"]`);
                const otherValue = otherField ? otherField.value : '';
                return {
                    valid: value === otherValue,
                    message: 'Values must match'
                };
                
            case 'different':
                const diffField = form.querySelector(`[name="${rule.value}"]`);
                const diffValue = diffField ? diffField.value : '';
                return {
                    valid: value !== diffValue,
                    message: 'Values must be different'
                };
                
            case 'url':
                try {
                    new URL(value);
                    return { valid: true, message: '' };
                } catch (e) {
                    return { valid: false, message: 'Please enter a valid URL' };
                }
                
            case 'numeric':
                return {
                    valid: !isNaN(value) && value.trim() !== '',
                    message: 'Please enter a valid number'
                };
                
            case 'alpha':
                return {
                    valid: /^[a-zA-Z]+$/.test(value),
                    message: 'Only alphabetic characters are allowed'
                };
                
            case 'alphanum':
                return {
                    valid: /^[a-zA-Z0-9]+$/.test(value),
                    message: 'Only alphanumeric characters are allowed'
                };
                
            case 'accepted':
                return {
                    valid: value === 'on' || value === 'yes' || value === '1' || value === 'true',
                    message: 'This field must be accepted'
                };
                
            default:
                return { valid: true, message: '' };
        }
    }
    
    // Валидация всей формы
    validateForm(form) {
        const validators = this.validators.get(form);
        if (!validators) return true;
        
        let isValid = true;
        
        Object.keys(validators).forEach(fieldName => {
            if (!this.validateField(fieldName, form)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // Показать ошибки поля
    showFieldErrors(fieldName, errors) {
        const form = document.querySelector(`form:has([name="${fieldName}"])`);
        if (!form) return;
        
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        // Добавить класс ошибки
        field.classList.add('error');
        
        // Создать контейнер ошибок
        let errorContainer = field.parentNode.querySelector('.field-errors');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'field-errors';
            field.parentNode.appendChild(errorContainer);
        }
        
        // Добавить сообщения об ошибках
        errorContainer.innerHTML = errors.map(error => 
            `<div class="field-error">${error}</div>`
        ).join('');
    }
    
    // Очистить ошибки поля
    clearFieldErrors(fieldName) {
        const form = document.querySelector(`form:has([name="${fieldName}"])`);
        if (!form) return;
        
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        field.classList.remove('error');
        
        const errorContainer = field.parentNode.querySelector('.field-errors');
        if (errorContainer) {
            errorContainer.remove();
        }
    }
    
    // Настройка автосохранения
    setupAutoSave() {
        const autoSaveFields = document.querySelectorAll('[data-auto-save]');
        
        autoSaveFields.forEach(field => {
            const form = field.closest('form');
            if (!form) return;
            
            const debounceTime = parseInt(field.dataset.autoSaveDebounce) || 2000;
            
            field.addEventListener('input', this.debounce(() => {
                this.autoSaveField(field, form);
            }, debounceTime));
            
            // Восстановить сохраненное значение при загрузке
            this.restoreAutoSavedValue(field);
        });
    }
    
    // Автосохранение поля
    async autoSaveField(field, form) {
        const fieldName = field.name;
        const value = field.value;
        
        // Показать индикатор сохранения
        this.showAutoSaveIndicator(field, 'saving');
        
        try {
            const formData = new FormData();
            formData.append(fieldName, value);
            formData.append('_auto_save', 'true');
            
            const response = await fetch(form.action || window.location.pathname, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showAutoSaveIndicator(field, 'saved');
                this.saveToLocalStorage(field, value);
            } else {
                this.showAutoSaveIndicator(field, 'error');
            }
        } catch (error) {
            this.showAutoSaveIndicator(field, 'error');
        }
        
        // Скрыть индикатор через некоторое время
        setTimeout(() => {
            this.hideAutoSaveIndicator(field);
        }, 2000);
    }
    
    // Показать индикатор автосохранения
    showAutoSaveIndicator(field, status) {
        let indicator = field.parentNode.querySelector('.auto-save-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'auto-save-indicator';
            field.parentNode.appendChild(indicator);
        }
        
        indicator.className = `auto-save-indicator ${status}`;
        
        const statusTexts = {
            saving: 'Saving...',
            saved: 'Saved',
            error: 'Error'
        };
        
        indicator.textContent = statusTexts[status] || '';
    }
    
    // Скрыть индикатор автосохранения
    hideAutoSaveIndicator(field) {
        const indicator = field.parentNode.querySelector('.auto-save-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Сохранить в localStorage
    saveToLocalStorage(field, value) {
        const key = `autosave_${field.name}_${window.location.pathname}`;
        localStorage.setItem(key, JSON.stringify({
            value: value,
            timestamp: Date.now()
        }));
    }
    
    // Восстановить из localStorage
    restoreAutoSavedValue(field) {
        const key = `autosave_${field.name}_${window.location.pathname}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const maxAge = 24 * 60 * 60 * 1000; // 24 часа
                
                if (Date.now() - data.timestamp < maxAge) {
                    field.value = data.value;
                    this.showAutoSaveIndicator(field, 'restored');
                    setTimeout(() => {
                        this.hideAutoSaveIndicator(field);
                    }, 2000);
                } else {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                localStorage.removeItem(key);
            }
        }
    }
    
    // Настройка загрузки файлов
    setupFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            this.setupFileInput(input);
        });
    }
    
    // Настройка конкретного файлового инпута
    setupFileInput(input) {
        const form = input.closest('form');
        if (!form) return;
        
        // Обработка выбора файла
        input.addEventListener('change', (e) => {
            this.handleFileSelect(e.target, form);
        });
        
        // Drag and drop
        const dropZone = input.closest('.file-drop-zone');
        if (dropZone) {
            this.setupFileDropZone(dropZone, input, form);
        }
    }
    
    // Обработка выбора файла
    handleFileSelect(input, form) {
        const files = Array.from(input.files);
        
        // Очистить предыдущие превью
        this.clearFilePreviews(input);
        
        // Валидация файлов
        const validFiles = this.validateFiles(files, input);
        
        if (validFiles.length > 0) {
            // Показать превью
            this.showFilePreviews(validFiles, input);
            
            // Обновить счетчик
            this.updateFileCount(input, validFiles.length);
        }
        
        // Если есть невалидные файлы, показать ошибки
        const invalidFiles = files.filter(file => !validFiles.includes(file));
        if (invalidFiles.length > 0) {
            this.showFileErrors(invalidFiles, input);
        }
    }
    
    // Валидация файлов
    validateFiles(files, input) {
        const validFiles = [];
        const maxFiles = parseInt(input.dataset.maxFiles) || 1;
        const maxSize = parseInt(input.dataset.maxSize) || 5 * 1024 * 1024; // 5MB
        const allowedTypes = input.dataset.allowedTypes?.split(',') || [];
        
        files.forEach((file, index) => {
            if (index >= maxFiles) {
                this.showFileError(file, `Maximum ${maxFiles} files allowed`);
                return;
            }
            
            if (file.size > maxSize) {
                this.showFileError(file, `File size exceeds limit of ${this.formatFileSize(maxSize)}`);
                return;
            }
            
            if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
                this.showFileError(file, 'File type not allowed');
                return;
            }
            
            validFiles.push(file);
        });
        
        return validFiles;
    }
    
    // Показать превью файлов
    showFilePreviews(files, input) {
        const previewContainer = input.parentNode.querySelector('.file-previews');
        if (!previewContainer) return;
        
        files.forEach(file => {
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            
            if (file.type.startsWith('image/')) {
                // Превью изображения
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}" class="preview-image">
                        <div class="preview-info">
                            <div class="preview-name">${file.name}</div>
                            <div class="preview-size">${this.formatFileSize(file.size)}</div>
                        </div>
                        <button type="button" class="remove-file" onclick="this.parentElement.remove()">×</button>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                // Превью для других типов файлов
                preview.innerHTML = `
                    <div class="preview-icon">${this.getFileIcon(file.type)}</div>
                    <div class="preview-info">
                        <div class="preview-name">${file.name}</div>
                        <div class="preview-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <button type="button" class="remove-file" onclick="this.parentElement.remove()">×</button>
                `;
            }
            
            previewContainer.appendChild(preview);
        });
    }
    
    // Очистить превью файлов
    clearFilePreviews(input) {
        const previewContainer = input.parentNode.querySelector('.file-previews');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
    }
    
    // Обновить счетчик файлов
    updateFileCount(input, count) {
        const countElement = input.parentNode.querySelector('.file-count');
        if (countElement) {
            countElement.textContent = `${count} file${count !== 1 ? 's' : ''} selected`;
        }
    }
    
    // Показать ошибки файлов
    showFileErrors(files, input) {
        const errorContainer = input.parentNode.querySelector('.file-errors');
        if (!errorContainer) return;
        
        files.forEach(file => {
            const error = document.createElement('div');
            error.className = 'file-error';
            error.textContent = `${file.name}: ${file.error || 'Invalid file'}`;
            errorContainer.appendChild(error);
        });
    }
    
    // Показать ошибку файла
    showFileError(file, message) {
        file.error = message;
    }
    
    // Настройка drag and drop зоны
    setupFileDropZone(dropZone, input, form) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            }, false);
        });
        
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            input.files = files;
            this.handleFileSelect(input, form);
        }, false);
    }
    
    // Получить иконку для типа файла
    getFileIcon(fileType) {
        const iconMap = {
            'application/pdf': '📄',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'application/vnd.ms-excel': '📊',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
            'application/vnd.ms-powerpoint': '📽️',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
            'text/plain': '📄',
            'application/zip': '📦',
            'application/x-rar-compressed': '📦',
            'application/x-tar': '📦',
            'application/x-gzip': '📦',
            'video/': '🎬',
            'audio/': '🎵',
            'image/': '🖼️'
        };
        
        for (const [type, icon] of Object.entries(iconMap)) {
            if (fileType.startsWith(type)) {
                return icon;
            }
        }
        
        return '📄';
    }
    
    // Форматировать размер файла
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Настройка отправки форм
    setupFormSubmission() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // AJAX формы
            if (form.dataset.ajax === 'true') {
                this.setupAjaxForm(form);
            }
            
            // Формы с подтверждением
            if (form.dataset.confirm) {
                this.setupConfirmForm(form);
            }
            
            // Формы с прогресс-баром
            if (form.dataset.showProgress === 'true') {
                this.setupProgressForm(form);
            }
        });
    }
    
    // Настройка AJAX формы
    setupAjaxForm(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.validateForm(form)) {
                return;
            }
            
            const submitBtn = form.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Показать загрузку
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
            
            try {
                const formData = new FormData(form);
                
                const response = await fetch(form.action || window.location.pathname, {
                    method: form.method || 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.handleFormSuccess(form, data);
                } else {
                    this.handleFormError(form, data);
                }
            } catch (error) {
                this.handleFormError(form, {
                    error: 'Network error occurred'
                });
            } finally {
                // Восстановить кнопку
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // Обработка успешной отправки формы
    handleFormSuccess(form, data) {
        // Показать сообщение
        if (data.message) {
            showNotification('success', data.message);
        }
        
        // Перенаправление
        if (data.redirect) {
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1000);
            return;
        }
        
        // Перезагрузка
        if (data.reload) {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            return;
        }
        
        // Сброс формы
        form.reset();
        
        // Очистить превью файлов
        const fileInputs = form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            this.clearFilePreviews(input);
        });
        
        // Вызов колбэка
        if (form.dataset.successCallback) {
            const callback = window[form.dataset.successCallback];
            if (typeof callback === 'function') {
                callback(data);
            }
        }
    }
    
    // Обработка ошибки отправки формы
    handleFormError(form, data) {
        // Показать сообщение об ошибке
        if (data.error) {
            showNotification('error', data.error);
        }
        
        // Показать ошибки полей
        if (data.errors) {
            Object.entries(data.errors).forEach(([fieldName, errors]) => {
                this.showFieldErrors(fieldName, errors);
            });
        }
        
        // Вызов колбэка
        if (form.dataset.errorCallback) {
            const callback = window[form.dataset.errorCallback];
            if (typeof callback === 'function') {
                callback(data);
            }
        }
    }
    
    // Настройка формы с подтверждением
    setupConfirmForm(form) {
        form.addEventListener('submit', (e) => {
            const message = form.dataset.confirm;
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    }
    
    // Настройка формы с прогресс-баром
    setupProgressForm(form) {
        form.addEventListener('submit', (e) => {
            if (!form.dataset.ajax) {
                this.showFormProgress(form);
            }
        });
    }
    
    // Показать прогресс-бар формы
    showFormProgress(form) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'form-progress';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">Processing...</div>
        `;
        
        form.appendChild(progressContainer);
        
        // Симуляция прогресса
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 90) progress = 90;
            
            const progressFill = progressContainer.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            if (progress >= 90) {
                clearInterval(interval);
            }
        }, 500);
    }
    
    // Настройка динамических форм
    setupDynamicForms() {
        // Добавление полей
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-field-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.add-field-btn');
                this.addDynamicField(btn);
            }
        });
        
        // Удаление полей
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-field-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.remove-field-btn');
                this.removeDynamicField(btn);
            }
        });
    }
    
    // Добавить динамическое поле
    addDynamicField(button) {
        const template = button.dataset.fieldTemplate;
        const container = button.dataset.fieldContainer;
        
        if (!template || !container) return;
        
        const targetContainer = document.querySelector(container);
        if (!targetContainer) return;
        
        // Клонировать шаблон
        const fieldHtml = decodeURIComponent(template);
        const fieldElement = document.createElement('div');
        fieldElement.innerHTML = fieldHtml;
        const field = fieldElement.firstElementChild;
        
        // Уникальное имя для поля
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const uniqueId = `${timestamp}_${random}`;
        
        // Заменить плейсхолдеры
        field.innerHTML = field.innerHTML.replace(/\{index\}/g, uniqueId);
        
        targetContainer.appendChild(field);
        
        // Анимация появления
        field.style.opacity = '0';
        field.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            field.style.transition = 'all 0.3s ease';
            field.style.opacity = '1';
            field.style.transform = 'translateY(0)';
        }, 10);
        
        // Фокус на новое поле
        const firstInput = field.querySelector('input, textarea, select');
        if (firstInput) {
            firstInput.focus();
        }
        
        // Настроить валидацию для нового поля
        this.setupFormValidators(field.closest('form'));
    }
    
    // Удалить динамическое поле
    removeDynamicField(button) {
        const field = button.closest('.dynamic-field');
        if (!field) return;
        
        // Анимация удаления
        field.style.transition = 'all 0.3s ease';
        field.style.opacity = '0';
        field.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            field.remove();
        }, 300);
    }
    
    // Вспомогательные функции
    debounce(func, wait) {
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
    
    throttle(func, limit) {
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
}

// Инициализация менеджера форм
const formManager = new FormManager();

// Экспорт для глобального использования
window.formManager = formManager;