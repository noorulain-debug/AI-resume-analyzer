const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeText:  { type: String, required: true },
  jobRole:     { type: String, default: 'General' },

  // What AI gives back
  summary:     String,
  score:       { type: Number, min: 0, max: 10 },
  keywords:    [String],        // keywords found in resume
  missingSkills: [String],      // skills the resume is missing
  suggestions: [String],        // improvement tips

}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);