// Site content. Tool keys map to assets/logos/<key>.png.

window.TOOLS = {
  claude: "Claude Code", cursor: "Cursor", grok: "Grok", ids: "Instant Data Scraper", python: "Python", typescript: "TypeScript",
  supabase: "Supabase", sheets: "Google Sheets", clay: "Clay", openai: "GPT-4o mini",
  storeleads: "Storeleads", apify: "Apify", airscale: "Airscale", exa: "Exa", serper: "Serper",
  gmaps: "Google Maps", spider: "Spider", clutch: "Clutch", crunchbase: "Crunchbase",
  companyenrich: "Company Enrich", aiark: "AI Ark", sec: "SEC filings", myntra: "Marketplaces",
  noon: "Noon", prospeo: "Prospeo", icypeas: "Icypeas", debounce: "DeBounce",
  whatsapp: "WhatsApp", unipile: "Unipile", msg91: "MSG91", heyreach: "HeyReach",
  linkedin: "LinkedIn", smartlead: "Smartlead", instantly: "Instantly", plusvibe: "PlusVibe",
  zapmail: "Zapmail", n8n: "n8n", make: "Make", zapier: "Zapier", hubspot: "HubSpot",
  salesforce: "Salesforce", postman: "Postman", metabase: "Metabase"
};

