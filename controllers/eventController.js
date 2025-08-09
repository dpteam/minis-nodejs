const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения событий'
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      userId: req.user.id
    });
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания события'
    });
  }
};