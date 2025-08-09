const { User } = require('../../models');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const user = await User.create(userData);
      
      expect(user.id).toBeDefined();
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.email).toBe(userData.email);
      expect(user.isActive).toBe(true);
      expect(user.role).toBe('user');
    });
    
    it('should hash password before creating user', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123'
      };
      
      const user = await User.create(userData);
      
      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
    });
    
    it('should not create user with duplicate email', async () => {
      const userData = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        password: 'password123'
      };
      
      await User.create(userData);
      
      await expect(User.create(userData)).rejects.toThrow();
    });
    
    it('should not create user without required fields', async () => {
      const userData = {
        firstName: 'Alice',
        lastName: 'Brown'
        // Missing email and password
      };
      
      await expect(User.create(userData)).rejects.toThrow();
    });
  });
  
  describe('User Validation', () => {
    it('should validate email format', async () => {
      const invalidEmailUser = {
        firstName: 'Charlie',
        lastName: 'Wilson',
        email: 'invalid-email',
        password: 'password123'
      };
      
      await expect(User.create(invalidEmailUser)).rejects.toThrow();
    });
    
    it('should validate name length', async () => {
      const longNameUser = {
        firstName: 'A'.repeat(101), // Too long
        lastName: 'Test',
        email: 'test@example.com',
        password: 'password123'
      };
      
      await expect(User.create(longNameUser)).rejects.toThrow();
    });
  });
  
  describe('User Methods', () => {
    let user;
    
    beforeEach(async () => {
      user = await testUtils.createUser();
    });
    
    it('should validate password correctly', async () => {
      const isValid = await user.validPassword('password123');
      expect(isValid).toBe(true);
      
      const isInvalid = await user.validPassword('wrongpassword');
      expect(isInvalid).toBe(false);
    });
    
    it('should update last activity time', async () => {
      const oldActivityTime = user.lastActivityTime;
      
      await user.update({ lastActivityTime: Math.floor(Date.now() / 1000) });
      
      expect(user.lastActivityTime).toBeGreaterThan(oldActivityTime);
    });
  });
  
  describe('User Associations', () => {
    let user;
    
    beforeEach(async () => {
      user = await testUtils.createUser();
    });
    
    it('should have many messages', async () => {
      const message1 = await testUtils.createMessage({ userId: user.id });
      const message2 = await testUtils.createMessage({ userId: user.id });
      
      const messages = await user.getMessages();
      
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe(message1.id);
      expect(messages[1].id).toBe(message2.id);
    });
    
    it('should have many notifications', async () => {
      const { Notification } = require('../../models');
      
      await Notification.create({
        userId: user.id,
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification'
      });
      
      const notifications = await user.getNotifications();
      
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Test Notification');
    });
  });
});