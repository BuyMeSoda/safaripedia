import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// ════════════════════════════════════════════════════════════
// ── SAFARI KNOWLEDGE BASE — hallucination prevention system ──
// ════════════════════════════════════════════════════════════

const PARKS: Record<string, { country: string; region: string; highlights: string; bestMonths: string[] }> = {
  "Maasai Mara":     { country: "Kenya",        region: "Southwest Kenya",    highlights: "Big Five, Great Migration Jul–Oct, big cats",                bestMonths: ["june","july","august","september","october"] },
  "Amboseli":        { country: "Kenya",        region: "South Kenya",        highlights: "Large elephant herds, Kilimanjaro views",                    bestMonths: ["june","july","august","september","october","january","february"] },
  "Samburu":         { country: "Kenya",        region: "North Kenya",        highlights: "Rare northern species: Grevy's zebra, reticulated giraffe",  bestMonths: ["june","july","august","september","january","february"] },
  "Lake Nakuru":     { country: "Kenya",        region: "Rift Valley Kenya",  highlights: "Flamingos, rhino sanctuary, leopard",                        bestMonths: ["june","july","august","september","october","january","february"] },
  "Tsavo":           { country: "Kenya",        region: "Southeast Kenya",    highlights: "Red elephants, big game, remote wilderness",                 bestMonths: ["june","july","august","september","january","february"] },
  "Serengeti":       { country: "Tanzania",     region: "North Tanzania",     highlights: "Great Migration year-round, big cats, vast plains",          bestMonths: ["june","july","august","september","october","january","february"] },
  "Ngorongoro":      { country: "Tanzania",     region: "North Tanzania",     highlights: "Crater with dense wildlife, rhino, lion",                    bestMonths: ["june","july","august","september","october","january","february"] },
  "Tarangire":       { country: "Tanzania",     region: "North Tanzania",     highlights: "Massive elephant herds, baobab trees, dry season",           bestMonths: ["june","july","august","september","october"] },
  "Selous/Nyerere":  { country: "Tanzania",     region: "South Tanzania",     highlights: "Remote, boat safaris, wild dog, hippo",                      bestMonths: ["june","july","august","september","october"] },
  "Ruaha":           { country: "Tanzania",     region: "South Tanzania",     highlights: "Large lion prides, elephant, remote",                        bestMonths: ["june","july","august","september","october"] },
  "Zanzibar":        { country: "Tanzania",     region: "Indian Ocean",       highlights: "Beach extension, spice tours, Stone Town",                   bestMonths: ["june","july","august","september","october","january","february"] },
  "Kruger":          { country: "South Africa", region: "Limpopo/Mpumalanga", highlights: "Big Five, self-drive, excellent infrastructure",             bestMonths: ["may","june","july","august","september","october"] },
  "Sabi Sands":      { country: "South Africa", region: "Limpopo",           highlights: "Luxury lodges, leopard, open vehicle game drives",           bestMonths: ["may","june","july","august","september","october"] },
  "Okavango Delta":  { country: "Botswana",     region: "North Botswana",    highlights: "Mokoro canoe, water safari, big game, exclusive camps",       bestMonths: ["june","july","august","september","october"] },
  "Chobe":           { country: "Botswana",     region: "North Botswana",    highlights: "Largest elephant concentration in Africa, boat safari",       bestMonths: ["june","july","august","september","october"] },
  "Moremi":          { country: "Botswana",     region: "North Botswana",    highlights: "Mix of water and land safari, wild dog",                     bestMonths: ["june","july","august","september","october"] },
  "Bwindi":          { country: "Uganda",       region: "Southwest Uganda",   highlights: "Mountain gorilla trekking, Impenetrable Forest",             bestMonths: ["june","july","august","december","january","february"] },
  "Queen Elizabeth": { country: "Uganda",       region: "Southwest Uganda",   highlights: "Tree-climbing lions, boat safari, chimp trekking",           bestMonths: ["june","july","august","december","january","february"] },
  "Volcanoes":       { country: "Rwanda",       region: "Northwest Rwanda",   highlights: "Mountain gorilla trekking, golden monkey",                   bestMonths: ["june","july","august","december","january","february"] },
  "Etosha":          { country: "Namibia",      region: "North Namibia",      highlights: "Salt pan, waterhole viewing, dry season concentration",      bestMonths: ["june","july","august","september","october"] },
};

