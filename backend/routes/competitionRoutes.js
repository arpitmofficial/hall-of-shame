const express = require('express');
const router = express.Router();
const {
  getCompetitions,
  getCompetition,
  createCompetition,
  toggleCompetition,
  joinCompetition
} = require('../controllers/competitionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCompetitions).post(protect, createCompetition);
router.route('/:id').get(protect, getCompetition);
router.put('/:id/toggle', protect, toggleCompetition);
router.put('/:id/join', protect, joinCompetition);

module.exports = router;
