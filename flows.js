// Card headlines (what it solves + who it finds) and one flowchart per lead list.
// A flow is a list of stages. A stage is a node, or { par: [node, node], join: "merge" | "or" }.
// node: { t: title, d: what happens, tools: [logo keys], drop: what gets thrown out, n: count after this step, note: small aside }

window.HEADS = {
  "d2c-engine": "Turning raw brand names into reachable D2C founders",
  "job-intel": "Reaching the hiring managers behind open GTM roles",
  "clay-partners": "Finding agencies saying “we're hiring a GTM engineer” this month",
  "directories": "Finding SaaS teams and agencies whose cold email just broke",
  "dental": "Finding independent US dental clinics and the people who own them",
  "finance": "Mapping M&A advisory firms without burning a credit",
  "spend-recovery": "Finding $1B+ manufacturers most likely leaking money to suppliers",
  "notetaker": "Finding startups whose meetings are about to multiply",
};

window.FLOWS = {
  "d2c-engine": [
    { par: [
      { t: "Marketplace scrape", d: "Brand names from fashion marketplaces. Started at ~6,000, scaled to 12,842. UAE runs from Noon.", tools: ["myntra", "noon"] },
      { t: "Store export", d: "Indian Shopify stores with sales estimates.", tools: ["storeleads"], n: "13,847 stores" }
    ], join: "merge" },
    { t: "Clean names", d: "All caps, junk rows and category headings mixed in. Normalise before anything else.", tools: ["python"], drop: "Headings, junk rows, duplicates" },
    { t: "Find the domain", d: "Free regex guesses first. Serper only when those miss.", tools: ["serper"] },
    { t: "Check the store", d: "Read /products.json: live or closed, product count, median price, newest product, clothing share.", tools: ["claude"], drop: "Dead, password-locked, “launching soon”, MNCs, non-Indian" },
    { t: "Qualify", d: "Rules, not AI: marketplace demand or a real own store, inside the $50k–$300k/month band.", tools: ["supabase"], n: "753 paid-eligible" },
    { t: "Tier by Meta ads", d: "A free ad count first, a paid lookup only as fallback, page-verified. The count decides tier A–E and the offer.", tools: ["apify"], note: "No ads → store-build offer. Heavy ads → creative volume offer." },
    { t: "Find people", d: "Founders and marketing heads from the site, Serper and Exa, then Airscale. One cheap AI pass drops namesakes.", tools: ["exa", "airscale"], note: "~$0.013 per brand" },
    { t: "Still there?", d: "Current-employer check before paying for a phone number.", tools: ["airscale"], drop: "People who left the brand" },
    { t: "Phone + WhatsApp", d: "Phone, email and a WhatsApp check. Everything lands in a never-contact ledger.", tools: ["airscale", "supabase"] },
    { t: "Reach out", d: "A sample ad video made for that brand, linked in the first WhatsApp. Then email, then LinkedIn.", tools: ["whatsapp", "msg91"], n: "13% reply · 2–5 bookings per 100" }
  ],

  "job-intel": [
    { t: "Pull live GTM roles", d: "LinkedIn job posts for GTM engineering and growth roles.", tools: ["spider"] },
    { t: "Read each post", d: "AI turns the job description into fields: team, stack, seniority, what they're trying to fix.", tools: ["openai"] },
    { t: "Score against my ICP", d: "An ICP I wrote for myself: stage, team size, the tools they run.", tools: ["clay"], drop: "Roles that don't fit" },
    { t: "Find the hiring manager", d: "The person the role reports to, not the recruiter.", tools: ["clay", "linkedin"] },
    { t: "Write the angle", d: "Per role: a résumé hook, a DM and a cover-letter angle built from their own post.", tools: ["openai"] },
    { t: "Reach out", d: "Direct to the hiring manager, with a reason to reply.", tools: ["linkedin"], n: "140 sends → 2 interviews + 1 referral · 9% replies" }
  ],

  "clay-partners": [
    { t: "Scrape the directory", d: "Every agency in Clay's partner directory, pulled into a sheet with Instant Data Scraper.", tools: ["ids"], n: "171 agencies" },
    { t: "Keep the Claygencies", d: "The export qualified in Clay: clean domain and name, outbound-focused Clay agencies only.", tools: ["clay", "openai"], drop: "Solo consultants, personal brands" },
    { t: "Find the right people", d: "Founders, CEOs and revenue leaders, with their LinkedIn profiles.", tools: ["clay", "linkedin"] },
    { t: "Into Claude Code", d: "Wired up a B2B enrichment API: docs, key and examples, so Claude can read LinkedIn posts.", tools: ["claude"] },
    { t: "Train on sample posts", d: "Showed Claude real hiring posts, then built keyword filters for targeted coverage.", tools: ["claude"] },
    { t: "Scrape 30 days of posts", d: "Every matching post from the people list in the last 30 days, one row per post.", tools: ["claude", "linkedin"] },
    { t: "Qualify the posts", d: "AI checks three things: hiring now, the role is GTM, the fit.", tools: ["clay", "openai"], drop: "Commentary, hiring tips, interview advice" },
    { t: "Reach out", d: "LinkedIn DMs, or a direct application, to people who just said they're hiring.", tools: ["linkedin"], n: "Every message has a dated reason" }
  ],

  "directories": [
    { par: [
      { t: "SaaS companies", d: "A Claude Code scraper over a funding database.", tools: ["claude", "crunchbase"] },
      { t: "Marketing agencies", d: "Blocked every request, even robots.txt. So it drives a real browser and runs 24 narrow searches, because filters intersect.", tools: ["claude", "clutch"] }
    ], join: "merge" },
    { t: "Merge in one table", d: "Both sides deduped into one list.", tools: ["clay"] },
    { t: "Who owns outbound?", d: "Look for a VP Sales or equivalent.", tools: ["clay"], drop: "Nobody owns outbound → nobody to sell to" },
    { par: [
      { t: "Signal: hiring SDRs", d: "Recent SDR, BDR or GTM postings. They're scaling outbound.", tools: ["linkedin"] },
      { t: "Signal: public pain", d: "Founder or sales-lead posts about burnt domains. Newest posts only, stop at 2 matches, founders first.", tools: ["claude", "linkedin"] }
    ], join: "or" },
    { t: "Email waterfall", d: "Find, validate, fall back.", tools: ["icypeas", "debounce", "prospeo"], n: "100 verified leads" }
  ],

  "dental": [
    { t: "Cities to coordinates", d: "10 cities across different US counties. Their zip codes became latitude and longitude for location searches.", tools: ["gmaps"] },
    { t: "Scrape Google Maps", d: "About 3 Maps pages per city through Serper, with a stop rule once an area runs dry to save cost.", tools: ["serper"], n: "224 rows" },
    { t: "Check the domain", d: "The site resolves and isn't a free subdomain or a Facebook page. No domain? A Google search finds one.", tools: ["clay"], drop: "404s, free and social-only sites" },
    { t: "Drop the noise", d: "Several ICP columns confirm it's a dental clinic, not the wider dental industry.", tools: ["clay"], drop: "DSOs, directories, manufacturers, suppliers" },
    { t: "AI pass 1: real domain", d: "Claygent confirms the root domain, not a third-party URL.", tools: ["clay"] },
    { t: "AI pass 2: real practice", d: "Claygent reads each site: name and address must match Maps, and Doctors, Treatments, Services or About pages prove a working clinic.", tools: ["clay"], drop: "Shell sites, mismatched addresses" },
    { t: "Find the clinic on LinkedIn", d: "Icypeas finds verified LinkedIn pages. Dental barely lives on LinkedIn, so a Claygent Google search covers the misses.", tools: ["icypeas", "linkedin"] },
    { t: "People table", d: "Owners and decision-makers at each verified clinic, with contacts, ready for outreach.", tools: ["clay", "icypeas"], n: "Independent clinics only" }
  ],

  "finance": [
    { t: "ICP to filters", d: "A skill turns the ICP into a database search.", tools: ["claude", "companyenrich"] },
    { t: "Preview first", d: "~50 rows for 10 credits, before anything bigger.", tools: ["companyenrich"], note: "Claude once tried to export all 1,200 rows to pick 20. Stopped before it spent anything." },
    { t: "Research every firm", d: "Web research on what each firm actually does.", tools: ["exa"] },
    { t: "Qualify", d: "The logic runs in Claude Code, with a reason per row.", tools: ["claude"], drop: "Firms outside the ICP" },
    { t: "People + emails", d: "Decision-makers, with a fallback provider.", tools: ["prospeo", "icypeas"], n: "0 credits wasted" }
  ],

  "spend-recovery": [
    { t: "Cast wide", d: "North American manufacturing and logistics companies, $1B+ revenue.", tools: ["clay"] },
    { t: "Sanity checks", d: "Confirm revenue is really over $1B and the industry is really manufacturing or logistics.", tools: ["clay"], drop: "Under $1B, wrong industry" },
    { t: "Score 5 dimensions from the 10-K", d: "Spend scale (cost of goods), transaction volume (purchase orders, invoices), supplier complexity (supplier count), commercial complexity (long-term contracts, volume discounts) and org complexity (several ERPs after acquisitions).", tools: ["sec", "openai"], note: "Each dimension keeps its evidence sentence, a link to the filing and a confidence level." },
    { t: "Account score", d: "The five dimensions roll up into one score out of 100.", tools: ["clay"] },
    { t: "Find a buying signal", d: "A dated reason to act now, with its source: M&A, procurement transformation, a cost-reduction programme or supplier restructuring.", tools: ["openai"], note: "No signal found? The account stays, one tier lower." },
    { t: "Tier", d: "Tier 1 scores 80 and up, Tier 2 sits between 56 and 75, Tier 3 is everything below.", tools: ["clay"], n: "20 / 20 / 10 accounts" },
    { t: "Buyers + copy per tier", d: "Finance and procurement leaders per account; the deepest outreach goes to Tier 1, built on its own 10-K lines and signal.", tools: ["linkedin", "openai"] }
  ],

  "notetaker": [
    { t: "Seed to Series B", d: "US B2B startups, mid-size and growing.", tools: ["clay"] },
    { t: "Funding filings", d: "Round, date and amount checked against funding filings, with the source kept.", tools: ["clay"], drop: "No recent funding" },
    { t: "Prove the office", d: "The business registration number on their website confirms a real, physical office.", tools: ["clay"] },
    { t: "Read the job descriptions", d: "An explicit “remote only” or “in office” line is the strongest signal either way.", tools: ["linkedin", "openai"], drop: "Remote-only teams" },
    { t: "Score and tier", d: "Intent out of 7, then tiers A / B / C, each with a written reason.", tools: ["openai"] },
    { t: "Find decision-makers", d: "The people who would buy it, at every scored company.", tools: ["clay", "linkedin"] }
  ]
};