const ROUTES: Array<{ from: string; to: string; transport: string; hours: number; notes?: string }> = [
  // Kenya internal
  { from: "Nairobi",       to: "Maasai Mara",    transport: "drive or fly",  hours: 5.5, notes: "Drive 5–6h or 45min flight" },
  { from: "Nairobi",       to: "Amboseli",        transport: "drive",         hours: 4 },
  { from: "Nairobi",       to: "Samburu",         transport: "drive or fly",  hours: 5,   notes: "Drive 5–6h or 1h flight" },
  { from: "Nairobi",       to: "Lake Nakuru",     transport: "drive",         hours: 2.5 },
  { from: "Nairobi",       to: "Tsavo",           transport: "drive",         hours: 4.5 },
  { from: "Maasai Mara",   to: "Lake Nakuru",     transport: "drive",         hours: 5 },
  { from: "Maasai Mara",   to: "Amboseli",        transport: "drive",         hours: 8,   notes: "Long drive — not recommended same day" },
  { from: "Lake Nakuru",   to: "Amboseli",        transport: "drive",         hours: 5 },
  { from: "Lake Nakuru",   to: "Samburu",         transport: "drive",         hours: 5 },
  { from: "Amboseli",      to: "Tsavo",           transport: "drive",         hours: 3 },
  // Tanzania internal
  { from: "Kilimanjaro",   to: "Serengeti",       transport: "fly",           hours: 1.5, notes: "Must fly — no direct road" },
  { from: "Kilimanjaro",   to: "Ngorongoro",      transport: "drive",         hours: 3 },
  { from: "Kilimanjaro",   to: "Tarangire",       transport: "drive",         hours: 2.5 },
  { from: "Arusha",        to: "Serengeti",       transport: "fly or drive",  hours: 7,   notes: "Fly 1h or drive 7–8h" },
  { from: "Arusha",        to: "Ngorongoro",      transport: "drive",         hours: 3 },
  { from: "Arusha",        to: "Tarangire",       transport: "drive",         hours: 2 },
  { from: "Ngorongoro",    to: "Serengeti",       transport: "drive",         hours: 3 },
  { from: "Ngorongoro",    to: "Tarangire",       transport: "drive",         hours: 2.5 },
  { from: "Serengeti",     to: "Zanzibar",        transport: "fly",           hours: 2,   notes: "Must fly via Arusha or Dar" },
  // Cross-border
  { from: "Nairobi",       to: "Arusha",          transport: "drive or fly",  hours: 4.5, notes: "Cross border Kenya→Tanzania. Drive 4–5h with border crossing or 45min flight" },
  { from: "Nairobi",       to: "Kilimanjaro",     transport: "drive or fly",  hours: 4,   notes: "Cross border. Drive or 45min flight" },
  { from: "Maasai Mara",   to: "Serengeti",       transport: "fly only",      hours: 1,   notes: "Cross border — must fly. No road crossing permitted for tourists" },
  { from: "Nairobi",       to: "Entebbe",         transport: "fly",           hours: 1.5, notes: "Kenya→Uganda. Fly only" },
  { from: "Nairobi",       to: "Kigali",          transport: "fly",           hours: 1.5, notes: "Kenya→Rwanda. Fly only" },
  { from: "Johannesburg",  to: "Kruger",          transport: "drive or fly",  hours: 5,   notes: "Drive 5h or 1h flight to Hoedspruit" },
  { from: "Johannesburg",  to: "Cape Town",       transport: "fly",           hours: 2 },
  { from: "Maun",          to: "Okavango Delta",  transport: "fly",           hours: 0.5, notes: "Small charter plane — no road access to most camps" },
  { from: "Maun",          to: "Chobe",           transport: "drive",         hours: 4 },
  { from: "Kasane",        to: "Chobe",           transport: "drive",         hours: 0.5 },
  { from: "Entebbe",       to: "Bwindi",          transport: "drive or fly",  hours: 8,   notes: "Drive 8h or charter flight to Kihihi" },
  { from: "Entebbe",       to: "Queen Elizabeth", transport: "drive",         hours: 5 },
  { from: "Kigali",        to: "Volcanoes",       transport: "drive",         hours: 2 },
];

