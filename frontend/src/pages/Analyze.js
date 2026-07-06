import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ResultCard from '../components/ResultCard';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const JOB_ROLES = [
  'MERN Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Software Engineer',
  'Python Developer',
  'Data Analyst',
  'DevOps Engineer',
];

function Analyze() {
  const { token } = useAuth();
  const [mode, setMode]             = useState('text');      // 'text' or 'file'
  const [resumeText, setResumeText] = useState('');
  const [file, setFile]             = useState(null);
  const [jobRole, setJobRole]       = useState('MERN Stack Developer');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    setFile(selected);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (mode === 'text' && resumeText.trim().length < 80) {
      setError('Please paste more of your resume — at least a few sentences.');
      return;
    }
    if (mode === 'file' && !file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('jobRole', jobRole);

      if (mode === 'file') {
        formData.append('resume', file);
      } else {
        formData.append('resumeText', resumeText);
      }

      const res = await axios.post(`${API}/api/analyze`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 40000,  // 40s — Hugging Face model may be cold-starting
      });

      setResult(res.data);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The AI model is loading — please try again in 30 seconds.');
      } else {
        setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setResumeText('');
    setFile(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container">

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">
          AI Resume Analyzer
          <span className="badge badge-ai" style={{ marginLeft: '10px', verticalAlign: 'middle' }}>
            Powered by Hugging Face
          </span>
        </h1>
        <p className="page-subtitle">
          Paste your resume or upload a PDF. Get an AI score, skill gap analysis,
          and actionable improvement suggestions.
        </p>
      </div>

      {/* Main form card */}
      <div className="card">

        {/* Mode toggle */}
        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${mode === 'text' ? 'active' : 'inactive'}`}
            onClick={() => { setMode('text'); setFile(null); setError(''); }}
          >
            📝 Paste text
          </button>
          <button
            type="button"
            className={`toggle-btn ${mode === 'file' ? 'active' : 'inactive'}`}
            onClick={() => { setMode('file'); setResumeText(''); setError(''); }}
          >
            📄 Upload PDF
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Target job role */}
          <div className="form-group">
            <label className="form-label">Target job role</label>
            <select value={jobRole} onChange={(e) => setJobRole(e.target.value)}>
              {JOB_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Text input */}
          {mode === 'text' && (
            <div className="form-group">
              <label className="form-label">
                Resume text
                <span style={{ color: '#484f58', fontWeight: 400, marginLeft: '6px' }}>
                  (copy and paste from your CV)
                </span>
              </label>
              <textarea
                placeholder="Paste your full resume here... Include your name, skills, experience, education, and projects. The more detail you paste, the better the analysis."
                value={resumeText}
                onChange={(e) => { setResumeText(e.target.value); setError(''); }}
                rows={10}
                style={{ minHeight: '200px' }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '4px',
              }}>
                <span style={{ fontSize: '12px', color: '#484f58' }}>
                  {resumeText.length} characters
                  {resumeText.length < 80 && resumeText.length > 0 && (
                    <span style={{ color: '#f87171', marginLeft: '6px' }}>
                      — too short
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* PDF file upload */}
          {mode === 'file' && (
            <div className="form-group">
              <label className="form-label">PDF file</label>
              <label
                htmlFor="pdfInput"
                className={`drop-zone ${file ? 'has-file' : ''}`}
              >
                <input
                  id="pdfInput"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {file ? (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>✅</div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{file.name}</div>
                    <div style={{ fontSize: '12px', color: '#8b949e' }}>
                      {(file.size / 1024).toFixed(1)} KB — click to change
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📄</div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                      Click to upload your resume PDF
                    </div>
                    <div style={{ fontSize: '12px', color: '#484f58' }}>
                      PDF files only · Max 5MB
                    </div>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-box">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-ai"
            disabled={loading}
            style={{ marginTop: '4px' }}
          >
            {loading ? (
              <><span className="spinner" />Analyzing with AI — this may take 20 seconds...</>
            ) : (
              '🚀 Analyze my resume'
            )}
          </button>

          {/* Loading tip */}
          {loading && (
            <p style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#484f58',
              marginTop: '10px',
            }}>
              The Hugging Face AI model may take up to 30 seconds on first use.
              Please wait and don't close this page.
            </p>
          )}
        </form>
      </div>

      {/* Results */}
      <div id="results">
        {result && (
          <>
            <ResultCard result={result} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={handleClear} className="btn-ghost" style={{ padding: '8px 24px' }}>
                Analyze another resume
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analyze;
