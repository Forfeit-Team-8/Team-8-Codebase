// screen-courtroom.jsx — Ace-Attorney-style verification

const COURT_SCRIPT = [
  { who: 'judge', text: "Court is now in session. The defendant is accused of skipping their 5K run today.", icon: '🔨' },
  { who: 'prosecutor', text: "The prosecution objects to ANY claim of completion without solid evidence!", shout: 'OBJECTION!' },
  { who: 'prosecutor', text: "Tell me, defendant... how far did you actually run today?" },
  { who: 'choice', options: [
      { id: 'truth', label: '5.2 km', tone: 'good' },
      { id: 'lie',   label: '"About 5km, give or take"', tone: 'mid' },
      { id: 'fail',  label: 'I didn\'t run today', tone: 'bad' },
    ] },
  { who: 'prosecutor', text: "5.2 km, you say? Then surely you can present... PROOF!", shout: 'HOLD IT!' },
  { who: 'evidence' },
  { who: 'defense', text: "The defense submits this run log as Exhibit A. Strava doesn't lie.", shout: 'TAKE THAT!' },
  { who: 'judge', text: "Hmm. The pace is consistent. Distance verified. The court accepts this evidence.", icon: '🔨' },
  { who: 'verdict' },
];

const Speaker = ({ name, color }) => (
  <div style={{
    position: 'absolute', top: -14, left: 16,
    background: color, color: '#fff',
    padding: '4px 10px', borderRadius: 6,
    fontFamily: '"Press Start 2P", monospace', fontSize: 9,
    letterSpacing: 0.5, zIndex: 2,
    boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
  }}>{name}</div>
);

const useTypewriter = (text, speed = 22) => {
  const [shown, setShown] = React.useState('');
  React.useEffect(() => {
    setShown('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return [shown, shown.length === (text || '').length];
};

const Shout = ({ word }) => {
  const [scale, setScale] = React.useState(0.4);
  React.useEffect(() => {
    setScale(0.4);
    requestAnimationFrame(() => setScale(1));
  }, [word]);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)',
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 38,
        color: '#FFD93C',
        textShadow: '4px 4px 0 #B33A1B, 8px 8px 0 #6B1A0A, -2px -2px 0 #fff',
        transform: `scale(${scale}) rotate(-6deg)`,
        transition: 'transform .18s cubic-bezier(.5,1.7,.5,1)',
        letterSpacing: 2,
      }}>{word}</div>
    </div>
  );
};

const CourtBackdrop = ({ art, children }) => {
  const isGB = art === 'gameboy';
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: isGB ? '#9BBC0F' :
        'radial-gradient(ellipse at 50% 30%, #6B3F2A 0%, #3a2517 60%, #1F1108 100%)',
    }}>
      {/* wood floor */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%',
        background: isGB ? '#306230' :
          'repeating-linear-gradient(180deg, #4a2d1c 0 6px, #553420 6px 12px, #3a2014 12px 18px)',
        borderTop: isGB ? '4px solid #0F380F' : '3px solid #1a0d05',
      }} />
      {/* back wall trim */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0, height: 8,
        background: isGB ? '#0F380F' : '#1a0d05',
        boxShadow: isGB ? '0 6px 0 #306230' : '0 4px 0 #2a160a',
      }} />
      {/* sconces */}
      {!isGB && [0.15, 0.85].map((x, i) => (
        <div key={i} style={{
          position: 'absolute', top: '14%', left: `${x * 100}%`, transform: 'translateX(-50%)',
          width: 16, height: 22,
          background: '#FFD166',
          boxShadow: '0 0 24px 8px rgba(255,209,102,0.4), 0 0 60px 20px rgba(255,150,80,0.18)',
          borderRadius: '50% 50% 20% 20%',
        }} />
      ))}
      {children}
    </div>
  );
};

const HeartMeter = ({ value, art }) => {
  const palette = STYLES[art] || STYLES.chunky;
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <PixelArt key={i}
          grid={`.HH..HH.\nHHHHHHHH\nHHHHHHHH\n.HHHHHH.\n..HHHH..\n...HH...`}
          palette={{ H: i <= value ? palette.danger : '#5A3030' }}
          scale={2} />
      ))}
    </div>
  );
};