const LODGES: Array<{ name: string; park: string; country: string; tier: "luxury" | "mid" | "budget"; priceRange: string }> = [
  // Maasai Mara
  { name: "Angama Mara",                    park: "Maasai Mara", country: "Kenya",        tier: "luxury", priceRange: "$1,500–$2,500/night pp" },
  { name: "Mahali Mzuri",                   park: "Maasai Mara", country: "Kenya",        tier: "luxury", priceRange: "$1,200–$2,000/night pp" },
  { name: "Mara Plains Camp",               park: "Maasai Mara", country: "Kenya",        tier: "luxury", priceRange: "$1,000–$1,800/night pp" },
  { name: "Cottar's 1920s Safari Camp",     park: "Maasai Mara", country: "Kenya",        tier: "luxury", priceRange: "$1,500–$2,500/night pp" },
  { name: "Mara Serena Safari Lodge",       park: "Maasai Mara", country: "Kenya",        tier: "mid",    priceRange: "$300–$500/night pp" },
  { name: "Basecamp Mara",                  park: "Maasai Mara", country: "Kenya",        tier: "mid",    priceRange: "$250–$450/night pp" },
  { name: "Mara Intrepids Camp",            park: "Maasai Mara", country: "Kenya",        tier: "mid",    priceRange: "$300–$500/night pp" },
  { name: "Fig Tree Camp",                  park: "Maasai Mara", country: "Kenya",        tier: "budget", priceRange: "$150–$250/night pp" },
  // Amboseli
  { name: "Amboseli Serena Safari Lodge",   park: "Amboseli",    country: "Kenya",        tier: "mid",    priceRange: "$250–$400/night pp" },
  { name: "Ol Tukai Lodge",                 park: "Amboseli",    country: "Kenya",        tier: "mid",    priceRange: "$200–$380/night pp" },
  { name: "Tortilis Camp",                  park: "Amboseli",    country: "Kenya",        tier: "luxury", priceRange: "$700–$1,200/night pp" },
  { name: "Tawi Lodge",                     park: "Amboseli",    country: "Kenya",        tier: "luxury", priceRange: "$800–$1,400/night pp" },
  // Samburu
  { name: "Sasaab Lodge",                   park: "Samburu",     country: "Kenya",        tier: "luxury", priceRange: "$900–$1,500/night pp" },
  { name: "Samburu Intrepids Camp",         park: "Samburu",     country: "Kenya",        tier: "mid",    priceRange: "$250–$450/night pp" },
  { name: "Samburu Serena Safari Lodge",    park: "Samburu",     country: "Kenya",        tier: "mid",    priceRange: "$200–$380/night pp" },
  // Lake Nakuru
  { name: "Sarova Lion Hill Game Lodge",    park: "Lake Nakuru", country: "Kenya",        tier: "mid",    priceRange: "$180–$320/night pp" },
  // Serengeti
  { name: "Four Seasons Safari Lodge",      park: "Serengeti",   country: "Tanzania",     tier: "luxury", priceRange: "$1,000–$2,000/night pp" },
  { name: "Singita Grumeti",                park: "Serengeti",   country: "Tanzania",     tier: "luxury", priceRange: "$2,000–$4,000/night pp" },
  { name: "Serengeti Under Canvas",         park: "Serengeti",   country: "Tanzania",     tier: "luxury", priceRange: "$800–$1,500/night pp" },
  { name: "Serengeti Serena Safari Lodge",  park: "Serengeti",   country: "Tanzania",     tier: "mid",    priceRange: "$300–$550/night pp" },
  { name: "Ikoma Tented Camp",              park: "Serengeti",   country: "Tanzania",     tier: "budget", priceRange: "$150–$280/night pp" },
  // Ngorongoro
  { name: "Ngorongoro Crater Lodge",        park: "Ngorongoro",  country: "Tanzania",     tier: "luxury", priceRange: "$1,500–$2,500/night pp" },
  { name: "&Beyond Ngorongoro Crater Lodge",park: "Ngorongoro",  country: "Tanzania",     tier: "luxury", priceRange: "$1,200–$2,000/night pp" },
  { name: "Ngorongoro Serena Safari Lodge", park: "Ngorongoro",  country: "Tanzania",     tier: "mid",    priceRange: "$280–$480/night pp" },
  // Tarangire
  { name: "Tarangire Treetops",             park: "Tarangire",   country: "Tanzania",     tier: "luxury", priceRange: "$800–$1,400/night pp" },
  { name: "Tarangire Sopa Lodge",           park: "Tarangire",   country: "Tanzania",     tier: "mid",    priceRange: "$200–$380/night pp" },
  // Kruger / Sabi Sands
  { name: "Singita Sabi Sand",              park: "Sabi Sands",  country: "South Africa", tier: "luxury", priceRange: "$2,000–$4,000/night pp" },
  { name: "Lion Sands Game Reserve",        park: "Sabi Sands",  country: "South Africa", tier: "luxury", priceRange: "$800–$1,500/night pp" },
  { name: "Londolozi",                      park: "Sabi Sands",  country: "South Africa", tier: "luxury", priceRange: "$1,000–$2,000/night pp" },
  { name: "MalaMala Game Reserve",          park: "Sabi Sands",  country: "South Africa", tier: "luxury", priceRange: "$1,200–$2,000/night pp" },
  { name: "Skukuza Rest Camp",              park: "Kruger",      country: "South Africa", tier: "budget", priceRange: "$50–$150/night pp" },
  // Okavango / Botswana
  { name: "Mombo Camp",                     park: "Okavango Delta", country: "Botswana",  tier: "luxury", priceRange: "$2,500–$4,500/night pp" },
  { name: "Vumbura Plains",                 park: "Okavango Delta", country: "Botswana",  tier: "luxury", priceRange: "$1,500–$3,000/night pp" },
  { name: "Xigera Safari Lodge",            park: "Okavango Delta", country: "Botswana",  tier: "luxury", priceRange: "$2,000–$4,000/night pp" },
  { name: "Chobe Game Lodge",               park: "Chobe",       country: "Botswana",     tier: "luxury", priceRange: "$700–$1,200/night pp" },
  // Rwanda / Uganda
  { name: "Bisate Lodge",                   park: "Volcanoes",   country: "Rwanda",       tier: "luxury", priceRange: "$1,500–$2,500/night pp" },
  { name: "One&Only Gorilla's Nest",        park: "Volcanoes",   country: "Rwanda",       tier: "luxury", priceRange: "$1,200–$2,000/night pp" },
  { name: "Bwindi Lodge",                   park: "Bwindi",      country: "Uganda",       tier: "luxury", priceRange: "$800–$1,500/night pp" },
  { name: "Clouds Mountain Gorilla Lodge",  park: "Bwindi",      country: "Uganda",       tier: "luxury", priceRange: "$700–$1,200/night pp" },
];

const SEASONALITY: Array<{ park: string; event: string; months: string[]; description: string }> = [
  { park: "Maasai Mara",    event: "Great Migration river crossings", months: ["july","august","september","october"],          description: "Wildebeest crossing Mara River — peak spectacle" },
  { park: "Serengeti",      event: "Great Migration calving season",  months: ["january","february"],                           description: "500,000 calves born on southern plains" },
  { park: "Serengeti",      event: "Great Migration northern herds",  months: ["june","july","august"],                         description: "Herds move north toward Mara" },
  { park: "Amboseli",       event: "Best Kilimanjaro views",          months: ["january","february","september","october"],      description: "Clearest mountain views in dry conditions" },
  { park: "Okavango Delta", event: "Flood season — water safari",    months: ["june","july","august","september"],              description: "Delta floods — mokoro and boat safaris at peak" },
  { park: "Kruger",         event: "Dry season — best game viewing",  months: ["may","june","july","august","september","october"], description: "Vegetation thins, animals concentrate at water" },
  { park: "Bwindi",         event: "Gorilla trekking — dry season",  months: ["june","july","august","december","january","february"], description: "Easier trekking conditions" },
  { park: "Volcanoes",      event: "Gorilla trekking — dry season",  months: ["june","july","august","december","january","february"], description: "Best trekking conditions" },
  { park: "Tarangire",      event: "Elephant concentration",          months: ["june","july","august","september","october"],    description: "Thousands of elephants gather at Tarangire River" },
];

const PRICING: Record<string, { perDayPP: string; includes: string }> = {
  budget:    { perDayPP: "$150–$300",  includes: "shared vehicles, basic tented camps, park fees, meals" },
  mid:       { perDayPP: "$350–$650",  includes: "private vehicle, comfortable camps/lodges, park fees, all meals, transfers" },
  luxury:    { perDayPP: "$700–$1,500", includes: "exclusive vehicle, luxury lodge, all meals, drinks, laundry, park fees, transfers" },
  "ultra":   { perDayPP: "$1,500+",   includes: "private concession, butler service, spa, helicopter options, all-inclusive" },
};

function maxParks(days: number): number {
  if (days <= 5)  return 2;
  if (days <= 8)  return 3;
  if (days <= 12) return 4;
  return 5;
}

