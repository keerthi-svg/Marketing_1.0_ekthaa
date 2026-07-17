// DecorativeBg.jsx
// Luxury editorial background: soft blobs + subtle SVG decorations
// (four-point stars, sparkles, orbits, constellations, dots)
// All elements ≤ 10% opacity so they never distract.

export default function DecorativeBg() {
  return (
    <div className="deco-bg" aria-hidden="true">

      {/* ── Soft blurred colour blobs ── */}
      <div className="deco-blob" style={{
        width: 600, height: 600,
        background: '#E8D3CA',
        top: -120, left: -160,
        opacity: 0.22,
      }} />
      <div className="deco-blob" style={{
        width: 500, height: 500,
        background: '#DDC3B7',
        bottom: 80, right: -100,
        opacity: 0.18,
      }} />
      <div className="deco-blob" style={{
        width: 360, height: 360,
        background: '#CEB1A3',
        top: '40%', left: '55%',
        opacity: 0.10,
      }} />
      <div className="deco-blob" style={{
        width: 280, height: 280,
        background: '#C49B87',
        top: '20%', right: '10%',
        opacity: 0.08,
      }} />

      {/* ── SVG decorative illustrations ── */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <style>{`
            .d { fill: none; stroke: #AA8472; }
            .df { fill: #AA8472; }
          `}</style>
        </defs>

        {/* ── Four-point stars (✦) ── */}
        {/* A four-point star path centered at (cx, cy) size s */}
        <g opacity="0.07">
          {/* Top-left cluster */}
          <FourStar cx={80}  cy={80}  s={6} />
          <FourStar cx={140} cy={45}  s={4} />
          <FourStar cx={45}  cy={160} s={3} />

          {/* Top-right cluster */}
          <FourStar cx={1320} cy={60}  s={7} />
          <FourStar cx={1380} cy={120} s={4} />
          <FourStar cx={1280} cy={100} s={3} />
          <FourStar cx={1400} cy={40}  s={3} />

          {/* Mid-left */}
          <FourStar cx={30}  cy={400} s={5} />
          <FourStar cx={70}  cy={460} s={3} />

          {/* Mid-right */}
          <FourStar cx={1410} cy={350} s={5} />
          <FourStar cx={1380} cy={420} s={3} />

          {/* Bottom-left */}
          <FourStar cx={100} cy={800} s={6} />
          <FourStar cx={60}  cy={840} s={3} />
          <FourStar cx={160} cy={860} s={4} />

          {/* Bottom-right */}
          <FourStar cx={1350} cy={820} s={7} />
          <FourStar cx={1410} cy={860} s={4} />
          <FourStar cx={1300} cy={870} s={3} />

          {/* Scattered mid */}
          <FourStar cx={700} cy={30}  s={5} />
          <FourStar cx={760} cy={60}  s={3} />
          <FourStar cx={680} cy={870} s={5} />
          <FourStar cx={740} cy={890} s={3} />
        </g>

        {/* ── Eight-point sparkles ✶ ── */}
        <g opacity="0.06" className="df">
          <EightStar cx={200} cy={120} s={5} />
          <EightStar cx={1240} cy={80}  s={6} />
          <EightStar cx={50}  cy={540} s={4} />
          <EightStar cx={1430} cy={560} s={5} />
          <EightStar cx={300} cy={840} s={4} />
          <EightStar cx={1180} cy={860} s={5} />
          <EightStar cx={850} cy={20}  s={4} />
        </g>

        {/* ── Tiny dots / specks ── */}
        <g opacity="0.09" fill="#AA8472">
          {[
            [120,220],[180,300],[90,350],[250,180],[320,90],[420,140],
            [1200,200],[1300,150],[1350,280],[1280,320],[1180,100],
            [500,870],[620,860],[820,880],[950,850],[1100,875],
            [400,30],[550,20],[1050,30],[900,25],
          ].map(([x,y],i) => <circle key={i} cx={x} cy={y} r={2} />)}
        </g>

        {/* ── Thin circles / orbital rings ── */}
        <g opacity="0.055" className="d" strokeWidth="0.8">
          <circle cx={100}  cy={100}  r={55} />
          <circle cx={100}  cy={100}  r={90} />
          <circle cx={1340} cy={100}  r={60} />
          <circle cx={1340} cy={100}  r={100} />
          <circle cx={80}   cy={820}  r={50} />
          <circle cx={1380} cy={820}  r={65} />
          <circle cx={720}  cy={450}  r={180} strokeDasharray="4 8" />
          <circle cx={720}  cy={450}  r={240} strokeDasharray="2 12" />
        </g>

        {/* ── Curved orbit arcs ── */}
        <g opacity="0.05" className="d" strokeWidth="0.7">
          <path d="M 0 300 Q 200 180 400 280 T 800 260" />
          <path d="M 1440 300 Q 1240 180 1040 280 T 640 260" />
          <path d="M 0 600 Q 300 500 600 580 T 1100 560" />
          <path d="M 300 0 Q 380 200 300 400" />
          <path d="M 1140 0 Q 1060 200 1140 400" />
          <path d="M 200 900 Q 320 700 240 500" />
          <path d="M 1240 900 Q 1120 700 1200 500" />
        </g>

        {/* ── Constellation lines ── */}
        <g opacity="0.05" className="d" strokeWidth="0.6">
          {/* top-left constellation */}
          <line x1="80"  y1="80"  x2="140" y2="45" />
          <line x1="140" y1="45"  x2="200" y2="120" />
          <line x1="45"  y1="160" x2="80"  y2="80" />
          {/* top-right constellation */}
          <line x1="1320" y1="60"  x2="1380" y2="120" />
          <line x1="1380" y1="120" x2="1280" y2="100" />
          <line x1="1280" y1="100" x2="1240" y2="80" />
          {/* bottom stars */}
          <line x1="100" y1="800" x2="160" y2="860" />
          <line x1="160" y1="860" x2="60"  y2="840" />
          <line x1="1350" y1="820" x2="1180" y2="860" />
          <line x1="1180" y1="860" x2="1300" y2="870" />
        </g>

        {/* ── Elegant decorative loops (abstract) ── */}
        <g opacity="0.04" className="d" strokeWidth="0.9">
          <path d="M 60 60 C 100 -20 200 60 140 120 C 80 180 -20 100 60 60 Z" />
          <path d="M 1380 60 C 1420 -20 1320 60 1360 120 C 1400 180 1480 100 1380 60 Z" />
        </g>

        {/* ── Fine horizontal rule lines (editorial feel) ── */}
        <g opacity="0.04" stroke="#AA8472" strokeWidth="0.5">
          <line x1="0"   y1="1"   x2="1440" y2="1" />
          <line x1="0"   y1="899" x2="1440" y2="899" />
        </g>

        {/* ── Small cross / plus marks ── */}
        <g opacity="0.07" stroke="#AA8472" strokeWidth="1">
          {[
            [340,70],[1100,70],[400,830],[1040,820],[170,450],[1270,450]
          ].map(([x,y],i) => (
            <g key={i}>
              <line x1={x-5} y1={y}   x2={x+5} y2={y} />
              <line x1={x}   y1={y-5} x2={x}   y2={y+5} />
            </g>
          ))}
        </g>

      </svg>
    </div>
  );
}

/* ── Helper: Four-Point Star ── */
function FourStar({ cx, cy, s }) {
  const p = `
    M ${cx} ${cy - s}
    C ${cx + s*0.15} ${cy - s*0.15}, ${cx + s*0.15} ${cy - s*0.15}, ${cx + s} ${cy}
    C ${cx + s*0.15} ${cy + s*0.15}, ${cx + s*0.15} ${cy + s*0.15}, ${cx} ${cy + s}
    C ${cx - s*0.15} ${cy + s*0.15}, ${cx - s*0.15} ${cy + s*0.15}, ${cx - s} ${cy}
    C ${cx - s*0.15} ${cy - s*0.15}, ${cx - s*0.15} ${cy - s*0.15}, ${cx} ${cy - s}
    Z
  `;
  return <path d={p} fill="#AA8472" />;
}

/* ── Helper: Eight-Point Star ── */
function EightStar({ cx, cy, s }) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4;
    const r     = i % 2 === 0 ? s : s * 0.42;
    return `${cx + r * Math.sin(angle)},${cy - r * Math.cos(angle)}`;
  }).join(' ');
  return <polygon points={pts} fill="#AA8472" />;
}
