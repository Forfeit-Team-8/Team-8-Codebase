// screen-home.jsx — Active pacts list (minimal)

const HomeScreen = ({ onOpenPact, onCreate }) => {
  const pacts = [
    { id: 'p1', title: 'Run 5km every day',          stake: 30, days: 12, total: 28, status: 'due' },
    { id: 'p2', title: 'No social media after 9pm',  stake: 20, days: 11, total: 30, status: 'on-track' },
    { id: 'p3', title: 'Read 20 pages every day',    stake: 15, days:  4, total: 14, status: 'on-track' },
    { id: 'p4', title: 'Cold shower, every morning', stake: 10, days:  0, total:  7, status: 'pending' },
  ];

  const totalAtStake = pacts.reduce((s, p) => s + p.stake, 0);

  return (
    <div style={{ background: C.bg, minHeight: '100%', paddingBottom: 110 }}>
      {/* header — just brand + total at stake */}
      <div style={{ padding: '64px 24px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Onest', fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: -0.6 }}>
          Promise
        </div>
        <div style={{ fontFamily: 'Onest', fontSize: 13, color: C.muted, fontWeight: 500 }}>
          <span style={{ color: C.ink, fontWeight: 700 }}>${totalAtStake}</span> on the line
        </div>
      </div>

      {/* pacts — clean list, no cards, no chrome */}
      <div style={{ padding: '24px 8px 0' }}>
        {pacts.map((p, i) => {
          const dotColor = p.status === 'due' ? C.warm : p.status === 'pending' ? C.muted : C.primary;
          return (
            <button key={p.id} onClick={() => onOpenPact && onOpenPact(p)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                border: 'none', background: 'transparent',
                padding: '18px 16px',
                borderTop: i === 0 ? `1px solid ${C.line}` : 'none',
                borderBottom: `1px solid ${C.line}`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, background: dotColor, flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Onest', fontSize: 16, fontWeight: 600, color: C.ink,
                  letterSpacing: -0.2, lineHeight: 1.3,
                }}>{p.title}</div>
                <div style={{
                  fontFamily: 'Onest', fontSize: 12, color: C.muted, marginTop: 4,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  Day {p.days} of {p.total}
                </div>
              </div>
              <div style={{
                fontFamily: 'Onest', fontSize: 17, fontWeight: 700, color: C.ink,
                fontVariantNumeric: 'tabular-nums',
              }}>${p.stake}</div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ padding: '28px 20px 0' }}>
        <Btn kind="primary" onClick={onCreate}>
          New pact
        </Btn>
      </div>
    </div>
  );
};

window.HomeScreen = HomeScreen;
