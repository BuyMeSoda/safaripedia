import { useState, useRef, useEffect } from "react";

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
  if (!lines || !Array.isArray(lines)) return null;
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

const ANIMALS = [
  {
    emoji: "🦁", name: "Lion", slug: "lion",
    headline: "Best Places to See Lions in Africa",
    intro: "The African lion is the undisputed star of the safari — the apex predator every traveler hopes to encounter. Seeing a pride hunt at dawn or a male lion roar across the savanna is a transformative experience. These are the best parks for reliable lion sightings.",
    bestParks: [
      { name: "Maasai Mara, Kenya", reason: "One of the highest lion densities in Africa. The Mara's open plains make lions easy to spot year-round, especially around the Mara Triangle." },
      { name: "Serengeti, Tanzania", reason: "Huge prides roam the endless plains. The Seronera Valley is famous for its resident lion population and regular kills." },
      { name: "Kruger National Park, South Africa", reason: "Excellent self-drive lion sightings, particularly in the southern and central regions around Skukuza and Satara camps." },
      { name: "Ngorongoro Crater, Tanzania", reason: "The crater's enclosed ecosystem means lions are almost guaranteed. Black-maned Ngorongoro lions are genetically distinct and iconic." },
    ],
    bestTime: "Year-round. During dry season (June–October) lions are easier to spot near water sources.",
    funFact: "A lion's roar can be heard from 8km away and is used to communicate territory to other prides.",
    migrationLink: false,
  },
  {
    emoji: "🐘", name: "Elephant", slug: "elephant",
    headline: "Best Safari Destinations for Elephant Sightings",
    intro: "African elephants are the world's largest land animals and one of the most emotionally moving creatures to encounter on safari. Watching a herd of 50 elephants cross a dusty plain or a mother guide her calf through the bush is unforgettable.",
    bestParks: [
      { name: "Amboseli, Kenya", reason: "The best place on Earth to see large free-roaming elephant herds against the backdrop of Mount Kilimanjaro. Home to some of Africa's largest tuskers." },
      { name: "Chobe National Park, Botswana", reason: "The highest concentration of elephants in Africa — over 50,000. River cruises offer incredible close-up encounters." },
      { name: "Tarangire, Tanzania", reason: "During the dry season, hundreds of elephants congregate around the Tarangire River — one of Africa's great wildlife spectacles." },
      { name: "Kruger National Park, South Africa", reason: "Large elephant population throughout the park. The Olifants River area is particularly rewarding." },
    ],
    bestTime: "Dry season (June–October) when elephants congregate around water sources.",
    funFact: "Elephants can recognize themselves in mirrors, mourn their dead, and communicate using infrasound frequencies humans cannot hear.",
    migrationLink: false,
  },
  {
    emoji: "🐆", name: "Cheetah", slug: "cheetah",
    headline: "Best Safari Destinations for Cheetah Sightings",
    intro: "The cheetah is the world's fastest land animal and one of the most thrilling sights on an African safari. Witnessing a cheetah accelerate from 0 to 110km/h in pursuit of prey is one of nature's greatest spectacles — and the open savannas of East Africa offer the best chances.",
    bestParks: [
      { name: "Maasai Mara, Kenya", reason: "The open grasslands are perfect cheetah habitat. Several well-known resident females have been studied for decades and are relatively habituated to vehicles." },
      { name: "Serengeti, Tanzania", reason: "The Serengeti's vast plains offer some of Africa's best cheetah viewing, particularly in the Ndutu area during calving season (Jan–March)." },
      { name: "Kruger National Park, South Africa", reason: "Less common than in East Africa but present. The open thornveld of the northern Kruger offers the best chances." },
    ],
    bestTime: "Dry season for East Africa. Cheetahs are active in daytime, making them easier to spot than nocturnal cats.",
    funFact: "Unlike other big cats, cheetahs cannot roar — they purr, chirp, and make a distinctive high-pitched yelp.",
    migrationLink: false,
  },
  {
    emoji: "🐆", name: "Leopard", slug: "leopard",
    headline: "Where to See Leopards in Africa",
    intro: "The leopard is the most elusive of the Big Five — a master of camouflage that spends its days hidden in trees or dense bush. A leopard sighting is considered the crown jewel of safari game viewing, and these parks give you the best odds.",
    bestParks: [
      { name: "South Luangwa, Zambia", reason: "Arguably the best place in Africa to see leopards. Night drives reveal remarkably high densities of leopards hunting in the open." },
      { name: "Maasai Mara, Kenya", reason: "Several habituated leopards are regularly seen in the riverine forest along the Mara and Talek rivers." },
      { name: "Kruger National Park, South Africa", reason: "Excellent leopard sightings, especially on night drives from private lodges in the surrounding conservancies." },
      { name: "Serengeti, Tanzania", reason: "The kopje outcroppings and riverine forests harbour good leopard populations. Look up — they often drape prey over tree branches." },
    ],
    bestTime: "Year-round but dawn and dusk offer the best opportunities. Night drives dramatically increase sighting chances.",
    funFact: "Leopards are the strongest climbers of the big cats and can haul prey weighing more than themselves into trees to keep it from lions and hyenas.",
    migrationLink: false,
  },
  {
    emoji: "🦏", name: "Rhino", slug: "rhino",
    headline: "Where to See Rhinos in Africa",
    intro: "With fewer than 6,000 black rhinos remaining in the wild, a rhino sighting is both thrilling and deeply meaningful. These prehistoric-looking giants are critically endangered, and visiting the parks that protect them directly funds conservation.",
    bestParks: [
      { name: "Ngorongoro Crater, Tanzania", reason: "One of the few places to reliably see the critically endangered black rhino on foot in a natural setting. The crater's closed ecosystem protects a small but stable population." },
      { name: "Lake Nakuru, Kenya", reason: "Both black and white rhinos were successfully reintroduced here. The compact park makes sightings highly likely." },
      { name: "Kruger National Park, South Africa", reason: "South Africa holds more than 80% of the world's white rhino population. Kruger is one of the best places globally for white rhino sightings." },
      { name: "Ol Pejeta Conservancy, Kenya", reason: "A private conservancy with the largest black rhino sanctuary in East Africa. Home to the last two northern white rhinos on Earth." },
    ],
    bestTime: "Year-round. Rhinos are most active in the early morning and late afternoon.",
    funFact: "A rhino's horn is made of keratin — the same protein as human fingernails — not bone.",
    migrationLink: false,
  },
  {
    emoji: "🦌", name: "Great Migration", slug: "migration",
    headline: "The Great Migration: Ultimate Guide",
    intro: "The Great Migration is the largest overland wildlife movement on Earth — 1.5 million wildebeest, 200,000 zebras, and 500,000 gazelles completing a 1,800-mile circular journey through Tanzania's Serengeti and Kenya's Maasai Mara. It is widely considered the greatest wildlife spectacle on the planet.",
    bestParks: [
      { name: "Serengeti (South) — January to March", reason: "Calving season. Up to 500,000 wildebeest calves are born in a 3-week period. Predator action is intense as lions, cheetahs, and hyenas converge on the herds." },
      { name: "Serengeti (Central) — April to June", reason: "The herds begin moving north through the central Serengeti. Long columns of wildebeest stretch to the horizon — a humbling sight." },
      { name: "Serengeti (North) / Maasai Mara — July to October", reason: "The famous Mara River crossings. Thousands of wildebeest plunge into crocodile-filled waters in one of nature's most dramatic events. Book 12–18 months in advance." },
      { name: "Serengeti (South) — November to December", reason: "The herds return south following the rains. A quieter but beautiful time with lush green landscapes." },
    ],
    bestTime: "July–October for the famous river crossings. January–March for calving season (fewer crowds, lower prices).",
    funFact: "No single animal leads the migration. The movement is driven entirely by rainfall and grass growth — an extraordinary collective intelligence.",
    migrationLink: true,
  },
  {
    emoji: "🐃", name: "Big Five", slug: "big-five",
    headline: "Where to See the Big Five in Africa",
    intro: "The Big Five — lion, elephant, rhino, leopard, and buffalo — were originally named by big game hunters as the most dangerous animals to hunt on foot. Today they represent the ultimate safari checklist, and ticking off all five on a single trip is the holy grail of African wildlife travel.",
    bestParks: [
      { name: "Kruger National Park, South Africa", reason: "The most accessible Big Five destination. All five species are present in healthy numbers and self-drive makes it affordable. Southern and central Kruger offer the best all-round game viewing." },
      { name: "Maasai Mara, Kenya", reason: "Excellent for lion, elephant, leopard, and buffalo. Rhino are present but rare — combine with Ol Pejeta or Lake Nakuru for a full Big Five Kenya itinerary." },
      { name: "Ngorongoro Crater, Tanzania", reason: "The crater's 260 sq km ecosystem harbours all Big Five in remarkable density. Black rhino sightings here are among the most reliable in Africa." },
      { name: "Serengeti + Ngorongoro Circuit, Tanzania", reason: "The classic Tanzania circuit delivers all Big Five across multiple ecosystems. Allow 7–10 days minimum for the full circuit." },
    ],
    bestTime: "Dry season (June–October) across all destinations gives the best visibility as vegetation thins and animals concentrate near water.",
    funFact: "The African buffalo is considered the most dangerous of the Big Five — nicknamed 'the Black Death' by hunters for its unpredictable temperament and tendency to ambush.",
    migrationLink: false,
  },
];


// ── Wildlife Predictor Database ──
const PARK_WILDLIFE = {
  "maasai mara": {
    veryLikely: ["🐘 Elephant","🦒 Giraffe","🦓 Zebra","🐃 Buffalo","🦛 Hippo","🐊 Crocodile"],
    goodChance: ["🦁 Lion","🐆 Cheetah","🦌 Wildebeest","🦅 Martial Eagle"],
    possible: ["🐆 Leopard","🦍 Hyena"],
    migration: true,
  },
  "serengeti": {
    veryLikely: ["🦓 Zebra","🦒 Giraffe","🐘 Elephant","🦌 Wildebeest","🐃 Buffalo"],
    goodChance: ["🦁 Lion","🐆 Cheetah","🦍 Hyena","🦅 Vulture"],
    possible: ["🐆 Leopard","🦺 Wild Dog"],
    migration: true,
  },
  "ngorongoro": {
    veryLikely: ["🐘 Elephant","🦁 Lion","🦍 Hyena","🐃 Buffalo","🦩 Flamingo"],
    goodChance: ["🦺 Black Rhino","🦒 Giraffe","🦓 Zebra"],
    possible: ["🐆 Leopard","🦅 Martial Eagle"],
    migration: false,
  },
  "amboseli": {
    veryLikely: ["🐘 Elephant","🦒 Giraffe","🦓 Zebra","🦁 Lion"],
    goodChance: ["🐆 Cheetah","🐃 Buffalo","🦩 Crowned Crane"],
    possible: ["🐆 Leopard","🦍 Hyena"],
    migration: false,
  },
  "kruger": {
    veryLikely: ["🐘 Elephant","🦒 Giraffe","🦓 Zebra","🐃 Buffalo","🦛 Hippo"],
    goodChance: ["🦁 Lion","🐆 Leopard","🦺 Wild Dog","🦏 White Rhino"],
    possible: ["🐆 Cheetah","🦍 Hyena"],
    migration: false,
  },
  "okavango": {
    veryLikely: ["🐘 Elephant","🦛 Hippo","🐊 Crocodile","🦒 Giraffe","🐃 Buffalo"],
    goodChance: ["🦁 Lion","🐆 Leopard","🦺 Wild Dog","🦦 Lechwe"],
    possible: ["🐆 Cheetah","🦏 Rhino"],
    migration: false,
  },
  "lake nakuru": {
    veryLikely: ["🦩 Flamingo","🦏 White Rhino","🦒 Giraffe","🐃 Buffalo"],
    goodChance: ["🦁 Lion","🐆 Leopard","🦛 Hippo"],
    possible: ["🦺 Wild Dog","🦅 African Fish Eagle"],
    migration: false,
  },
  "tarangire": {
    veryLikely: ["🐘 Elephant","🦒 Giraffe","🦓 Zebra","🐃 Buffalo"],
    goodChance: ["🦁 Lion","🐆 Leopard","🦺 Wild Dog"],
    possible: ["🐆 Cheetah","🦍 Hyena"],
    migration: false,
  },
  "zanzibar": {
    veryLikely: ["🐬 Dolphin","🐢 Sea Turtle","🦎 Red Colobus Monkey"],
    goodChance: ["🦈 Whale Shark","🐠 Tropical Fish"],
    possible: ["🦀 Coconut Crab"],
    migration: false,
  },
};

function detectWildlife(itineraryText: string, userPrompt: string) {
  const combined = (itineraryText + " " + userPrompt).toLowerCase();
  const matched: typeof PARK_WILDLIFE[string][] = [];
  let hasMigration = false;

  for (const [park, data] of Object.entries(PARK_WILDLIFE)) {
    if (combined.includes(park)) {
      matched.push(data);
      if (data.migration) hasMigration = true;
    }
  }

  if (matched.length === 0) return null;

  const merge = (key: "veryLikely" | "goodChance" | "possible") =>
    [...new Set(matched.flatMap(m => m[key]))];

  return {
    veryLikely: merge("veryLikely"),
    goodChance: merge("goodChance"),
    possible: merge("possible"),
    hasMigration,
  };
}

