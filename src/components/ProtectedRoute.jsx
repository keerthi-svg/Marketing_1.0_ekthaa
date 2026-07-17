// components/ProtectedRoute.jsx – redirect to /login if not authenticated
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show beige spinner while session is being verified
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--color-primary)',
          animation: 'spin 0.9s linear infinite',
        }} />
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: '1rem',
          color: 'var(--text-muted)', fontStyle: 'italic',
        }}>
          Loading Ekthaa…
        </span>
      </div>
    );
  }

  if (!user) {
    // Save intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
