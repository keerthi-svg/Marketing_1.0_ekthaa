// BottomNav.jsx – editorial floating pill navigation
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Trophy, PenLine, Search, User } from 'lucide-react';

const tabs = [
  { to: '/',            icon: Home,    label: 'Home',    id: 'nav-home'  },
  { to: '/leaderboard', icon: Trophy,  label: 'Ranks',   id: 'nav-lb'    },
  { to: '/create',      icon: PenLine, label: 'Write',   id: 'nav-create', special: true },
  { to: '/search',      icon: Search,  label: 'Discover',id: 'nav-search'},
  { to: '/profile',     icon: User,    label: 'Profile', id: 'nav-profile'},
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'var(--bottom-nav-h)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: 'rgba(250,246,242,0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-full)',
        padding: '8px 14px',
        boxShadow: '0 8px 32px rgba(170,132,114,0.14), 0 2px 8px rgba(170,132,114,0.08)',
        pointerEvents: 'auto',
      }}>
        {tabs.map(({ to, icon: Icon, label, id, special }) => {
          const active = location.pathname === to;
          return (
            <NavLink key={to} to={to} id={id} style={{ textDecoration: 'none' }}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: special ? '9px 18px' : '7px 14px',
                  borderRadius: 'var(--r-full)',
                  background: special
                    ? 'var(--color-primary)'
                    : active
                      ? 'rgba(170,132,114,0.12)'
                      : 'transparent',
                  border: special
                    ? 'none'
                    : active
                      ? '1px solid rgba(170,132,114,0.20)'
                      : '1px solid transparent',
                  boxShadow: special ? '0 3px 12px rgba(170,132,114,0.28)' : 'none',
                  transition: 'all 0.25s ease',
                  minWidth: 46,
                  position: 'relative',
                }}
              >
                {active && !special && (
                  <motion.div
                    layoutId="nav-pill"
                    style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r-full)', background: 'rgba(170,132,114,0.10)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon
                  size={special ? 19 : 18}
                  color={special ? '#fff' : active ? 'var(--color-primary)' : 'var(--text-muted)'}
                  strokeWidth={active ? 2.2 : 1.6}
                  style={{ position: 'relative', zIndex: 1 }}
                />
                <span style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: active ? 700 : 500,
                  color: special ? '#fff' : active ? 'var(--color-primary)' : 'var(--text-muted)',
                  lineHeight: 1,
                  position: 'relative', zIndex: 1,
                  letterSpacing: '0.01em',
                }}>
                  {label}
                </span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