function buildConstrainedPrompt(userPrompt: string, extracted: ReturnType<typeof extractTripData>): string {
  const mentionedCountries = extracted.destinations.map(d => d.toLowerCase());

  let relevantParks = Object.entries(PARKS).filter(([parkName, park]) => {
    const pn = parkName.toLowerCase();
    return mentionedCountries.some(d =>
      pn.includes(d) || d.includes(pn) ||
      park.country.toLowerCase().includes(d) ||
      d.includes(park.country.toLowerCase()) ||
      park.region.toLowerCase().includes(d)
    );
  });

  if (relevantParks.length === 0) relevantParks = Object.entries(PARKS).slice(0, 8);

  const days = extracted.durationDays || 7;
  const cap = maxParks(days);
  const cappedParks = relevantParks.slice(0, cap + 2);
  const parkNames = cappedParks.map(([name]) => name);

  const relevantLodges = LODGES.filter(l => parkNames.includes(l.park));
  const tier = extracted.budgetTier || "mid-range";
  const tierMap: Record<string, string[]> = { "budget": ["budget","mid"], "mid-range": ["mid","luxury"], "luxury": ["luxury"] };
  const allowedTiers = tierMap[tier] || ["mid","luxury"];
  const tieredLodges = relevantLodges.filter(l => allowedTiers.includes(l.tier));
  const lodgesToUse = tieredLodges.length > 0 ? tieredLodges : relevantLodges;

  const relevantRoutes = ROUTES.filter(r =>
    parkNames.some(park =>
      r.from.toLowerCase().includes(park.toLowerCase()) ||
      r.to.toLowerCase().includes(park.toLowerCase()) ||
      park.toLowerCase().includes(r.from.toLowerCase()) ||
      park.toLowerCase().includes(r.to.toLowerCase())
    )
  );

  const month = extracted.month;
  const seasonalNotes: string[] = [];
  if (month) {
    SEASONALITY.forEach(s => {
      if (parkNames.some(p => p.toLowerCase().includes(s.park.toLowerCase()) || s.park.toLowerCase().includes(p.toLowerCase()))) {
        if (s.months.includes(month)) {
          seasonalNotes.push(`✓ ${s.park}: ${s.event} — ${s.description}`);
        } else {
          seasonalNotes.push(`⚠ ${s.park}: "${s.event}" does NOT occur in ${month} (best months: ${s.months.join(", ")})`);
        }
      }
    });
  }

  const pricingTier = tier === "luxury" ? PRICING.luxury : tier === "budget" ? PRICING.budget : PRICING.mid;
  const parksBlock = cappedParks.map(([name, park]) => `- ${name} (${park.country}) — ${park.highlights}`).join("\n");
  const lodgesBlock = lodgesToUse.map(l => `- ${l.name} | ${l.park} | ${l.tier} | ${l.priceRange}`).join("\n");
  const routesBlock = relevantRoutes.map(r =>
    `- ${r.from} → ${r.to}: ${r.transport}, ~${r.hours}h${r.hours > 4 ? " [LONG TRANSFER — no game drives same day]" : ""}${r.notes ? ` (${r.notes})` : ""}`
  ).join("\n");
  const seasonBlock = seasonalNotes.length > 0 ? `\nSEASONALITY FOR ${month?.toUpperCase()}:\n${seasonalNotes.join("\n")}` : "";
  const parkLimit = `For a ${days}-day safari, use a MAXIMUM of ${cap} parks. Do not exceed this.`;

  return `You are an expert African safari planner. Generate a realistic, accurate safari itinerary.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES — YOU MUST FOLLOW THESE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Use ONLY the parks listed below. Do NOT invent or add other parks.
2. Use ONLY the lodges listed below. Do NOT invent lodge names.
3. Use ONLY the travel routes listed below. Do NOT create impossible routes.
4. If a route takes >4 hours, do NOT schedule game drives on the same day.
5. Do NOT mix Kenya and Tanzania parks unless a flight transfer is explicitly included.
6. ${parkLimit}
7. Use the pricing range provided — do not invent prices outside this range.
8. Respect seasonality — do not promise migration viewing outside peak months.

APPROVED PARKS:
${parksBlock}

APPROVED LODGES (${tier} tier):
${lodgesBlock}

ALLOWED TRAVEL ROUTES:
${routesBlock}
${seasonBlock}

PRICING GUIDANCE:
Tier: ${tier} | ${pricingTier.perDayPP} per person per day
Includes: ${pricingTier.includes}
Trip length: ${days} days
${extracted.groupSize ? `Group size: ${extracted.groupSize} people` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRAVELLER REQUEST:
${userPrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now write the itinerary in this format:

## Your Safari Itinerary

### Day 1 — [Location]
[Narrative: arrival, lodge name, evening]

### Day 2 — [Park Name]
[Morning game drive, afternoon, lodge]

[Continue for all ${days} days]

## What's Included
- [based on tier above]

## Pricing
**Per person (sharing):** [from pricing guidance]
**Estimated total (${extracted.groupSize || 2} people):** [calculated]

## Best Time to Visit
[Note about ${month || "the travel period"} and wildlife]

Write in warm, expert tone. Name exact lodges and parks from the approved lists only.`;
}

// ── In-memory stores ──
const tripStore = new Map<string, any>();
const analyticsStore: any[] = [];
const leadsStore: any[] = [];
const operatorRegistry = new Map<string, any>();
const operatorApplications: any[] = [];
const recentLeadEmails = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const responseTimers = new Map<string, any>();

