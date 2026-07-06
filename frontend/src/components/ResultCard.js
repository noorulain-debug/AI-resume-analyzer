import ScoreCircle from './ScoreCircle';

function ResultCard({ result }) {
  return (
    <div className="fade-in" style={{ marginTop: '32px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '3px',
          height: '22px',
          background: 'linear-gradient(to bottom, #1D9E75, #534AB7)',
          borderRadius: '2px',
        }} />
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6edf3' }}>
          Analysis Results
        </h2>
        <span className="badge badge-ai">
          AI powered
        </span>
      </div>

      {/* Top row: score + AI summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gap: '16px',
        marginBottom: '16px',
        alignItems: 'stretch',
      }}>
        {/* Score circle */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <ScoreCircle score={result.score} />
          <p style={{ fontSize: '12px', color: '#8b949e', textAlign: 'center' }}>
            {result.jobRole}
          </p>
        </div>

        {/* AI Summary */}
        <div className="card" style={{
          borderLeft: '3px solid #534AB7',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#9b91f5',
            }}>
              AI Summary
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#c9d1d9',
            lineHeight: 1.7,
          }}>
            {result.summary || 'AI summary was not available for this analysis.'}
          </p>
        </div>
      </div>

      {/* Skills row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '16px',
      }}>
        {/* Skills found */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>✅</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D9E75' }}>
              Skills Found ({result.keywords?.length || 0})
            </span>
          </div>
          <div>
            {result.keywords && result.keywords.length > 0 ? (
              result.keywords.map((k) => (
                <span key={k} className="badge badge-found">{k}</span>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#484f58' }}>
                No matching technical skills detected.
              </p>
            )}
          </div>
        </div>

        {/* Missing skills */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>❌</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f87171' }}>
              Missing Skills ({result.missingSkills?.length || 0})
            </span>
          </div>
          <div>
            {result.missingSkills && result.missingSkills.length > 0 ? (
              result.missingSkills.map((k) => (
                <span key={k} className="badge badge-missing">{k}</span>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#484f58' }}>
                Great — no major skills missing!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="card" style={{ borderLeft: '3px solid #1D9E75' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D9E75' }}>
            Improvement Suggestions
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {result.suggestions?.map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}>
              <span style={{
                background: 'rgba(29,158,117,0.15)',
                color: '#1D9E75',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px',
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: '14px', color: '#c9d1d9', lineHeight: 1.6 }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#484f58',
        marginTop: '16px',
      }}>
        Analysis saved to your history automatically.
      </p>
    </div>
  );
}

export default ResultCard;
