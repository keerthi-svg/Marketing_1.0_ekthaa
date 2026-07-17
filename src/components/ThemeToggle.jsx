// ThemeToggle.jsx – editorial theme toggle
import { useTheme } from '../hooks/useTheme.jsx';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggle}
      id="theme-toggle-btn"
      whileTap={{ scale: 0.9 }}
      style={{
        width: 44,
        height: 24,
        borderRadius: 99,
        background: isDark
          ? 'var(--bg-subtle)'
          : '#EADACF',
        border: '1px solid #DCCBBC',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        transition: 'background 0.3s ease',
        flexShrink: 0,
      }}
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ x: isDark ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#6D5A4E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          boxShadow: '0 1px 3px rgba(74,59,51,0.25)',
          color: '#FFFFFF',
        }}
      >
        {isDark ? '✧' : '✦'}
      </motion.div>
    </motion.button>
  );
}
