import { useState, useRef } from "react";

const EXAMPLE_PROMPTS = [
  "7 day Kenya safari for $3500 in August",
  "Luxury honeymoon safari Tanzania and Zanzibar",
  "Family safari Kenya and Amboseli for 5 days",
  "10 day Tanzania Grand Circuit on a budget",
];

const SYSTEM_PROMPT = `You are a professional African safari travel planner. Generate realistic, well-structured safari itineraries.

Format your response using EXACTLY this markdown structure:

## Trip Overview
**Location:** ...
**Duration:** ...
**Estimated Budget Range:** ...

## Day-by-Day Itinerary

### Day 1 — [Title]
[Description]

### Day 2 — [Title]
[Description]

[Continue for all days]

## Wildlife Highlights
- [animal 1]
- [animal 2]

## Recommended Lodge Style
[paragraph]

## Travel Tips
- [tip 1]
- [tip 2]

Keep the tone exciting, professional, and inspiring. Include game drives, travel logistics, wildlife highlights, and practical cost estimates.`;

const DESTINATIONS = [
  {
    emoji: "🇰🇪", name: "Maasai Mara", country: "Kenya",
    overview: "The Maasai Mara is Kenya's most iconic safari destination — a vast savanna teeming with the Big Five and home to the world-famous Great Migration, where millions of wildebeest cross the Mara River between July and October.",
    wildlife: ["Lion", "Leopard", "Cheetah", "Elephant", "Buffalo", "Wildebeest", "Hippo", "Crocodile", "Zebra"],
    bestTime: "July–October (Migration season). Green season (Nov–June) offers lush scenery and fewer crowds.",
    costs: "$350–$1,200 per person per night depending on lodge tier.",
    highlight: "Witness the dramatic river crossings of the Great Migration — one of nature's greatest spectacles.",
  },
  {
    emoji: "🇹🇿", name: "Serengeti", country: "Tanzania",
    overview: "The Serengeti is the world's most celebrated national park — 14,750 sq km of endless plains, kopje outcroppings, and acacia woodland. The Great Migration circles through here year-round, with calving season in the south from January to March.",
    wildlife: ["Lion", "Leopard", "Cheetah", "Wild Dog", "Elephant", "Wildebeest", "Giraffe", "Flamingo"],
    bestTime: "January–March (calving, south). June–July (river crossings, north). All year is excellent.",
    costs: "$400–$1,500+ per person per night. Park fees ~$60/day.",
    highlight: "Over 1.5 million wildebeest complete their annual 1,800-mile circular journey through these plains.",
  },
  {
    emoji: "🇹🇿", name: "Ngorongoro Crater", country: "Tanzania",
    overview: "A UNESCO World Heritage Site and one of Africa's most extraordinary natural wonders — a 260 sq km collapsed volcanic caldera sheltering some 25,000 large animals in a near-perfect ecosystem. The density of predators here is unmatched.",
    wildlife: ["Black Rhino", "Lion", "Hyena", "Elephant", "Flamingo", "Buffalo", "Wildebeest", "Jackal"],
    bestTime: "Year-round. Dry season (June–October) offers clearest visibility.",
    costs: "$250–$900 per person per night. Crater descent fee ~$295/vehicle.",
    highlight: "One of the only places in East Africa to reliably spot the critically endangered black rhino.",
  },
  {
    emoji: "🇰🇪", name: "Amboseli", country: "Kenya",
    overview: "Amboseli sits at the foot of Mount Kilimanjaro, offering jaw-dropping game viewing with Africa's highest peak as a backdrop. Famous for its large free-roaming elephant herds and crystal-clear Kilimanjaro views on clear mornings.",
    wildlife: ["Elephant (large herds)", "Lion", "Cheetah", "Giraffe", "Zebra", "Wildebeest", "Hyena", "400+ bird species"],
    bestTime: "June–October (dry, best photography). January–February (second dry season, fewer visitors).",
    costs: "$200–$900 per person per night.",
    highlight: "Photograph massive bull elephants silhouetted against the snow-capped summit of Kilimanjaro.",
  },
  {
    emoji: "🇿🇦", name: "Kruger National Park", country: "South Africa",
    overview: "One of Africa's largest game reserves at nearly 20,000 sq km, Kruger is a self-drive paradise offering remarkable flexibility and accessibility. Home to the Big Five, it's perfect for independent travelers.",
    wildlife: ["Lion", "Leopard", "Rhino", "Elephant", "Buffalo", "Wild Dog", "Hippo", "Giraffe", "Kudu"],
    bestTime: "May–September (winter, dry season — animals concentrate near water). Year-round viable.",
    costs: "Self-drive from $50/day. Luxury private lodges $500–$2,000+ per person per night.",
    highlight: "The only major African safari destination where self-drive is fully practical — rent a car and explore.",
  },
  {
    emoji: "🇧🇼", name: "Okavango Delta", country: "Botswana",
    overview: "The Okavango is the world's largest inland delta — a magical labyrinth of lagoons, channels, and islands in the middle of the Kalahari Desert. Water-based safaris by mokoro canoe offer a uniquely serene perspective.",
    wildlife: ["Elephant", "Hippo", "Crocodile", "Lion", "Leopard", "Wild Dog", "Buffalo", "Lechwe", "Sitatunga"],
    bestTime: "June–August (peak flood season, best game viewing). October–November for birdwatching.",
    costs: "Premium destination. $800–$3,000+ per person per night. Fly-in camps only in remote areas.",
    highlight: "Glide silently through papyrus channels in a traditional mokoro canoe as elephants wade nearby.",
  },
];

