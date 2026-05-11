const Match = require('../models/Match');
const mongoose = require('mongoose');
const { sendSMS } = require('../utils/sms');

// @desc  Get all matches
// @route GET /api/matches
const getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('player1', 'name avatar')
      .populate('player2', 'name avatar')
      .sort({ playedAt: -1 });
    res.json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc  Create match
// @route POST /api/matches
const createMatch = async (req, res) => {
  try {
    const { player1, player2, score, notes, playedAt } = req.body;
    const match = await Match.create({ player1, player2, score, notes, playedAt });
    await match.populate('player1', 'name avatar phone');
    await match.populate('player2', 'name avatar phone');
    
    // SMS Notification for FIFA Match
    const p1 = match.player1;
    const p2 = match.player2;
    const p1w = match.result === 'player1_win';
    const p2w = match.result === 'player2_win';
    
    if (p1w && p2?.phone) {
      sendSMS(p2.phone, `🚨 HALL OF SHAME: ${p1.name} just logged a ${score.player1Goals}-${score.player2Goals} FIFA win against you. Log in to check the damage or file a dispute.`);
    } else if (p2w && p1?.phone) {
      sendSMS(p1.phone, `🚨 HALL OF SHAME: ${p2.name} just logged a ${score.player2Goals}-${score.player1Goals} FIFA win against you. Log in to check the damage or file a dispute.`);
    }

    res.status(201).json({ success: true, data: match });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc  Get aggregate stats per player
// @route GET /api/matches/stats
const getStats = async (req, res) => {
  try {
    const matches = await Match.find().populate('player1', 'name').populate('player2', 'name');

    const statsMap = {};

    const ensure = (user) => {
      const id = user._id.toString();
      if (!statsMap[id]) {
        statsMap[id] = { userId: id, name: user.name, wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matches: 0 };
      }
    };

    matches.forEach((m) => {
      ensure(m.player1);
      ensure(m.player2);
      const p1 = m.player1._id.toString();
      const p2 = m.player2._id.toString();

      statsMap[p1].matches++;
      statsMap[p2].matches++;
      statsMap[p1].goalsFor += m.score.player1Goals;
      statsMap[p1].goalsAgainst += m.score.player2Goals;
      statsMap[p2].goalsFor += m.score.player2Goals;
      statsMap[p2].goalsAgainst += m.score.player1Goals;

      if (m.result === 'player1_win') {
        statsMap[p1].wins++;
        statsMap[p2].losses++;
      } else if (m.result === 'player2_win') {
        statsMap[p2].wins++;
        statsMap[p1].losses++;
      } else {
        statsMap[p1].draws++;
        statsMap[p2].draws++;
      }
    });

    const stats = Object.values(statsMap).map((s) => ({
      ...s,
      goalDiff: s.goalsFor - s.goalsAgainst,
      winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
    }));

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc  Update match score/notes
// @route PUT /api/matches/:id
const updateMatch = async (req, res) => {
  try {
    const { score, notes } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (score) match.score = score;
    if (notes !== undefined) match.notes = notes;
    await match.save(); // triggers pre-save result recalculation
    await match.populate('player1', 'name avatar');
    await match.populate('player2', 'name avatar');
    res.json({ success: true, data: match });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc  Delete match
// @route DELETE /api/matches/:id
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getMatches, createMatch, getStats, updateMatch, deleteMatch };
