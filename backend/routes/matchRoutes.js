const express = require('express');
const router = express.Router();
const { getMatches, createMatch, getStats, updateMatch, deleteMatch } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getStats);
router.route('/').get(protect, getMatches).post(protect, createMatch);
router.route('/:id').put(protect, updateMatch).delete(protect, deleteMatch);

module.exports = router;
