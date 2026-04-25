// screen-ngo-detail.jsx — NGO deep-dive page reached from Create step 2

const NGO_DETAILS = {
  ocean: {
    name: 'Ocean Cleanup',
    emoji: '🌊',
    accent: '#0E7490',
    tagline: 'Removing plastic from oceans, one river at a time.',
    founded: 2013,
    hq: 'Rotterdam, NL',
    rating: 'A · Charity Navigator',
    cause: 'Marine pollution',
    body: [
      "The Ocean Cleanup is a non-profit engineering organization developing technologies to rid the world's oceans of plastic. Their two-pronged approach intercepts plastic in rivers — where 80% of ocean plastic originates — while removing legacy plastic already accumulated in the Great Pacific Garbage Patch.",
      "Since 2019, their Interceptor systems have been deployed in rivers across Indonesia, Malaysia, the Dominican Republic, Vietnam, Jamaica, Guatemala, Thailand, and the United States. The Interceptors run on solar power and extract plastic before it ever reaches open water.",
      "Their offshore System 03 sweeps the Great Pacific Garbage Patch using a slow-moving, U-shaped barrier. As of late 2025, more than 25 million kilograms of trash had been removed from oceans and rivers combined.",
    ],
    impact: [
      { n: '25M kg', l: 'plastic removed' },
      { n: '11', l: 'river systems' },
      { n: '$8', l: 'pulls 1kg from a river' },
    ],
    where: 'Forfeits go directly to The Ocean Cleanup\u00A0Foundation (501c3 / ANBI), tax ID 824225025. We send a quarterly batched transfer with a public ledger entry for every pact that funded it.',
  },
  dwb: {
    name: 'Doctors Without Borders',
    emoji: '⚕️',
    accent: '#B91C1C',
    tagline: 'Independent medical care where it\u2019s needed most.',
    founded: 1971,
    hq: 'Geneva, CH',
    rating: 'A+ · CharityWatch',
    cause: 'Emergency medical aid',
    body: [
      "Médecins Sans Frontières / Doctors Without Borders provides emergency medical assistance in over 70 countries to people affected by armed conflict, epidemics, natural disasters, and exclusion from healthcare. Their teams treat tens of millions of patients every year.",
      "MSF is fiercely independent — over 97% of their funding comes from private individuals, which is what keeps them able to speak out and operate where governments won't. They've been awarded the Nobel Peace Prize for their humanitarian work.",
      "On any given day, MSF staff are running cholera treatment centers, performing surgery in conflict zones, delivering vaccines through cold chains in remote villages, and providing mental health care to displaced families.",
    ],
    impact: [
      { n: '12.7M', l: 'outpatient consultations / year' },
      { n: '70+', l: 'countries' },
      { n: '$40', l: 'covers a child\u2019s vaccinations' },
    ],
    where: 'Forfeits route to Doctors Without Borders USA (501c3), tax ID 13-3433452. Funds are unrestricted, which is what MSF specifically asks for — it lets them respond to crises the news cycle has forgotten.',
  },
  r2r: {
    name: 'Room to Read',
    emoji: '📚',
    accent: '#7C3AED',
    tagline: 'Children\u2019s literacy and girls\u2019 education in low-income communities.',
    founded: 2000,
    hq: 'San Francisco, US',
    rating: 'Top-rated · GiveWell-adjacent',
    cause: 'Education',
    body: [
      "Room to Read works in 21 countries to help children become independent readers and to keep girls in school through secondary education. They partner with local communities and governments to build school libraries, publish original children's books in local languages, and run long-term mentoring programs for adolescent girls.",
      "They've published over 2,000 original children's titles in 53 languages — many of which are the first books a child has ever held in their mother tongue. Every book is co-created with local authors and illustrators.",
      "Their girls' education program isn't a scholarship — it's a six-to-eight-year mentorship that walks alongside each girl from middle school through to graduation, with life-skills training and family engagement built in.",
    ],
    impact: [
      { n: '40M+', l: 'children reached' },
      { n: '2,000+', l: 'original titles published' },
      { n: '$50', l: 'stocks a classroom library' },
    ],
    where: 'Forfeits go to Room to Read (501c3), tax ID 91-2003533. Funds support country programs in Asia and Africa.',
  },
  water: {
    name: 'WaterAid',
    emoji: '💧',
    accent: '#0369A1',
    tagline: 'Clean water, decent toilets, good hygiene \u2014 for everyone, everywhere.',
    founded: 1981,
    hq: 'London, UK',
    rating: 'Four-star · Charity Navigator',
    cause: 'Water & sanitation',
    body: [
      "WaterAid has been working for over 40 years to ensure that people in the world's poorest communities can access clean water, safe sanitation, and good hygiene. They partner with local governments and communities so the systems they build keep working long after the team has left.",
      "771 million people still don't have clean water close to home. The cascading effects — children missing school to fetch water, women walking miles in unsafe conditions, disease outbreaks from contaminated sources — make WASH (Water, Sanitation, Hygiene) one of the highest-leverage causes you can fund.",
      "WaterAid's model focuses on system change: training local plumbers, setting up community water committees, and lobbying governments to take responsibility for long-term maintenance. It's slower than drilling wells, but it's why their projects are still working decades later.",
    ],
    impact: [
      { n: '28M', l: 'reached with clean water' },
      { n: '34', l: 'countries' },
      { n: '$25', l: 'gives one person clean water for life' },
    ],
    where: 'Forfeits go to WaterAid America (501c3), tax ID 30-0108263.',
  },
  efr: {
    name: 'Electronic Frontier Foundation',
    emoji: '🛡️',
    accent: '#1F3A2A',
    tagline: 'Defending civil liberties in the digital world.',
    founded: 1990,
    hq: 'San Francisco, US',
    rating: 'Top-rated · CharityWatch',
    cause: 'Digital rights',
    body: [
      "The Electronic Frontier Foundation is the leading nonprofit defending civil liberties in the digital world. Through impact litigation, policy analysis, grassroots activism, and technology development, EFF works to ensure rights and freedoms are enhanced as our use of technology grows.",
      "They've been on the front lines of nearly every major digital rights case in the last 30 years — from defending end-to-end encryption to fighting overbroad surveillance, to protecting fair use online. They build privacy tools too: HTTPS Everywhere, Privacy Badger, and Certbot are all EFF projects.",
      "EFF is small, fast, and member-funded. They take cases governments and big platforms would rather see disappear. Forfeit money put toward EFF directly funds litigation hours.",
    ],
    impact: [
      { n: '30,000+', l: 'members' },
      { n: '180+', l: 'active cases & filings' },
      { n: '$35', l: 'funds 1 hour of litigation' },
    ],
    where: 'Forfeits go to the Electronic Frontier Foundation (501c3), tax ID 04-3091431.',
  },
};