export default function Safaripedia() {
  const [tab, setTab] = useState("plan");
  const [dest, setDest] = useState(null);
  const [guide, setGuide] = useState(null);
  const [animal, setAnimal] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState(null);
  const [showLead, setShowLead] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", dates: "", travelers: "", budget: "", notes: "" });
  const [leadStep, setLeadStep] = useState(1);
  const [leadProfile, setLeadProfile] = useState({
    travelStyle: "", accommodation: "", mustSeeAnimals: [] as string[],
    africaExperience: "", fitnessLevel: "", tripPriority: "",
    flexibleDates: false, groupType: "",
  });
  const [costData, setCostData] = useState(null);
  const [wildlifeData, setWildlifeData] = useState(null);
  const [shareId, setShareId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sharedTrip, setSharedTrip] = useState(null);
  const [sharedTripLoading, setSharedTripLoading] = useState(false);
  const [sharedTripError, setSharedTripError] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "true");
  const [adminPwInput, setAdminPwInput] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);
  const [operatorForm, setOperatorForm] = useState({ client: "", days: "", destination: "", budget: "", month: "", groupSize: "", tripType: "general", notes: "", companyName: "", companyEmail: "", companyPhone: "", companyWebsite: "", lodgeTier: "mid-range lodges", currency: "USD", preferredLodges: "", lodgeMode: "ai" as "ai" | "freetext" | "perday", templateId: "" });
  const [perDayLodges, setPerDayLodges] = useState<string[]>([]);
  const [operatorResult, setOperatorResult] = useState(null);
  const [operatorLoading, setOperatorLoading] = useState(false);
  const [operatorError, setOperatorError] = useState(null);
  const [operatorLoggedIn, setOperatorLoggedIn] = useState(() => sessionStorage.getItem("op_auth") === "true");
  const [operatorPassword, setOperatorPassword] = useState("");
  const [operatorPasswordError, setOperatorPasswordError] = useState("");
  const [operatorPortalTab, setOperatorPortalTab] = useState("quote");
  // Stable operator ID — persists for session, identifies this operator in the registry
  const [operatorId] = useState(() => {
    const stored = sessionStorage.getItem("op_id");
    if (stored) return stored;
    const id = `op-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("op_id", id);
    return id;
  });
  const [opProfile, setOpProfile] = useState({ companyName: "", email: "", phone: "", website: "", countries: "", currency: "USD", vehicle: "", tagline: "" });
  const [opProfileSaved, setOpProfileSaved] = useState(false);
  const [opSuppliers, setOpSuppliers] = useState<any[]>([]);
  const [newSupplier, setNewSupplier] = useState({ type: "lodge", name: "", park: "", tier: "luxury", priceRange: "", region: "" });
  const [opTemplates, setOpTemplates] = useState<any[]>([]);
  const [newTemplate, setNewTemplate] = useState({ name: "", days: "7", destination: "", route: Array(7).fill("") });
  const [opLeads, setOpLeads] = useState<any[]>([]);
  const [opLeadsLoading, setOpLeadsLoading] = useState(false);
  const [bookingModal, setBookingModal] = useState<any>(null);
  const [bookingValue, setBookingValue] = useState("");
  const [opVerificationStatus, setOpVerificationStatus] = useState("none"); // none | pending | approved | rejected
  const [opApplicationSubmitted, setOpApplicationSubmitted] = useState(false);
  const [opApplication, setOpApplication] = useState({ companyName: "", contactName: "", email: "", phone: "", website: "", countries: "", yearsInBusiness: "", reference: "" });
  const [opApplicationError, setOpApplicationError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const resultRef = useRef(null);

  // On mount, check URL for /trip/:id or /admin
  useEffect(() => {
    const path = window.location.pathname;
    const tripMatch = path.match(/^\/trip\/(.+)$/);
    if (tripMatch) {
      const tripId = tripMatch[1];
      setSharedTripLoading(true);
      fetch(`/api/trip/${tripId}`)
        .then(r => r.json())
        .then(data => {
          if (data.itinerary) setSharedTrip(data);
          else setSharedTripError("Trip not found.");
        })
        .catch(() => setSharedTripError("Failed to load trip."))
        .finally(() => setSharedTripLoading(false));
    }
    if (path === "/admin") {
      setAdminLoading(true);
      fetch("/api/analytics")
        .then(r => r.json())
        .then(data => setAdminData(data))
        .catch(() => setAdminData({ error: "Failed to load analytics." }))
        .finally(() => setAdminLoading(false));
    }
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/operator") {
      fetch(`/api/operator/status/${operatorId}`)
        .then(r => r.json())
        .then(d => { if (d.verificationStatus) setOpVerificationStatus(d.verificationStatus); })
        .catch(() => {});
    }
  }, [operatorId]);

  function nav(t) { setTab(t); setDest(null); setGuide(null); setAnimal(null); }

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true); setError(null); setResult(null); setShowLead(false); setLeadDone(false); setCostData(null); setWildlifeData(null); setShareId(null); setCopied(false); setLoadingStage(1);
    try {
      // Generate itinerary
      setLoadingStage(1);
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
      const wildlife = detectWildlife(text, prompt);
      setWildlifeData(wildlife);
      // Generate shareable slug from prompt
      const slug = prompt.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .split(/\s+/)
        .slice(0, 6)
        .join("-");
      const id = `${slug}-${Math.random().toString(36).slice(2, 7)}`;
      setShareId(id);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      setLoadingStage(2);
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
      let parsedCost = null;
      try {
        parsedCost = JSON.parse(costText.replace(/```json|```/g, "").trim());
        setCostData(parsedCost);
      } catch { /* silently skip if parse fails */ }

      setLoadingStage(3);
      // Save trip to database for sharing
      try {
        await fetch("/api/trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            prompt,
            itinerary: text,
            costData: parsedCost,
            wildlifeData: wildlife,
          }),
        });
      } catch { /* non-critical, sharing still shows URL */ }
    } catch {
      setError("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  // ── ADMIN DASHBOARD ──
  if (window.location.pathname === "/admin") {

    // ── PASSWORD GATE ──
    if (!adminAuthed) return (
      <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "360px", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>🦁</div>
            <div style={{ fontStyle: "italic", fontSize: "1.8rem", color: G, marginBottom: "0.3rem" }}>Safaripedia</div>
            <div style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED }}>Admin Dashboard</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem" }}>
            <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>Password</label>
            <input
              type="password"
              value={adminPwInput}
              onChange={e => { setAdminPwInput(e.target.value); setAdminPwError(false); }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  if (adminPwInput === (import.meta.env.VITE_ADMIN_PASSWORD || "ADMIN2025")) {
                    sessionStorage.setItem("admin_auth", "true");
                    setAdminAuthed(true);
                  } else {
                    setAdminPwError(true);
                    setAdminPwInput("");
                  }
                }
              }}
              placeholder="Enter admin password"
              autoFocus
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${adminPwError ? "rgba(248,113,113,0.5)" : "rgba(212,168,67,0.2)"}`, borderRadius: "8px", padding: "0.75rem 0.9rem", color: TEXT, fontSize: "0.9rem", fontFamily: FONT, outline: "none", boxSizing: "border-box" as const, marginBottom: "0.8rem" }}
            />
            {adminPwError && <p style={{ color: "#f87171", fontSize: "0.78rem", fontStyle: "italic", marginBottom: "0.8rem" }}>Incorrect password</p>}
            <button
              onClick={() => {
                if (adminPwInput === (import.meta.env.VITE_ADMIN_PASSWORD || "ADMIN2025")) {
                  sessionStorage.setItem("admin_auth", "true");
                  setAdminAuthed(true);
                } else {
                  setAdminPwError(true);
                  setAdminPwInput("");
                }
              }}
              style={{ width: "100%", background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.9rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>
              Enter →
            </button>
          </div>
        </div>
      </div>
    );

    if (adminLoading) return (
      <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📊</div>
          <p style={{ color: MUTED, fontStyle: "italic" }}>Loading analytics…</p>
        </div>
      </div>
    );

    const d = adminData || {};
    const destEntries = Object.entries(d.destinations || {}).sort((a: any, b: any) => b[1] - a[1]);
    const monthEntries = Object.entries(d.months || {}).sort((a: any, b: any) => b[1] - a[1]);
    const budgetEntries = Object.entries(d.budgetTiers || {}).sort((a: any, b: any) => b[1] - a[1]);
    const typeEntries = Object.entries(d.tripTypes || {}).sort((a: any, b: any) => b[1] - a[1]);
    const maxDest = Math.max(...destEntries.map((e: any) => e[1]), 1);
    const maxMonth = Math.max(...monthEntries.map((e: any) => e[1]), 1);

    const StatCard = ({ emoji, label, value, sub = "" }: any) => (
      <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>{emoji}</div>
        <div style={{ fontSize: "2rem", color: G, fontWeight: "bold", fontFamily: FONT }}>{value ?? "—"}</div>
        <div style={{ fontSize: "0.75rem", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.3rem" }}>{label}</div>
        {sub && <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: "0.3rem", fontStyle: "italic" }}>{sub}</div>}
      </div>
    );

    const BarChart = ({ entries, max, color = G }: any) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {entries.length === 0 && <p style={{ color: MUTED, fontSize: "0.82rem", fontStyle: "italic" }}>No data yet</p>}
        {entries.map(([label, count]: any) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.82rem", color: TEXT, textTransform: "capitalize" }}>{label}</span>
              <span style={{ fontSize: "0.82rem", color: G, fontWeight: "bold" }}>{count}</span>
            </div>
            <div style={{ height: "6px", background: "rgba(212,168,67,0.1)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round((count / max) * 100)}%`, background: `linear-gradient(90deg, ${color}, rgba(212,168,67,0.5))`, borderRadius: "3px", transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }} />

        {/* Admin Nav */}
        <nav className="r-nav-main" style={{ position: "relative", zIndex: 10, borderBottom: `1px solid ${BORDER}`, padding: "1.2rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🦁</span>
            <span style={{ fontStyle: "italic", fontSize: "1.3rem", color: G }}>Safaripedia</span>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, background: "rgba(212,168,67,0.08)", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "0.2rem 0.7rem", marginLeft: "0.5rem" }}>Admin</span>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={() => { window.location.href = "/"; }} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>← Back to App</button>
            <button onClick={() => { sessionStorage.removeItem("admin_auth"); setAdminAuthed(false); }} style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: "8px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>Sign Out</button>
          </div>
        </nav>

        <div className="r-section" style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem 6rem" }}>

          {/* Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h1 className="r-heading-lg" style={{ fontStyle: "italic", fontSize: "2rem", color: TEXT, fontWeight: "normal", marginBottom: "0.4rem" }}>Analytics Dashboard</h1>
            <p style={{ color: MUTED, fontSize: "0.88rem" }}>Real-time safari demand data from every itinerary generated.</p>
          </div>

          {/* Top stat cards */}
          <div className="r-grid-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
            <StatCard emoji="✈️" label="Total Trips" value={d.totalTrips ?? 0} />
            <StatCard emoji="🎯" label="Total Leads" value={d.totalLeads ?? 0} />
            <StatCard emoji="📈" label="Conversion" value={d.conversionRate ?? "0%"} sub="itinerary → lead" />
            <StatCard emoji="💰" label="Avg Budget" value={d.avgBudget ? `$${d.avgBudget.toLocaleString()}` : "—"} sub="per person USD" />
            <StatCard emoji="📅" label="Avg Duration" value={d.avgDuration ? `${d.avgDuration}d` : "—"} sub="days" />
            <StatCard emoji="🌍" label="Top Destination" value={destEntries[0] ? destEntries[0][0] : "—"} sub={destEntries[0] ? `${destEntries[0][1]} trips` : ""} />
          </div>
          {/* Marketplace metrics */}
          <div className="r-grid-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            <StatCard emoji="🏕️" label="Operators" value={d.approvedOperators ?? 0} sub={`${d.pendingApplications ?? 0} pending`} />
            <StatCard emoji="✅" label="Matched Leads" value={d.matchedLeads ?? 0} sub={`${d.unmatchedLeads ?? 0} unmatched`} />
            <StatCard emoji="🎉" label="Booked" value={d.bookedLeads ?? 0} sub="confirmed" />
            <StatCard emoji="💵" label="Booking Value" value={d.totalBookingValue ? `$${Math.round(d.totalBookingValue).toLocaleString()}` : "—"} sub="total confirmed" />
            <StatCard emoji="🏦" label="Your Fees" value={d.totalFees ? `$${Math.round(d.totalFees).toLocaleString()}` : "—"} sub="10% of bookings" />
            <StatCard emoji="⏰" label="Overdue" value={d.overdueLeads ?? 0} sub="48hr+ no response" />
          </div>

          {/* Charts row */}
          <div className="r-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

            {/* Destinations */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", marginBottom: "1.2rem" }}>🗺️ Top Destinations</h3>
              <BarChart entries={destEntries.slice(0, 8)} max={maxDest} />
            </div>

            {/* Months */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", marginBottom: "1.2rem" }}>📅 Travel Months</h3>
              <BarChart entries={monthEntries} max={maxMonth} color="#86efac" />
            </div>

          </div>

          <div className="r-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

            {/* Budget tiers */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", marginBottom: "1.2rem" }}>💰 Budget Tiers</h3>
              <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                {budgetEntries.length === 0 && <p style={{ color: MUTED, fontSize: "0.82rem", fontStyle: "italic" }}>No data yet</p>}
                {budgetEntries.map(([tier, count]: any) => (
                  <div key={tier} style={{ flex: 1, minWidth: "80px", background: "rgba(212,168,67,0.06)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: G }}>{count}</div>
                    <div style={{ fontSize: "0.75rem", color: MUTED, textTransform: "capitalize", marginTop: "0.3rem" }}>{tier}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trip types */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", marginBottom: "1.2rem" }}>👥 Trip Types</h3>
              <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                {typeEntries.length === 0 && <p style={{ color: MUTED, fontSize: "0.82rem", fontStyle: "italic" }}>No data yet</p>}
                {typeEntries.map(([type, count]: any) => (
                  <div key={type} style={{ flex: 1, minWidth: "80px", background: "rgba(212,168,67,0.06)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: G }}>{count}</div>
                    <div style={{ fontSize: "0.75rem", color: MUTED, textTransform: "capitalize", marginTop: "0.3rem" }}>{type}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recent trips table */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem" }}>
            <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", marginBottom: "1.2rem" }}>🕐 Recent Trips</h3>
            {(!d.recentTrips || d.recentTrips.length === 0) && (
              <p style={{ color: MUTED, fontSize: "0.82rem", fontStyle: "italic" }}>No trips generated yet. Go plan some safaris!</p>
            )}
            {d.recentTrips && d.recentTrips.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Time", "Destinations", "Month", "Duration", "Budget", "Type", "Group"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.8rem", color: MUTED, fontWeight: "normal", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.recentTrips.map((trip: any, i: number) => (
                      <tr key={i} style={{ borderBottom: `1px solid rgba(212,168,67,0.05)` }}>
                        <td style={{ padding: "0.6rem 0.8rem", color: MUTED }}>{new Date(trip.timestamp).toLocaleTimeString()}</td>
                        <td style={{ padding: "0.6rem 0.8rem", color: TEXT, textTransform: "capitalize" }}>{trip.destinations || "—"}</td>
                        <td style={{ padding: "0.6rem 0.8rem", color: TEXT, textTransform: "capitalize" }}>{trip.month || "—"}</td>
                        <td style={{ padding: "0.6rem 0.8rem", color: TEXT }}>{trip.durationDays ? `${trip.durationDays}d` : "—"}</td>
                        <td style={{ padding: "0.6rem 0.8rem", color: G, fontWeight: "bold" }}>{trip.budgetUsd ? `$${trip.budgetUsd.toLocaleString()}` : "—"}</td>
                        <td style={{ padding: "0.6rem 0.8rem", color: TEXT, textTransform: "capitalize" }}>{trip.tripType || "—"}</td>
                        <td style={{ padding: "0.6rem 0.8rem", color: TEXT }}>{trip.groupSize || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Group size + Duration row */}
          <div className="r-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", marginBottom: "1.2rem" }}>👥 Group Sizes</h3>
              <BarChart entries={Object.entries(d.groupSizes || {}).sort((a: any, b: any) => b[1] - a[1])} max={Math.max(...Object.values(d.groupSizes || {1: 1}).map((v: any) => v), 1)} color="#c084fc" />
            </div>
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", marginBottom: "1.2rem" }}>📆 Trip Durations</h3>
              <BarChart entries={Object.entries(d.durations || {}).sort((a: any, b: any) => parseInt(a[0]) - parseInt(b[0]))} max={Math.max(...Object.values(d.durations || {1: 1}).map((v: any) => v), 1)} color="#38bdf8" />
            </div>
          </div>

          {/* Leads table */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.2rem" }}>
              <h3 style={{ fontStyle: "italic", color: G, fontSize: "1rem", fontWeight: "normal", margin: 0 }}>🎯 Leads — Operator Quote Requests</h3>
              {d.totalLeads > 0 && <span style={{ background: "rgba(212,168,67,0.1)", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "0.15rem 0.7rem", fontSize: "0.7rem", color: G }}>{d.totalLeads} total</span>}
            </div>
            {(!d.recentLeads || d.recentLeads.length === 0) ? (
              <p style={{ color: MUTED, fontSize: "0.82rem", fontStyle: "italic" }}>No leads yet. They will appear here when users submit the quote form.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Time", "Name", "Email", "Dates", "Travelers", "Budget", "Notes"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.8rem", color: MUTED, fontWeight: "normal", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.recentLeads.map((lead: any, i: number) => (
                      <tr key={i} style={{ borderBottom: `1px solid rgba(212,168,67,0.05)` }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(212,168,67,0.03)"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                        <td style={{ padding: "0.7rem 0.8rem", color: MUTED, whiteSpace: "nowrap" }}>{new Date(lead.timestamp).toLocaleString()}</td>
                        <td style={{ padding: "0.7rem 0.8rem", color: TEXT, fontWeight: "bold" }}>{lead.name}</td>
                        <td style={{ padding: "0.7rem 0.8rem" }}><a href={`mailto:${lead.email}`} style={{ color: G, textDecoration: "none" }}>{lead.email}</a></td>
                        <td style={{ padding: "0.7rem 0.8rem", color: TEXT }}>{lead.dates || "—"}</td>
                        <td style={{ padding: "0.7rem 0.8rem", color: TEXT }}>{lead.travelers || "—"}</td>
                        <td style={{ padding: "0.7rem 0.8rem", color: G, fontWeight: "bold" }}>{lead.budget || "—"}</td>
                        <td style={{ padding: "0.7rem 0.8rem", color: MUTED, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Operator Applications */}
          {d.applications && d.applications.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h2 style={{ fontStyle: "italic", color: G, fontSize: "1.1rem", fontWeight: "normal", marginBottom: "1rem" }}>
                Operator Applications {d.pendingApplications > 0 && <span style={{ fontSize: "0.75rem", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b", borderRadius: "20px", padding: "0.15rem 0.6rem", marginLeft: "0.5rem" }}>{d.pendingApplications} pending</span>}
              </h2>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.8rem" }}>
                {d.applications.map((app: any) => (
                  <div key={app.id} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${app.status === "pending" ? "rgba(245,158,11,0.4)" : BORDER}`, borderRadius: "10px", padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.3rem" }}>
                        <span style={{ color: TEXT, fontWeight: "bold" }}>{app.companyName}</span>
                        <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: app.status === "pending" ? "#f59e0b" : app.status === "approved" ? "#86efac" : "#f87171", background: "rgba(212,168,67,0.08)", border: `1px solid rgba(212,168,67,0.2)`, borderRadius: "20px", padding: "0.15rem 0.6rem" }}>{app.status}</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: MUTED }}>{app.contactName} · <a href={`mailto:${app.email}`} style={{ color: G, textDecoration: "none" }}>{app.email}</a></div>
                      <div style={{ fontSize: "0.78rem", color: MUTED, marginTop: "2px" }}>Countries: {app.countries} · {app.yearsInBusiness ? `${app.yearsInBusiness} yrs` : ""} {app.website ? `· ${app.website}` : ""}</div>
                    </div>
                    {app.status === "pending" && (
                      <div style={{ display: "flex", gap: "0.6rem" }}>
                        <button onClick={async () => {
                          await fetch(`/api/operator/applications/${app.id}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision: "approved" }) });
                          setAdminLoading(true); fetch("/api/analytics").then(r=>r.json()).then(data=>setAdminData(data)).finally(()=>setAdminLoading(false));
                        }} style={{ background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.3)", color: "#86efac", borderRadius: "6px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>✓ Approve</button>
                        <button onClick={async () => {
                          await fetch(`/api/operator/applications/${app.id}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision: "rejected" }) });
                          setAdminLoading(true); fetch("/api/analytics").then(r=>r.json()).then(data=>setAdminData(data)).finally(()=>setAdminLoading(false));
                        }} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: "6px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>✕ Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh button */}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button onClick={() => {
              setAdminLoading(true);
              fetch("/api/analytics").then(r => r.json()).then(data => setAdminData(data)).finally(() => setAdminLoading(false));
            }} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.5rem 1.5rem", fontSize: "0.8rem", fontFamily: FONT, cursor: "pointer" }}>
              ↻ Refresh Data
            </button>
          </div>

        </div>
      </div>
    );
  }


  // ── OPERATOR PORTAL ──
  if (window.location.pathname === "/operator") {

    // ── LOGIN GATE ──
    if (!operatorLoggedIn) return (
      <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }} />
        <nav style={{ position: "relative", zIndex: 10, borderBottom: `1px solid ${BORDER}`, padding: "1.2rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🦁</span>
            <span style={{ fontStyle: "italic", fontSize: "1.3rem", color: G }}>Safaripedia</span>
          </div>
          <button onClick={() => { window.location.href = "/"; }} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>← Back to App</button>
        </nav>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
          <div style={{ width: "100%", maxWidth: "420px", padding: "0 2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🦁</div>
              <h1 style={{ fontStyle: "italic", fontSize: "2rem", color: TEXT, fontWeight: "normal", marginBottom: "0.5rem" }}>Operator Portal</h1>
              <p style={{ color: MUTED, fontSize: "0.88rem" }}>AI-powered safari proposal engine for travel professionals.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem" }}>
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: MUTED, marginBottom: "0.5rem" }}>Access Password</label>
                <input type="password" value={operatorPassword}
                  onChange={e => { setOperatorPassword(e.target.value); setOperatorPasswordError(""); }}
                  onKeyDown={e => { if (e.key === "Enter") { if (operatorPassword === "SAFARI2025") { sessionStorage.setItem("op_auth", "true"); setOperatorLoggedIn(true); } else setOperatorPasswordError("Incorrect password. Contact us to get access."); }}}
                  placeholder="Enter your operator password"
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${operatorPasswordError ? "#f87171" : "rgba(212,168,67,0.2)"}`, borderRadius: "6px", padding: "0.75rem 1rem", color: TEXT, fontSize: "0.88rem", fontFamily: FONT, outline: "none", boxSizing: "border-box" as const }} />
                {operatorPasswordError && <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "0.4rem", fontStyle: "italic" }}>{operatorPasswordError}</p>}
              </div>
              <button onClick={() => { if (operatorPassword === "SAFARI2025") { sessionStorage.setItem("op_auth", "true"); setOperatorLoggedIn(true); } else setOperatorPasswordError("Incorrect password. Contact us to get access."); }}
                style={{ width: "100%", background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.9rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>
                Access Portal →
              </button>
              <div style={{ marginTop: "1.5rem", paddingTop: "1.2rem", borderTop: `1px solid ${BORDER}`, textAlign: "center" }}>
                <p style={{ color: MUTED, fontSize: "0.78rem" }}>Don't have access yet?</p>
                <a href="mailto:hello@safaripedia.com" style={{ color: G, fontSize: "0.82rem", textDecoration: "none" }}>Contact us to get operator access →</a>
              </div>
            </div>
            <div className="r-grid-3" style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem", textAlign: "center" }}>
              {[["⚡", "30 seconds", "per proposal"], ["🏕️", "Your lodges", "only"], ["📄", "PDF ready", "to send"]].map(([icon, title, sub]) => (
                <div key={title} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1rem 0.5rem" }}>
                  <div style={{ fontSize: "1.3rem", marginBottom: "0.3rem" }}>{icon}</div>
                  <div style={{ fontSize: "0.8rem", color: TEXT }}>{title}</div>
                  <div style={{ fontSize: "0.7rem", color: MUTED }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    // ── PORTAL SHELL ──
    const opTab = operatorPortalTab;
    const setOpTab = setOperatorPortalTab;
    const fieldStyle = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "6px", padding: "0.65rem 0.9rem", color: TEXT, fontSize: "0.88rem", fontFamily: FONT, outline: "none", boxSizing: "border-box" as const };
    const labelStyle = { display: "block" as const, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: MUTED, marginBottom: "0.4rem" };
    const sectionLabel = (text: string) => <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: G, marginBottom: "0.8rem", marginTop: "0.5rem", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.4rem" }}>{text}</div>;
    const card = (children: any, extra?: any) => <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", ...extra }}>{children}</div>;

    // ── GENERATE QUOTE FUNCTION ──
    async function generateOperatorQuote() {
      const { client, days, destination, budget, month, groupSize, tripType, notes, currency } = operatorForm;
      if (!days || !destination) { setOperatorError("Please enter trip length and destination."); return; }
      setOperatorLoading(true); setOperatorError(null); setOperatorResult(null);

      // Build supplier context from saved DB
      const supplierParks = opSuppliers.filter(s => s.type === "park").map(s => `- ${s.name}${s.region ? ` (${s.region})` : ""}`).join("\n") || null;
      const supplierLodges = opSuppliers.filter(s => s.type === "lodge");
      const luxLodges = supplierLodges.filter(s => s.tier === "luxury").map(s => `- ${s.name}${s.park ? ` (${s.park})` : ""}${s.priceRange ? ` ~$${s.priceRange}/night` : ""}`).join("\n");
      const midLodges = supplierLodges.filter(s => s.tier === "midrange").map(s => `- ${s.name}${s.park ? ` (${s.park})` : ""}${s.priceRange ? ` ~$${s.priceRange}/night` : ""}`).join("\n");
      const budLodges = supplierLodges.filter(s => s.tier === "budget").map(s => `- ${s.name}${s.park ? ` (${s.park})` : ""}${s.priceRange ? ` ~$${s.priceRange}/night` : ""}`).join("\n");
      const airlines = opSuppliers.filter(s => s.type === "airline").map(s => `- ${s.name}`).join("\n") || null;
      const guides = opSuppliers.filter(s => s.type === "guide").map(s => `- ${s.name}`).join("\n") || null;

      // Find matching template
      const matchingTemplate = opTemplates.find(t =>
        t.days === days && destination.toLowerCase().includes(t.destination?.toLowerCase() || "___")
      ) || opTemplates.find(t => t.days === days) || null;

      const supplierBlock = opSuppliers.length > 0 ? `
CRITICAL SUPPLIER RULES — YOU MUST FOLLOW THESE EXACTLY:
- Use ONLY the parks and lodges listed below. Do NOT invent, substitute, or suggest any lodge not on this list.
- If a park or lodge is not listed, do not include it.
${supplierParks ? `\nAPPROVED PARKS:\n${supplierParks}` : ""}
${luxLodges ? `\nAPPROVED LUXURY LODGES:\n${luxLodges}` : ""}
${midLodges ? `\nAPPROVED MID-RANGE LODGES:\n${midLodges}` : ""}
${budLodges ? `\nAPPROVED BUDGET LODGES:\n${budLodges}` : ""}
${airlines ? `\nAPPROVED FLIGHT OPERATORS:\n${airlines}` : ""}
${guides ? `\nAPPROVED GUIDES:\n${guides}` : ""}` : `
Use appropriate lodges for a ${operatorForm.lodgeTier || "mid-range"} trip.`;

      const templateBlock = matchingTemplate ? `
ITINERARY TEMPLATE — follow this routing exactly:
${matchingTemplate.days} Day ${matchingTemplate.destination || destination}
${matchingTemplate.route.map((r: any, i: number) => `Day ${i + 1}: ${r}`).join("\n")}` : "";

      const prompt = `You are a professional safari proposal writer for tour operators. Generate a detailed, client-ready safari proposal.

${supplierBlock}
${templateBlock}

Format EXACTLY as follows:

## Proposed Itinerary

### Day 1 — [Title]
[Detailed description using ONLY approved lodges and parks. Mention the specific lodge by name.]

[Continue for ALL days]

## What's Included
- All accommodation as specified
- [item]
- [item]
- [item]
- [item]

## What's Not Included
- International flights
- [item]
- [item]

## Pricing Estimate
**Per Person (sharing):** ${currency || "USD"} [low] – [high]
**Single Supplement:** ${currency || "USD"} [amount]
**Total for Group of ${groupSize || 2}:** ${currency || "USD"} [total low] – [total high]

## Important Notes
- [visa/health note]
- [packing note]
- [wildlife note for ${month || "the season"}]

## Why This Safari
[3 sentences explaining why this is perfect for this client]

Client: ${client || "Valued Client"}
Trip length: ${days} days
Destination: ${destination}
Budget per person: ${budget || "flexible"} ${currency || "USD"}
Travel month: ${month || "flexible"}
Group size: ${groupSize || "2"} people
Trip type: ${tripType}
Special notes: ${notes || "none"}

Keep tone professional and inspiring. Write as if from the operator to their client.`;

      try {
        const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
        const data = await res.json();
        if (data.response) setOperatorResult(data.response);
        else setOperatorError("Failed to generate proposal. Please try again.");
      } catch { setOperatorError("Failed to generate. Please try again."); }
      finally { setOperatorLoading(false); }
    }

    // ── DOWNLOAD PROPOSAL ──
    function downloadProposal() {
      if (!operatorResult) return;
      const { client, days, destination, month, currency } = operatorForm;
      const companyName = opProfile.companyName;
      const companyEmail = opProfile.email;
      const companyPhone = opProfile.phone;
      const companyWebsite = opProfile.website;
      const tripTitle = `${days}-Day ${destination} Safari`;
      const clientName = client || "Valued Client";
      const today = new Date();
      const validUntil = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

      const lines = operatorResult.split("\n");
      let bodyHtml = "";
      let inList = false;
      lines.forEach(line => {
        const t = line.trim();
        if (!t) { if (inList) { bodyHtml += "</ul>"; inList = false; } bodyHtml += "<div style='height:8px'></div>"; return; }
        if (t.startsWith("## ")) { if (inList) { bodyHtml += "</ul>"; inList = false; } bodyHtml += `<h2 style="color:#8B6914;font-size:1.15rem;font-weight:normal;font-style:italic;margin:2rem 0 0.6rem;padding-bottom:6px;border-bottom:1px solid #e8d9b0;">${t.slice(3)}</h2>`; return; }
        if (t.startsWith("### ")) { if (inList) { bodyHtml += "</ul>"; inList = false; } bodyHtml += `<h3 style="color:#5a4010;font-size:1rem;font-weight:bold;margin:1.2rem 0 0.3rem;">${t.slice(4)}</h3>`; return; }
        if (t.startsWith("- ") || t.startsWith("* ")) { if (!inList) { bodyHtml += '<ul style="margin:0.4rem 0;padding-left:1.4rem;">'; inList = true; } bodyHtml += `<li style="color:#333;line-height:1.8;">${t.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`; return; }
        if (inList) { bodyHtml += "</ul>"; inList = false; }
        bodyHtml += `<p style="color:#333;line-height:1.75;margin:4px 0;">${t.replace(/\*\*(.+?)\*\*/g, "<strong style='color:#5a4010;'>$1</strong>")}</p>`;
      });
      if (inList) bodyHtml += "</ul>";

      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${tripTitle} — ${clientName}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;background:#fff;}
@media print{.no-print{display:none!important;}body{margin:0;}.page{page-break-after:always;}}
.no-print{position:fixed;top:16px;right:16px;z-index:999;background:#d4a843;color:#1a1a1a;border:none;border-radius:6px;padding:10px 20px;font-size:.9rem;font-family:Georgia,serif;font-weight:bold;cursor:pointer;}</style></head><body>
<button class="no-print" onclick="window.print()">🖨 Print / Save as PDF</button>
<div class="page" style="min-height:100vh;background:linear-gradient(160deg,#1a1200 0%,#2d1f00 50%,#0d1208 100%);display:flex;flex-direction:column;justify-content:space-between;padding:60px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div><div style="font-size:.7rem;letter-spacing:.25em;text-transform:uppercase;color:#d4a843;margin-bottom:6px;">Safari Proposal</div><div style="font-size:1.1rem;color:#f5ead0;font-style:italic;">${companyName || "Your Safari Company"}</div></div>
    <div style="text-align:right;font-size:.78rem;color:rgba(245,234,208,.5);"><div>Prepared: ${fmt(today)}</div><div>Valid until: ${fmt(validUntil)}</div></div>
  </div>
  <div style="text-align:center;padding:40px 0;">
    <div style="font-size:3rem;margin-bottom:20px;">🦁</div>
    <h1 style="font-size:3rem;font-weight:normal;font-style:italic;color:#f5ead0;line-height:1.2;margin-bottom:16px;">${tripTitle}</h1>
    <div style="width:60px;height:2px;background:#d4a843;margin:0 auto 20px;"></div>
    <div style="font-size:1.1rem;color:#d4a843;font-style:italic;">Prepared exclusively for ${clientName}</div>
    ${month ? `<div style="font-size:.9rem;color:rgba(245,234,208,.6);margin-top:8px;">${month} Departure</div>` : ""}
  </div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px solid rgba(212,168,67,.2);">
    <div style="font-size:.78rem;color:rgba(245,234,208,.5);">${companyEmail ? `✉ ${companyEmail}` : ""} ${companyPhone ? `· 📞 ${companyPhone}` : ""} ${companyWebsite ? `· 🌐 ${companyWebsite}` : ""}</div>
    <div style="font-size:.65rem;color:rgba(245,234,208,.25);">Powered by Safaripedia</div>
  </div>
</div>
<div style="max-width:760px;margin:0 auto;padding:60px 40px;">
  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:2px solid #d4a843;margin-bottom:32px;">
    <div><div style="font-size:1.2rem;font-style:italic;color:#8B6914;">${companyName || "Safari Proposal"}</div><div style="font-size:.78rem;color:#999;margin-top:2px;">${tripTitle} · ${clientName}</div></div>
    <div style="font-size:.75rem;color:#999;text-align:right;">${fmt(today)}<br/><span style="color:#8B6914;">Ref: SP-${Math.random().toString(36).slice(2,7).toUpperCase()}</span></div>
  </div>
  ${bodyHtml}
  <div style="background:#faf6ee;border-left:4px solid #d4a843;padding:20px 24px;margin-top:2rem;border-radius:4px;">
    <h2 style="color:#8B6914;font-size:1rem;font-weight:bold;margin-bottom:12px;">Payment Terms</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
      ${[["30%","Deposit on Booking"],["40%","60 Days Before"],["30%","30 Days Before"]].map(([pct,lbl])=>`<div style="text-align:center;padding:12px;background:white;border-radius:6px;"><div style="font-size:1.4rem;font-weight:bold;color:#8B6914;">${pct}</div><div style="font-size:.78rem;color:#666;margin-top:4px;">${lbl}</div></div>`).join("")}
    </div>
  </div>
  <div style="margin-top:1.5rem;"><h2 style="color:#8B6914;font-size:1.15rem;font-weight:normal;font-style:italic;margin-bottom:.6rem;padding-bottom:6px;border-bottom:1px solid #e8d9b0;">Cancellation Policy</h2>
    <table style="width:100%;border-collapse:collapse;font-size:.85rem;">
      ${[["90+ days","Full refund minus admin fee"],["60–89 days","50% refund"],["30–59 days","25% refund"],["Under 30 days","No refund"]].map(([p,r])=>`<tr style="border-bottom:1px solid #f0e8d0;"><td style="padding:8px 12px;color:#5a4010;font-weight:bold;">${p}</td><td style="padding:8px 12px;color:#333;">${r}</td></tr>`).join("")}
    </table>
  </div>
  <div style="margin-top:2.5rem;padding:24px;border:1px solid #e8d9b0;border-radius:8px;">
    <h2 style="color:#8B6914;font-size:1rem;font-weight:bold;margin-bottom:16px;">Acceptance & Signature</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div><div style="font-size:.78rem;color:#999;margin-bottom:4px;">Client Signature</div><div style="border-bottom:1px solid #ccc;height:40px;margin-bottom:8px;"></div><div style="font-size:.78rem;color:#999;">Name: ${clientName}</div></div>
      <div><div style="font-size:.78rem;color:#999;margin-bottom:4px;">Date</div><div style="border-bottom:1px solid #ccc;height:40px;margin-bottom:8px;"></div><div style="font-size:.78rem;color:#999;">Valid until: ${fmt(validUntil)}</div></div>
    </div>
  </div>
  <div style="margin-top:3rem;padding-top:16px;border-top:1px solid #e8d9b0;display:flex;justify-content:space-between;">
    <div style="font-size:.78rem;color:#999;">${companyName || ""} ${companyEmail ? `· ${companyEmail}` : ""}</div>
    <div style="font-size:.65rem;color:#ccc;">Powered by Safaripedia · safaripedia.com</div>
  </div>
</div></body></html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${tripTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${clientName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.html`;
      a.click(); URL.revokeObjectURL(url);
    }

    // ── SYNC operator data to server ──
    async function syncToServer(overrides?: any) {
      try {
        const res = await fetch("/api/operator/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operatorId, profile: overrides?.profile || opProfile, suppliers: overrides?.suppliers || opSuppliers, templates: overrides?.templates || opTemplates }),
        });
        const data = await res.json();
        if (data.verificationStatus) setOpVerificationStatus(data.verificationStatus);
      } catch { /* silent */ }
    }

    // ── FETCH verification status on load (moved to top-level useEffect) ──

    // ── SUBMIT application ──
    async function submitApplication() {
      const { companyName, contactName, email, countries } = opApplication;
      if (!companyName || !contactName || !email || !countries) {
        setOpApplicationError("Please fill in all required fields."); return;
      }
      setOpApplicationError("");
      try {
        const res = await fetch("/api/operator/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...opApplication, operatorId }),
        });
        const data = await res.json();
        if (data.success) {
          setOpVerificationStatus("pending");
          setOpApplicationSubmitted(true);
        }
      } catch { setOpApplicationError("Submission failed. Please try again."); }
    }

    // ── FETCH leads ──
    async function fetchLeads() {
      setOpLeadsLoading(true);
      try {
        const res = await fetch(`/api/operator/leads/${operatorId}`);
        const data = await res.json();
        setOpLeads(data.leads || []);
      } catch { /* silent */ }
      finally { setOpLeadsLoading(false); }
    }

    // ── UPDATE lead status ──
    async function updateLeadStatus(leadId: string, status: string, value?: string) {
      try {
        await fetch(`/api/operator/leads/${operatorId}/${leadId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, bookingValue: value }),
        });
        await fetchLeads();
      } catch { /* silent */ }
    }

    // ── PORTAL TABS ──
    const PORTAL_TABS = [
      { id: "quote", label: "✦ Quote Generator" },
      { id: "leads", label: `📬 Leads${opLeads.filter(l=>l.status==="new").length > 0 ? ` (${opLeads.filter(l=>l.status==="new").length})` : ""}` },
      { id: "suppliers", label: "🏕 Suppliers" },
      { id: "templates", label: "📋 Templates" },
      { id: "profile", label: "⚙ Profile" },
    ];

    return (
      <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }} />

        {/* Nav */}
        <nav className="r-op-nav" style={{ position: "relative", zIndex: 10, borderBottom: `1px solid ${BORDER}`, padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="r-op-nav-inner" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div className="r-op-logo" style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "1.4rem" }}>🦁</span>
              <span style={{ fontStyle: "italic", fontSize: "1.2rem", color: G }}>Safaripedia</span>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, background: "rgba(212,168,67,0.08)", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "0.2rem 0.6rem" }}>Operator Portal</span>
            </div>
            <div className="r-op-tabs" style={{ display: "flex", gap: "0.3rem" }}>
              {PORTAL_TABS.map(t => (
                <button key={t.id} onClick={() => { setOpTab(t.id); if (t.id === "leads") fetchLeads(); }}
                  style={{ background: opTab === t.id ? "rgba(212,168,67,0.12)" : "transparent", border: `1px solid ${opTab === t.id ? G : "transparent"}`, color: opTab === t.id ? G : MUTED, borderRadius: "8px", padding: "0.35rem 0.9rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="r-op-status" style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            {opSuppliers.length === 0 && opTab === "quote" && (
              <span style={{ fontSize: "0.72rem", color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "6px", padding: "0.25rem 0.7rem" }}>
                ⚠ Add suppliers first for best results
              </span>
            )}
            {opVerificationStatus === "pending" && (
              <span style={{ fontSize: "0.72rem", color: "#93c5fd", background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.3)", borderRadius: "6px", padding: "0.25rem 0.7rem" }}>
                ⏳ Verification pending — leads paused
              </span>
            )}
            {opVerificationStatus === "approved" && (
              <span style={{ fontSize: "0.72rem", color: "#86efac", background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.3)", borderRadius: "6px", padding: "0.25rem 0.7rem" }}>
                ✓ Verified operator — receiving leads
              </span>
            )}
            <button onClick={() => { window.location.href = "/"; }} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>← Back</button>
          </div>
        </nav>

        <div className="r-section" style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "2rem 2rem 6rem" }}>

          {/* ── QUOTE GENERATOR TAB ── */}
          {opTab === "quote" && (
            <div className="r-grid-quote" style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "2rem", alignItems: "start" }}>
              {/* Form */}
              <div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h1 style={{ fontStyle: "italic", fontSize: "1.6rem", color: TEXT, fontWeight: "normal", marginBottom: "0.3rem" }}>AI Quote Generator</h1>
                  <p style={{ color: MUTED, fontSize: "0.82rem" }}>
                    {opSuppliers.length > 0 ? `Using ${opSuppliers.filter(s=>s.type==="lodge").length} lodges & ${opSuppliers.filter(s=>s.type==="park").length} parks from your supplier database.` : "No suppliers configured — AI will suggest its own. Add suppliers for operator-guided proposals."}
                  </p>
                </div>

                <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {sectionLabel("Client Details")}
                  <div>
                    <label style={labelStyle}>Client Name</label>
                    <input value={operatorForm.client} onChange={e => setOperatorForm(f => ({ ...f, client: e.target.value }))} placeholder="e.g. The Johnson Family" style={fieldStyle} />
                  </div>
                  <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                    <div><label style={labelStyle}>Trip Length (days)</label><input value={operatorForm.days} onChange={e => setOperatorForm(f => ({ ...f, days: e.target.value }))} placeholder="7" style={fieldStyle} /></div>
                    <div><label style={labelStyle}>Group Size</label><input value={operatorForm.groupSize} onChange={e => setOperatorForm(f => ({ ...f, groupSize: e.target.value }))} placeholder="2" style={fieldStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>Destination</label><input value={operatorForm.destination} onChange={e => setOperatorForm(f => ({ ...f, destination: e.target.value }))} placeholder="e.g. Kenya — Maasai Mara, Amboseli" style={fieldStyle} /></div>
                  <div className="r-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem" }}>
                    <div><label style={labelStyle}>Budget p.p.</label><input value={operatorForm.budget} onChange={e => setOperatorForm(f => ({ ...f, budget: e.target.value }))} placeholder="4,000" style={fieldStyle} /></div>
                    <div>
                      <label style={labelStyle}>Currency</label>
                      <select value={operatorForm.currency || "USD"} onChange={e => setOperatorForm(f => ({ ...f, currency: e.target.value }))} style={{ ...fieldStyle, cursor: "pointer" }}>
                        {["USD","GBP","EUR","KES","ZAR"].map(c => <option key={c} value={c} style={{ background: "#1a1a1a" }}>{c}</option>)}
                      </select>
                    </div>
                    <div><label style={labelStyle}>Month</label><input value={operatorForm.month} onChange={e => setOperatorForm(f => ({ ...f, month: e.target.value }))} placeholder="August" style={fieldStyle} /></div>
                  </div>
                  <div>
                    <label style={labelStyle}>Trip Type</label>
                    <select value={operatorForm.tripType} onChange={e => setOperatorForm(f => ({ ...f, tripType: e.target.value }))} style={{ ...fieldStyle, cursor: "pointer" }}>
                      {["general","honeymoon","family","solo","group","adventure","luxury","budget"].map(t => <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>

                  {/* Template selector */}
                  {opTemplates.length > 0 && (
                    <>
                      {sectionLabel("Itinerary Template")}
                      <div>
                        <label style={labelStyle}>Use a Template (optional)</label>
                        <select value={operatorForm.templateId || ""} onChange={e => setOperatorForm(f => ({ ...f, templateId: e.target.value }))} style={{ ...fieldStyle, cursor: "pointer" }}>
                          <option value="" style={{ background: "#1a1a1a" }}>No template — AI plans the route</option>
                          {opTemplates.map(t => <option key={t.id} value={t.id} style={{ background: "#1a1a1a" }}>{t.name} ({t.days} days)</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {sectionLabel("Additional Details")}
                  <div>
                    <label style={labelStyle}>Special Requests / Notes</label>
                    <textarea value={operatorForm.notes} onChange={e => setOperatorForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                      placeholder="Anniversary trip, vegetarian meals, wheelchair access…" style={{ ...fieldStyle, resize: "none" }} />
                  </div>

                  {operatorError && <p style={{ color: "#f87171", fontSize: "0.82rem", fontStyle: "italic" }}>{operatorError}</p>}

                  <button onClick={generateOperatorQuote} disabled={operatorLoading}
                    style={{ background: operatorLoading ? "rgba(212,168,67,0.3)" : G, color: BG, border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.9rem", fontFamily: FONT, fontWeight: "bold", cursor: operatorLoading ? "not-allowed" : "pointer" }}>
                    {operatorLoading ? "⏳ Generating…" : "Generate Proposal →"}
                  </button>
                </div>

                {/* Supplier summary */}
                {opSuppliers.length > 0 && (
                  <div style={{ marginTop: "1rem", background: "rgba(212,168,67,0.04)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1rem" }}>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: G, marginBottom: "0.6rem" }}>Active Supplier Profile</div>
                    {[
                      ["🏕️ Lodges", opSuppliers.filter(s=>s.type==="lodge").length],
                      ["🌿 Parks", opSuppliers.filter(s=>s.type==="park").length],
                      ["✈️ Airlines", opSuppliers.filter(s=>s.type==="airline").length],
                      ["🧭 Guides", opSuppliers.filter(s=>s.type==="guide").length],
                    ].filter(([,n]) => (n as number) > 0).map(([label, count]) => (
                      <div key={label as string} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "0.25rem 0", borderBottom: `1px solid ${BORDER}` }}>
                        <span style={{ color: MUTED }}>{label as string}</span>
                        <span style={{ color: G }}>{count as number}</span>
                      </div>
                    ))}
                    <button onClick={() => setOpTab("suppliers")} style={{ marginTop: "0.6rem", background: "transparent", border: "none", color: MUTED, fontSize: "0.72rem", cursor: "pointer", fontFamily: FONT, textDecoration: "underline" }}>Manage suppliers →</button>
                  </div>
                )}
              </div>

              {/* Output */}
              <div>
                {!operatorResult && !operatorLoading && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: `1px dashed rgba(212,168,67,0.2)`, borderRadius: "14px", padding: "5rem 2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>📄</div>
                    <p style={{ color: MUTED, fontStyle: "italic", fontSize: "0.9rem" }}>Your proposal will appear here.<br />Fill in the form and click Generate.</p>
                    {opSuppliers.length === 0 && <p style={{ color: "#f59e0b", fontSize: "0.78rem", marginTop: "1rem" }}>💡 Tip: Add your preferred lodges in the Suppliers tab first.</p>}
                  </div>
                )}
                {operatorLoading && (
                  <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "5rem 2rem", textAlign: "center" }}>
                    <div style={{ width: "36px", height: "36px", border: `3px solid rgba(212,168,67,0.2)`, borderTopColor: G, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1.2rem" }} />
                    <p style={{ color: MUTED, fontStyle: "italic" }}>Crafting your proposal{opSuppliers.length > 0 ? " using your supplier database" : ""}…</p>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </div>
                )}
                {operatorResult && (
                  <div>
                    <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
                      <button onClick={downloadProposal} style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.65rem 1.5rem", fontSize: "0.85rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>⬇ Download Proposal</button>
                      <button onClick={() => setOperatorResult(null)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.65rem 1.2rem", fontSize: "0.85rem", fontFamily: FONT, cursor: "pointer" }}>✎ Regenerate</button>
                      <button onClick={() => { setOperatorResult(null); setOperatorForm(f => ({ ...f, client: "", days: "", destination: "", budget: "", month: "", groupSize: "", tripType: "general", notes: "", templateId: "" })); }}
                        style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.65rem 1.2rem", fontSize: "0.85rem", fontFamily: FONT, cursor: "pointer" }}>+ New Client</button>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem", maxHeight: "75vh", overflowY: "auto" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "20px", padding: "0.25rem 0.8rem", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: G, marginBottom: "1.5rem" }}>📄 Proposal Preview</div>
                      <div style={{ background: "linear-gradient(135deg,rgba(212,168,67,0.12),rgba(212,168,67,0.04))", border: "1px solid rgba(212,168,67,0.25)", borderRadius: "10px", padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                        <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>🦁</div>
                        <h2 style={{ fontStyle: "italic", fontSize: "1.3rem", color: G, fontWeight: "normal", marginBottom: "0.3rem" }}>{operatorForm.days}-Day {operatorForm.destination} Safari</h2>
                        <p style={{ color: MUTED, fontSize: "0.82rem" }}>For {operatorForm.client || "Valued Client"} · {operatorForm.month || ""}</p>
                        {opProfile.companyName && <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.4rem", fontStyle: "italic" }}>by {opProfile.companyName}</p>}
                      </div>
                      {operatorResult.split("\n").map((line, i) => {
                        const t = line.trim();
                        if (!t) return <div key={i} style={{ height: "6px" }} />;
                        if (t.startsWith("## ")) return <h2 key={i} style={{ fontStyle: "italic", color: G, fontSize: "1.05rem", fontWeight: "normal", margin: "1.5rem 0 0.5rem", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.4rem" }}>{t.slice(3)}</h2>;
                        if (t.startsWith("### ")) return <h3 key={i} style={{ color: G, fontSize: "0.95rem", fontWeight: "normal", margin: "1rem 0 0.3rem", fontStyle: "italic" }}>{t.slice(4)}</h3>;
                        if (t.startsWith("- ") || t.startsWith("* ")) return <div key={i} style={{ display: "flex", gap: "8px", color: MUTED, fontSize: "0.85rem", marginBottom: "3px" }}><span style={{ color: G }}>▸</span><span>{t.slice(2)}</span></div>;
                        const bold = t.split(/(\*\*[^*]+\*\*)/).map((p, j) => p.startsWith("**") ? <strong key={j} style={{ color: "#f5d98b" }}>{p.slice(2,-2)}</strong> : p);
                        return <p key={i} style={{ color: MUTED, fontSize: "0.88rem", lineHeight: 1.75, margin: "3px 0" }}>{bold}</p>;
                      })}
                      <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(212,168,67,0.04)", borderRadius: "8px", border: `1px solid ${BORDER}` }}>
                        <p style={{ fontSize: "0.75rem", color: MUTED, fontStyle: "italic", textAlign: "center" }}>✦ Downloaded proposal includes cover page, payment terms, cancellation policy & signature section</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── LEADS TAB ── */}
          {opTab === "leads" && (
            <div>
              <div className="r-flex-stack" style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "0.8rem" }}>
                <div>
                  <h1 style={{ fontStyle: "italic", fontSize: "1.6rem", color: TEXT, fontWeight: "normal", marginBottom: "0.3rem" }}>Matched Inquiries</h1>
                  <p style={{ color: MUTED, fontSize: "0.82rem" }}>Travellers matched to you based on your destinations and lodge portfolio.</p>
                </div>
                <button onClick={fetchLeads} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>↻ Refresh</button>
              </div>

              {/* Stats row */}
              <div className="r-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  ["📬", "New", opLeads.filter(l=>l.status==="new").length, G],
                  ["💬", "Contacted", opLeads.filter(l=>l.status==="contacted").length, MUTED],
                  ["✅", "Booked", opLeads.filter(l=>l.status==="booked").length, "#86efac"],
                  ["💰", "Total Value", `$${opLeads.filter(l=>l.bookingValue).reduce((s,l)=>s+parseFloat(l.bookingValue||0),0).toLocaleString()}`, "#f5d98b"],
                ].map(([icon, label, val, color]) => (
                  <div key={label as string} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem" }}>{icon}</div>
                    <div style={{ fontSize: "1.3rem", color: color as string, fontWeight: "bold", margin: "0.3rem 0" }}>{val}</div>
                    <div style={{ fontSize: "0.72rem", color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{label}</div>
                  </div>
                ))}
              </div>

              {opLeadsLoading && <div style={{ textAlign: "center", padding: "3rem", color: MUTED, fontStyle: "italic" }}>Loading leads…</div>}

              {!opLeadsLoading && opLeads.length === 0 && (
                <div style={{ textAlign: "center", padding: "4rem 2rem", color: MUTED }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3 }}>📬</div>
                  <p style={{ fontStyle: "italic" }}>No matched inquiries yet.</p>
                  <p style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>Make sure your supplier database is configured so we can match you to the right travellers.</p>
                  <button onClick={() => setOpTab("suppliers")} style={{ marginTop: "1rem", background: "transparent", border: `1px solid ${BORDER}`, color: G, borderRadius: "8px", padding: "0.5rem 1.2rem", fontSize: "0.82rem", fontFamily: FONT, cursor: "pointer" }}>Configure Suppliers →</button>
                </div>
              )}

              {opLeads.map(lead => {
                const statusColors: Record<string, string> = { new: G, contacted: MUTED, booked: "#86efac", lost: "#f87171" };
                const feeEst = lead.bookingValue ? `$${(parseFloat(lead.bookingValue) * 0.1).toLocaleString()}` : "—";
                return (
                  <div key={lead.id} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${lead.status === "new" ? "rgba(212,168,67,0.4)" : BORDER}`, borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}>
                    <div className="r-lead-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1rem", color: TEXT, fontWeight: "bold" }}>{lead.name}</span>
                          <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: statusColors[lead.status] || MUTED, background: "rgba(212,168,67,0.08)", border: `1px solid rgba(212,168,67,0.2)`, borderRadius: "20px", padding: "0.15rem 0.6rem" }}>{lead.status}</span>
                          {lead.status === "new" && <span style={{ fontSize: "0.65rem", color: G, fontStyle: "italic" }}>● New</span>}
                        </div>
                        <a href={`mailto:${lead.email}`} style={{ color: G, fontSize: "0.85rem", textDecoration: "none" }}>{lead.email}</a>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: MUTED, textAlign: "right" }}>
                        {new Date(lead.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    <div className="r-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem", marginBottom: "1rem" }}>
                      {[
                        ["📍 Destination", lead.destination || lead.destinationsStr || "—"],
                        ["📅 Dates", lead.dates || "—"],
                        ["👥 Travellers", lead.travelers || (lead.groupSize ? `${lead.groupSize} pax` : "—")],
                        ["💰 Budget", lead.budget || (lead.budgetUsd ? `$${lead.budgetUsd.toLocaleString()}` : "—")],
                      ].map(([k, v]) => (
                        <div key={k as string} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "0.6rem" }}>
                          <div style={{ fontSize: "0.68rem", color: MUTED, marginBottom: "2px" }}>{k}</div>
                          <div style={{ fontSize: "0.85rem", color: TEXT }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Enriched profile tags */}
                    {(lead.groupType || lead.africaExperience || lead.accommodation || lead.tripPriority || lead.mustSeeAnimals || lead.flexibleDates) && (
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.4rem", marginBottom: "0.8rem" }}>
                        {lead.groupType && <span style={{ padding: "0.25rem 0.65rem", borderRadius: "20px", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", fontSize: "0.72rem", color: G }}>{{ couple: "💑 Couple", family: "👨‍👩‍👧 Family", friends: "👯 Friends", solo: "🧍 Solo", corporate: "🏢 Corporate" }[lead.groupType] || lead.groupType}</span>}
                        {lead.africaExperience && <span style={{ padding: "0.25rem 0.65rem", borderRadius: "20px", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", fontSize: "0.72rem", color: TEXT }}>{{ "first-time": "🌍 First visit", "been-once": "✈️ Been once", "experienced": "🦁 Experienced" }[lead.africaExperience] || lead.africaExperience}</span>}
                        {lead.accommodation && <span style={{ padding: "0.25rem 0.65rem", borderRadius: "20px", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", fontSize: "0.72rem", color: TEXT }}>{{ "tented-camp": "⛺ Tented camp", "lodge": "🏡 Lodge", "mixed": "🔄 Mixed", "self-drive": "🚗 Self-drive" }[lead.accommodation] || lead.accommodation}</span>}
                        {lead.tripPriority && <span style={{ padding: "0.25rem 0.65rem", borderRadius: "20px", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", fontSize: "0.72rem", color: TEXT }}>{{ wildlife: "🦁 Wildlife", photography: "📷 Photography", relaxation: "🌅 Relaxation", culture: "🏘 Culture", romance: "💑 Romance", adventure: "🥾 Adventure" }[lead.tripPriority] || lead.tripPriority}</span>}
                        {lead.mustSeeAnimals && lead.mustSeeAnimals.split(", ").filter(Boolean).map((a: string) => (
                          <span key={a} style={{ padding: "0.25rem 0.65rem", borderRadius: "20px", background: "rgba(147,197,253,0.08)", border: "1px solid rgba(147,197,253,0.2)", fontSize: "0.72rem", color: "#93c5fd" }}>{a}</span>
                        ))}
                        {lead.flexibleDates && <span style={{ padding: "0.25rem 0.65rem", borderRadius: "20px", background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.2)", fontSize: "0.72rem", color: "#86efac" }}>📅 Flexible dates</span>}
                      </div>
                    )}

                    {lead.notes && <p style={{ color: MUTED, fontSize: "0.82rem", fontStyle: "italic", marginBottom: "1rem", padding: "0.6rem", background: "rgba(0,0,0,0.15)", borderRadius: "6px" }}>"{lead.notes}"</p>}

                    {lead.bookingValue && (
                      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", padding: "0.6rem 0.8rem", background: "rgba(134,239,172,0.06)", border: "1px solid rgba(134,239,172,0.2)", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.82rem", color: "#86efac" }}>✅ Booked: ${parseFloat(lead.bookingValue).toLocaleString()}</span>
                        <span style={{ fontSize: "0.82rem", color: MUTED }}>· Safaripedia fee: {feeEst} (10%)</span>
                      </div>
                    )}

                    <div className="r-lead-actions" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      <a href={`mailto:${lead.email}?subject=Re: Your Safari Inquiry`}
                        style={{ background: G, color: BG, borderRadius: "6px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, fontWeight: "bold", textDecoration: "none" }}>
                        ✉ Reply to Traveller
                      </a>
                      {lead.status === "new" && (
                        <button onClick={() => updateLeadStatus(lead.id, "contacted")}
                          style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "6px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>
                          Mark Contacted
                        </button>
                      )}
                      {lead.status !== "booked" && lead.status !== "lost" && (
                        <button onClick={() => { setBookingModal(lead); setBookingValue(""); }}
                          style={{ background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.3)", color: "#86efac", borderRadius: "6px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>
                          ✅ Mark Booked
                        </button>
                      )}
                      {lead.status !== "lost" && lead.status !== "booked" && (
                        <button onClick={() => updateLeadStatus(lead.id, "lost")}
                          style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", borderRadius: "6px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer" }}>
                          Mark Lost
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Booking value modal */}
              {bookingModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="r-modal-content" style={{ background: "#1a1a0d", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem", width: "360px", fontFamily: FONT }}>
                    <h3 style={{ color: G, fontStyle: "italic", fontWeight: "normal", marginBottom: "1rem" }}>🎉 Mark as Booked</h3>
                    <p style={{ color: MUTED, fontSize: "0.85rem", marginBottom: "1.2rem" }}>Enter the total booking value so we can calculate the Safaripedia success fee (10%).</p>
                    <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: MUTED, marginBottom: "0.4rem" }}>Booking Value (USD)</label>
                    <input value={bookingValue} onChange={e => setBookingValue(e.target.value)} placeholder="e.g. 8500"
                      style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid rgba(212,168,67,0.2)`, borderRadius: "6px", padding: "0.65rem", color: TEXT, fontSize: "0.88rem", fontFamily: FONT, outline: "none", boxSizing: "border-box" as const, marginBottom: "0.6rem" }} />
                    {bookingValue && !isNaN(parseFloat(bookingValue)) && (
                      <p style={{ color: "#86efac", fontSize: "0.82rem", marginBottom: "1rem" }}>
                        Safaripedia fee: ${(parseFloat(bookingValue) * 0.1).toLocaleString()} · You keep: ${(parseFloat(bookingValue) * 0.9).toLocaleString()}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "0.8rem" }}>
                      <button onClick={async () => { await updateLeadStatus(bookingModal.id, "booked", bookingValue); setBookingModal(null); }}
                        style={{ flex: 1, background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.7rem", fontSize: "0.85rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>Confirm</button>
                      <button onClick={() => setBookingModal(null)}
                        style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.7rem", fontSize: "0.85rem", fontFamily: FONT, cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SUPPLIERS TAB ── */}
          {opTab === "suppliers" && (
            <div>
              <div className="r-flex-stack" style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "0.8rem" }}>
                <div>
                  <h1 style={{ fontStyle: "italic", fontSize: "1.6rem", color: TEXT, fontWeight: "normal", marginBottom: "0.3rem" }}>Supplier Database</h1>
                  <p style={{ color: MUTED, fontSize: "0.82rem" }}>AI will only use lodges, parks and suppliers from this list when generating proposals.</p>
                </div>
              </div>

              {/* Add supplier form */}
              <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: G, marginBottom: "1rem" }}>Add Supplier</div>
                <div className="r-grid-supplier-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: "0.8rem", alignItems: "end" }}>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select value={newSupplier.type} onChange={e => setNewSupplier(s => ({ ...s, type: e.target.value }))} style={{ ...fieldStyle, cursor: "pointer" }}>
                      {["lodge","park","airline","guide","vehicle"].map(t => <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input value={newSupplier.name} onChange={e => setNewSupplier(s => ({ ...s, name: e.target.value }))} placeholder="e.g. Angama Mara" style={fieldStyle} />
                  </div>
                  {newSupplier.type === "lodge" ? (
                    <>
                      <div>
                        <label style={labelStyle}>Park / Location</label>
                        <input value={newSupplier.park} onChange={e => setNewSupplier(s => ({ ...s, park: e.target.value }))} placeholder="Maasai Mara" style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Tier</label>
                        <select value={newSupplier.tier} onChange={e => setNewSupplier(s => ({ ...s, tier: e.target.value }))} style={{ ...fieldStyle, cursor: "pointer" }}>
                          {["luxury","midrange","budget"].map(t => <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Price/night (USD)</label>
                        <input value={newSupplier.priceRange} onChange={e => setNewSupplier(s => ({ ...s, priceRange: e.target.value }))} placeholder="900" style={fieldStyle} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label style={labelStyle}>Region / Route</label>
                        <input value={newSupplier.region} onChange={e => setNewSupplier(s => ({ ...s, region: e.target.value }))} placeholder="Kenya, Tanzania…" style={fieldStyle} />
                      </div>
                      <div /><div />
                    </>
                  )}
                  <button onClick={() => {
                    if (!newSupplier.name.trim()) return;
                  setOpSuppliers(prev => {
                    const updated = [...prev, { ...newSupplier, id: Date.now().toString() }];
                    syncToServer({ suppliers: updated });
                    return updated;
                  });
                    setNewSupplier({ type: "lodge", name: "", park: "", tier: "luxury", priceRange: "", region: "" });
                  }} style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.65rem 1.2rem", fontSize: "0.85rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>+ Add</button>
                </div>
              </div>

              {/* Supplier tables by type */}
              {(["lodge","park","airline","guide","vehicle"] as const).map(type => {
                const items = opSuppliers.filter(s => s.type === type);
                if (items.length === 0) return null;
                const typeLabel = { lodge: "🏕️ Lodges", park: "🌿 Parks & Conservancies", airline: "✈️ Flight Operators", guide: "🧭 Guides", vehicle: "🚙 Vehicles" }[type];
                return (
                  <div key={type} style={{ marginBottom: "2rem" }}>
                    <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: G, marginBottom: "0.8rem", paddingBottom: "0.4rem", borderBottom: `1px solid ${BORDER}` }}>{typeLabel}</div>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      {items.map(s => (
                        <div key={s.id} className="r-grid-supplier-item" style={{ display: "grid", gridTemplateColumns: type === "lodge" ? "2fr 1.5fr 1fr 1fr auto" : "2fr 2fr auto", gap: "0.8rem", alignItems: "center", background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "0.7rem 1rem" }}>
                          <span style={{ color: TEXT, fontSize: "0.88rem", fontWeight: "bold" }}>{s.name}</span>
                          {type === "lodge" ? (
                            <>
                              <span style={{ color: MUTED, fontSize: "0.82rem" }}>{s.park || "—"}</span>
                              <span style={{ color: MUTED, fontSize: "0.78rem", background: "rgba(212,168,67,0.08)", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "0.15rem 0.5rem", textAlign: "center" }}>{s.tier}</span>
                              <span style={{ color: G, fontSize: "0.82rem" }}>{s.priceRange ? `$${s.priceRange}/night` : "—"}</span>
                            </>
                          ) : (
                            <span style={{ color: MUTED, fontSize: "0.82rem" }}>{s.region || "—"}</span>
                          )}
                          <button onClick={() => setOpSuppliers(prev => { const updated = prev.filter(x => x.id !== s.id); syncToServer({ suppliers: updated }); return updated; })}
                            style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: "6px", padding: "0.3rem 0.6rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: FONT }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {opSuppliers.length === 0 && (
                <div style={{ textAlign: "center", padding: "4rem 2rem", color: MUTED }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3 }}>🏕️</div>
                  <p style={{ fontStyle: "italic" }}>No suppliers yet. Add your preferred lodges, parks, and partners above.</p>
                  <p style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>Once added, the AI will only use these when generating proposals.</p>
                </div>
              )}
            </div>
          )}

          {/* ── TEMPLATES TAB ── */}
          {opTab === "templates" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontStyle: "italic", fontSize: "1.6rem", color: TEXT, fontWeight: "normal", marginBottom: "0.3rem" }}>Itinerary Templates</h1>
                <p style={{ color: MUTED, fontSize: "0.82rem" }}>Define your standard routes. The AI will follow these exactly and only write the story around them.</p>
              </div>

              {/* Add template */}
              <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: G, marginBottom: "1rem" }}>New Template</div>
                <div className="r-template-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
                  <div><label style={labelStyle}>Template Name *</label><input value={newTemplate.name} onChange={e => setNewTemplate(t => ({ ...t, name: e.target.value }))} placeholder="7 Day Kenya Classic" style={fieldStyle} /></div>
                  <div><label style={labelStyle}>Days *</label><input value={newTemplate.days} onChange={e => { setNewTemplate(t => ({ ...t, days: e.target.value, route: Array(parseInt(e.target.value)||7).fill("") })); }} placeholder="7" type="number" style={fieldStyle} /></div>
                  <div><label style={labelStyle}>Primary Destination</label><input value={newTemplate.destination} onChange={e => setNewTemplate(t => ({ ...t, destination: e.target.value }))} placeholder="Kenya" style={fieldStyle} /></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.4rem", marginBottom: "1rem" }}>
                  <label style={labelStyle}>Day-by-Day Route</label>
                  {Array.from({ length: parseInt(newTemplate.days) || 7 }, (_, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: MUTED, textAlign: "right" }}>Day {i+1}</span>
                      <input value={newTemplate.route[i] || ""} onChange={e => { const r = [...newTemplate.route]; r[i] = e.target.value; setNewTemplate(t => ({ ...t, route: r })); }}
                        placeholder={i === 0 ? "Arrive Nairobi, transfer to lodge" : i === parseInt(newTemplate.days)-1 ? "Depart for Nairobi, fly home" : "Game drives at Maasai Mara"}
                        style={fieldStyle} />
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  if (!newTemplate.name.trim() || !newTemplate.days) return;
                  setOpTemplates(prev => [...prev, { ...newTemplate, id: Date.now().toString() }]);
                  setNewTemplate({ name: "", days: "7", destination: "", route: Array(7).fill("") });
                }} style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.7rem 1.5rem", fontSize: "0.85rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>Save Template →</button>
              </div>

              {/* Template list */}
              {opTemplates.length > 0 ? opTemplates.map(t => (
                <div key={t.id} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "1rem", color: TEXT, fontWeight: "bold" }}>{t.name}</div>
                      <div style={{ fontSize: "0.78rem", color: MUTED, marginTop: "2px" }}>{t.days} days · {t.destination || "Any destination"}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => { setOperatorForm(f => ({ ...f, days: t.days, destination: t.destination || f.destination, templateId: t.id })); setOpTab("quote"); }}
                        style={{ background: "rgba(212,168,67,0.1)", border: `1px solid ${BORDER}`, color: G, borderRadius: "6px", padding: "0.3rem 0.8rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: FONT }}>Use →</button>
                      <button onClick={() => setOpTemplates(prev => prev.filter(x => x.id !== t.id))}
                        style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: "6px", padding: "0.3rem 0.6rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: FONT }}>✕</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.3rem" }}>
                    {t.route.map((r: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "0.8rem", fontSize: "0.82rem" }}>
                        <span style={{ color: G, minWidth: "50px", fontWeight: "bold" }}>Day {i+1}</span>
                        <span style={{ color: MUTED }}>{r || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: "center", padding: "4rem 2rem", color: MUTED }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3 }}>📋</div>
                  <p style={{ fontStyle: "italic" }}>No templates yet. Create your standard routes above.</p>
                  <p style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>Templates lock in your routing — the AI just fills in the story.</p>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {opTab === "profile" && (
            <div style={{ maxWidth: "600px" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontStyle: "italic", fontSize: "1.6rem", color: TEXT, fontWeight: "normal", marginBottom: "0.3rem" }}>Operator Profile</h1>
                <p style={{ color: MUTED, fontSize: "0.82rem" }}>Your company details appear on every downloaded proposal.</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column" as const, gap: "1rem" }}>
                {sectionLabel("Company Details")}
                <div><label style={labelStyle}>Company Name</label><input value={opProfile.companyName} onChange={e => setOpProfile(p => ({ ...p, companyName: e.target.value }))} placeholder="Acacia Safari Co." style={fieldStyle} /></div>
                <div className="r-profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                  <div><label style={labelStyle}>Email</label><input value={opProfile.email} onChange={e => setOpProfile(p => ({ ...p, email: e.target.value }))} placeholder="info@acacia.com" style={fieldStyle} /></div>
                  <div><label style={labelStyle}>Phone</label><input value={opProfile.phone} onChange={e => setOpProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+254 700 000000" style={fieldStyle} /></div>
                </div>
                <div><label style={labelStyle}>Website</label><input value={opProfile.website} onChange={e => setOpProfile(p => ({ ...p, website: e.target.value }))} placeholder="www.acaciasafaris.com" style={fieldStyle} /></div>
                {sectionLabel("Operational Preferences")}
                <div><label style={labelStyle}>Primary Countries</label><input value={opProfile.countries} onChange={e => setOpProfile(p => ({ ...p, countries: e.target.value }))} placeholder="Kenya, Tanzania, Botswana" style={fieldStyle} /></div>
                <div className="r-profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                  <div>
                    <label style={labelStyle}>Default Currency</label>
                    <select value={opProfile.currency || "USD"} onChange={e => setOpProfile(p => ({ ...p, currency: e.target.value }))} style={{ ...fieldStyle, cursor: "pointer" }}>
                      {["USD","GBP","EUR","KES","ZAR"].map(c => <option key={c} value={c} style={{ background: "#1a1a1a" }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Default Vehicle</label>
                    <input value={opProfile.vehicle} onChange={e => setOpProfile(p => ({ ...p, vehicle: e.target.value }))} placeholder="4x4 Land Cruiser" style={fieldStyle} />
                  </div>
                </div>
                <div><label style={labelStyle}>Tagline / Brand Message</label><input value={opProfile.tagline} onChange={e => setOpProfile(p => ({ ...p, tagline: e.target.value }))} placeholder="Your wild story begins here." style={fieldStyle} /></div>
                <button onClick={() => { setOpProfileSaved(true); syncToServer({ profile: opProfile }); }}
                  style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.9rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>
                  {opProfileSaved ? "✓ Saved" : "Save Profile →"}
                </button>
              </div>

              {/* ── VERIFICATION SECTION ── */}
              <div style={{ marginTop: "2rem" }}>
                <h2 style={{ fontStyle: "italic", fontSize: "1.3rem", color: TEXT, fontWeight: "normal", marginBottom: "0.4rem" }}>Lead Access Verification</h2>
                <p style={{ color: MUTED, fontSize: "0.82rem", marginBottom: "1.2rem" }}>Submit your company details to be verified. Once approved, you'll receive matched traveller inquiries — no upfront cost, just a 10% success fee on confirmed bookings.</p>

                {opVerificationStatus === "approved" && (
                  <div style={{ background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.3)", borderRadius: "10px", padding: "1.2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>✅</div>
                    <p style={{ color: "#86efac", fontWeight: "bold", marginBottom: "0.3rem" }}>You're a verified operator</p>
                    <p style={{ color: MUTED, fontSize: "0.82rem" }}>You are now receiving matched traveller inquiries. Check the Leads tab.</p>
                  </div>
                )}

                {opVerificationStatus === "pending" && (
                  <div style={{ background: "rgba(147,197,253,0.06)", border: "1px solid rgba(147,197,253,0.25)", borderRadius: "10px", padding: "1.2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>⏳</div>
                    <p style={{ color: "#93c5fd", fontWeight: "bold", marginBottom: "0.3rem" }}>Application under review</p>
                    <p style={{ color: MUTED, fontSize: "0.82rem" }}>We'll review your application within 2–3 business days. You'll receive an email at the address you provided.</p>
                  </div>
                )}

                {opVerificationStatus === "rejected" && (
                  <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "10px", padding: "1.2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>😔</div>
                    <p style={{ color: "#f87171", fontWeight: "bold", marginBottom: "0.3rem" }}>Application not approved</p>
                    <p style={{ color: MUTED, fontSize: "0.82rem" }}>Please contact <a href="mailto:hello@safaripedia.com" style={{ color: G }}>hello@safaripedia.com</a> if you have questions.</p>
                  </div>
                )}

                {(opVerificationStatus === "none") && !opApplicationSubmitted && (
                  <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column" as const, gap: "0.9rem" }}>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: G, marginBottom: "0.4rem" }}>Apply for Lead Access</div>
                    <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                      <div>
                        <label style={labelStyle}>Company Name *</label>
                        <input value={opApplication.companyName} onChange={e => setOpApplication(a => ({ ...a, companyName: e.target.value }))} placeholder="Acacia Safaris Ltd" style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Your Name *</label>
                        <input value={opApplication.contactName} onChange={e => setOpApplication(a => ({ ...a, contactName: e.target.value }))} placeholder="James Odhiambo" style={fieldStyle} />
                      </div>
                    </div>
                    <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                      <div>
                        <label style={labelStyle}>Business Email *</label>
                        <input value={opApplication.email} onChange={e => setOpApplication(a => ({ ...a, email: e.target.value }))} placeholder="james@acacia.com" style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Phone</label>
                        <input value={opApplication.phone} onChange={e => setOpApplication(a => ({ ...a, phone: e.target.value }))} placeholder="+254 700 000000" style={fieldStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Website</label>
                      <input value={opApplication.website} onChange={e => setOpApplication(a => ({ ...a, website: e.target.value }))} placeholder="www.acaciasafaris.com" style={fieldStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Countries You Operate In *</label>
                      <input value={opApplication.countries} onChange={e => setOpApplication(a => ({ ...a, countries: e.target.value }))} placeholder="Kenya, Tanzania, Botswana" style={fieldStyle} />
                    </div>
                    <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                      <div>
                        <label style={labelStyle}>Years in Business</label>
                        <input value={opApplication.yearsInBusiness} onChange={e => setOpApplication(a => ({ ...a, yearsInBusiness: e.target.value }))} placeholder="5" style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Reference (optional)</label>
                        <input value={opApplication.reference} onChange={e => setOpApplication(a => ({ ...a, reference: e.target.value }))} placeholder="Tourism board, partner, client" style={fieldStyle} />
                      </div>
                    </div>
                    {opApplicationError && <p style={{ color: "#f87171", fontSize: "0.78rem", fontStyle: "italic" }}>{opApplicationError}</p>}
                    <button onClick={submitApplication}
                      style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.9rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>
                      Submit Application →
                    </button>
                    <p style={{ fontSize: "0.72rem", color: MUTED, fontStyle: "italic", textAlign: "center" }}>We review all applications manually. 2–3 business days. Free forever — 10% fee on bookings only.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ── SHARED TRIP PAGE ──
  if (sharedTripLoading) return (
    <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🦁</div>
        <p style={{ color: MUTED, fontStyle: "italic" }}>Loading safari plan…</p>
      </div>
    </div>
  );

  if (sharedTripError) return (
    <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🌍</div>
        <p style={{ color: MUTED, marginBottom: "1.5rem" }}>{sharedTripError}</p>
        <button onClick={() => { window.location.href = "/"; }} style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.7rem 1.8rem", fontSize: "0.88rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>Plan Your Own Safari →</button>
      </div>
    </div>
  );

  if (sharedTrip) {
    const sharedSections = parseItinerary(sharedTrip.itinerary);
    const sharedOverview = sharedSections.find(s => s.title?.includes("Trip Overview"));
    const sharedDays = sharedSections.filter(s => s.type === "day");
    const sharedRest = sharedSections.filter(s => s.type === "section" && !s.title?.includes("Trip Overview") && !s.title?.includes("Day-by-Day"));
    const wd = sharedTrip.wildlifeData;
    const cd = sharedTrip.costData;

    return (
      <div style={{ fontFamily: FONT, background: BG, minHeight: "100vh", color: TEXT }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }} />
        <nav style={{ position: "relative", zIndex: 10, borderBottom: `1px solid ${BORDER}`, padding: "1.2rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => { window.location.href = "/"; }} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
            <span style={{ fontSize: "1.5rem" }}>🦁</span>
            <span style={{ fontStyle: "italic", fontSize: "1.3rem", color: G }}>Safaripedia</span>
          </div>
          <button onClick={() => { window.location.href = "/"; }} style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.5rem 1.2rem", fontSize: "0.8rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>
            Plan My Own Safari →
          </button>
        </nav>
        <div className="r-section" style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "3rem 2rem 6rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "20px", padding: "0.3rem 1rem", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: G, marginBottom: "1.5rem" }}>
            🔗 Shared Safari Plan
          </div>
          {sharedOverview && (
            <div style={{ background: "rgba(212,168,67,0.06)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem", marginBottom: "1.5rem" }}>
              <h1 style={{ fontStyle: "italic", fontSize: "1.8rem", color: G, fontWeight: "normal", marginBottom: "1rem" }}>{sharedOverview.title}</h1>
              {renderContent(sharedOverview.lines || [])}
            </div>
          )}
          {sharedDays.map((day, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}>
              <h3 style={{ fontStyle: "italic", fontSize: "1.05rem", color: G, fontWeight: "normal", marginBottom: "0.8rem", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0.6rem" }}>{day.title}</h3>
              {renderContent(day.lines)}
            </div>
          ))}
          {sharedRest.map((sec, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}>
              <h3 style={{ fontStyle: "italic", fontSize: "1.05rem", color: G, fontWeight: "normal", marginBottom: "0.8rem" }}>{sec.title}</h3>
              {renderContent(sec.lines)}
            </div>
          ))}
          {wd && (
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.2rem" }}>
                <span style={{ fontSize: "1.3rem" }}>🔭</span>
                <h2 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", margin: 0 }}>Wildlife You May See</h2>
              </div>
              {wd.hasMigration && (
                <div style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.25)", borderRadius: "10px", padding: "0.9rem 1.2rem", marginBottom: "1.2rem" }}>
                  <span style={{ fontSize: "0.8rem", color: G }}>🦌 Great Migration Zone — ask your operator about current herd positions.</span>
                </div>
              )}
              {[
                { label: "Very Likely", animals: wd.veryLikely, color: "#86efac" },
                { label: "Good Chance", animals: wd.goodChance, color: G },
                { label: "Rare but Possible", animals: wd.possible, color: "#f87171" },
              ].map(({ label, animals, color }) => (
                <div key={label} style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color, marginBottom: "0.5rem" }}>{label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {animals.map((a, i) => (
                      <span key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "0.3rem 0.9rem", fontSize: "0.82rem", color: TEXT }}>{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {cd && (
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.2rem" }}>
                <span style={{ fontSize: "1.3rem" }}>💰</span>
                <h2 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", margin: 0 }}>Estimated Costs</h2>
              </div>
              {cd.rows.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center", padding: "0.8rem 0", borderBottom: `1px solid rgba(212,168,67,0.07)` }}>
                  <span style={{ fontSize: "0.88rem", color: TEXT }}>{row.category}</span>
                  <span style={{ fontSize: "0.95rem", color: G, fontWeight: "bold" }}>${row.cost.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid rgba(212,168,67,0.25)` }}>
                <span style={{ fontSize: "0.88rem", color: TEXT, fontWeight: "bold" }}>Estimated Total</span>
                <span style={{ fontSize: "1.15rem", color: G, fontWeight: "bold" }}>${cd.totalLow.toLocaleString()} – ${cd.totalHigh.toLocaleString()}</span>
              </div>
            </div>
          )}
          <div style={{ textAlign: "center", padding: "2.5rem", background: "linear-gradient(135deg,rgba(212,168,67,0.1),rgba(212,168,67,0.03))", border: "1px solid rgba(212,168,67,0.3)", borderRadius: "16px", marginTop: "1rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>🌍</div>
            <h3 style={{ fontStyle: "italic", fontSize: "1.5rem", color: TEXT, fontWeight: "normal", marginBottom: "0.5rem" }}>Plan Your Own Safari</h3>
            <p style={{ color: MUTED, fontSize: "0.9rem", marginBottom: "1.5rem" }}>AI-generated itineraries in seconds. Free to try.</p>
            <button onClick={() => { window.location.href = "/"; }} style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>
              Plan My Safari →
            </button>
          </div>
        </div>
      </div>
    );
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
      <nav className="r-nav-main" style={{ position: "relative", zIndex: 10, borderBottom: `1px solid ${BORDER}`, padding: "1.2rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={() => nav("plan")} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
          <span style={{ fontSize: "1.5rem" }}>🦁</span>
          <span style={{ fontStyle: "italic", fontSize: "1.3rem", color: G, letterSpacing: "0.02em" }}>Safaripedia</span>
        </div>
        <div className="r-nav-tabs" style={{ display: "flex", gap: "2rem", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {[["plan", "Plan Safari"], ["destinations", "Destinations"], ["animals", "Animals"], ["guides", "Guides"]].map(([t, label]) => (
            <span key={t} onClick={() => nav(t)} style={{ cursor: "pointer", color: tab === t ? G : MUTED, borderBottom: tab === t ? `1px solid ${G}` : "1px solid transparent", paddingBottom: "2px", transition: "color 0.2s", whiteSpace: "nowrap" }}>
              {label}
            </span>
          ))}
          <span onClick={() => { window.location.href = "/operator"; }} style={{ cursor: "pointer", color: MUTED, borderBottom: "1px solid transparent", paddingBottom: "2px", transition: "color 0.2s", fontSize: "0.75rem", background: "rgba(212,168,67,0.08)", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "0.25rem 0.8rem", whiteSpace: "nowrap" }}>
            Operators
          </span>
        </div>
        <button
          className="r-hamburger"
          data-testid="button-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: "none", background: "none", border: "none", color: G, fontSize: "1.6rem", cursor: "pointer", padding: "0.3rem", lineHeight: 1 }}
        >
          ☰
        </button>
      </nav>
      {mobileMenuOpen && (
        <div className="r-mobile-menu" data-testid="mobile-menu" style={{ display: "none", flexDirection: "column", background: BG, borderBottom: `1px solid ${BORDER}`, position: "relative", zIndex: 9 }}>
          {[["plan", "Plan Safari"], ["destinations", "Destinations"], ["animals", "Animals"], ["guides", "Guides"]].map(([t, label]) => (
            <span key={t} data-testid={`menu-item-${t}`} onClick={() => { nav(t); setMobileMenuOpen(false); }}
              style={{ cursor: "pointer", color: tab === t ? G : TEXT, fontFamily: FONT, fontSize: "1rem", padding: "1rem 2rem", borderBottom: `1px solid ${BORDER}`, transition: "color 0.2s", background: tab === t ? "rgba(212,168,67,0.08)" : "transparent" }}>
              {label}
            </span>
          ))}
          <span data-testid="menu-item-operators" onClick={() => { setMobileMenuOpen(false); window.location.href = "/operator"; }}
            style={{ cursor: "pointer", color: TEXT, fontFamily: FONT, fontSize: "1rem", padding: "1rem 2rem", transition: "color 0.2s" }}>
            Operators
          </span>
        </div>
      )}

      {/* ── PLAN TAB ── */}
      {tab === "plan" && (
        <>
          <div className="r-section-hero" style={{ position: "relative", zIndex: 1, padding: "5rem 2rem 4rem", textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1.5rem", opacity: 0.8 }}>✦ AI-Powered Safari Planning ✦</div>
            <h1 className="r-heading-xl" style={{ fontStyle: "italic", fontSize: "clamp(2.4rem,6vw,4rem)", lineHeight: 1.15, color: TEXT, marginBottom: "1.2rem", fontWeight: "normal" }}>
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
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

              {/* Stage indicator */}
              <div style={{ background: "rgba(212,168,67,0.05)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem 2rem", marginBottom: "1.5rem", animation: "fadeIn 0.4s ease" }}>
                <div style={{ display: "flex", gap: "0", marginBottom: "1.2rem" }}>
                  {[
                    { n: 1, label: "Planning Route" },
                    { n: 2, label: "Estimating Costs" },
                    { n: 3, label: "Finalising" },
                  ].map(({ n, label }, i) => {
                    const done = loadingStage > n;
                    const active = loadingStage === n;
                    return (
                      <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                        {/* connector line */}
                        {i > 0 && <div style={{ position: "absolute", left: 0, top: "14px", width: "50%", height: "2px", background: done || active ? G : "rgba(212,168,67,0.15)", transition: "background 0.5s" }} />}
                        {i < 2 && <div style={{ position: "absolute", right: 0, top: "14px", width: "50%", height: "2px", background: done ? G : "rgba(212,168,67,0.15)", transition: "background 0.5s" }} />}
                        {/* circle */}
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: done ? G : active ? "rgba(212,168,67,0.15)" : "rgba(212,168,67,0.05)", border: `2px solid ${done || active ? G : "rgba(212,168,67,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, transition: "all 0.4s", position: "relative" }}>
                          {done
                            ? <span style={{ fontSize: "0.75rem", color: BG, fontWeight: "bold" }}>✓</span>
                            : active
                              ? <div style={{ width: "10px", height: "10px", border: `2px solid ${G}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                              : <span style={{ fontSize: "0.65rem", color: MUTED }}>{n}</span>
                          }
                        </div>
                        <span style={{ fontSize: "0.68rem", color: done || active ? G : MUTED, marginTop: "0.4rem", letterSpacing: "0.06em", transition: "color 0.4s", textAlign: "center" }}>{label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Status message */}
                <div style={{ textAlign: "center", color: MUTED, fontSize: "0.82rem", fontStyle: "italic" }}>
                  {loadingStage === 1 && "✦ Designing your day-by-day itinerary…"}
                  {loadingStage === 2 && "✦ Calculating realistic costs for your trip…"}
                  {loadingStage === 3 && "✦ Preparing your shareable safari plan…"}
                </div>
              </div>

              {/* Shimmer skeleton */}
              {[100, 85, 95, 75, 90].map((w, i) => (
                <div key={i} style={{ height: "13px", background: "rgba(212,168,67,0.08)", borderRadius: "4px", marginBottom: "0.8rem", width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
              ))}
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


                {/* ── WILDLIFE PREDICTOR ── */}
                {wildlifeData && (
                  <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>🔭</span>
                      <h2 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", margin: 0 }}>Wildlife You May See</h2>
                    </div>
                    <p style={{ color: MUTED, fontSize: "0.8rem", marginBottom: "1.5rem", fontStyle: "italic" }}>
                      Based on the parks in your itinerary — predictions vary by season and conditions.
                    </p>

                    {wildlifeData.hasMigration && (
                      <div style={{ background: "linear-gradient(135deg,rgba(212,168,67,0.12),rgba(212,168,67,0.04))", border: "1px solid rgba(212,168,67,0.3)", borderRadius: "10px", padding: "0.9rem 1.2rem", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>🦌</span>
                        <div>
                          <div style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: G, fontWeight: "bold" }}>Great Migration Zone</div>
                          <div style={{ fontSize: "0.8rem", color: MUTED, marginTop: "0.2rem" }}>Your itinerary passes through the Great Migration corridor. Timing is everything — ask your operator about current herd positions.</div>
                        </div>
                      </div>
                    )}

                    {[
                      { label: "Very Likely", animals: wildlifeData.veryLikely, color: "#86efac", bg: "rgba(134,239,172,0.06)", border: "rgba(134,239,172,0.15)", dot: "🟢" },
                      { label: "Good Chance", animals: wildlifeData.goodChance, color: G, bg: "rgba(212,168,67,0.06)", border: "rgba(212,168,67,0.15)", dot: "🟡" },
                      { label: "Rare but Possible", animals: wildlifeData.possible, color: "#f87171", bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.15)", dot: "🔴" },
                    ].map(({ label, animals, color, bg, border, dot }) => (
                      <div key={label} style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                          <span style={{ fontSize: "0.65rem" }}>{dot}</span>
                          <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color }}>{label}</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {animals.map((animal, i) => (
                            <span key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: "20px", padding: "0.3rem 0.9rem", fontSize: "0.82rem", color: TEXT }}>
                              {animal}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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

                {/* ── SHARE MY SAFARI ── */}
                {shareId && (
                  <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "2rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>🔗</span>
                      <h2 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", margin: 0 }}>Share My Safari Plan</h2>
                    </div>
                    <p style={{ color: MUTED, fontSize: "0.82rem", marginBottom: "1.2rem", fontStyle: "italic" }}>
                      Share this itinerary with your travel partner, family, or friends.
                    </p>

                    {/* URL box */}
                    <div className="r-share-url" style={{ display: "flex", gap: "0.6rem", marginBottom: "1.2rem" }}>
                      <div style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "0.65rem 1rem", fontSize: "0.8rem", color: MUTED, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {window.location.origin}/trip/{shareId}
                      </div>
                      <button onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/trip/${shareId}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }} style={{ background: copied ? "rgba(134,239,172,0.15)" : "rgba(212,168,67,0.1)", border: `1px solid ${copied ? "rgba(134,239,172,0.3)" : BORDER}`, borderRadius: "8px", padding: "0.65rem 1.2rem", fontSize: "0.8rem", color: copied ? "#86efac" : G, cursor: "pointer", whiteSpace: "nowrap", fontFamily: FONT, transition: "all 0.2s" }}>
                        {copied ? "✓ Copied!" : "Copy Link"}
                      </button>
                    </div>

                    {/* Share buttons */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                      {[
                        { label: "💬 WhatsApp", color: "#25d366", url: `https://wa.me/?text=Just planned my African safari with Safaripedia ✈️🦁 Check it out: ${encodeURIComponent(window.location.origin + "/trip/" + shareId)}` },
                        { label: "✉️ Email", color: G, url: `mailto:?subject=My Safari Plan — Safaripedia&body=I just planned my African safari with Safaripedia — check it out: ${window.location.origin}/trip/${shareId}` },
                        { label: "🐦 Twitter / X", color: "#1da1f2", url: `https://twitter.com/intent/tweet?text=Just planned my African safari with Safaripedia ✈️🦁 Check it out!&url=${encodeURIComponent(window.location.origin + "/trip/" + shareId)}` },
                        { label: "📋 Reddit", color: "#ff4500", url: `https://reddit.com/submit?url=${encodeURIComponent(window.location.origin + "/trip/" + shareId)}&title=I planned my African safari with Safaripedia AI` },
                      ].map(({ label, color, url }) => (
                        <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                          style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "0.4rem 1rem", fontSize: "0.8rem", color: TEXT, textDecoration: "none", cursor: "pointer", transition: "border-color 0.2s" }}
                          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = color}
                          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = BORDER}>
                          {label}
                        </a>
                      ))}
                    </div>
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
                    {/* Step indicator */}
                    <div className="r-step-indicator" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.8rem" }}>
                      {[["1","Contact"],["2","Your Trip"],["3","Travel Style"]].map(([n, label], i) => (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: leadStep > parseInt(n) ? G : leadStep === parseInt(n) ? G : "rgba(255,255,255,0.08)", border: `1px solid ${leadStep >= parseInt(n) ? G : "rgba(212,168,67,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: leadStep >= parseInt(n) ? BG : MUTED, fontWeight: "bold", flexShrink: 0 }}>{leadStep > parseInt(n) ? "✓" : n}</div>
                          <span style={{ fontSize: "0.72rem", color: leadStep === parseInt(n) ? G : MUTED, letterSpacing: "0.08em" }}>{label}</span>
                          {i < 2 && <div style={{ width: "24px", height: "1px", background: "rgba(212,168,67,0.2)", margin: "0 0.2rem" }} />}
                        </div>
                      ))}
                    </div>

                    {/* ── STEP 1: Contact ── */}
                    {leadStep === 1 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <h3 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", margin: 0 }}>Who are we quoting for?</h3>
                        <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                          {[["name","Your Name","Jane Smith"],["email","Email Address","jane@example.com"]].map(([k, label, ph]) => (
                            <div key={k}>
                              <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.35rem" }}>{label}</label>
                              <input value={lead[k as keyof typeof lead] as string} onChange={e => setLead(l => ({ ...l, [k]: e.target.value }))} placeholder={ph}
                                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "6px", padding: "0.65rem 0.8rem", color: TEXT, fontSize: "0.85rem", fontFamily: FONT, outline: "none", boxSizing: "border-box" as const }} />
                            </div>
                          ))}
                        </div>
                        <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                          {[["travelers","Number of Travellers","2 adults"],["budget","Total Budget (USD)","$5,000"]].map(([k, label, ph]) => (
                            <div key={k}>
                              <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.35rem" }}>{label}</label>
                              <input value={lead[k as keyof typeof lead] as string} onChange={e => setLead(l => ({ ...l, [k]: e.target.value }))} placeholder={ph}
                                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "6px", padding: "0.65rem 0.8rem", color: TEXT, fontSize: "0.85rem", fontFamily: FONT, outline: "none", boxSizing: "border-box" as const }} />
                            </div>
                          ))}
                        </div>
                        <button onClick={() => { if (lead.name && lead.email) setLeadStep(2); }}
                          style={{ background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.9rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer", marginTop: "0.5rem" }}>
                          Next: Trip Details →
                        </button>
                      </div>
                    )}

                    {/* ── STEP 2: Trip Details ── */}
                    {leadStep === 2 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <h3 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", margin: 0 }}>Tell us about your trip</h3>
                        <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.35rem" }}>Travel Dates</label>
                            <input value={lead.dates} onChange={e => setLead(l => ({ ...l, dates: e.target.value }))} placeholder="Aug 10–20, 2025"
                              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "6px", padding: "0.65rem 0.8rem", color: TEXT, fontSize: "0.85rem", fontFamily: FONT, outline: "none", boxSizing: "border-box" as const }} />
                            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.5rem", cursor: "pointer" }}>
                              <input type="checkbox" checked={leadProfile.flexibleDates} onChange={e => setLeadProfile(p => ({ ...p, flexibleDates: e.target.checked }))}
                                style={{ accentColor: G }} />
                              <span style={{ fontSize: "0.75rem", color: MUTED }}>Flexible on dates</span>
                            </label>
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.35rem" }}>Group Type</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                              {[["couple","💑 Couple"],["family","👨‍👩‍👧 Family"],["friends","👯 Friends"],["solo","🧍 Solo"]].map(([v, label]) => (
                                <div key={v} onClick={() => setLeadProfile(p => ({ ...p, groupType: v }))}
                                  style={{ padding: "0.45rem 0.6rem", borderRadius: "6px", border: `1px solid ${leadProfile.groupType === v ? G : "rgba(212,168,67,0.2)"}`, background: leadProfile.groupType === v ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: "0.75rem", color: leadProfile.groupType === v ? G : MUTED, textAlign: "center" as const }}>
                                  {label}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.35rem" }}>Africa Experience</label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {[["first-time","🌍 First time"],["been-once","✈️ Been once"],["experienced","🦁 Experienced"]].map(([v, label]) => (
                              <div key={v} onClick={() => setLeadProfile(p => ({ ...p, africaExperience: v }))}
                                style={{ flex: 1, padding: "0.55rem", borderRadius: "6px", border: `1px solid ${leadProfile.africaExperience === v ? G : "rgba(212,168,67,0.2)"}`, background: leadProfile.africaExperience === v ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: "0.75rem", color: leadProfile.africaExperience === v ? G : MUTED, textAlign: "center" as const }}>
                                {label}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.35rem" }}>Additional Notes</label>
                          <textarea value={lead.notes} onChange={e => setLead(l => ({ ...l, notes: e.target.value }))} rows={2} placeholder="Special requests, dietary needs, accessibility…"
                            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: "6px", padding: "0.65rem 0.8rem", color: TEXT, fontSize: "0.85rem", fontFamily: FONT, outline: "none", resize: "none", boxSizing: "border-box" as const }} />
                        </div>
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                          <button onClick={() => setLeadStep(1)} style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.85rem", fontSize: "0.85rem", fontFamily: FONT, cursor: "pointer" }}>← Back</button>
                          <button onClick={() => setLeadStep(3)} style={{ flex: 3, background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.9rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>Next: Travel Style →</button>
                        </div>
                      </div>
                    )}

                    {/* ── STEP 3: Travel Style ── */}
                    {leadStep === 3 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <h3 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", margin: 0 }}>What kind of safari experience?</h3>

                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>Accommodation Style</label>
                          <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            {[["tented-camp","⛺ Tented Camp","Classic bush intimacy"],["lodge","🏡 Lodge","Comfort & views"],["mixed","🔄 Mix of both","Best of both worlds"],["self-drive","🚗 Self-Drive","Independent adventure"]].map(([v, label, sub]) => (
                              <div key={v} onClick={() => setLeadProfile(p => ({ ...p, accommodation: v }))}
                                style={{ padding: "0.7rem 0.8rem", borderRadius: "8px", border: `1px solid ${leadProfile.accommodation === v ? G : "rgba(212,168,67,0.2)"}`, background: leadProfile.accommodation === v ? "rgba(212,168,67,0.1)" : "rgba(255,255,255,0.02)", cursor: "pointer" }}>
                                <div style={{ fontSize: "0.82rem", color: leadProfile.accommodation === v ? G : TEXT, marginBottom: "0.15rem" }}>{label}</div>
                                <div style={{ fontSize: "0.7rem", color: MUTED }}>{sub}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>Trip Priority</label>
                          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.4rem" }}>
                            {[["wildlife","🦁 Wildlife"],["photography","📷 Photography"],["relaxation","🌅 Relaxation"],["culture","🏘 Culture"],["romance","💑 Romance"],["adventure","🥾 Adventure"]].map(([v, label]) => (
                              <div key={v} onClick={() => setLeadProfile(p => ({ ...p, tripPriority: p.tripPriority === v ? "" : v }))}
                                style={{ padding: "0.4rem 0.8rem", borderRadius: "20px", border: `1px solid ${leadProfile.tripPriority === v ? G : "rgba(212,168,67,0.2)"}`, background: leadProfile.tripPriority === v ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: "0.78rem", color: leadProfile.tripPriority === v ? G : MUTED }}>
                                {label}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>Must-See Animals <span style={{ textTransform: "none", letterSpacing: 0, color: MUTED, fontSize: "0.65rem" }}>(pick any)</span></label>
                          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.4rem" }}>
                            {[["lion","🦁 Lion"],["elephant","🐘 Elephant"],["leopard","🐆 Leopard"],["rhino","🦏 Rhino"],["cheetah","🐆 Cheetah"],["gorilla","🦍 Gorilla"],["wild-dog","🐕 Wild Dog"],["migration","🐃 Migration"]].map(([v, label]) => {
                              const selected = leadProfile.mustSeeAnimals.includes(v);
                              return (
                                <div key={v} onClick={() => setLeadProfile(p => ({ ...p, mustSeeAnimals: selected ? p.mustSeeAnimals.filter(a => a !== v) : [...p.mustSeeAnimals, v] }))}
                                  style={{ padding: "0.4rem 0.8rem", borderRadius: "20px", border: `1px solid ${selected ? G : "rgba(212,168,67,0.2)"}`, background: selected ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: "0.78rem", color: selected ? G : MUTED }}>
                                  {label}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.8rem" }}>
                          <button onClick={() => setLeadStep(2)} style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "8px", padding: "0.85rem", fontSize: "0.85rem", fontFamily: FONT, cursor: "pointer" }}>← Back</button>
                          <button onClick={async () => {
                            try {
                              await fetch("/api/lead", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ...lead,
                                  ...leadProfile,
                                  mustSeeAnimals: leadProfile.mustSeeAnimals.join(", "),
                                  prompt,
                                  itinerary: result ? (typeof result === "string" ? result.slice(0, 1000) : "") : "",
                                  destination: prompt,
                                }),
                              });
                            } catch { /* non-critical */ }
                            setLeadDone(true);
                          }} style={{ flex: 3, background: G, color: BG, border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.9rem", fontFamily: FONT, fontWeight: "bold", cursor: "pointer" }}>
                            Send My Request →
                          </button>
                        </div>
                      </div>
                    )}
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
        <div className="r-section" style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem 4rem" }}>
          {!dest ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1rem" }}>✦ Explore Africa ✦</div>
                <h1 className="r-heading-xl" style={{ fontStyle: "italic", fontSize: "2.5rem", color: TEXT, fontWeight: "normal", marginBottom: "0.8rem" }}>Safari Destinations</h1>
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
              <div className="r-dest-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
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

      {/* ── ANIMALS TAB ── */}
      {tab === "animals" && (
        <div className="r-section" style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem 4rem" }}>
          {!animal ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1rem" }}>✦ Wildlife Guides ✦</div>
                <h1 className="r-heading-xl" style={{ fontStyle: "italic", fontSize: "2.5rem", color: TEXT, fontWeight: "normal", marginBottom: "0.8rem" }}>Safari Animals</h1>
                <p style={{ color: MUTED, fontSize: "0.95rem" }}>Find the best parks and seasons for the animals you most want to see.</p>
              </div>

              {/* Big Five + Migration featured cards */}
              <div className="r-animal-featured" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {ANIMALS.filter(a => a.slug === "big-five" || a.slug === "migration").map((a, i) => (
                  <div key={i} onClick={() => setAnimal(a)}
                    style={{ background: "linear-gradient(135deg,rgba(212,168,67,0.1),rgba(212,168,67,0.03))", border: "1px solid rgba(212,168,67,0.3)", borderRadius: "12px", padding: "1.8rem", cursor: "pointer", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = BORDER2}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)"}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>{a.emoji}</div>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: G, marginBottom: "0.4rem" }}>Featured Guide</div>
                    <h3 style={{ fontStyle: "italic", fontSize: "1.1rem", color: TEXT, fontWeight: "normal", marginBottom: "0.5rem" }}>{a.headline}</h3>
                    <p style={{ color: MUTED, fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>{a.intro.slice(0, 100)}…</p>
                    <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: G }}>Read Guide →</div>
                  </div>
                ))}
              </div>

              {/* Individual animal cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1rem" }}>
                {ANIMALS.filter(a => a.slug !== "big-five" && a.slug !== "migration").map((a, i) => (
                  <div key={i} onClick={() => setAnimal(a)}
                    style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", cursor: "pointer", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = BORDER2}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>{a.emoji}</div>
                    <h3 style={{ fontStyle: "italic", fontSize: "1.1rem", color: TEXT, fontWeight: "normal", marginBottom: "0.4rem" }}>{a.name}</h3>
                    <p style={{ color: MUTED, fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>{a.intro.slice(0, 90)}…</p>
                    <div style={{ marginTop: "0.8rem", fontSize: "0.75rem", color: G }}>Where to see →</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div>
              {backBtn("← Back to Animals", () => setAnimal(null))}

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.5rem" }}>{animal.emoji}</span>
                <div>
                  <h1 style={{ fontStyle: "italic", fontSize: "2rem", color: TEXT, fontWeight: "normal", margin: 0 }}>{animal.headline}</h1>
                </div>
              </div>

              {/* Intro */}
              <div style={{ background: "rgba(212,168,67,0.06)", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.8rem", marginBottom: "1.5rem" }}>
                <p style={{ color: TEXT, fontSize: "0.95rem", lineHeight: 1.75, margin: 0 }}>{animal.intro}</p>
              </div>

              {/* Best Parks */}
              <h2 style={{ fontStyle: "italic", fontSize: "1.2rem", color: G, fontWeight: "normal", marginBottom: "1rem", paddingLeft: "0.5rem", borderLeft: `3px solid ${G}` }}>
                {animal.slug === "migration" ? "Migration Calendar" : animal.slug === "big-five" ? "Best Big Five Destinations" : `Best Parks for ${animal.name} Sightings`}
              </h2>
              <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                {animal.bestParks.map((park, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.4rem", display: "grid", gridTemplateColumns: "auto 1fr", gap: "1rem", alignItems: "start" }}>
                    <div style={{ background: "rgba(212,168,67,0.15)", borderRadius: "6px", padding: "0.3rem 0.6rem", fontSize: "0.7rem", color: G, border: "1px solid rgba(212,168,67,0.2)", whiteSpace: "nowrap" }}>{i + 1}</div>
                    <div>
                      <h3 style={{ fontStyle: "italic", fontSize: "1rem", color: G, fontWeight: "normal", marginBottom: "0.4rem" }}>{park.name}</h3>
                      <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>{park.reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Best Time + Fun Fact */}
              <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.4rem" }}>
                  <h3 style={{ fontStyle: "italic", color: G, fontSize: "0.95rem", fontWeight: "normal", marginBottom: "0.6rem" }}>📅 Best Time to Visit</h3>
                  <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>{animal.bestTime}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.4rem" }}>
                  <h3 style={{ fontStyle: "italic", color: G, fontSize: "0.95rem", fontWeight: "normal", marginBottom: "0.6rem" }}>✦ Did You Know?</h3>
                  <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>{animal.funFact}</p>
                </div>
              </div>

              {/* CTA */}
              <div style={{ textAlign: "center", padding: "2rem", background: "linear-gradient(135deg,rgba(212,168,67,0.08),rgba(212,168,67,0.03))", border: "1px solid rgba(212,168,67,0.25)", borderRadius: "14px" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{animal.emoji}</div>
                <h3 style={{ fontStyle: "italic", fontSize: "1.2rem", color: TEXT, fontWeight: "normal", marginBottom: "0.5rem" }}>
                  Plan a {animal.slug === "migration" ? "Migration" : animal.slug === "big-five" ? "Big Five" : animal.name} Safari
                </h3>
                <p style={{ color: MUTED, fontSize: "0.88rem", marginBottom: "1.2rem" }}>Let our AI build you a custom itinerary for the best sightings.</p>
                {btn("Plan My Safari →", () => {
                  nav("plan");
                  setPrompt(animal.slug === "migration" ? "Great Migration safari Serengeti and Maasai Mara" : animal.slug === "big-five" ? "Big Five safari 7 days" : `Safari to see ${animal.name}s in Africa`);
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GUIDES TAB ── */}
      {tab === "guides" && (
        <div className="r-section" style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem 4rem" }}>
          {!guide ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1rem" }}>✦ Expert Knowledge ✦</div>
                <h1 className="r-heading-xl" style={{ fontStyle: "italic", fontSize: "2.5rem", color: TEXT, fontWeight: "normal", marginBottom: "0.8rem" }}>Safari Guides</h1>
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
      <div className="r-footer" style={{ borderTop: `1px solid ${BORDER}`, padding: "3rem 2rem", textAlign: "center", position: "relative", zIndex: 1 }}>
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
        <div style={{ marginTop: "1rem" }}>
          <span onClick={() => { window.location.href = "/operator"; }} style={{ fontSize: "0.72rem", color: MUTED, cursor: "pointer", borderBottom: `1px solid rgba(168,144,96,0.3)`, paddingBottom: "1px" }}>
            Are you a safari operator? Access the Operator Portal →
          </span>
        </div>
      </div>
    </div>
  );
}