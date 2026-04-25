// screen-create.jsx — Create a pact (3 steps + payment)
// Step 1: Promise + duration
// Step 2: Pick NGO (forfeit destination)
// Step 3: Pick amount + pay

const NGOS = [
  { id: 'ocean', name: 'Ocean Cleanup',                tag: 'Removes plastic from oceans', emoji: '🌊' },
  { id: 'dwb',   name: 'Doctors Without Borders',      tag: 'Emergency medical aid',       emoji: '⚕️' },
  { id: 'r2r',   name: 'Room to Read',                 tag: 'Literacy for children',       emoji: '📚' },
  { id: 'water', name: 'WaterAid',                     tag: 'Clean water access',          emoji: '💧' },
  { id: 'efr',   name: 'Electronic Frontier Foundation', tag: 'Digital rights',            emoji: '🛡️' },
];

const TEMPLATES = [
  { emoji: '🏃', t: 'Run 5km daily' },
  { emoji: '📵', t: 'No phone after 9pm' },
  { emoji: '📖', t: 'Read 20 pages a day' },
  { emoji: '🥗', t: 'No takeout this week' },
  { emoji: '✏️', t: 'Write 500 words daily' },
];

const CreateScreen = ({ onBack, onSubmit, initialStep = 1 }) => {
  const [step, setStep] = React.useState(initialStep);
  const [title, setTitle] = React.useState('Run 5km every day');
  const [stake, setStake] = React.useState(30);
  const [ngo, setNgo] = React.useState('ocean');
  const [duration, setDuration] = React.useState(28);
  const [paying, setPaying] = React.useState(false);
  const [card, setCard] = React.useState({ num: '4242 4242 4242 4242', exp: '08/29', cvc: '•••' });
  const [detailNgo, setDetailNgo] = React.useState(null);

  if (detailNgo) {
    return (
      <NGODetailScreen
        ngoId={detailNgo}
        onBack={() => setDetailNgo(null)}
        onSelect={(id) => { setNgo(id); setDetailNgo(null); }}
      />
    );
  }

  const ngoObj = NGOS.find(n => n.id === ngo);

  const goNext = () => {
    if (step < 3) { setStep(step + 1); return; }
    if (!paying) { setPaying(true); return; }
    onSubmit && onSubmit({ title, stake, ngo: ngoObj.name, duration });
  };

  const goBack = () => {
    if (paying) { setPaying(false); return; }
    if (step === 1) { onBack && onBack(); return; }
    setStep(step - 1);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={paying ? 'Confirm payment' : `Step ${step} of 3`}
        leading={<button onClick={goBack} style={{border:'none',background:'transparent',padding:0,cursor:'pointer'}}><IconBack/></button>}
        trailing={!paying && <div style={{fontSize:13,color:C.muted,fontFamily:'Onest',fontWeight:600}}>Skip</div>}
      />

      {/* progress dots */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 8px' }}>
        {[1,2,3].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2,
            background: s <= step ? C.ink : C.line }} />
        ))}
      </div>

      <div style={{ flex: 1, padding: '12px 20px 20px', overflow: 'auto' }}>

        {/* ── STEP 1: Promise + duration ─────────────────────────── */}
        {step === 1 && !paying && (
          <>
            <div style={{ fontFamily: 'Onest', fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: -0.6, lineHeight: 1.15 }}>
              What are you<br/>promising yourself?
            </div>
            <div style={{ fontFamily: 'Onest', fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 20 }}>
              Make it specific. The AI will need to verify it.
            </div>

            <Card style={{ padding: 14 }}>
              <textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={2}
                style={{
                  width: '100%', border: 'none', outline: 'none', resize: 'none',
                  fontFamily: 'Onest', fontSize: 18, fontWeight: 600, color: C.ink,
                  background: 'transparent', lineHeight: 1.3,
                }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: C.muted, fontFamily: 'Onest' }}>
                <span>{title.length}/120</span>
                <span>👁 AI sees this</span>
              </div>
            </Card>

            <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, marginTop: 22, marginBottom: 8, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              How long?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[7, 14, 28, 60].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 14, cursor: 'pointer',
                    border: duration === d ? '1.5px solid ' + C.ink : '1.5px solid ' + C.line,
                    background: duration === d ? C.ink : '#fff',
                    color: duration === d ? '#fff' : C.ink,
                    fontFamily: 'Onest', fontWeight: 700, fontSize: 15,
                  }}>
                  {d}<span style={{ opacity: 0.7, fontWeight: 500, fontSize: 12, marginLeft: 2 }}>d</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 2: NGO ─────────────────────────────────────────── */}
        {step === 2 && !paying && (
          <>
            <div style={{ fontFamily: 'Onest', fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: -0.6, lineHeight: 1.15 }}>
              If you fail,<br/>who gets the cash?
            </div>
            <div style={{ fontFamily: 'Onest', fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 20 }}>
              Pick a cause. We forward 100% — no fees on forfeits.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {NGOS.map(n => (
                <div key={n.id}
                  onClick={() => setNgo(n.id)}
                  style={{
                    border: ngo === n.id ? '2px solid ' + C.ink : '1.5px solid ' + C.line,
                    background: '#fff',
                    padding: 14, borderRadius: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                  }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: C.chip,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{n.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Onest', fontWeight: 700, fontSize: 15, color: C.ink }}>{n.name}</div>
                    <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, marginTop: 1 }}>{n.tag}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDetailNgo(n.id); }}
                    aria-label={`Learn more about ${n.name}`}
                    style={{
                      width: 30, height: 30, borderRadius: 15,
                      border: '1.5px solid ' + C.line, background: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Onest', fontSize: 14, fontWeight: 700, color: C.ink2,
                      fontStyle: 'italic',
                    }}>i</button>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11,
                    border: '2px solid ' + (ngo === n.id ? C.ink : C.line),
                    background: ngo === n.id ? C.ink : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {ngo === n.id && <span style={{color:'#fff',fontSize:11,fontWeight:700}}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <button style={{
              width: '100%', marginTop: 14, padding: '14px',
              border: '1.5px dashed ' + C.line, background: 'transparent',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: 'Onest', fontSize: 13, color: C.ink2, fontWeight: 600,
            }}>＋ Suggest another organization</button>
          </>
        )}

        {/* ── STEP 3: Amount (then payment overlay) ──────────────── */}
        {step === 3 && !paying && (
          <>
            <div style={{ fontFamily: 'Onest', fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: -0.6, lineHeight: 1.15 }}>
              How much<br/>are you willing to lose?
            </div>
            <div style={{ fontFamily: 'Onest', fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 20 }}>
              If you fail, this goes to <strong style={{color:C.ink}}>{ngoObj.name}</strong>. Pick a number that stings just enough.
            </div>

            <div style={{
              background: '#fff', borderRadius: 22, padding: 24,
              boxShadow: '0 6px 16px rgba(31,58,42,0.04)',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Onest', fontSize: 13, color: C.muted, fontWeight: 600 }}>STAKE</div>
              <div style={{ fontFamily: 'Onest', fontSize: 64, fontWeight: 800, color: C.ink, letterSpacing: -2, lineHeight: 1, marginTop: 4 }}>
                <span style={{ fontSize: 28, verticalAlign: 'top', marginRight: 2 }}>$</span>{stake}
              </div>
              <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, marginTop: 6 }}>
                ≈ ${(stake/duration).toFixed(2)} per day on the line
              </div>

              <input type="range" min={5} max={50} step={5} value={stake}
                onChange={(e) => setStake(+e.target.value)}
                style={{ width: '100%', marginTop: 18, accentColor: C.primary }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Onest', fontSize: 11, color: C.muted, fontWeight: 500 }}>
                <span>$5</span><span>$50</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {[10, 20, 30, 50].map(v => (
                <button key={v} onClick={() => setStake(v)}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 14, cursor: 'pointer',
                    border: stake === v ? '1.5px solid ' + C.ink : '1.5px solid ' + C.line,
                    background: stake === v ? C.accent : '#fff',
                    color: C.ink,
                    fontFamily: 'Onest', fontWeight: 700, fontSize: 14,
                  }}>${v}</button>
              ))}
            </div>

            <div style={{
              marginTop: 22, padding: 14, borderRadius: 16,
              background: C.chipWarm, display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 18, lineHeight: 1 }}>💳</div>
              <div style={{ fontFamily: 'Onest', fontSize: 13, color: '#7a4f12', lineHeight: 1.4 }}>
                We hold ${stake} on your card for {duration} days. Complete the pact and it's released. Fail and it goes to {ngoObj.name}.
              </div>
            </div>
          </>
        )}

        {/* ── PAYMENT (after step 3) ─────────────────────────────── */}
        {paying && (
          <>
            <div style={{ fontFamily: 'Onest', fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: -0.6, lineHeight: 1.15 }}>
              Lock in<br/>your stake
            </div>
            <div style={{ fontFamily: 'Onest', fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 20 }}>
              We'll authorize ${stake} now. You're not charged unless you fail.
            </div>

            {/* receipt */}
            <div style={{
              background: C.ink, color: '#fff', borderRadius: 18,
              padding: 18, marginBottom: 16,
            }}>
              <div style={{ fontFamily: 'Onest', fontSize: 11, opacity: 0.6, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>The pact</div>
              <div style={{ fontFamily: 'Onest', fontSize: 17, fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>
                "{title}"
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '14px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Onest', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Duration</span>
                  <span style={{ fontWeight: 600 }}>{duration} days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Forfeit to</span>
                  <span style={{ fontWeight: 600 }}>{ngoObj.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Stake</span>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>${stake}.00</span>
                </div>
              </div>
            </div>

            {/* payment method */}
            <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Payment method
            </div>
            <div style={{
              background: '#fff', borderRadius: 18, padding: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              border: '2px solid ' + C.ink,
            }}>
              <div style={{
                width: 44, height: 30, borderRadius: 6,
                background: 'linear-gradient(135deg, #1a1a1a, #444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: 'Onest', fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
              }}>VISA</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Onest', fontWeight: 600, fontSize: 14, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
                  •••• •••• •••• 4242
                </div>
                <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, marginTop: 1 }}>
                  Expires {card.exp}
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.primary, fontFamily: 'Onest', fontWeight: 600 }}>Change</div>
            </div>

            <button style={{
              width: '100%', marginTop: 10, padding: '12px',
              border: '1.5px dashed ' + C.line, background: 'transparent',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: 'Onest', fontSize: 13, color: C.ink2, fontWeight: 600,
            }}>＋ Apple Pay  ·  ＋ Add new card</button>

            <div style={{
              marginTop: 18, fontFamily: 'Onest', fontSize: 11, color: C.muted,
              lineHeight: 1.5, textAlign: 'center', padding: '0 8px',
            }}>
              By signing, you authorize Promise to hold ${stake} until {duration === 7 ? 'next week' : `${duration} days from now`}. Funds released on success, transferred to {ngoObj.name} on failure. No fees.
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '12px 20px 28px', borderTop: '1px solid ' + C.line, background: C.bg }}>
        <Btn kind={paying ? 'green' : (step === 3 ? 'primary' : 'primary')} onClick={goNext}>
          {paying ? `Authorize $${stake} & sign pact 🤝`
            : step === 3 ? `Continue · $${stake}`
            : 'Continue'}
        </Btn>
      </div>
    </div>
  );
};

window.CreateScreen = CreateScreen;