const NGODetailScreen = ({ ngoId = 'ocean', onBack, onSelect }) => {
  const d = NGO_DETAILS[ngoId] || NGO_DETAILS.ocean;

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{
        background: d.accent, color: '#fff',
        padding: '14px 20px 28px', position: 'relative',
      }}>
        <button onClick={onBack} style={{
          border: 'none', background: 'rgba(255,255,255,0.16)', color: '#fff',
          width: 36, height: 36, borderRadius: 18, cursor: 'pointer',
          fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
        }}>‹</button>

        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, marginBottom: 12,
        }}>{d.emoji}</div>

        <div style={{ fontFamily: 'Onest', fontSize: 24, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.15 }}>
          {d.name}
        </div>
        <div style={{ fontFamily: 'Onest', fontSize: 14, opacity: 0.85, marginTop: 6, lineHeight: 1.4 }}>
          {d.tagline}
        </div>

        {/* meta strip */}
        <div style={{
          display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap',
        }}>
          {[
            { l: 'Cause', v: d.cause },
            { l: 'Founded', v: d.founded },
            { l: 'HQ', v: d.hq },
          ].map(m => (
            <div key={m.l} style={{
              background: 'rgba(255,255,255,0.14)', padding: '6px 10px',
              borderRadius: 999, fontFamily: 'Onest', fontSize: 11, fontWeight: 500,
            }}>
              <span style={{ opacity: 0.7 }}>{m.l} · </span>
              <span style={{ fontWeight: 700 }}>{m.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content scroll */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 24px' }}>
        {/* Trust badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fff', borderRadius: 14, padding: '12px 14px',
          border: '1px solid ' + C.line, marginBottom: 18,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: C.chip,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>✓</div>
          <div>
            <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.muted, fontWeight: 600 }}>RATING</div>
            <div style={{ fontFamily: 'Onest', fontSize: 14, fontWeight: 700, color: C.ink }}>{d.rating}</div>
          </div>
        </div>

        {/* About */}
        <div style={{
          fontFamily: 'Onest', fontSize: 12, color: C.muted, fontWeight: 600,
          letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
        }}>About the cause</div>

        {d.body.map((p, i) => (
          <p key={i} style={{
            fontFamily: 'Onest', fontSize: 14, color: C.ink2, lineHeight: 1.55,
            margin: '0 0 12px', textWrap: 'pretty',
          }}>{p}</p>
        ))}

        {/* Impact stats */}
        <div style={{
          marginTop: 20, marginBottom: 8,
          fontFamily: 'Onest', fontSize: 12, color: C.muted, fontWeight: 600,
          letterSpacing: 0.6, textTransform: 'uppercase',
        }}>By the numbers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {d.impact.map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: '14px 10px',
              border: '1px solid ' + C.line, textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Onest', fontSize: 18, fontWeight: 800, color: d.accent, letterSpacing: -0.4 }}>
                {s.n}
              </div>
              <div style={{ fontFamily: 'Onest', fontSize: 10, color: C.ink2, marginTop: 4, lineHeight: 1.3 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Where the money goes */}
        <div style={{
          marginTop: 22, padding: 14, borderRadius: 14,
          background: C.chip, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>📬</div>
          <div>
            <div style={{ fontFamily: 'Onest', fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
              Where your forfeit goes
            </div>
            <div style={{ fontFamily: 'Onest', fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>
              {d.where}
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <a href="#" onClick={(e) => e.preventDefault()} style={{
            flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center',
            border: '1.5px solid ' + C.line, background: '#fff', color: C.ink,
            fontFamily: 'Onest', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            cursor: 'pointer',
          }}>↗ Visit website</a>
          <a href="#" onClick={(e) => e.preventDefault()} style={{
            flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center',
            border: '1.5px solid ' + C.line, background: '#fff', color: C.ink,
            fontFamily: 'Onest', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            cursor: 'pointer',
          }}>📄 Annual report</a>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '12px 20px 28px', borderTop: '1px solid ' + C.line, background: C.bg }}>
        <Btn kind="primary" onClick={() => onSelect && onSelect(ngoId)}>
          Pick {d.name.split(' ')[0]} as my forfeit
        </Btn>
      </div>
    </div>
  );
};

window.NGODetailScreen = NGODetailScreen;
window.NGO_DETAILS = NGO_DETAILS;
