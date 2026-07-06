function ScoreCircle({ score }) {
  const getColor = () => {
    if (score >= 7) return '#4ade80';
    if (score >= 5) return '#fb923c';
    return '#f87171';
  };

  const getLabel = () => {
    if (score >= 7) return 'Strong';
    if (score >= 5) return 'Average';
    return 'Needs work';
  };

  const color = getColor();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    }}>
      <div style={{ position: 'relative', width: '140px', height: '140px' }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="#21262d"
            strokeWidth="10"
          />
          {/* Score ring */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Score number in center */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '32px',
            fontWeight: 700,
            color: color,
            lineHeight: 1,
          }}>
            {score}
          </span>
          <span style={{
            fontSize: '12px',
            color: '#8b949e',
            marginTop: '2px',
          }}>
            / 10
          </span>
        </div>
      </div>
      <div style={{
        padding: '4px 14px',
        borderRadius: '20px',
        background: `${color}20`,
        border: `1px solid ${color}40`,
        color: color,
        fontSize: '13px',
        fontWeight: 500,
      }}>
        {getLabel()}
      </div>
    </div>
  );
}

export default ScoreCircle;
