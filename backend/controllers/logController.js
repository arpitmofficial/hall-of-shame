const Log = require('../models/Log');
const Competition = require('../models/Competition');
const User = require('../models/User');
const { sendSMS } = require('../utils/sms');

// @desc  Get logs (optionally filter by competition)
// @route GET /api/logs
const getLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.competition) filter.competition = req.query.competition;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.user) filter.user = req.query.user;

    const logs = await Log.find(filter)
      .populate('user', 'name avatar')
      .populate('competition', 'title emoji')
      .populate('reviewedBy', 'name')
      .sort({ loggedAt: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc  Create a log entry (claim an event)
// @route POST /api/logs
const createLog = async (req, res) => {
  try {
    const { competition, note } = req.body;

    const comp = await Competition.findById(competition);
    if (!comp) return res.status(404).json({ success: false, error: 'Competition not found' });

    const log = await Log.create({
      competition,
      user: req.user._id,
      note,
      status: comp.requiresApproval ? 'pending' : 'approved',
    });

    await log.populate('user', 'name avatar phone');
    await log.populate('competition', 'title emoji');

    // SMS Notification for new pending claim
    if (log.status === 'pending') {
      const admins = await User.find({ role: 'admin' });
      admins.forEach(admin => {
        if (admin.phone) {
          sendSMS(admin.phone, `👮 COUNCIL DUTY: ${log.user.name} just claimed a '${comp.emoji} ${comp.title}'. Open the Council Panel to approve or reject.`);
        }
      });
    }

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc  Admin approve or reject a log
// @route PUT /api/logs/:id/review
const reviewLog = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
    }

    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, error: 'Log not found' });
    if (log.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Log already reviewed' });
    }

    const updated = await Log.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id, reviewNote: reviewNote || '' },
      { returnDocument: 'after' }
    )
      .populate('user', 'name avatar phone')
      .populate('competition', 'title emoji')
      .populate('reviewedBy', 'name');

    // SMS Notification for review
    if (updated.user?.phone) {
      if (status === 'approved') {
        sendSMS(updated.user.phone, `✅ CLAIM APPROVED: The Council has verified your '${updated.competition.emoji} ${updated.competition.title}'. You're on the board!`);
      } else {
        sendSMS(updated.user.phone, `❌ CLAIM REJECTED: Your '${updated.competition.emoji} ${updated.competition.title}' was denied. Reason: '${reviewNote || 'No reason given'}'.`);
      }
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc  Get scoreboard for a competition (approved logs count per user)
// @route GET /api/logs/scoreboard/:competitionId
const getScoreboard = async (req, res) => {
  try {
    const logs = await Log.find({
      competition: req.params.competitionId,
      status: 'approved',
    }).populate('user', 'name avatar');

    const scoreMap = {};
    logs.forEach((log) => {
      const uid = log.user._id.toString();
      if (!scoreMap[uid]) {
        scoreMap[uid] = { userId: uid, name: log.user.name, avatar: log.user.avatar, count: 0 };
      }
      scoreMap[uid].count++;
    });

    const scoreboard = Object.values(scoreMap).sort((a, b) => b.count - a.count);
    res.json({ success: true, data: scoreboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getLogs, createLog, reviewLog, getScoreboard };
