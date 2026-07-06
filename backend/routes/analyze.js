require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');

// ── pdf-parse v1.1.1 works correctly on Windows ──
const pdfParse = require('pdf-parse');

// ── Multer memory storage ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ── Skills list ──
const TECH_SKILLS = [
  'javascript', 'react', 'node', 'node.js', 'express', 'mongodb',
  'python', 'sql', 'git', 'html', 'css', 'typescript',
  'rest api', 'docker', 'aws', 'figma', 'tailwind', 'tailwindcss',
  'redux', 'graphql', 'next.js', 'nextjs', 'mysql', 'php',
  'bootstrap', 'jquery', 'vue', 'angular', 'firebase', 'postman',
  'mongoose', 'axios', 'jwt', 'api', 'github', 'vscode'
];

// ── Score calculator ──
const scoreResume = (text, foundSkills) => {
  let score = 0;
  const lower = text.toLowerCase();
  score += Math.min(foundSkills.length * 0.4, 4);
  if (lower.includes('@')) score += 1;
  if (lower.match(/\d{10,}/) || lower.includes('phone') || lower.includes('mobile')) score += 0.5;
  if (lower.includes('experience') || lower.includes('internship') || lower.includes('work')) score += 1.5;
  if (lower.includes('education') || lower.includes('university') || lower.includes('bachelor') || lower.includes('bs ') || lower.includes('bscs') || lower.includes('bsit')) score += 1;
  if (lower.includes('project')) score += 1;
  if (text.length > 300) score += 0.5;
  if (text.length > 800) score += 0.5;
  return Math.min(Math.round(score * 10) / 10, 10);
};

// ══════════════════════════════════════════
// POST /api/analyze
// ══════════════════════════════════════════
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';

    if (req.file) {
      console.log('📄 PDF received:', req.file.originalname, '|', req.file.size, 'bytes');

      try {
        // pdfParse reads the buffer directly — this works for all text-based PDFs
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
        console.log('✅ PDF parsed successfully');
        console.log('📝 Characters extracted:', resumeText.length);
        console.log('📋 Pages:', data.numpages);
        // Print first 300 chars so you can see what was extracted
        console.log('🔍 Preview:', resumeText.substring(0, 300));

      } catch (pdfErr) {
        console.error('❌ pdf-parse error:', pdfErr.message);
        return res.status(400).json({
          message: 'Could not read this PDF. Please try these steps: 1) Open your CV in Word or Google Docs, 2) File → Download as PDF, 3) Upload that new PDF. Or switch to Paste Text mode.'
        });
      }

    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
      console.log('📝 Text mode, length:', resumeText.length);

    } else {
      return res.status(400).json({
        message: 'Please provide a resume file or paste your resume text.'
      });
    }

    // Clean up whitespace
    resumeText = resumeText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[^\S\n]+/g, ' ')
      .trim();

    console.log('📏 Final text length after cleanup:', resumeText.length);

    if (resumeText.length < 50) {
      return res.status(400).json({
        message: 'Your PDF appears to be image-based — no readable text was found. Please open your CV in Word or Google Docs, then download as PDF and try again. Or use Paste Text mode.'
      });
    }

    const jobRole = req.body.jobRole || 'General Developer';
    const lowerText = resumeText.toLowerCase();

    // Skills found
    const foundSkills = TECH_SKILLS.filter(skill =>
      lowerText.includes(skill.toLowerCase())
    );

    // Missing skills
    const missingSkills = TECH_SKILLS.filter(skill =>
      !lowerText.includes(skill.toLowerCase())
    ).slice(0, 6);

    const score = scoreResume(resumeText, foundSkills);
    console.log('📊 Score:', score, '| Skills found:', foundSkills.length, '→', foundSkills.join(', '));

    // ── Hugging Face AI summary ──
    let summary = '';
    try {
      console.log('🤖 Calling Hugging Face...');
      const aiRes = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        { inputs: resumeText.substring(0, 800) },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 35000,
        }
      );

      if (aiRes.data?.[0]?.summary_text) {
        summary = aiRes.data[0].summary_text;
        console.log('✅ AI summary received:', summary.substring(0, 100));
      } else if (aiRes.data?.error) {
        console.log('⏳ HF model loading:', aiRes.data.error);
        summary = 'AI model is warming up. Try analyzing again in 30 seconds for the AI summary. Your score is accurate.';
      } else {
        summary = 'AI summary not available right now. Your skill analysis and score are complete.';
      }
    } catch (aiErr) {
      console.log('⚠️ HF error (non-fatal):', aiErr.message);
      summary = 'AI summary unavailable. Your skill analysis and score are accurate.';
    }

    // ── Suggestions ──
    const suggestions = [];
    if (!lowerText.includes('project')) {
      suggestions.push('Add a Projects section — list your GitHub projects with a one-line description of what each does.');
    }
    if (!lowerText.includes('experience') && !lowerText.includes('internship')) {
      suggestions.push('Add a Work Experience or Internship section. Freelance or volunteer work counts too.');
    }
    if (missingSkills.length >= 4) {
      suggestions.push(`These in-demand skills are missing from your resume: ${missingSkills.slice(0, 3).join(', ')}. Add them if you know them.`);
    }
    if (resumeText.length < 600) {
      suggestions.push('Your resume is quite short. Expand each section with more detail — describe what you did and what the outcome was.');
    }
    if (!lowerText.includes('@')) {
      suggestions.push('Make sure your email address is clearly visible at the top of your resume.');
    }
    if (!lowerText.includes('github')) {
      suggestions.push('Add your GitHub profile URL — recruiters always check it for MERN developer roles.');
    }
    if (!lowerText.includes('linkedin')) {
      suggestions.push('Add your LinkedIn profile URL to make it easy for recruiters to connect.');
    }
    if (score >= 8 && suggestions.length === 0) {
      suggestions.push('Excellent resume. Now tailor the skills section for each specific job description you apply to.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Good foundation. Focus on quantifying your achievements — add numbers and outcomes where possible.');
    }

    // ── Save to MongoDB ──
    const analysis = await Analysis.create({
      user: req.user.id,
      resumeText: resumeText.substring(0, 2000),
      jobRole,
      summary,
      score,
      keywords: foundSkills,
      missingSkills,
      suggestions,
    });

    console.log('✅ Analysis saved, id:', analysis._id);

    res.status(201).json({
      id: analysis._id,
      score,
      summary,
      keywords: foundSkills,
      missingSkills,
      suggestions,
      jobRole,
      createdAt: analysis.createdAt,
    });

  } catch (err) {
    console.error('=== ROUTE ERROR ===');
    console.error(err.message);
    console.error(err.stack);
    console.error('==================');
    res.status(500).json({
      message: 'Analysis failed. Please try again.',
      debug: err.message
    });
  }
});

// ── GET history ──
router.get('/history', auth, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user.id })
      .select('-resumeText')
      .sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE history item ──
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ message: 'Not found' });
    if (analysis.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;