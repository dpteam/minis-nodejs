const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');

router.get('/requests', friendsController.getRequests);
router.get('/find', friendsController.findFriends);

module.exports = router;