import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
  const title = decision === "approved" ? "You\'re Approved!" : "Application Update";
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

  // ── Generate ──
  app.post(api.generate.path, async (req, res) => {
    try {
      const input = api.generate.input.parse(req.body);
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return res.status(500).json({ message: "ANTHROPIC_API_KEY not configured" });
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1024, messages: [{ role: "user", content: input.prompt }] })
      });
      const data = await response.json();
      if (!response.ok || data.type === "error") return res.status(500).json({ message: "Anthropic error", detail: data });
      const text = data.content[0].text;
      await storage.createGeneration({ prompt: input.prompt, response: text });
      analyticsStore.push({ ...extractTripData(input.prompt), timestamp: new Date().toISOString() });
      res.status(200).json({ response: text });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Submit lead ──
  app.post("/api/lead", async (req, res) => {
    try {
      const { name, email, dates, travelers, budget, notes, prompt, itinerary, destination } = req.body;
      if (!name || !email) return res.status(400).json({ message: "Name and email required" });

      // Duplicate protection
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
        status: "new", timestamp: new Date().toISOString(), matchedOperatorId: null,
      };

      // Match to best approved operator
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