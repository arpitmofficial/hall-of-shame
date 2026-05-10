const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      player1Goals: { type: Number, required: true, min: 0 },
      player2Goals: { type: Number, required: true, min: 0 },
    },
    result: {
      type: String,
      enum: ['player1_win', 'player2_win', 'draw'],
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

matchSchema.pre('save', function () {
  const { player1Goals, player2Goals } = this.score;
  if (player1Goals > player2Goals) this.result = 'player1_win';
  else if (player2Goals > player1Goals) this.result = 'player2_win';
  else this.result = 'draw';
});

module.exports = mongoose.model('Match', matchSchema);