// ── Trip data extractor ──
function extractTripData(prompt: string) {
  const p = prompt.toLowerCase();
  const durationMatch = p.match(/(\d+)\s*(?:day|night)/);
  const durationDays = durationMatch ? parseInt(durationMatch[1]) : null;
  const budgetMatch = p.match(/\$(\d[\d,]*)/);
  const budgetUsd = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, "")) : null;
  const budgetTier = budgetUsd ? budgetUsd < 2000 ? "budget" : budgetUsd < 6000 ? "mid-range" : "luxury" : null;
  const groupMatch = p.match(/(\d+)\s*(?:people|person|traveler|traveller|adult|pax)/);
  const groupSize = groupMatch ? parseInt(groupMatch[1]) : null;
  const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const month = months.find(m => p.includes(m)) || null;
  const destKeywords = ["kenya","tanzania","south africa","botswana","rwanda","uganda","zambia","zimbabwe","namibia","ethiopia","maasai mara","serengeti","kruger","okavango","zanzibar","amboseli","ngorongoro","samburu","nakuru","tarangire"];
  const destinations = destKeywords.filter(d => p.includes(d));
  const tripType = p.includes("honeymoon") ? "honeymoon" : p.includes("family") ? "family" : p.includes("solo") ? "solo" : p.includes("group") ? "group" : "general";
  return { durationDays, budgetUsd, budgetTier, groupSize, month, destinations, destinationsStr: destinations.join(", ") || null, tripType };
}

// ── Operator scorer — only approved operators get leads ──
function scoreOperator(operator: any, lead: any): number {
  if (operator.verificationStatus !== "approved") return 0;
  const suppliers = operator.suppliers || [];
  const profile = operator.profile || {};
  let score = 0;
  const leadDests = (lead.destinations || []).map((d: string) => d.toLowerCase());
  suppliers.forEach((s: any) => {
    if (s.type === "park") { const n = s.name.toLowerCase(); if (leadDests.some(d => n.includes(d) || d.includes(n))) score += 10; }
    if (s.type === "lodge" && s.park) { const pk = s.park.toLowerCase(); if (leadDests.some(d => pk.includes(d) || d.includes(pk))) score += 5; }
  });
  const countries = (profile.countries || "").toLowerCase();
  if (leadDests.some(d => countries.includes(d))) score += 8;
  if (lead.budgetTier) {
    const tierMap: Record<string, string[]> = { luxury: ["luxury","ultra-luxury"], "mid-range": ["midrange","mid-range","mid"], budget: ["budget"] };
    const matchTiers = tierMap[lead.budgetTier] || [];
    if (suppliers.some((s: any) => s.type === "lodge" && matchTiers.some(t => (s.tier||"").toLowerCase().includes(t)))) score += 6;
  }
  if (profile.email) score += 2;
  return score;
}

// ── Email ──
async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) { console.log(`📧 [NO KEY] → ${to}: ${subject}`); return; }
  const from = process.env.EMAIL_FROM || "admin@safaripedia.com";
  try {
    const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: "Safaripedia" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });
    if (r.status === 202) {
      console.log(`📧 Sent → ${to}: ${subject}`);
    } else {
      const d = await r.json().catch(() => ({}));
      console.error("📧 SendGrid error:", r.status, JSON.stringify(d));
    }
  } catch (e) { console.error("📧 Error:", e); }
}

function leadHtml(opName: string, lead: any) {
  const rows = [["Name",lead.name||"—"],["Email",`<a href="mailto:${lead.email}">${lead.email}</a>`],["Destination",lead.destination||"—"],["Dates",lead.dates||"—"],["Travellers",lead.travelers||"—"],["Budget",lead.budget||(lead.budgetUsd?`$${lead.budgetUsd.toLocaleString()}`:"—")],["Type",lead.tripType||"—"],["Duration",lead.durationDays?`${lead.durationDays} days`:"—"],["Group",lead.groupType||"—"],["Africa Experience",lead.africaExperience||"—"],["Accommodation",lead.accommodation||"—"],["Priority",lead.tripPriority||"—"],["Must-See Animals",lead.mustSeeAnimals||"—"],["Flexible Dates",lead.flexibleDates?"Yes":"No"]];
  return `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;"><div style="background:#1a1200;padding:32px;text-align:center;"><div style="font-size:2rem;">🦁</div><h1 style="color:#d4a843;font-style:italic;font-weight:normal;margin:8px 0 4px;">New Safari Inquiry</h1><p style="color:rgba(245,234,208,0.6);font-size:0.85rem;margin:0;">via Safaripedia · matched to ${opName}</p></div><div style="padding:32px;background:#fffef9;border:1px solid #e8d9b0;"><table style="width:100%;border-collapse:collapse;font-size:0.9rem;">${rows.map(([k,v])=>`<tr style="border-bottom:1px solid #f5ead0;"><td style="padding:8px 12px;color:#8B6914;font-weight:bold;width:140px;">${k}</td><td style="padding:8px 12px;color:#333;">${v}</td></tr>`).join("")}</table>${lead.notes?`<div style="margin-top:16px;padding:12px;background:#faf6ee;border-left:3px solid #d4a843;font-size:0.88rem;color:#555;"><strong>Notes:</strong> ${lead.notes}</div>`:""}<div style="margin-top:24px;padding:16px;background:#fef9ee;border:1px solid #e8d9b0;border-radius:6px;text-align:center;"><p style="margin:0 0 8px;font-size:0.82rem;color:#666;">Reply within 48 hours or this lead will be re-routed:</p><a href="mailto:${lead.email}?subject=Re: Your Safari Inquiry" style="background:#d4a843;color:#1a1200;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Reply to ${lead.name||"Traveller"} →</a></div></div><div style="padding:16px;text-align:center;font-size:0.72rem;color:#999;">Safaripedia · 10% success fee on confirmed bookings only.</div></div>`;
}

function appReceivedHtml(a: any) {
  return `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;"><div style="background:#1a1200;padding:32px;text-align:center;"><div style="font-size:2rem;">🦁</div><h1 style="color:#d4a843;font-style:italic;font-weight:normal;">Application Received</h1></div><div style="padding:32px;background:#fffef9;border:1px solid #e8d9b0;"><p>Hi ${a.contactName},</p><p>Thank you for applying to join the Safaripedia Operator Network. We've received your application for <strong>${a.companyName}</strong> and will review it within 2–3 business days.</p><p>In the meantime, the AI Quote Generator is free to use. Once approved, you'll receive matched traveller inquiries at no upfront cost — just a 10% success fee on confirmed bookings.</p><p style="color:#8B6914;font-style:italic;">The Safaripedia Team</p></div></div>`;
}