// step: [label, one short line, [tools]]
window.LISTS = [
  {
    id: "d2c-engine",
    pain: "How do you find a founder when all you have is a brand name in all caps?",
    title: "Indian D2C fashion brands",
    industries: ["D2C & e-commerce"],
    built: ["Claude Code"],
    stat: "12,842 brands · 13% replies · 50 bookings/month",
    problem: "A raw marketplace scrape: ~6,000 brand names and the marketplace each sells on. No websites, no people, names in caps, category headings mixed in.",
    steps: [
      ["Clean names", "Strip caps, headings and junk rows", ["python"]],
      ["Find domains", "Regex first, Serper only as fallback", ["serper"]],
      ["Probe sites", "Live, a real store, Indian. Drop dead and “launching soon”", ["claude"]],
      ["Tier by ads", "Meta Ad Library count decides the offer", ["apify"]],
      ["Find people", "Founders and marketing heads", ["exa", "airscale"]],
      ["Reach out", "WhatsApp with a sample ad made for them", ["whatsapp"]]
    ],
    evolved: "Scaled to 12,842 brands, then to Storeleads exports kept on Supabase with a never-contact ledger. New geographies run through the same gates: the UAE starts from Noon.",
    results: [["12,842", "brands processed"], ["13%", "reply rate"], ["2–5", "bookings per 100 sends"]]
  },
  {
    id: "job-intel",
    pain: "How do you get hired as a GTM engineer?",
    title: "GTM job intelligence",
    industries: ["Hiring signals"],
    built: ["Clay"],
    stat: "140 sends → 2 interviews + 1 referral · 9% replies",
    problem: "On a job portal you're one résumé among hundreds. I wanted to reach the hiring manager directly, with a reason for them to reply.",
    steps: [
      ["Pull GTM jobs", "Live postings for GTM roles", ["clay"]],
      ["Scrape postings", "The full job description", ["spider"]],
      ["Parse", "Turn each post into structured fields", ["openai"]],
      ["Score", "Against an ICP I wrote for myself", ["clay"]],
      ["Personalise", "A résumé hook, a DM and a cover-letter angle per role", ["openai"]]
    ],
    evolved: "It became the template for the signal-based version, the next card.",
    results: [["140", "sends"], ["9%", "reply rate"], ["2 + 1", "interviews + referral"]]
  },
  {
    id: "clay-partners",
    pain: "Evolving the lead lists that get you hired",
    title: "Agencies hiring GTM engineers",
    industries: ["Agencies", "Hiring signals"],
    built: ["Claude Code", "Clay"],
    stat: "171 Clay partners → qualified hiring posts",
    problem: "Cold-emailing every agency was noise. I wanted the best Clay agencies, and the strongest signal is a founder saying “we're hiring” in public.",
    steps: [
      ["Scrape the directory", "171 Clay partners with Instant Data Scraper", ["ids"]],
      ["Keep the Claygencies", "Outbound-focused Clay agencies only", ["clay", "openai"]],
      ["Right people", "Founders, CEOs, revenue leaders", ["linkedin"]],
      ["Train Claude", "Sample hiring posts + keyword filters", ["claude"]],
      ["Pull posts", "Last 30 days of matching LinkedIn posts", ["claude", "linkedin"]],
      ["Reach out", "LinkedIn DMs, or apply directly", ["linkedin"]]
    ],
    evolved: "Built to reach the crème de la crème of Clay agencies without leaning on cold email. LinkedIn DMs to people who had just posted about hiring opened far more doors.",
    results: [["171", "Clay partners scraped"], ["30 days", "of posts read per person"], ["DMs", "+ direct applications"]]
  },
  {
    id: "directories",
    pain: "How do you scrape the directories companies use to look trustworthy?",
    title: "SaaS and agencies with deliverability pain",
    industries: ["B2B SaaS", "Agencies"],
    built: ["Claude Code", "Clay"],
    stat: "Free Clutch scraper · decision-makers posting the pain",
    problem: "Clutch and Crunchbase hold the companies but block scrapers. And a firmographic list says nothing about who is hurting right now.",
    steps: [
      ["Scrape directories", "A real browser gets past the 403s", ["claude", "clutch", "crunchbase"]],
      ["Merge and filter", "No one owns outbound? Out", ["clay"]],
      ["Signal 1", "Hiring SDRs or BDRs", ["linkedin"]],
      ["Signal 2", "Posting about burnt domains", ["claude", "linkedin"]],
      ["Email waterfall", "Find, then verify", ["icypeas", "debounce", "prospeo"]]
    ],
    evolved: "The filters narrowed instead of widened (6,481 + 596 gave 255), so it runs 24 narrow searches and merges them. Tests on saved pages caught 4 silent bugs.",
    results: [["100", "verified leads"], ["24", "narrow searches merged"], ["4", "silent bugs caught"]]
  },
  {
    id: "dental",
    pain: "How do you find local businesses you never walked past growing up in India?",
    title: "Independent US dental clinics",
    industries: ["Local business"],
    built: ["Clay"],
    stat: "224 Maps results → verified independent clinics + owners",
    problem: "Local clinics aren't in B2B databases, chains and directories look like clinics, and dental barely exists on LinkedIn.",
    steps: [
      ["Cities to coordinates", "10 US cities, zip codes to lat/long", ["gmaps"]],
      ["Scrape Maps", "About 3 pages per city, with a stop rule", ["serper"]],
      ["Domain check", "Live site, not free or a Facebook page", ["clay"]],
      ["Drop the noise", "DSOs, directories, manufacturers, suppliers", ["clay"]],
      ["2 AI passes", "Real domain? Name + address match, real practice?", ["clay"]],
      ["Decision-makers", "Icypeas, with a Google search fallback", ["icypeas", "linkedin"]]
    ],
    evolved: "The domain and address cross-check is now step one in every pipeline I build.",
    results: [["224", "Maps results to start"], ["10", "US cities"], ["2", "AI qualification passes"]]
  },
  {
    id: "finance",
    pain: "Building a finance list without letting Claude burn my credits",
    title: "M&A advisory firms",
    industries: ["Financial services"],
    built: ["Claude Code"],
    stat: "Spend guardrails · 0 credits spent without approval",
    problem: "My first list built only in Claude Code. No Clay screen to show previews and credit counts.",
    steps: [
      ["ICP to filters", "A skill writes the search", ["claude", "companyenrich"]],
      ["Preview", "~50 rows for 10 credits first", ["companyenrich"]],
      ["Research", "Web research on every firm", ["exa"]],
      ["Qualify", "Logic runs in Claude Code", ["claude"]],
      ["People and emails", "With a fallback provider", ["prospeo", "icypeas"]]
    ],
    evolved: "Claude once started exporting all 1,200 rows to pick 20. I stopped it before it spent anything, then added a skill that reads API docs, a rule to never export without asking, and sampling as its own step.",
    results: [["0", "credits wasted"], ["1,200", "row export caught"]]
  },
  {
    id: "spend-recovery",
    pain: "How do you build a list for a product that's hard to sell?",
    title: "$1B+ North American manufacturers",
    industries: ["Manufacturing & logistics"],
    built: ["Clay"],
    stat: "Every score backed by a source a rep can quote",
    problem: "Nobody searches for “recover our duplicate payments”, and “$1B+ manufacturing” covers thousands of companies. The product sells where spend is complex, so complexity had to be measured, not guessed.",
    steps: [
      ["Cast wide", "Manufacturing and logistics, $1B+", ["clay"]],
      ["Score 5 dimensions", "From 10-K filings, with a source each", ["sec", "openai"]],
      ["Buying signal", "M&A, cost programme, procurement change", ["openai"]],
      ["Tier", "80+ / 56–75 / below", ["clay"]]
    ],
    evolved: "Every score carries the sentence it came from and a link to the filing, so a rep can quote it on a call. Accounts with no live buying signal dropped a tier instead of being thrown out.",
    results: [["50", "accounts scored"], ["5", "complexity dimensions"], ["20/20/10", "Tier 1 / 2 / 3"]]
  },
  {
    id: "notetaker",
    pain: "Who buys an AI notetaker when everyone already has one?",
    title: "Funded startups that work from an office",
    industries: ["B2B SaaS"],
    built: ["Clay"],
    stat: "Intent = CS hiring speed · office proof · job-post cues",
    problem: "A crowded market. The question isn't who could use one, it's whose meetings are about to multiply in a physical office.",
    steps: [
      ["Funding filings", "Recent round, verified", ["clay"]],
      ["Office proof", "Business registration on their site", ["clay"]],
      ["Job descriptions", "Remote only or in office", ["linkedin"]],
      ["Score and tier", "Out of 7, then A / B / C", ["openai"]],
      ["Decision-makers", "Per scored company", ["linkedin"]]
    ],
    evolved: "The strongest signal turned out to be the job descriptions themselves: an explicit “remote only” or “in office” line beats any guess from headcount.",
    results: [["/7", "intent score"], ["A·B·C", "tiers, with reasons"]]
  },

];