const CourtroomScreen = ({ art = 'chunky', onDone }) => {
  const [step, setStep] = React.useState(0);
  const [credibility, setCredibility] = React.useState(5);
  const [shake, setShake] = React.useState(0);
  const [shout, setShout] = React.useState(null);
  const [evidence, setEvidence] = React.useState(null);

  const cur = COURT_SCRIPT[step];
  const dialog = cur && cur.text ? cur.text : '';
  const [typed, done] = useTypewriter(dialog);

  // shout effect
  React.useEffect(() => {
    if (cur && cur.shout) {
      setShout(cur.shout);
      setShake(1);
      setTimeout(() => setShake(0), 400);
      setTimeout(() => setShout(null), 850);
    }
  }, [step]);

  const advance = () => {
    if (cur.who === 'choice' || cur.who === 'evidence' || cur.who === 'verdict') return;
    if (!done) return;
    if (step < COURT_SCRIPT.length - 1) setStep(step + 1);
  };

  const pickChoice = (opt) => {
    if (opt.tone === 'bad') {
      setCredibility(0);
      setStep(COURT_SCRIPT.length - 1); // jump to verdict
    } else if (opt.tone === 'mid') {
      setCredibility(c => Math.max(1, c - 2));
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  const submitEvidence = (kind) => {
    setEvidence(kind);
    if (kind === 'photo') {
      setShout('TAKE THAT!');
      setTimeout(() => setShout(null), 850);
    }
    setTimeout(() => setStep(step + 1), 900);
  };

  const speaker = {
    judge: { name: 'JUDGE', color: '#7a3a18' },
    prosecutor: { name: 'PROSECUTOR', color: '#9B2828' },
    defense: { name: 'YOU', color: '#1a7d49' },
  }[cur && cur.who] || null;

  const palette = STYLES[art] || STYLES.chunky;
  const dialogBg = art === 'gameboy' ? '#0F380F' : '#0a1a14';
  const dialogText = art === 'gameboy' ? '#9BBC0F' : '#ffffff';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: '#000',
      transform: shake ? `translate(${(Math.random()-0.5)*8}px, ${(Math.random()-0.5)*8}px)` : 'none',
      transition: shake ? 'none' : 'transform .1s',
    }}>
      <CourtBackdrop art={art}>
        {/* HUD top */}
        <div style={{
          position: 'absolute', top: 56, left: 16, right: 16, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button onClick={onDone} style={{
            border: 'none', background: 'rgba(0,0,0,0.5)',
            color: '#fff', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
            fontFamily: '"Press Start 2P", monospace', fontSize: 8, letterSpacing: 0.5,
          }}>← FLEE</button>
          <div style={{
            background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#fff', letterSpacing: 0.5 }}>CREDIBILITY</div>
            <HeartMeter value={credibility} art={art} />
          </div>
        </div>

        {/* characters */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* judge — back center */}
          {(cur.who === 'judge') && (
            <IdleBob style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)' }}>
              <Character kind="judge" art={art} scale={5} />
            </IdleBob>
          )}
          {/* prosecutor — right podium */}
          {(cur.who === 'prosecutor') && (
            <IdleBob delay={1.3} style={{ position: 'absolute', bottom: '38%', right: '6%' }}>
              <Character kind="prosecutor" art={art} scale={5} />
            </IdleBob>
          )}
          {/* defense (you) — left podium */}
          {(cur.who === 'defense' || cur.who === 'choice' || cur.who === 'evidence') && (
            <IdleBob delay={0.7} style={{ position: 'absolute', bottom: '38%', left: '6%' }}>
              <Character kind={cur.who === 'defense' ? 'defensePoint' : 'defense'} art={art} scale={5} />
            </IdleBob>
          )}
        </div>

        {shout && <Shout word={shout} />}

        {/* dialog box */}
        {cur.text && (
          <div onClick={advance} style={{
            position: 'absolute', bottom: 24, left: 14, right: 14, zIndex: 15,
            background: dialogBg,
            border: `3px solid ${art === 'gameboy' ? '#9BBC0F' : '#FFD166'}`,
            borderRadius: 4,
            padding: '20px 16px 16px',
            cursor: 'pointer',
            boxShadow: '0 0 0 2px #000, 0 8px 0 rgba(0,0,0,0.4)',
            minHeight: 110,
          }}>
            {speaker && <Speaker name={speaker.name} color={speaker.color} />}
            <div style={{
              fontFamily: 'VT323, monospace', fontSize: 22, lineHeight: 1.25,
              color: dialogText, letterSpacing: 0.5,
            }}>
              {typed}
              {!done && <span style={{ animation: 'blink 1s step-end infinite' }}>▌</span>}
            </div>
            {done && (
              <div style={{
                position: 'absolute', bottom: 8, right: 12,
                fontFamily: '"Press Start 2P", monospace', fontSize: 8,
                color: art === 'gameboy' ? '#9BBC0F' : '#FFD166',
                animation: 'blink 0.8s step-end infinite',
              }}>▼ TAP</div>
            )}
          </div>
        )}

        {/* CHOICE prompt */}
        {cur.who === 'choice' && (
          <div style={{
            position: 'absolute', bottom: 24, left: 14, right: 14, zIndex: 16,
          }}>
            <div style={{
              background: dialogBg, border: '3px solid #FFD166', borderRadius: 4,
              padding: '14px 12px',
              boxShadow: '0 0 0 2px #000',
            }}>
              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: '#FFD166', marginBottom: 10, letterSpacing: 0.5 }}>
                ▸ CHOOSE YOUR TESTIMONY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cur.options.map(o => (
                  <button key={o.id} onClick={() => pickChoice(o)} style={{
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '10px 12px',
                    background: o.tone === 'good' ? '#1a7d49' : o.tone === 'mid' ? '#7a4f12' : '#7a1a1a',
                    color: '#fff',
                    fontFamily: 'VT323, monospace', fontSize: 18, lineHeight: 1.2,
                    borderRadius: 2,
                    boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.3), 0 2px 0 #000',
                  }}>▸ {o.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EVIDENCE prompt */}
        {cur.who === 'evidence' && (
          <div style={{
            position: 'absolute', bottom: 24, left: 14, right: 14, zIndex: 16,
          }}>
            <div style={{
              background: dialogBg, border: '3px solid #FFD166', borderRadius: 4,
              padding: '14px 12px',
              boxShadow: '0 0 0 2px #000',
            }}>
              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: '#FFD166', marginBottom: 10, letterSpacing: 0.5 }}>
                ▸ PRESENT EVIDENCE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { k: 'photo', t: 'Strava log', emoji: '📊' },
                  { k: 'gps', t: 'GPS trace', emoji: '🗺️' },
                  { k: 'photo2', t: 'Sweaty selfie', emoji: '🤳' },
                  { k: 'fail', t: 'No evidence', emoji: '🤷' },
                ].map(e => (
                  <button key={e.k} onClick={() => submitEvidence(e.k)} style={{
                    border: '2px solid #FFD166', cursor: 'pointer',
                    padding: '10px 8px',
                    background: '#000',
                    color: '#FFD166',
                    fontFamily: 'VT323, monospace', fontSize: 16, lineHeight: 1.1,
                    borderRadius: 2,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontSize: 22 }}>{e.emoji}</span>
                    {e.t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VERDICT trigger */}
        {cur.who === 'verdict' && (
          <div style={{
            position: 'absolute', bottom: 24, left: 14, right: 14, zIndex: 16,
          }}>
            <button onClick={() => onDone && onDone(credibility >= 3 ? 'win' : 'lose')}
              style={{
                width: '100%', padding: '16px',
                background: '#FFD166', border: '3px solid #000',
                fontFamily: '"Press Start 2P", monospace', fontSize: 14,
                color: '#1a0d05', letterSpacing: 1, cursor: 'pointer',
                boxShadow: '0 4px 0 #000',
              }}>
              ▶ HEAR THE VERDICT
            </button>
          </div>
        )}
      </CourtBackdrop>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
};

window.CourtroomScreen = CourtroomScreen;
