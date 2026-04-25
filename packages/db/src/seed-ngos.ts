import { db } from "./client";
import { Ngo } from "./schema";

const NGOS = [
  {
    id: "ocean",
    name: "Ocean Cleanup",
    emoji: "🌊",
    accent: "#0E7490",
    tag: "Removes plastic from oceans",
    tagline: "Removing plastic from oceans, one river at a time.",
    founded: 2013,
    hq: "Rotterdam, NL",
    rating: "A · Charity Navigator",
    cause: "Marine pollution",
    body: [
      "The Ocean Cleanup is a non-profit engineering organization developing technologies to rid the world's oceans of plastic. Their two-pronged approach intercepts plastic in rivers — where 80% of ocean plastic originates — while removing legacy plastic already accumulated in the Great Pacific Garbage Patch.",
      "Since 2019, their Interceptor systems have been deployed in rivers across Indonesia, Malaysia, the Dominican Republic, Vietnam, Jamaica, Guatemala, Thailand, and the United States. The Interceptors run on solar power and extract plastic before it ever reaches open water.",
      "Their offshore System 03 sweeps the Great Pacific Garbage Patch using a slow-moving, U-shaped barrier. As of late 2025, more than 25 million kilograms of trash had been removed from oceans and rivers combined.",
    ],
    impact: [
      { n: "25M kg", l: "plastic removed" },
      { n: "11", l: "river systems" },
      { n: "$8", l: "pulls 1kg from a river" },
    ],
    whereFundsGo:
      "Forfeits go directly to The Ocean Cleanup Foundation (501c3 / ANBI), tax ID 824225025. We send a quarterly batched transfer with a public ledger entry for every pact that funded it.",
    sortOrder: 1,
  },
  {
    id: "dwb",
    name: "Doctors Without Borders",
    emoji: "⚕️",
    accent: "#B91C1C",
    tag: "Emergency medical aid",
    tagline: "Independent medical care where it's needed most.",
    founded: 1971,
    hq: "Geneva, CH",
    rating: "A+ · CharityWatch",
    cause: "Emergency medical aid",
    body: [
      "Médecins Sans Frontières / Doctors Without Borders provides emergency medical assistance in over 70 countries to people affected by armed conflict, epidemics, natural disasters, and exclusion from healthcare. Their teams treat tens of millions of patients every year.",
      "MSF is fiercely independent — over 97% of their funding comes from private individuals, which is what keeps them able to speak out and operate where governments won't. They've been awarded the Nobel Peace Prize for their humanitarian work.",
      "On any given day, MSF staff are running cholera treatment centers, performing surgery in conflict zones, delivering vaccines through cold chains in remote villages, and providing mental health care to displaced families.",
    ],
    impact: [
      { n: "12.7M", l: "outpatient consultations / year" },
      { n: "70+", l: "countries" },
      { n: "$40", l: "covers a child's vaccinations" },
    ],
    whereFundsGo:
      "Forfeits route to Doctors Without Borders USA (501c3), tax ID 13-3433452. Funds are unrestricted, which is what MSF specifically asks for — it lets them respond to crises the news cycle has forgotten.",
    sortOrder: 2,
  },
  {
    id: "r2r",
    name: "Room to Read",
    emoji: "📚",
    accent: "#7C3AED",
    tag: "Literacy for children",
    tagline:
      "Children's literacy and girls' education in low-income communities.",
    founded: 2000,
    hq: "San Francisco, US",
    rating: "Top-rated · GiveWell-adjacent",
    cause: "Education",
    body: [
      "Room to Read works in 21 countries to help children become independent readers and to keep girls in school through secondary education. They partner with local communities and governments to build school libraries, publish original children's books in local languages, and run long-term mentoring programs for adolescent girls.",
      "They've published over 2,000 original children's titles in 53 languages — many of which are the first books a child has ever held in their mother tongue. Every book is co-created with local authors and illustrators.",
      "Their girls' education program isn't a scholarship — it's a six-to-eight-year mentorship that walks alongside each girl from middle school through to graduation, with life-skills training and family engagement built in.",
    ],
    impact: [
      { n: "40M+", l: "children reached" },
      { n: "2,000+", l: "original titles published" },
      { n: "$50", l: "stocks a classroom library" },
    ],
    whereFundsGo:
      "Forfeits go to Room to Read (501c3), tax ID 91-2003533. Funds support country programs in Asia and Africa.",
    sortOrder: 3,
  },
  {
    id: "water",
    name: "WaterAid",
    emoji: "💧",
    accent: "#0369A1",
    tag: "Clean water access",
    tagline:
      "Clean water, decent toilets, good hygiene — for everyone, everywhere.",
    founded: 1981,
    hq: "London, UK",
    rating: "Four-star · Charity Navigator",
    cause: "Water & sanitation",
    body: [
      "WaterAid has been working for over 40 years to ensure that people in the world's poorest communities can access clean water, safe sanitation, and good hygiene. They partner with local governments and communities so the systems they build keep working long after the team has left.",
      "771 million people still don't have clean water close to home. The cascading effects — children missing school to fetch water, women walking miles in unsafe conditions, disease outbreaks from contaminated sources — make WASH (Water, Sanitation, Hygiene) one of the highest-leverage causes you can fund.",
      "WaterAid's model focuses on system change: training local plumbers, setting up community water committees, and lobbying governments to take responsibility for long-term maintenance. It's slower than drilling wells, but it's why their projects are still working decades later.",
    ],
    impact: [
      { n: "28M", l: "reached with clean water" },
      { n: "34", l: "countries" },
      { n: "$25", l: "gives one person clean water for life" },
    ],
    whereFundsGo: "Forfeits go to WaterAid America (501c3), tax ID 30-0108263.",
    sortOrder: 4,
  },
  {
    id: "efr",
    name: "Electronic Frontier Foundation",
    emoji: "🛡️",
    accent: "#1F3A2A",
    tag: "Digital rights",
    tagline: "Defending civil liberties in the digital world.",
    founded: 1990,
    hq: "San Francisco, US",
    rating: "Top-rated · CharityWatch",
    cause: "Digital rights",
    body: [
      "The Electronic Frontier Foundation is the leading nonprofit defending civil liberties in the digital world. Through impact litigation, policy analysis, grassroots activism, and technology development, EFF works to ensure rights and freedoms are enhanced as our use of technology grows.",
      "They've been on the front lines of nearly every major digital rights case in the last 30 years — from defending end-to-end encryption to fighting overbroad surveillance, to protecting fair use online. They build privacy tools too: HTTPS Everywhere, Privacy Badger, and Certbot are all EFF projects.",
      "EFF is small, fast, and member-funded. They take cases governments and big platforms would rather see disappear. Forfeit money put toward EFF directly funds litigation hours.",
    ],
    impact: [
      { n: "30,000+", l: "members" },
      { n: "180+", l: "active cases & filings" },
      { n: "$35", l: "funds 1 hour of litigation" },
    ],
    whereFundsGo:
      "Forfeits go to the Electronic Frontier Foundation (501c3), tax ID 04-3091431.",
    sortOrder: 5,
  },
];

async function main() {
  for (const n of NGOS) {
    await db
      .insert(Ngo)
      .values(n)
      .onConflictDoUpdate({ target: Ngo.id, set: n });
  }
  console.log(`Seeded ${NGOS.length} NGOs`);
}

main().then(
  () => process.exit(0),
  (err: unknown) => {
    console.error(err);
    process.exit(1);
  },
);