const GUIDES = [
  {
    emoji: "💰", title: "African Safari Cost Guide 2025",
    intro: "Planning a safari budget is one of the most common challenges travelers face. Costs vary enormously — from $150/day self-drive Kruger trips to $3,000+/night ultra-luxury tented camps. Here is a realistic breakdown.",
    sections: [
      { heading: "Budget Safari: $150–$350/day", body: "Camping safaris, shared vehicles, and basic lodges. Typically includes park fees, meals, and guided game drives. Best for adventurous travelers willing to trade exclusivity for price." },
      { heading: "Mid-Range Safari: $350–$800/day", body: "Comfortable tented camps with private facilities, included meals, and twice-daily game drives. This is the sweet spot for most travelers — excellent guiding and wildlife without the ultra-luxury price tag." },
      { heading: "Luxury Safari: $800–$3,000+/day", body: "Private conservancies, exclusive-use camps, private guides, and fly-in itineraries. No crowds, extraordinary service, and curated experiences including night drives and bush walks." },
      { heading: "Hidden Costs to Budget For", body: "Park entry fees ($50–$80/day), internal flights ($200–$600/sector), tips ($20–$50/day for guide), travel insurance (3–5% of trip cost), visas ($50–$100), and international airfare." },
    ],
  },
  {
    emoji: "📅", title: "Best Time to Visit the Maasai Mara",
    intro: "The Maasai Mara is a year-round destination, but timing your visit around the Great Migration can transform a good safari into an unforgettable one.",
    sections: [
      { heading: "July–October: Migration Season (Peak)", body: "The wildebeest and zebra herds pour in from Tanzania's Serengeti, and the Mara River crossings occur July–September. Expect thrilling predator action. Book 12–18 months ahead for top camps." },
      { heading: "January–March: Calving Season", body: "The herds are in the Serengeti calving, but the Mara sees fewer visitors, lush green scenery, and excellent predator sightings. Prices are 20–40% lower." },
      { heading: "November–December: Short Rains", body: "Light showers bring brilliant green landscapes and superb birdwatching. Game viewing remains excellent — a good value shoulder season with fewer crowds." },
    ],
  },
  {
    emoji: "⚖️", title: "Maasai Mara vs Serengeti: Which to Choose?",
    intro: "Both parks share the same ecosystem and the same Great Migration. The right choice depends on your nationality, budget, and travel style.",
    sections: [
      { heading: "Choose Kenya's Maasai Mara if…", body: "You want a shorter international flight from Europe, prefer a compact area for game viewing, want to combine with a Kenyan beach holiday (Diani, Lamu), or have limited time (4–5 days)." },
      { heading: "Choose Tanzania's Serengeti if…", body: "You want to combine with Ngorongoro Crater and Tarangire on the Northern Circuit. The Serengeti is larger and more varied, and offers the calving season spectacle (Jan–Feb) that Kenya cannot match." },
      { heading: "Do Both!", body: "A Kenya-Tanzania combination — Maasai Mara + Serengeti + Ngorongoro — is the classic East Africa Grand Safari. Fly between the countries and you will not need to choose." },
    ],
  },
  {
    emoji: "🎒", title: "African Safari Packing List",
    intro: "Packing right can make or break a safari. Weight restrictions on bush flights are strict (typically 15kg soft bag only), and the right gear keeps you comfortable on long game drives.",
    sections: [
      { heading: "Clothing", body: "Neutral colours only (khaki, olive, tan) — no white or bright colours that disturb wildlife. Lightweight long sleeves and trousers for sun protection. A warm fleece for early morning drives." },
      { heading: "Photography Gear", body: "A telephoto lens (300–500mm) is a game-changer for wildlife photography. Bring a bean bag for vehicle window support, extra memory cards, and a portable charger." },
      { heading: "Health and Comfort", body: "Malaria prophylaxis (consult your doctor), DEET-based insect repellent, SPF50+ sunscreen, antihistamine, and any personal medication. Remote camps have limited medical supplies." },
    ],
  },
];

