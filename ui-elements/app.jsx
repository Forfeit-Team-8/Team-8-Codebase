// app.jsx — composition: design-canvas of iOS frames showing the full loop

const Phone = ({ children, dark = false }) => (
  <IOSDevice width={390} height={780} dark={dark}>
    {children}
  </IOSDevice>
);

// Standalone screen artboards — each shows one stage of the loop
function App() {
  // Tweaks: pixel art style
  const [tweaks, setTweak] = useTweaks({ artStyle: 'chunky' });
  const art = tweaks.artStyle;

  // Live courtroom flow has its own internal state
  const [flow, setFlow] = React.useState('home'); // home | create | checkin | court | verdict
  const [verdict, setVerdict] = React.useState('win');

  // Static panels (for the canvas)
  const homePanel = (
    <Phone>
      <HomeScreen onCreate={() => {}} onOpenPact={() => {}} />
      <TabBar active="home" />
    </Phone>
  );
  const createStep1 = (<Phone><CreateScreen initialStep={1} /></Phone>);
  const createStep2 = (<Phone><CreateScreen initialStep={2} /></Phone>);
  const createStep3 = (<Phone><CreateScreen initialStep={3} /></Phone>);
  const ngoDetailPanel = (<Phone><NGODetailScreen ngoId="ocean" onBack={() => {}} onSelect={() => {}} /></Phone>);
  const checkinPanel = (
    <Phone>
      <CheckinScreen onStartCourtroom={() => {}} />
    </Phone>
  );
  const courtPanel = (
    <Phone dark>
      <CourtroomScreen art={art} />
    </Phone>
  );
  const verdictWinPanel = (
    <Phone dark>
      <VerdictScreen won={true} art={art} />
    </Phone>
  );
  const verdictLosePanel = (
    <Phone dark>
      <VerdictScreen won={false} art={art} />
    </Phone>
  );

  // Live full-loop demo phone
  const livePhone = (
    <Phone dark={flow === 'court' || flow === 'verdict'}>
      {flow === 'home' && (<><HomeScreen onCreate={() => setFlow('create')} onOpenPact={() => setFlow('checkin')} /><TabBar active="home" onSelect={(t) => t === 'create' ? setFlow('create') : setFlow('home')} /></>)}
      {flow === 'create' && <CreateScreen onBack={() => setFlow('home')} onSubmit={() => setFlow('home')} />}
      {flow === 'checkin' && <CheckinScreen onBack={() => setFlow('home')} onStartCourtroom={() => setFlow('court')} />}
      {flow === 'court' && <CourtroomScreen art={art} onDone={(result) => { setVerdict(result || 'win'); setFlow('verdict'); }} />}
      {flow === 'verdict' && <VerdictScreen won={verdict === 'win'} art={art} onDone={() => setFlow('home')} />}
    </Phone>
  );

  return (
    <>
      <DesignCanvas>
        <DCSection id="loop" title="Promise — the full loop"
          subtitle="Tap “Take the stand” on the check-in screen to enter the courtroom. Drag/focus any artboard.">
          <DCArtboard id="home" label="01 · Home" width={390} height={780}>{homePanel}</DCArtboard>
          <DCArtboard id="create-1" label="02a · Create — promise" width={390} height={780}>{createStep1}</DCArtboard>
          <DCArtboard id="create-2" label="02b · Create — pick NGO" width={390} height={780}>{createStep2}</DCArtboard>
          <DCArtboard id="ngo-detail" label="02b·i · NGO deep-dive" width={390} height={780}>{ngoDetailPanel}</DCArtboard>
          <DCArtboard id="create-3" label="02c · Create — stake & pay" width={390} height={780}>{createStep3}</DCArtboard>
          <DCArtboard id="checkin" label="03 · Daily check-in" width={390} height={780}>{checkinPanel}</DCArtboard>
          <DCArtboard id="court" label="04 · The Courtroom" width={390} height={780}>{courtPanel}</DCArtboard>
          <DCArtboard id="verdict-win" label="05a · Acquitted" width={390} height={780}>{verdictWinPanel}</DCArtboard>
          <DCArtboard id="verdict-lose" label="05b · Guilty" width={390} height={780}>{verdictLosePanel}</DCArtboard>
        </DCSection>

        <DCSection id="live" title="Live prototype" subtitle="Click through the whole flow end-to-end.">
          <DCArtboard id="live" label="Try it" width={390} height={780}>{livePhone}</DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Pixel art style" />
        <TweakRadio
          label="Style"
          value={tweaks.artStyle}
          onChange={(v) => setTweak('artStyle', v)}
          options={[
            { value: 'chunky',  label: '16-bit' },
            { value: 'crisp',   label: '8-bit' },
            { value: 'gameboy', label: 'GB' },
          ]}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
