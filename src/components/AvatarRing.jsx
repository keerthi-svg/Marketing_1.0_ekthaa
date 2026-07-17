// AvatarRing.jsx – XP progress ring (editorial warm brown)
export default function AvatarRing({ user, size = 48, showRing = false, ringProgress = 0.7 }) {
  const sw     = 3;
  const r      = (size - sw) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - ringProgress);

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      {showRing && (
        <svg width={size} height={size}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="url(#xpGrad)" strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
          <defs>
            <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#AA8472" />
              <stop offset="60%"  stopColor="#C49B87" />
              <stop offset="100%" stopColor="#E8D3CA" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <div className="avatar" style={{
        width:  size - (showRing ? sw * 2 + 2 : 0),
        height: size - (showRing ? sw * 2 + 2 : 0),
        position: showRing ? 'absolute' : 'static',
        top:  showRing ? sw + 1 : undefined,
        left: showRing ? sw + 1 : undefined,
        fontSize: size * 0.34,
        letterSpacing: '-0.01em',
        background: user?.avatarGradient || 'linear-gradient(135deg, #AA8472, #DDC3B7)',
      }}>
        {user?.initials || (user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?')}
      </div>
    </div>
  );
}
