// screen-verdict.jsx — Verdict reveal: payout (acquittal) or forfeit (guilty)

const VerdictScreen = ({ won = true, art = 'chunky', stake = 30, ngo = 'Ocean Cleanup', onDone }) => {
  const [reveal, setReveal] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setReveal(true), 600);
    return () => clearTimeout(t);
  }, []);

  const palette = STYLES[art] || STYLES.chunky;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: won
        ? 'radial-gradient(ellipse at 50% 30%, #1a7d49 0%, #0d2a1c 70%, #050d08 100%)'
        : 'radial-gradient(ellipse at 50% 30%, #7a1a1a 0%, #2a0a0a 70%, #0d0303 100%)',
    }}>
      {/* curtains */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '20%',
        background: 'repeating-linear-gradient(180deg, #1a0d05 0 12px, #2a160a 12px 24px)',
        boxShadow: 'inset -8px 0 16px rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '20%',
        background: 'repeating-linear-gradient(180deg, #1a0d05 0 12px, #2a160a 12px 24px)',
        boxShadow: 'inset 8px 0 16px rgba(0,0,0,0.5)' }} />

      {/* sparkles */}
      {reveal && Array.from({ length: 24 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 70}%`,
          width: 6, height: 6,
          background: won ? '#FFD166' : '#E05767',
          animation: `sparkle 1.6s ease-out ${Math.random() * 0.8}s infinite`,
        }} />
      ))}

      {/* big shout */}
      <div style={{
        position: 'absolute', top: '14%', left: 0, right: 0,
        textAlign: 'center',
        opacity: reveal ? 1 : 0,
        transform: reveal ? 'scale(1) rotate(-3deg)' : 'scale(0.3) rotate(-30deg)',
        transition: 'all .5s cubic-bezier(.5, 1.7, .5, 1)',
      }}>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 30, color: won ? '#FFD93C' : '#FF6B6B',
          textShadow: won
            ? '4px 4px 0 #1a7d49, 8px 8px 0 #0d2a1c, -2px -2px 0 #fff'
            : '4px 4px 0 #7a1a1a, 8px 8px 0 #2a0a0a, -2px -2px 0 #fff',
          letterSpacing: 2,
          lineHeight: 1.2,
        }}>{won ? 'NOT GUILTY!' : 'GUILTY!'}</div>
        <div style={{
          marginTop: 12,
          fontFamily: 'VT323, monospace', fontSize: 22, color: '#fff',
          letterSpacing: 1,
        }}>{won ? '☆ The court rules in your favor ☆' : '⚠ The court has ruled ⚠'}</div>
      </div>

      {/* character */}
      <div style={{
        position: 'absolute', bottom: '32%', left: '50%', transform: 'translateX(-50%)',
        opacity: reveal ? 1 : 0, transition: 'opacity .6s .3s',
      }}>
        <IdleBob amp={3}>
          <Character kind={won ? 'defensePoint' : 'judge'} art={art} scale={6} />
        </IdleBob>
      </div>

      {/* result panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px 16px 32px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 100%)',
        opacity: reveal ? 1 : 0, transition: 'opacity .5s .5s',
      }}>
        <div style={{
          background: '#fff', borderRadius: 22, padding: 18,
        }}>
          <div style={{
            fontFamily: '"Press Start 2P", monospace', fontSize: 9,
            color: won ? '#1a7d49' : '#9a3340',
            letterSpacing: 0.6, marginBottom: 8,
          }}>{won ? '— STREAK +1 —' : '— PACT BROKEN —'}</div>

          {won ? (
            <>
              <div style={{ fontFamily: 'Onest', fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: -0.4 }}>
                Your ${stake} is safe.
              </div>
              <div style={{ fontFamily: 'Onest', fontSize: 14, color: C.ink2, marginTop: 6, lineHeight: 1.4 }}>
                Day 12 of 28 done. 16 more and it's all yours, free and clear. The prosecutor is fuming.
              </div>
              <div style={{
                marginTop: 14, padding: 12, borderRadius: 12, background: C.chip,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'Onest', fontSize: 12, color: '#1a7d49', fontWeight: 600 }}>STREAK</span>
                <span style={{ fontFamily: 'Onest', fontSize: 18, fontWeight: 800, color: C.ink }}>7 days 🔥</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'Onest', fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: -0.4 }}>
                ${stake} forfeited to {ngo}.
              </div>
              <div style={{ fontFamily: 'Onest', fontSize: 14, color: C.ink2, marginTop: 6, lineHeight: 1.4 }}>
                The pact is dissolved. On the bright side — that's a real ocean getting a little less plastic. You can start again whenever you're ready.
              </div>
              <div style={{
                marginTop: 14, padding: 12, borderRadius: 12, background: C.chipDanger,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'Onest', fontSize: 12, color: '#9a3340', fontWeight: 600 }}>TRANSFER</span>
                <span style={{ fontFamily: 'Onest', fontSize: 18, fontWeight: 800, color: C.ink }}>${stake} → {ngo}</span>
              </div>
            </>
          )}

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn kind={won ? 'green' : 'primary'} onClick={onDone}>
              {won ? 'Back to my pacts' : 'Make a new promise'}
            </Btn>
            {!won && (
              <button
                onClick={(e) => { e.preventDefault(); }}
                style={{
                  width: '100%', padding: '12px',
                  border: '1.5px solid ' + C.line, background: '#fff',
                  borderRadius: 14, cursor: 'pointer',
                  fontFamily: 'Onest', fontSize: 14, fontWeight: 700, color: C.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                <span style={{fontSize:15}}>⚖️</span>
                Appeal this verdict
              </button>
            )}
            {!won && (
              <div style={{
                fontFamily: 'Onest', fontSize: 11, color: C.muted,
                textAlign: 'center', lineHeight: 1.4, marginTop: 2,
              }}>
                Disagree with the AI? A human reviewer will look at your evidence within 24h. Funds stay paused.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.4) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

window.VerdictScreen = VerdictScreen;
