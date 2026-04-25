// screen-checkin.jsx — Daily check-in / progress detail

const CheckinScreen = ({ pact, onBack, onStartCourtroom }) => {
  const days = Array.from({ length: 28 }, (_, i) => {
    const status = i < 11 ? 'done' : i === 11 ? 'today' : 'future';
    return { i, status };
  });

  return (
    <div style={{ background: C.bg, minHeight: '100%' }}>
      <TopBar title="Pact details"
        leading={<button onClick={onBack} style={{border:'none',background:'transparent',padding:0,cursor:'pointer'}}><IconBack/></button>}
        trailing={<div style={{fontSize:18, color:C.ink2}}>⋯</div>}
      />

      {/* hero */}
      <div style={{ padding: '12px 20px 0' }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: C.chip,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>🏃</div>
            <div style={{ flex: 1 }}>
              <Chip tone="warm">DUE TODAY · 9:00 PM</Chip>
              <div style={{ fontFamily: 'Onest', fontSize: 17, fontWeight: 700, color: C.ink, marginTop: 6, lineHeight: 1.25 }}>
                Run 5km every day
              </div>
              <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, marginTop: 2 }}>
                $30 → Ocean Cleanup
              </div>
            </div>
          </div>

          {/* progress bar */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Onest', fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              <span>Day 12 of 28</span>
              <span>16 days to go</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: C.line, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(12/28)*100}%`,
                background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
                borderRadius: 4,
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontFamily: 'Onest', fontSize: 12 }}>
            <div><span style={{color:C.muted}}>Streak</span> <strong style={{color:C.ink}}>12 days 🔥</strong></div>
            <div><span style={{color:C.muted}}>At stake</span> <strong style={{color:C.ink}}>$30</strong></div>
            <div><span style={{color:C.muted}}>Forfeit to</span> <strong style={{color:C.ink}}>Ocean</strong></div>
          </div>
        </Card>
      </div>

      {/* today's task */}
      <div style={{ padding: '20px 20px 8px', fontFamily: 'Onest', fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        Today's check-in
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{
          padding: 18, borderRadius: 22,
          background: 'linear-gradient(180deg, #FFF7E5 0%, #FFE9C2 100%)',
          border: '1.5px solid ' + C.accent,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Character kind="judge" art="chunky" scale={2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: '#A4691B', marginBottom: 4, letterSpacing: 0.5 }}>
                THE COURT AWAITS
              </div>
              <div style={{ fontFamily: 'Onest', fontSize: 16, fontWeight: 700, color: '#5A3A0E', lineHeight: 1.3 }}>
                Did you run 5km today?
              </div>
              <div style={{ fontFamily: 'Onest', fontSize: 13, color: '#7a4f12', marginTop: 4, lineHeight: 1.4 }}>
                The AI prosecutor will ask you a few questions. Have your evidence ready.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <Btn kind="primary" onClick={onStartCourtroom}>
              Take the stand →
            </Btn>
          </div>
        </div>

        <button style={{
          width: '100%', marginTop: 10, padding: '12px',
          border: '1.5px dashed ' + C.line, background: 'transparent',
          borderRadius: 14, cursor: 'pointer',
          fontFamily: 'Onest', fontSize: 13, color: C.muted, fontWeight: 600,
        }}>I didn't do it today — forfeit honestly</button>
      </div>

      {/* recent activity */}
      <div style={{ padding: '24px 20px 8px', fontFamily: 'Onest', fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        Recent verdicts
      </div>
      <div style={{ padding: '0 20px 110px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { d: 'Yesterday', v: 'Acquitted', sub: '5.2km · 28:14', tone: 'green' },
          { d: 'Sunday',    v: 'Acquitted', sub: '5.1km · 29:02', tone: 'green' },
          { d: 'Saturday',  v: 'Acquitted', sub: '5.0km · 30:11', tone: 'green' },
          { d: 'Friday',    v: 'Acquitted', sub: '5.4km · 27:48', tone: 'green' },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#fff', padding: '12px 14px', borderRadius: 14,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: r.tone === 'green' ? C.chip : '#EAF1ED',
              color: r.tone === 'green' ? C.primary : C.ink2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Onest', fontWeight: 700, fontSize: 14,
            }}>{r.tone === 'green' ? '✓' : '–'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Onest', fontWeight: 600, fontSize: 14, color: C.ink }}>{r.v}</div>
              <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, marginTop: 1 }}>{r.sub}</div>
            </div>
            <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, fontWeight: 500 }}>{r.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.CheckinScreen = CheckinScreen;
