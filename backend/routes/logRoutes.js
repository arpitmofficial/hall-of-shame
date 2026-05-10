const express = require('express');
const router = express.Router();
const { getLogs, createLog, reviewLog, getScoreboard } = require('../controllers/logController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/scoreboard/:competitionId', protect, getScoreboard);
router.route('/').get(protect, getLogs).post(protect, createLog);
router.put('/:id/review', protect, adminOnly, reviewLog);

module.exports = router;