function appAdminHtml(a: any) {
  const rows = [["Company",a.companyName],["Contact",a.contactName],["Email",a.email],["Phone",a.phone||"—"],["Website",a.website||"—"],["Countries",a.countries],["Years in Business",a.yearsInBusiness||"—"],["Reference",a.reference||"—"]];
  return `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;"><h2 style="color:#8B6914;">New Operator Application</h2><table style="width:100%;border-collapse:collapse;font-size:0.9rem;">${rows.map(([k,v])=>`<tr style="border-bottom:1px solid #eee;"><td style="padding:8px;font-weight:bold;color:#8B6914;width:160px;">${k}</td><td style="padding:8px;">${v}</td></tr>`).join("")}</table><p style="margin-top:16px;padding:12px;background:#fef9ee;border-radius:6px;font-size:0.85rem;">Approve or reject at <a href="https://safaripedia.com/admin">/admin</a></p></div>`;
}

function appDecisionHtml(a: any, decision: string) {
  const body = decision === "approved"
    ? "<p>Your application for <strong>" + a.companyName + "</strong> has been approved. You will now start receiving matched traveller inquiries. Log in to your operator portal to see your leads.</p>"
    : "<p>Unfortunately we are unable to approve your application at this time. Please contact hello@safaripedia.com if you have questions.</p>";
  const icon = decision === "approved" ? "\u{1F389}" : "\u{1F614}";
  const title = decision === "approved" ? "You're Approved!" : "Application Update";
  return `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;"><div style="background:#1a1200;padding:32px;text-align:center;"><div style="font-size:2rem;">${icon}</div><h1 style="color:#d4a843;font-style:italic;font-weight:normal;">${title}</h1></div><div style="padding:32px;background:#fffef9;border:1px solid #e8d9b0;"><p>Hi ${a.contactName},</p>${body}</div></div>`;
}

function reminderHtml(opName: string, lead: any) {
  return `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;"><div style="background:#2d1500;padding:24px;text-align:center;"><div style="font-size:1.5rem;">⏰</div><h2 style="color:#f59e0b;margin:8px 0 4px;">Lead Awaiting Response</h2></div><div style="padding:24px;background:#fffef9;border:1px solid #e8d9b0;"><p><strong>${lead.name}</strong> (${lead.email}) has been waiting 48 hours for a response about their ${lead.destination||"Africa"} safari.</p><p style="color:#f59e0b;font-weight:bold;">This lead will be re-routed to another operator if not contacted within 24 hours.</p><div style="margin-top:16px;text-align:center;"><a href="mailto:${lead.email}?subject=Re: Your Safari Inquiry" style="background:#d4a843;color:#1a1200;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Reply Now →</a></div></div></div>`;
}

