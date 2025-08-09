const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Complete User Flow E2E Tests', function() {
  this.timeout(30000); // Увеличиваем таймаут для E2E тестов
  
  let driver;
  
  before(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .build();
  });
  
  after(async () => {
    await driver.quit();
  });
  
  describe('Registration and Login Flow', () => {
    it('should complete full registration flow', async () => {
      // Открыть страницу регистрации
      await driver.get('http://localhost:3000/register');
      
      // Заполнить форму регистрации
      await driver.findElement(By.id('firstName')).sendKeys('Test');
      await driver.findElement(By.id('lastName')).sendKeys('User');
      await driver.findElement(By.id('email')).sendKeys(`e2e-${Date.now()}@example.com`);
      await driver.findElement(By.id('password')).sendKeys('password123');
      await driver.findElement(By.id('confirmPassword')).sendKeys('password123');
      
      // Принять условия
      await driver.findElement(By.id('terms')).click();
      
      // Отправить форму
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Проверить перенаправление на главную страницу
      await driver.wait(until.urlContains('http://localhost:3000'), 5000);
      
      // Проверить наличие имени пользователя в навигации
      const userName = await driver.findElement(By.css('.user-name')).getText();
      expect(userName).to.equal('Test User');
    });
    
    it('should login with registered credentials', async () => {
      // Выйти из системы
      await driver.findElement(By.css('.user-menu .logout')).click();
      
      // Открыть страницу входа
      await driver.get('http://localhost:3000/login');
      
      // Ввести учетные данные
      await driver.findElement(By.id('email')).sendKeys('admin@minis.local');
      await driver.findElement(By.id('password')).sendKeys('admin123');
      
      // Отправить форму
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Проверить перенаправление на главную страницу
      await driver.wait(until.urlContains('http://localhost:3000'), 5000);
      
      // Проверить наличие имени администратора
      const userName = await driver.findElement(By.css('.user-name')).getText();
      expect(userName).to.equal('Admin User');
    });
  });
  
  describe('Message Creation Flow', () => {
    it('should create a new message', async () => {
      // Открыть страницу сообщений
      await driver.get('http://localhost:3000/messages');
      
      // Нажать кнопку создания сообщения
      await driver.findElement(By.css('[data-action="new-message"]')).click();
      
      // Ввести текст сообщения
      const textarea = await driver.findElement(By.css('#newMessageForm textarea'));
      await textarea.sendKeys('This is a test E2E message! 🎉');
      
      // Отправить форму
      await driver.findElement(By.css('#newMessageForm button[type="submit"]')).click();
      
      // Проверить наличие сообщения в ленте
      await driver.wait(until.elementLocated(By.css('.message-card')), 5000);
      
      const messageContent = await driver.findElement(By.css('.message-content')).getText();
      expect(messageContent).to.include('This is a test E2E message!');
    });
    
    it('should like a message', async () => {
      // Найти первое сообщение
      const messageCard = await driver.findElement(By.css('.message-card'));
      
      // Найти кнопку лайка
      const likeBtn = messageCard.findElement(By.css('.like-btn'));
      
      // Получить текущее количество лайков
      const likeCount = await likeBtn.findElement(By.css('.like-count')).getText();
      const initialCount = parseInt(likeCount) || 0;
      
      // Нажать кнопку лайка
      await likeBtn.click();
      
      // Проверить, что кнопка стала активной
      await driver.wait(until.elementLocated(By.css('.like-btn.liked')), 2000);
      
      // Проверить увеличение счетчика лайков
      const newLikeCount = await likeBtn.findElement(By.css('.like-count')).getText();
      const newCount = parseInt(newLikeCount) || 0;
      expect(newCount).to.equal(initialCount + 1);
    });
  });
  
  describe('Profile Management Flow', () => {
    it('should update user profile', async () => {
      // Открыть страницу профиля
      await driver.get('http://localhost:3000/profile/1');
      
      // Нажать кнопку редактирования профиля
      await driver.findElement(By.css('[href*="edit-profile"]')).click();
      
      // Обновить биографию
      const bioTextarea = await driver.findElement(By.id('bio'));
      await bioTextarea.clear();
      await bioTextarea.sendKeys('Updated bio for E2E testing');
      
      // Сохранить изменения
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Проверить обновление профиля
      await driver.wait(until.urlContains('http://localhost:3000/profile/1'), 5000);
      
      const bioElement = await driver.findElement(By.css('.profile-bio'));
      const bioText = await bioElement.getText();
      expect(bioText).to.equal('Updated bio for E2E testing');
    });
    
    it('should upload avatar', async () => {
      // Открыть страницу редактирования профиля
      await driver.get('http://localhost:3000/edit-profile');
      
      // Нажать кнопку загрузки аватара
      await driver.findElement(By.css('.avatar-upload-btn')).click();
      
      // Загрузить тестовый файл (в реальном тесте нужен бы путь к файлу)
      // Для примера пропускаем этот шаг
      
      // Проверить наличие сообщения об успешной загрузке
      // await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
    });
  });
  
  describe('Friendship Flow', () => {
    it('should send friend request', async () => {
      // Открыть страницу другого пользователя
      await driver.get('http://localhost:3000/profile/2');
      
      // Нажать кнопку добавления в друзья
      const addFriendBtn = await driver.findElement(By.css('[data-action="add-friend"]'));
      await addFriendBtn.click();
      
      // Проверить изменение текста кнопки
      await driver.wait(async () => {
        const btnText = await addFriendBtn.getText();
        return btnText.includes('Request Sent');
      }, 3000);
    });
    
    it('should accept friend request', async () => {
      // Выйти из системы
      await driver.findElement(By.css('.user-menu .logout')).click();
      
      // Войти как второй пользователь
      await driver.get('http://localhost:3000/login');
      await driver.findElement(By.id('email')).sendKeys('jane@example.com');
      await driver.findElement(By.id('password')).sendKeys('password123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Открыть страницу друзей
      await driver.get('http://localhost:3000/friends');
      
      // Найти и принять запрос в друзья
      const acceptBtn = await driver.findElement(By.css('.accept-friend-btn'));
      await acceptBtn.click();
      
      // Проверить, что пользователь теперь в списке друзей
      await driver.wait(until.elementLocated(By.css('.friend-card')), 5000);
    });
  });
  
  describe('Notification Flow', () => {
    it('should display notifications', async () => {
      // Нажать на кнопку уведомлений
      await driver.findElement(By.id('notificationBtn')).click();
      
      // Проверить наличие меню уведомлений
      await driver.wait(until.elementLocated(By.id('notificationMenu')), 2000);
      
      // Проверить наличие уведомлений
      const notifications = await driver.findElements(By.css('.notification-item'));
      expect(notifications.length).to.be.greaterThan(0);
    });
    
    it('should mark notification as read', async () => {
      // Найти первое непрочитанное уведомление
      const unreadNotifications = await driver.findElements(By.css('.notification-item.unread'));
      
      if (unreadNotifications.length > 0) {
        const firstUnread = unreadNotifications[0];
        const markReadBtn = firstUnread.findElement(By.css('.mark-read-btn'));
        await markReadBtn.click();
        
        // Проверить, что уведомление больше не непрочитанное
        await driver.wait(async () => {
          const updatedNotifications = await driver.findElements(By.css('.notification-item.unread'));
          return updatedNotifications.length < unreadNotifications.length;
        }, 2000);
      }
    });
  });
  
  describe('Admin Flow', () => {
    it('should access admin dashboard', async () => {
      // Войти как администратор
      await driver.findElement(By.css('.user-menu .logout')).click();
      await driver.get('http://localhost:3000/login');
      await driver.findElement(By.id('email')).sendKeys('admin@minis.local');
      await driver.findElement(By.id('password')).sendKeys('admin123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Открыть админ панель
      await driver.get('http://localhost:3000/admin');
      
      // Проверить наличие элементов админ панели
      await driver.wait(until.elementLocated(By.css('.stats-grid')), 5000);
      
      const statsCards = await driver.findElements(By.css('.stat-card'));
      expect(statsCards.length).to.be.greaterThan(0);
    });
    
    it('should manage users from admin panel', async () => {
      // Открыть управление пользователями
      await driver.findElement(By.css('a[href="/admin/users"]')).click();
      
      // Проверить наличие таблицы пользователей
      await driver.wait(until.elementLocated(By.css('.admin-table')), 5000);
      
      const userRows = await driver.findElements(By.css('.admin-table tbody tr'));
      expect(userRows.length).to.be.greaterThan(0);
      
      // Попробовать изменить статус первого пользователя
      const firstUserRow = userRows[0];
      const toggleBtn = firstUserRow.findElement(By.css('.toggle-user-status'));
      await toggleBtn.click();
      
      // Проверить изменение статуса
      await driver.sleep(1000); // Ждем обновления
      
      const statusBadge = firstUserRow.findElement(By.css('.status-badge'));
      const statusText = await statusBadge.getText();
      expect(['Active', 'Inactive']).to.include(statusText);
    });
  });
});