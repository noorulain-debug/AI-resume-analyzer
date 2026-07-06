import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: '#161b22',
      borderBottom: '1px solid #30363d',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/analyze" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #1D9E75, #534AB7)',
          borderRadius: '6px',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
        }}>🤖</span>
        <span style={{
          fontWeight: 600,
          fontSize: '15px',
          color: '#e6edf3',
        }}>
          Resume<span style={{ color: '#1D9E75' }}>AI</span>
        </span>
      </Link>

      {/* Nav links — only show when logged in */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link to="/analyze" style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            textDecoration: 'none',
            color: isActive('/analyze') ? '#1D9E75' : '#8b949e',
            background: isActive('/analyze') ? 'rgba(29,158,117,0.1)' : 'transparent',
            fontWeight: isActive('/analyze') ? 500 : 400,
            transition: 'all 0.15s',
          }}>
            Analyze
          </Link>

          <Link to="/history" style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            textDecoration: 'none',
            color: isActive('/history') ? '#1D9E75' : '#8b949e',
            background: isActive('/history') ? 'rgba(29,158,117,0.1)' : 'transparent',
            fontWeight: isActive('/history') ? 500 : 400,
            transition: 'all 0.15s',
          }}>
            History
          </Link>

          <div style={{
            width: '1px',
            height: '20px',
            background: '#30363d',
            margin: '0 8px',
          }} />

          {/* User avatar + name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '8px',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1D9E75, #534AB7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: 'white',
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: '#8b949e' }}>
              {user.name}
            </span>
          </div>

          <button onClick={handleLogout} className="btn-ghost" style={{
            padding: '6px 12px',
            fontSize: '13px',
          }}>
            Sign out
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/login" className="btn-ghost" style={{
            padding: '6px 14px',
            fontSize: '13px',
            border: '1px solid #30363d',
            borderRadius: '6px',
            color: '#8b949e',
          }}>
            Sign in
          </Link>
          <Link to="/register" style={{
            padding: '6px 14px',
            fontSize: '13px',
            background: '#1D9E75',
            borderRadius: '6px',
            color: 'white',
            fontWeight: 500,
          }}>
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
