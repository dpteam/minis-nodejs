const App = require('../models/App');

exports.getApps = async (req, res) => {
  try {
    const apps = await App.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: apps
    });
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения приложений'
    });
  }
};

exports.createApp = async (req, res) => {
  try {
    const { name, description, url } = req.body;
    const app = await App.create({
      name,
      description,
      url,
      userId: req.user.id
    });
    
    res.json({
      success: true,
      data: app
    });
  } catch (error) {
    console.error('Error creating app:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания приложения'
    });
  }
};