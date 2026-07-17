// EmptyState.jsx – elegant editorial empty states

const config = {
  posts:         { symbol: '✦', title: 'Nothing here yet',           desc: 'Be the first to share an idea. Every great conversation starts with a single thought.' },
  notifications: { symbol: '○', title: 'All quiet',                  desc: 'No notifications yet. Keep writing and engaging — the community will respond.' },
  search:        { symbol: '✧', title: 'No results found',           desc: 'Try a different keyword, or explore the trending topics below.' },
  welcome:       { symbol: '✶', title: 'Welcome to Ekthaa',          desc: 'Your premium space for ideas. Begin by writing something that matters to you.' },
};

export default function EmptyState({ type = 'posts', action, actionLabel }) {
  const { symbol, title, desc } = config[type] || config.posts;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '72px 24px', textAlign: 'center', gap: 18,
    }}>
      {/* Decorative symbol */}
      <div style={{
        width: 88, height: 88,
        borderRadius: '50%',
        border: '1.5px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
        color: 'var(--p-brown-3)',
        fontFamily: 'var(--font-serif)',
        boxShadow: 'var(--shadow-sm)',
        animation: 'floatGently 4s ease-in-out infinite',
      }}>
        {symbol}
      </div>

      <div>
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem', fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 10, letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          maxWidth: 300, lineHeight: 1.7,
        }}>
          {desc}
        </p>
      </div>

      {action && (
        <button className="btn btn-primary" onClick={action} style={{ marginTop: 4 }}>
          {actionLabel || 'Get started'}
        </button>
      )}
    </div>
  );
}
