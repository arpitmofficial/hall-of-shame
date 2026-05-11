const Competition = require('../models/Competition');

// @desc  Get all competitions
// @route GET /api/competitions
const getCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find()
      .populate('participants', 'name avatar')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: competitions.length, data: competitions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc  Get single competition
// @route GET /api/competitions/:id
const getCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('participants', 'name avatar')
      .populate('createdBy', 'name');
    if (!competition) return res.status(404).json({ success: false, error: 'Competition not found' });
    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc  Create competition
// @route POST /api/competitions
const createCompetition = async (req, res) => {
  try {
    const { title, description, emoji, participants, requiresApproval, semester } = req.body;
    const competition = await Competition.create({
      title, description, emoji, participants, requiresApproval, semester,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: competition });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc  Toggle competition active status
// @route PUT /api/competitions/:id/toggle
const toggleCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ success: false, error: 'Competition not found' });
    competition.isActive = !competition.isActive;
    await competition.save();
    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc  Join a competition
// @route PUT /api/competitions/:id/join
const joinCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ success: false, error: 'Competition not found' });
    
    if (competition.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, error: 'Already a participant' });
    }
    
    competition.participants.push(req.user._id);
    await competition.save();
    
    const updated = await Competition.findById(req.params.id)
      .populate('participants', 'name avatar')
      .populate('createdBy', 'name');
      
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getCompetitions, getCompetition, createCompetition, toggleCompetition, joinCompetition };
