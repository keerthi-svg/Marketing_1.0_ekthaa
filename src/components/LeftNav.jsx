// LeftNav.jsx – Premium editorial left sidebar
import { NavLink } from 'react-router-dom';
import { Home, Trophy, Search, Bell, User, PenLine, BookOpen } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AvatarRing  from './AvatarRing';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',              icon: Home,    label: 'Home',          id: 'left-nav-home'   },
  { to: '/leaderboard',   icon: Trophy,  label: 'Leaderboard',   id: 'left-nav-lb'     },
  { to: '/search',        icon: Search,  label: 'Discover',      id: 'left-nav-search' },
  { to: '/notifications', icon: Bell,    label: 'Notifications', id: 'left-nav-notif'  },
  { to: '/profile',       icon: User,    label: 'Profile',       id: 'left-nav-profile'},
];

export default function LeftNav({ onCreatePost }) {
  const { user } = useAuth();
  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      width: 'var(--left-nav-w)',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 16px 24px',
      zIndex: 40,
      gap: 2,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingLeft: 10 }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 11,
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(170,132,114,0.30)',
        }}>
          <BookOpen size={18} color="#fff" strokeWidth={1.8} />
        </div>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.3rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          Ekthaa
        </span>
      </div>

      {/* Nav items */}
      {navItems.map(({ to, icon: Icon, label, id }) => (
        <NavLink key={to} to={to} id={id} style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '10px 14px',
                borderRadius: 14,
                background: isActive ? 'rgba(170,132,114,0.14)' : 'transparent',
                border: isActive ? '1px solid rgba(170,132,114,0.18)' : '1px solid transparent',
                transition: 'all 0.22s ease',
                cursor: 'pointer',
                marginBottom: 2,
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(170,132,114,0.07)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; } }}
            >
              <Icon
                size={18}
                color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9125rem',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                letterSpacing: '-0.01em',
              }}>
                {label}
              </span>
            </div>
          )}
        </NavLink>
      ))}

      {/* Write button */}
      <button
        id="left-nav-create"
        onClick={onCreatePost}
        className="btn btn-primary"
        style={{
          marginTop: 18,
          width: '100%',
          padding: '12px 0',
          fontSize: '0.9rem',
          letterSpacing: '0.01em',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <PenLine size={16} strokeWidth={1.8} /> Write
      </button>

      <div style={{ flex: 1 }} />

      {/* User strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 10px',
        borderRadius: 13,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <AvatarRing user={user} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>
            Level {user?.level || 1}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
