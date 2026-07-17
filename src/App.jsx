// App.jsx – editorial root layout with auth
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Coffee } from 'lucide-react';

import { AuthProvider }  from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute    from './components/ProtectedRoute';

import DecorativeBg    from './components/DecorativeBg';
import BottomNav       from './components/BottomNav';
import LeftNav         from './components/LeftNav';
import RightSidebar    from './components/RightSidebar';
import CreatePostModal from './components/CreatePostModal';
import ThemeToggle     from './components/ThemeToggle';

import Home          from './pages/Home';
import Leaderboard   from './pages/Leaderboard';
import Profile       from './pages/Profile';
import Search        from './pages/Search';
import Notifications from './pages/Notifications';

// Auth pages (outside protected shell)
import Login            from './pages/auth/Login';
import Register         from './pages/auth/Register';
import OtpVerification  from './pages/auth/OtpVerification';
import ForgotPassword   from './pages/auth/ForgotPassword';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1,  y: 0  },
  exit:    { opacity: 0,  y: -8 },
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isDesktop;
}

// ── Inner shell (only rendered when authenticated) ──
function AppShell({ createOpen, setCreateOpen }) {
  const isDesktop = useIsDesktop();
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    if (location.pathname === '/create') {
      setCreateOpen(true);
      navigate('/', { replace: true });
    }
  }, [location.pathname]);

  return (
    <div className="app-layout" style={{ position: 'relative' }}>
      <DecorativeBg />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', minHeight: '100vh' }}>
        {isDesktop && <LeftNav onCreatePost={() => setCreateOpen(true)} />}

        <main className="app-main">
          {/* Mobile top bar */}
          {!isDesktop && (
            <div style={{
              position: 'sticky', top: 0, zIndex: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 20px',
              background: 'rgba(250,246,242,0.92)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coffee size={16} color="#fff" />
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Ekthaa
                </span>
              </div>
              <ThemeToggle />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.27, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1 }}
            >
              <Routes location={location}>
                <Route path="/"              element={<Home onCreatePost={() => setCreateOpen(true)} />} />
                <Route path="/leaderboard"   element={<Leaderboard />} />
                <Route path="/search"        element={<Search />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile"       element={<Profile />} />
                <Route path="*"              element={<Home onCreatePost={() => setCreateOpen(true)} />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

        {isDesktop && <RightSidebar />}
        {!isDesktop && <BottomNav />}
      </div>

      <CreatePostModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onPost={() => setCreateOpen(false)}
      />
    </div>
  );
}

// ── Root App ──
export default function App() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-otp"      element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected app shell */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell createOpen={createOpen} setCreateOpen={setCreateOpen} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
