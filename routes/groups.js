const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');

router.post('/create', groupsController.createGroup);
router.get('/suggested', groupsController.getSuggestedGroups);

module.exports = router;