function parseItinerary(text) {
  const sections = [];
  const lines = text.split("\n");
  let current = null;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { type: "section", title: line.replace("## ", ""), content: [] };
    } else if (line.startsWith("### ")) {
      if (current) sections.push(current);
      current = { type: "day", title: line.replace("### ", ""), content: [] };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} style={{ color: "#f5d98b", fontWeight: 600 }}>{part.slice(2, -2)}</strong>
      : part
  );
}

function renderContent(lines) {
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: "6px" }} />;
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={i} style={{ display: "flex", gap: "8px", color: "rgba(245,234,208,0.75)", fontSize: "0.85rem", marginBottom: "3px" }}>
          <span style={{ color: "#d4a843", flexShrink: 0 }}>▸</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} style={{ fontWeight: "bold", color: "#d4a843", fontSize: "0.85rem", margin: "4px 0" }}>{line.slice(2, -2)}</p>;
    }
    return <p key={i} style={{ color: "rgba(245,234,208,0.75)", fontSize: "0.85rem", lineHeight: 1.7, margin: "3px 0" }}>{renderInline(line)}</p>;
  });
}

const G = "#d4a843";
const BG = "#0d1208";
const BORDER = "rgba(212,168,67,0.15)";
const BORDER2 = "rgba(212,168,67,0.35)";
const TEXT = "#f5ead0";
const MUTED = "#a89060";
const FONT = "'Georgia','Times New Roman',serif";