// ── Response tracker — checks every 30 min ──
function startResponseTracker() {
  setInterval(async () => {
    const now = Date.now();
    for (const [leadId, timer] of responseTimers.entries()) {
      if (timer.reminded || timer.responded) continue;
      const hoursElapsed = (now - timer.assignedAt) / (1000 * 60 * 60);
      if (hoursElapsed >= 48) {
        const operator = operatorRegistry.get(timer.operatorId);
        const lead = leadsStore.find(l => l.id === leadId);
        if (!lead || lead.status !== "new") { responseTimers.delete(leadId); continue; }
        timer.reminded = true; timer.remindedAt = new Date().toISOString();
        console.log(`⏰ 48hr reminder for lead ${leadId}`);
        if (operator?.profile?.email) await sendEmail(operator.profile.email, `⏰ Reminder: ${lead.name}'s inquiry needs a response`, reminderHtml(operator.profile.companyName||"", lead));
        const ownerEmail = process.env.OWNER_EMAIL;
        if (ownerEmail) await sendEmail(ownerEmail, `⚠️ Unresponded lead: ${lead.name}`, `<p>Lead <strong>${lead.name}</strong> has not been contacted by operator ${timer.operatorId} after 48 hours. Consider re-routing.</p>`);
      }
    }
  }, 30 * 60 * 1000);
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  startResponseTracker();

  // ── Generate (with hallucination prevention) ──
  app.post(api.generate.path, async (req, res) => {
    try {
      const input = api.generate.input.parse(req.body);
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return res.status(500).json({ message: "ANTHROPIC_API_KEY not configured" });
      // Use userPrompt (clean user input) for extraction so park limits / seasonality
      // rules are based on what the user actually typed, not the composed system prompt
      const rawUserPrompt: string = (req.body as any).userPrompt || input.prompt;
      const extracted = extractTripData(rawUserPrompt);
      const constrainedPrompt = buildConstrainedPrompt(rawUserPrompt, extracted);
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system: "You are an expert African safari planner. You ONLY use real, verified parks, lodges, and routes provided to you. You NEVER invent lodge names, park names, or travel routes. You are accurate, professional, and trustworthy.",
          messages: [{ role: "user", content: constrainedPrompt }]
        })
      });
      const data = await response.json();
      if (!response.ok || data.type === "error") return res.status(500).json({ message: "Anthropic error", detail: data });
      const text = data.content[0].text;
      await storage.createGeneration({ prompt: rawUserPrompt, response: text });
      analyticsStore.push({ ...extracted, timestamp: new Date().toISOString() });
      res.status(200).json({ response: text });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Submit lead ──
  app.post("/api/lead", async (req, res) => {
    try {
      const { name, email, dates, travelers, budget, notes, prompt, itinerary, destination, groupType, africaExperience, accommodation, tripPriority, mustSeeAnimals, flexibleDates } = req.body;
      if (!name || !email) return res.status(400).json({ message: "Name and email required" });
      const emailKey = email.toLowerCase().trim();
      const lastSub = recentLeadEmails.get(emailKey);
      if (lastSub && (Date.now() - lastSub) < DUPLICATE_WINDOW_MS) {
        console.log(`🔁 Duplicate suppressed: ${email}`);
        return res.status(200).json({ success: true, duplicate: true });
      }
      recentLeadEmails.set(emailKey, Date.now());
      const extracted = extractTripData(prompt || destination || "");
      const lead: any = {
        id: `lead-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        name, email, dates, travelers, budget, notes, prompt, itinerary,
        destination: destination || extracted.destinationsStr,
        destinations: extracted.destinations,
        budgetUsd: extracted.budgetUsd, budgetTier: extracted.budgetTier,
        durationDays: extracted.durationDays, tripType: extracted.tripType,
        month: extracted.month, groupSize: extracted.groupSize,
        groupType, africaExperience, accommodation, tripPriority, mustSeeAnimals, flexibleDates,
        status: "new", timestamp: new Date().toISOString(), matchedOperatorId: null,
      };
      let bestId: string | null = null; let bestScore = 0;
      operatorRegistry.forEach((op, id) => { const s = scoreOperator(op, lead); if (s > bestScore) { bestScore = s; bestId = id; } });
      if (bestId && bestScore > 0) {
        lead.matchedOperatorId = bestId;
        const op = operatorRegistry.get(bestId)!;
        if (!op.leads) op.leads = [];
        op.leads.push(lead);
        responseTimers.set(lead.id, { operatorId: bestId, assignedAt: Date.now(), reminded: false });
        console.log(`✅ Lead ${lead.id} → operator ${bestId} (score: ${bestScore})`);
        if (op.profile?.email) await sendEmail(op.profile.email, `🦁 New Safari Inquiry — ${lead.name} · ${lead.destination||"Africa"}`, leadHtml(op.profile.companyName||"Operator", lead));
      } else {
        console.log(`⚠️ No approved operator match for ${lead.id}`);
        const ownerEmail = process.env.OWNER_EMAIL;
        if (ownerEmail) await sendEmail(ownerEmail, `⚠️ Unmatched lead: ${lead.name}`, leadHtml("Safaripedia (unmatched)", lead));
      }
      leadsStore.push(lead);
      res.status(200).json({ success: true, matched: !!bestId });
    } catch (err) {
      console.error("Lead error:", err);
      res.status(500).json({ message: "Failed to save lead" });
    }
  });

  // ── Operator application ──
  app.post("/api/operator/apply", async (req, res) => {
    try {
      const { companyName, contactName, email, phone, website, countries, yearsInBusiness, reference, operatorId } = req.body;
      if (!companyName || !contactName || !email || !countries) return res.status(400).json({ message: "Required fields missing" });
      const existing = operatorApplications.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (existing) return res.status(200).json({ success: true, alreadyApplied: true, status: existing.status });
      const application = { id: `app-${Date.now()}`, operatorId: operatorId||null, companyName, contactName, email, phone, website, countries, yearsInBusiness, reference, status: "pending", submittedAt: new Date().toISOString() };
      operatorApplications.push(application);
      if (operatorId) {
        const ex = operatorRegistry.get(operatorId) || { leads: [] };
        operatorRegistry.set(operatorId, { ...ex, verificationStatus: "pending", applicationId: application.id });
      }
      await sendEmail(email, "Your Safaripedia Operator Application", appReceivedHtml(application));
      const ownerEmail = process.env.OWNER_EMAIL;
      if (ownerEmail) await sendEmail(ownerEmail, `📋 New Operator Application: ${companyName}`, appAdminHtml(application));
      res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ message: "Application failed" }); }
  });

  // ── Admin: list applications ──
  app.get("/api/operator/applications", async (req, res) => {
    res.status(200).json({ applications: operatorApplications });
  });

  // ── Admin: approve/reject ──
  app.post("/api/operator/applications/:id/decision", async (req, res) => {
    try {
      const { decision } = req.body;
      const application = operatorApplications.find(a => a.id === req.params.id);
      if (!application) return res.status(404).json({ message: "Not found" });
      application.status = decision; application.decidedAt = new Date().toISOString();
      if (application.operatorId) {
        const op = operatorRegistry.get(application.operatorId) || { leads: [] };
        operatorRegistry.set(application.operatorId, { ...op, verificationStatus: decision });
      }
      await sendEmail(application.email, `Safaripedia: Application ${decision}`, appDecisionHtml(application, decision));
      res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ message: "Decision failed" }); }
  });

  // ── Operator: sync ──
  app.post("/api/operator/sync", async (req, res) => {
    try {
      const { operatorId, profile, suppliers, templates } = req.body;
      if (!operatorId) return res.status(400).json({ message: "operatorId required" });
      const ex = operatorRegistry.get(operatorId) || { leads: [], verificationStatus: "none" };
      operatorRegistry.set(operatorId, { ...ex, profile: profile||ex.profile, suppliers: suppliers||ex.suppliers||[], templates: templates||ex.templates||[], updatedAt: new Date().toISOString() });
      res.status(200).json({ success: true, verificationStatus: operatorRegistry.get(operatorId)!.verificationStatus });
    } catch (err) { res.status(500).json({ message: "Sync failed" }); }
  });

  // ── Operator: status ──
  app.get("/api/operator/status/:operatorId", async (req, res) => {
    const op = operatorRegistry.get(req.params.operatorId);
    const application = operatorApplications.find(a => a.operatorId === req.params.operatorId);
    res.status(200).json({ verificationStatus: op?.verificationStatus||"none", applicationStatus: application?.status||null });
  });

  // ── Operator: leads ──
  app.get("/api/operator/leads/:operatorId", async (req, res) => {
    const op = operatorRegistry.get(req.params.operatorId);
    res.status(200).json({ leads: (op?.leads||[]).slice().reverse() });
  });

  // ── Operator: update lead status ──
  app.post("/api/operator/leads/:operatorId/:leadId/status", async (req, res) => {
    try {
      const op = operatorRegistry.get(req.params.operatorId);
      if (!op) return res.status(404).json({ message: "Operator not found" });
      const lead = (op.leads||[]).find((l: any) => l.id === req.params.leadId);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      const prev = lead.status;
      lead.status = req.body.status;
      if (req.body.bookingValue) lead.bookingValue = req.body.bookingValue;
      lead.updatedAt = new Date().toISOString();
      if (prev === "new" && req.body.status !== "new") {
        const timer = responseTimers.get(lead.id);
        if (timer) { timer.responded = true; responseTimers.delete(lead.id); }
      }
      const gl = leadsStore.find(l => l.id === lead.id);
      if (gl) { gl.status = lead.status; if (lead.bookingValue) gl.bookingValue = lead.bookingValue; }
      res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ message: "Update failed" }); }
  });

  // ── Trip sharing ──
  app.post("/api/trip", async (req, res) => {
    try {
      const { id, prompt, itinerary, costData, wildlifeData } = req.body;
      if (!id || !prompt || !itinerary) return res.status(400).json({ message: "Missing fields" });
      tripStore.set(id, { id, prompt, itinerary, costData, wildlifeData, createdAt: new Date() });
      res.status(200).json({ id });
    } catch (err) { res.status(500).json({ message: "Failed" }); }
  });

  app.get("/api/trip/:id", async (req, res) => {
    try {
      const trip = tripStore.get(req.params.id);
      if (!trip) return res.status(404).json({ message: "Not found" });
      res.status(200).json(trip);
    } catch (err) { res.status(500).json({ message: "Failed" }); }
  });

  // ── Admin: all operators ──
  app.get("/api/operators", async (req, res) => {
    try {
      const operators = [...operatorRegistry.entries()].map(([operatorId, op]) => {
        const leads = op.leads || [];
        const bookedLeads = leads.filter((l: any) => l.status === "booked");
        const totalBookingValue = bookedLeads.reduce((s: number, l: any) => s + parseFloat(l.bookingValue || 0), 0);
        return {
          operatorId,
          verificationStatus: op.verificationStatus || "none",
          profile: op.profile || {},
          supplierCount: (op.suppliers || []).length,
          templateCount: (op.templates || []).length,
          leadCount: leads.length,
          newLeads: leads.filter((l: any) => l.status === "new").length,
          contactedLeads: leads.filter((l: any) => l.status === "contacted").length,
          bookedLeads: bookedLeads.length,
          lostLeads: leads.filter((l: any) => l.status === "lost").length,
          totalBookingValue,
          totalFees: totalBookingValue * 0.1,
          suppliers: op.suppliers || [],
          templates: op.templates || [],
          updatedAt: op.updatedAt || null,
        };
      });
      res.status(200).json({ operators });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch operators" });
    }
  });

  // ── Analytics ──
  app.get("/api/analytics", async (req, res) => {
    try {
      res.status(200).json({
        totalTrips: analyticsStore.length,
        totalLeads: leadsStore.length,
        conversionRate: analyticsStore.length > 0 ? `${Math.round((leadsStore.length/analyticsStore.length)*100)}%` : "0%",
        matchedLeads: leadsStore.filter(l=>l.matchedOperatorId).length,
        unmatchedLeads: leadsStore.filter(l=>!l.matchedOperatorId).length,
        registeredOperators: operatorRegistry.size,
        approvedOperators: [...operatorRegistry.values()].filter(o=>o.verificationStatus==="approved").length,
        pendingApplications: operatorApplications.filter(a=>a.status==="pending").length,
        bookedLeads: leadsStore.filter(l=>l.status==="booked").length,
        totalBookingValue: leadsStore.filter(l=>l.bookingValue).reduce((s,l)=>s+parseFloat(l.bookingValue||0),0),
        totalFees: leadsStore.filter(l=>l.bookingValue).reduce((s,l)=>s+parseFloat(l.bookingValue||0)*0.1,0),
        overdueLeads: [...responseTimers.values()].filter(t=>!t.reminded&&(Date.now()-t.assignedAt)>48*60*60*1000).length,
        destinations: analyticsStore.reduce((acc,r)=>{ (r.destinations||[]).forEach((d: string)=>{ acc[d]=(acc[d]||0)+1; }); return acc; },{}),
        months: analyticsStore.reduce((acc,r)=>{ if(r.month) acc[r.month]=(acc[r.month]||0)+1; return acc; },{}),
        budgetTiers: analyticsStore.reduce((acc,r)=>{ if(r.budgetTier) acc[r.budgetTier]=(acc[r.budgetTier]||0)+1; return acc; },{}),
        tripTypes: analyticsStore.reduce((acc,r)=>{ if(r.tripType) acc[r.tripType]=(acc[r.tripType]||0)+1; return acc; },{}),
        groupSizes: analyticsStore.reduce((acc,r)=>{ if(r.groupSize){const k=`${r.groupSize} pax`;acc[k]=(acc[k]||0)+1;} return acc; },{}),
        durations: analyticsStore.reduce((acc,r)=>{ if(r.durationDays){const k=`${r.durationDays} days`;acc[k]=(acc[k]||0)+1;} return acc; },{}),
        avgBudget: analyticsStore.filter(r=>r.budgetUsd).length ? Math.round(analyticsStore.filter(r=>r.budgetUsd).reduce((s,r)=>s+r.budgetUsd,0)/analyticsStore.filter(r=>r.budgetUsd).length) : null,
        avgDuration: analyticsStore.filter(r=>r.durationDays).length ? Math.round(analyticsStore.filter(r=>r.durationDays).reduce((s,r)=>s+r.durationDays,0)/analyticsStore.filter(r=>r.durationDays).length) : null,
        recentTrips: analyticsStore.slice(-10).reverse(),
        recentLeads: leadsStore.slice(-20).reverse(),
        applications: operatorApplications,
      });
    } catch (err) { res.status(500).json({ message: "Analytics error" }); }
  });

  return httpServer;
}