// Walkthrough videos (Google Drive file IDs), embedded in each story sheet.
window.VIDEOS = {
  "job-intel": "1X-MU_WLeT31ur8BXqoB_wl_zHgM7ucdr",
  "dental": "1ZAaEJBeTQiDTSYZszXKjdHPUmwMB9pJV",
  "directories": "10zlBisbhP-Z0uQp1Wq_ee8-yqChSEvcZ",
  "clay-partners": "1pIbry-SQ_qKdKp0Tt0yJBW8dVf7f5DNX",
  "spend-recovery": "1qmDChzuwnHT3grV222_F_Yi7-Qn880eQ",
  "finance": "loom:6054994b43454a1daebaf330d92b1780"
};
window.LISTS.forEach((l) => { if (window.VIDEOS[l.id]) l.video = window.VIDEOS[l.id]; });

// Card thumbnails, saved locally from each Drive video. Cards with a video but no thumbnail get a placeholder.
window.THUMBS = {
  "job-intel": "assets/thumbs/job-intel.jpg",
  "dental": "assets/thumbs/dental.jpg",
  "directories": "assets/thumbs/directories-v2.jpg",
  "clay-partners": "assets/thumbs/clay-partners.jpg",
  "spend-recovery": "assets/thumbs/spend-recovery-v2.jpg",
  "finance": "assets/thumbs/finance.jpg"
};


// Proof images for cards without a walkthrough video.
window.PROOF = {
  "d2c-engine": { img: "assets/thumbs/d2c-proof.jpg", alt: "Calendly: 50 meetings booked", label: "Calendly · 50 meetings booked" }
};

// Card copy: the earlier wording (quoted pain question + "who it finds" line), with a few overrides.
window.CARD = {
  "job-intel": { desc: "GTM job intelligence: every email pitched a project built for that company." },
  "clay-partners": { desc: "Scraped Clay partners with Instant Data Scraper; kept only those hiring GTM publicly." },
  "spend-recovery": { title: "Finding $1B+ manufacturers most likely leaking money to suppliers", desc: "Scored $1B+ manufacturers on 10-K complexity and tiered 50 accounts for ABM." }
};

// Display order of the projects
(function () {
  const order = ["d2c-engine", "directories", "dental", "job-intel", "clay-partners", "finance", "spend-recovery", "notetaker"];
  window.LISTS.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
})();