export default function Safaripedia() {
  const [tab, setTab] = useState("plan");
  const [dest, setDest] = useState(null);
  const [guide, setGuide] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLead, setShowLead] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", dates: "", travelers: "", budget: "", notes: "" });
  const [costData, setCostData] = useState(null);
  const resultRef = useRef(null);

  function nav(t) { setTab(t); setDest(null); setGuide(null); }

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true); setError(null); setResult(null); setShowLead(false); setLeadDone(false); setCostData(null);
    try {
      // Generate itinerary
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${SYSTEM_PROMPT}\n\nUser request: ${prompt}`
        }),
      });
      const data = await res.json();
      const text = data.response || "";
      setResult(text);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      // Generate cost breakdown
      const costRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a safari cost estimator. Return ONLY a JSON object with no markdown, no code fences, no extra text whatsoever. The JSON must have this exact shape:
{
  "rows": [
    {"category": "Lodges", "cost": 2100},
    {"category": "Park Fees", "cost": 320},
    {"category": "Safari Vehicle & Guide", "cost": 650},
    {"category": "Domestic Flights", "cost": 480},
    {"category": "Meals & Activities", "cost": 450}
  ],
  "totalLow": 4000,
  "totalHigh": 4600
}
Base the numbers realistically on the destination, duration, and budget. All costs per person in USD.

Safari request: ${prompt}`
        }),
      });
      const costJson = await costRes.json();
      const costText = costJson.response || "";
      try {
        const parsed = JSON.parse(costText.replace(/```json|```/g, "").trim());
        setCostData(parsed);
      } catch { /* silently skip if parse fails */ }
    } catch {
      setError("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  const sections = result ? parseItinerary(result) : [];
  const overview = sections.find(s => s.title?.includes("Trip Overview"));
  const days = sections.filter(s => s.type === "day");
  const rest = sections.filter(s => s.type === "section" && !s.title?.includes("Trip Overview") && !s.title?.includes("Day-by-Day"));

  const btn = (label, onClick, style = {}) => (
    <button onClick={onClick} style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.7rem 1.8rem", fontSize: "0.88rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer", ...style }}>{label}</button>
  );

  const backBtn = (label, onClick) => (
    <button onClick={onClick} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "20px", padding: "0.35rem 1rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: FONT, marginBottom: "2rem" }}>{label}</button>
  );

  const card = (children, extra = {}) => (
    <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.5rem", ...extra }}>{children}</div>
  );

  return (
    <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }} />

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, borderBottom: `1px solid ${BORDER}`, padding: "1.2rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={() => nav("plan")} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
          <span style={{ fontSize: "1.5rem" }}>🦁</span>
          <span style={{ fontStyle: "italic", fontSize: "1.3rem", color: G, letterSpacing: "0.02em" }}>Safaripedia</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {[["plan", "Plan Safari"], ["destinations", "Destinations"], ["guides", "Guides"]].map(([t, label]) => (
            <span key={t} onClick={() => nav(t)} style={{ cursor: "pointer", color: tab === t ? G : MUTED, borderBottom: tab === t ? `1px solid ${G}` : "1px solid transparent", paddingBottom: "2px", transition: "color 0.2s" }}>
              {label}
            </span>
          ))}
        </div>
      </nav>

      {/* ── PLAN TAB ── */}
      {tab === "plan" && (
        <>
          <div style={{ position: "relative", zIndex: 1, padding: "5rem 2rem 4rem", textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1.5rem", opacity: 0.8 }}>✦ AI-Powered Safari Planning ✦</div>
            <h1 style={{ fontStyle: "italic", fontSize: "clamp(2.4rem,6vw,4rem)", lineHeight: 1.15, color: TEXT, marginBottom: "1.2rem", fontWeight: "normal" }}>
              Plan Your African Safari<br /><span style={{ color: G }}>in Seconds</span>
            </h1>
            <p style={{ color: MUTED, fontSize: "1rem", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 2.5rem" }}>
              Describe your dream safari — destination, budget, duration — and our AI planner generates a custom itinerary instantly.
            </p>
            <div style={{ background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.25)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); } }}
                placeholder="e.g. 7 day Kenya safari in August, budget $4000 for 2 people…"
                rows={3}
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: FONT, fontSize: "1rem", color: TEXT, lineHeight: 1.6, minHeight: "70px", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <span style={{ fontSize: "0.7rem", color: MUTED, letterSpacing: "0.08em" }}>PRESS ENTER OR CLICK PLAN</span>
                <button onClick={generate} disabled={loading || !prompt.trim()}
                  style={{ background: loading ? "rgba(212,168,67,0.3)" : G, color: loading ? MUTED : BG, border: "none", borderRadius: "8px", padding: "0.65rem 1.8rem", fontSize: "0.85rem", fontFamily: FONT, fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Planning…" : "Plan My Safari →"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
              {EXAMPLE_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => setPrompt(p)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "20px", padding: "0.35rem 0.9rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: FONT }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ maxWidth: "760px", margin: "0 auto 2rem", padding: "0 2rem" }}><div style={{ background: "rgba(200,60,60,0.1)", border: "1px solid rgba(200,60,60,0.3)", borderRadius: "8px", padding: "1rem", color: "#f87171", fontSize: "0.85rem" }}>{error}</div></div>}

          {loading && (
            <div style={{ maxWidth: "900px", margin: "0 auto 3rem", padding: "0 2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", padding: "1rem 1.5rem", background: "rgba(212,168,67,0.05)", borderRadius: "8px", border: `1px solid ${BORDER}` }}>
                <div style={{ width: "20px", height: "20px", border: `2px solid ${BORDER}`, borderTopColor: G, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ color: MUTED, fontSize: "0.85rem", fontStyle: "italic" }}>Crafting your perfect safari itinerary…</span>
              </div>
              {[100, 85, 95, 75, 90].map((w, i) => <div key={i} style={{ height: "13px", background: "rgba(212,168,67,0.08)", borderRadius: "4px", marginBottom: "0.8rem", width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />)}
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
            </div>
          )}

          {result && !loading && (
            <div ref={resultRef} style={{ maxWidth: "900px", margin: "0 auto 4rem", padding: "0 2rem" }}>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "3rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: G, marginBottom: "2rem", textAlign: "center" }}>✦ Your Custom Itinerary ✦</div>

                {overview && (
                  <div style={{ background: "rgba(212,168,67,0.07)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "12px", padding: "2rem", marginBottom: "2rem" }}>
                    <h2 style={{ fontStyle: "italic", fontSize: "1.4rem", color: G, marginBottom: "1rem", fontWeight: "normal" }}>Trip Overview</h2>
                    {renderContent(overview.content)}
                  </div>
                )}

                {days.length > 0 && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, marginBottom: "1.2rem", fontWeight: "normal", paddingLeft: "0.5rem", borderLeft: `3px solid ${G}` }}>Day-by-Day Itinerary</h2>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {days.map((day, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.5rem", display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.2rem" }}>
                          <div style={{ background: "rgba(212,168,67,0.15)", borderRadius: "8px", padding: "0.4rem 0.7rem", fontSize: "0.7rem", letterSpacing: "0.1em", color: G, textAlign: "center", minWidth: "36px", border: "1px solid rgba(212,168,67,0.2)", alignSelf: "start" }}>{i + 1}</div>
                          <div>
                            <h3 style={{ fontStyle: "italic", fontSize: "1rem", color: TEXT, marginBottom: "0.6rem", fontWeight: "normal" }}>{day.title.replace(/^Day \d+\s*[—\-]\s*/, "")}</h3>
                            {renderContent(day.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rest.map((sec, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.5rem", marginBottom: "1rem" }}>
                    <h2 style={{ fontStyle: "italic", fontSize: "1.1rem", color: G, marginBottom: "1rem", fontWeight: "normal" }}>{sec.title}</h2>
                    {renderContent(sec.content)}
                  </div>
                ))}


                {/* ── COST CALCULATOR ── */}
                {costData && (
                  <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem", marginBottom: "1.5rem", marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>💰</span>
                      <h2 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", margin: 0 }}>Estimated Safari Cost</h2>
                      <span style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginLeft: "auto", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "0.2rem 0.7rem" }}>per person</span>
                    </div>

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.6rem", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>Category</span>
                      <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, textAlign: "right" }}>Estimated Cost</span>
                    </div>

                    {/* Rows */}
                    {costData.rows.map((row, i) => {
                      const maxCost = Math.max(...costData.rows.map(r => r.cost));
                      const pct = Math.round((row.cost / maxCost) * 100);
                      return (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center", padding: "0.9rem 0", borderBottom: `1px solid rgba(212,168,67,0.07)` }}>
                          <div>
                            <div style={{ fontSize: "0.88rem", color: TEXT, marginBottom: "0.35rem" }}>{row.category}</div>
                            <div style={{ height: "3px", background: "rgba(212,168,67,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${G}, rgba(212,168,67,0.5))`, borderRadius: "2px", transition: "width 0.8s ease" }} />
                            </div>
                          </div>
                          <span style={{ fontSize: "0.95rem", color: G, fontWeight: "bold", textAlign: "right", whiteSpace: "nowrap" }}>
                            ${row.cost.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}

                    {/* Total */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center", marginTop: "1.2rem", paddingTop: "1rem", borderTop: `1px solid rgba(212,168,67,0.25)` }}>
                      <span style={{ fontSize: "0.88rem", color: TEXT, fontWeight: "bold", letterSpacing: "0.04em" }}>Estimated Total</span>
                      <span style={{ fontSize: "1.15rem", color: G, fontWeight: "bold", textAlign: "right" }}>
                        ${costData.totalLow.toLocaleString()} – ${costData.totalHigh.toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: MUTED, marginTop: "0.6rem", fontStyle: "italic" }}>
                      * Estimates are indicative. Actual costs vary by season, lodge tier, and group size.
                    </p>
                  </div>
                )}

                {!showLead && !leadDone && (
                  <div style={{ textAlign: "center", padding: "2.5rem", background: "linear-gradient(135deg,rgba(212,168,67,0.08),rgba(212,168,67,0.03))", border: "1px solid rgba(212,168,67,0.25)", borderRadius: "14px", marginTop: "0.5rem" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}>🐘</div>
                    <h3 style={{ fontStyle: "italic", fontSize: "1.4rem", color: TEXT, fontWeight: "normal", marginBottom: "0.5rem" }}>Ready to Book Your Safari?</h3>
                    <p style={{ color: MUTED, fontSize: "0.9rem", marginBottom: "1.5rem" }}>Get personalised quotes from vetted safari operators.</p>
                    {btn("Get Operator Quotes →", () => setShowLead(true))}
                  </div>
                )}

                {showLead && !leadDone && (
                  <div style={{ background: "rgba(212,168,67,0.05)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "14px", padding: "2rem", marginTop: "2rem" }}>
                    <h3 style={{ fontStyle: "italic", fontSize: "1.3rem", color: G, marginBottom: "1.5rem", fontWeight: "normal" }}>Get Quotes from Safari Operators</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                      {[["name","Your Name","Jane Smith"],["email","Email Address","jane@example.com"],["dates","Travel Dates","Aug 10–20, 2025"],["travelers","Number of Travelers","2 adults"],["budget","Total Budget (USD)","$5,000"]].map(([k, label, ph]) => (
                        <div key={k}>
                          <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.4rem" }}>{label}</label>
                          <input value={lead[k]} onChange={e => setLead(l => ({ ...l, [k]: e.target.value }))} placeholder={ph}
                            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "6px", padding: "0.6rem 0.8rem", color: TEXT, fontSize: "0.85rem", fontFamily: FONT, outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.4rem" }}>Additional Notes</label>
                      <textarea value={lead.notes} onChange={e => setLead(l => ({ ...l, notes: e.target.value }))} rows={3} placeholder="Special requests, dietary needs…"
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "6px", padding: "0.6rem 0.8rem", color: TEXT, fontSize: "0.85rem", fontFamily: FONT, outline: "none", resize: "none", boxSizing: "border-box" }} />
                    </div>
                    {btn("Submit Request →", () => setLeadDone(true))}
                  </div>
                )}

                {leadDone && (
                  <div style={{ textAlign: "center", padding: "2rem", background: "rgba(100,200,100,0.06)", border: "1px solid rgba(100,200,100,0.2)", borderRadius: "12px", marginTop: "2rem" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
                    <p style={{ color: "#86efac", fontStyle: "italic" }}>Thank you! A safari specialist will be in touch within 24 hours.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── DESTINATIONS TAB ── */}
      {tab === "destinations" && (
        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem 4rem" }}>
          {!dest ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1rem" }}>✦ Explore Africa ✦</div>
                <h1 style={{ fontStyle: "italic", fontSize: "2.5rem", color: TEXT, fontWeight: "normal", marginBottom: "0.8rem" }}>Safari Destinations</h1>
                <p style={{ color: MUTED, fontSize: "0.95rem" }}>From Kenya's sweeping savannas to Botswana's magical delta.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1.2rem" }}>
                {DESTINATIONS.map((d, i) => (
                  <div key={i} onClick={() => setDest(d)}
                    style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.8rem", cursor: "pointer", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = BORDER2}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>{d.emoji}</div>
                    <h3 style={{ fontStyle: "italic", fontSize: "1.2rem", color: TEXT, fontWeight: "normal", marginBottom: "0.3rem" }}>{d.name}</h3>
                    <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: G, marginBottom: "0.8rem" }}>{d.country}</div>
                    <p style={{ color: MUTED, fontSize: "0.82rem", lineHeight: 1.6 }}>{d.overview.slice(0, 115)}…</p>
                    <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: G }}>Explore →</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div>
              {backBtn("← Back to Destinations", () => setDest(null))}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.5rem" }}>{dest.emoji}</span>
                <div>
                  <h1 style={{ fontStyle: "italic", fontSize: "2rem", color: TEXT, fontWeight: "normal", margin: 0 }}>{dest.name}</h1>
                  <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: G }}>{dest.country}</div>
                </div>
              </div>
              <div style={{ background: "rgba(212,168,67,0.06)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.8rem", marginBottom: "1rem" }}>
                <p style={{ color: TEXT, fontSize: "0.95rem", lineHeight: 1.75, margin: 0 }}>{dest.overview}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.4rem" }}>
                  <h3 style={{ fontStyle: "italic", color: G, fontSize: "0.95rem", fontWeight: "normal", marginBottom: "0.8rem" }}>Wildlife Highlights</h3>
                  {dest.wildlife.map((a, i) => <div key={i} style={{ color: MUTED, fontSize: "0.82rem", padding: "0.2rem 0", display: "flex", gap: "0.5rem" }}><span style={{ color: G }}>▸</span>{a}</div>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.4rem" }}>
                    <h3 style={{ fontStyle: "italic", color: G, fontSize: "0.95rem", fontWeight: "normal", marginBottom: "0.5rem" }}>Best Time to Visit</h3>
                    <p style={{ color: MUTED, fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>{dest.bestTime}</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.4rem" }}>
                    <h3 style={{ fontStyle: "italic", color: G, fontSize: "0.95rem", fontWeight: "normal", marginBottom: "0.5rem" }}>Safari Costs</h3>
                    <p style={{ color: MUTED, fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>{dest.costs}</p>
                  </div>
                </div>
              </div>
              <div style={{ background: "linear-gradient(135deg,rgba(212,168,67,0.1),rgba(212,168,67,0.04))", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "10px", padding: "1.4rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: G }}>✦ Highlight</span>
                <p style={{ color: TEXT, fontSize: "0.9rem", lineHeight: 1.7, marginTop: "0.5rem", fontStyle: "italic", marginBottom: 0 }}>{dest.highlight}</p>
              </div>
              {btn(`Plan a ${dest.name} Safari →`, () => { nav("plan"); setPrompt(`Safari in ${dest.name}`); })}
            </div>
          )}
        </div>
      )}

      {/* ── GUIDES TAB ── */}
      {tab === "guides" && (
        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem 4rem" }}>
          {!guide ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1rem" }}>✦ Expert Knowledge ✦</div>
                <h1 style={{ fontStyle: "italic", fontSize: "2.5rem", color: TEXT, fontWeight: "normal", marginBottom: "0.8rem" }}>Safari Guides</h1>
                <p style={{ color: MUTED, fontSize: "0.95rem" }}>Everything you need to know before booking your African safari.</p>
              </div>
              <div style={{ display: "grid", gap: "1rem" }}>
                {GUIDES.map((g, i) => (
                  <div key={i} onClick={() => setGuide(g)}
                    style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem 2rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1.5rem", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = BORDER2}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                    <span style={{ fontSize: "2rem", flexShrink: 0 }}>{g.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontStyle: "italic", fontSize: "1.05rem", color: TEXT, fontWeight: "normal", marginBottom: "0.3rem" }}>{g.title}</h3>
                      <p style={{ color: MUTED, fontSize: "0.82rem", margin: 0 }}>{g.intro.slice(0, 110)}…</p>
                    </div>
                    <span style={{ color: G, fontSize: "1.1rem", flexShrink: 0 }}>→</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div>
              {backBtn("← Back to Guides", () => setGuide(null))}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.5rem" }}>{guide.emoji}</span>
                <h1 style={{ fontStyle: "italic", fontSize: "1.8rem", color: TEXT, fontWeight: "normal", margin: 0 }}>{guide.title}</h1>
              </div>
              <div style={{ background: "rgba(212,168,67,0.06)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.8rem", marginBottom: "1.5rem" }}>
                <p style={{ color: TEXT, fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>{guide.intro}</p>
              </div>
              {guide.sections.map((sec, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.5rem", marginBottom: "1rem" }}>
                  <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", marginBottom: "0.6rem" }}>{sec.heading}</h3>
                  <p style={{ color: MUTED, fontSize: "0.88rem", lineHeight: 1.75, margin: 0 }}>{sec.body}</p>
                </div>
              ))}
              <div style={{ textAlign: "center", marginTop: "2rem", padding: "1.5rem", background: "rgba(212,168,67,0.05)", borderRadius: "10px", border: `1px solid ${BORDER}` }}>
                <p style={{ color: MUTED, fontSize: "0.88rem", marginBottom: "1rem" }}>Ready to start planning? Let AI build your custom itinerary.</p>
                {btn("Plan My Safari →", () => nav("plan"))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "3rem 2rem", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, marginBottom: "1.5rem" }}>Top Safari Destinations</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.8rem" }}>
          {DESTINATIONS.map(d => (
            <span key={d.name} onClick={() => { setTab("destinations"); setDest(d); }}
              style={{ background: "rgba(212,168,67,0.06)", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "0.35rem 1rem", fontSize: "0.8rem", color: MUTED, cursor: "pointer" }}>
              {d.emoji} {d.name}
            </span>
          ))}
        </div>
        <div style={{ marginTop: "2.5rem", fontSize: "0.7rem", color: "rgba(168,144,96,0.35)", letterSpacing: "0.08em" }}>
          © 2025 Safaripedia — AI-Powered African Safari Planning
        </div>
      </div>
    </div>
  );
}