// components/SkeletonCard.jsx – shimmer placeholder matching PostCard
export default function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '40%', height: 13, borderRadius: 6, marginBottom: 7 }} />
          <div className="skeleton" style={{ width: '25%', height: 11, borderRadius: 6 }} />
        </div>
      </div>
      {/* Content lines */}
      <div className="skeleton" style={{ width: '100%', height: 13, borderRadius: 6, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '90%',  height: 13, borderRadius: 6, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '65%',  height: 13, borderRadius: 6, marginBottom: 16 }} />
      {/* Tags row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 99 }} />
        <div className="skeleton" style={{ width: 55, height: 22, borderRadius: 99 }} />
      </div>
    </div>
  );
}
