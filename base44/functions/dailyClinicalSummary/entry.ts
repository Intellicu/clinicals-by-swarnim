import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled (no user) and manual (admin user) calls
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch {
      isAuthorized = true; // scheduled automation
    }

    if (!isAuthorized) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const today = new Date().toISOString().slice(0, 10);

    // Handle unsubscribe token (single-click unsubscribe, no login required)
    const url = new URL(req.url);
    const unsubToken = url.searchParams.get('unsubscribe');
    if (unsubToken) {
      const allPrefs = await base44.asServiceRole.entities.NotificationPreference.list('-created_date', 500);
      const match = allPrefs.find(p => p.id === unsubToken || p.user_email === unsubToken);
      if (match) {
        await base44.asServiceRole.entities.NotificationPreference.update(match.id, {
          daily_clinical_summary: false,
        });
        return new Response('<html><body style="font-family:sans-serif;max-width:400px;margin:60px auto;text-align:center"><h2>Unsubscribed</h2><p>You have been unsubscribed from Daily Clinical Summaries. You can re-enable this at any time in Notification Preferences.</p></body></html>', {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      return Response.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Fetch recent data
    const [recentAlerts, recentEncounters] = await Promise.allSettled([
      base44.asServiceRole.entities.MonitoringAlert.list('-created_date', 10),
      base44.asServiceRole.entities.ClinicalEncounter.list('-created_date', 5),
    ]);
    const alerts = recentAlerts.status === 'fulfilled' ? recentAlerts.value : [];
    const encounterCount = recentEncounters.status === 'fulfilled' ? recentEncounters.value.length : 0;

    // AI prompt — structured 6-section daily summary
    const prompt = `You are a senior pediatric nephrologist creating a daily clinical briefing for residents and fellows. Today is ${today}. Active system alerts: ${alerts.length}. Encounters today: ${encounterCount}.

Generate a high-yield daily summary with EXACTLY this JSON structure. Keep each section SHORT (2–4 lines max). This must be readable in under 60 seconds. Be clinical, practical, and engaging.

IMPORTANT: Vary the topic daily. Rotate through: AKI, Nephrotic Syndrome, Hypertension, CKD, Electrolytes, Rare Disease, Tubular disorders, Dialysis, Transplant, Glomerulonephritis.

Return JSON with these fields:
- clinical_pearl (string, 2-3 lines max, one actionable teaching point)
- pearl_topic (string, e.g. "AKI in Nephrotic Syndrome")
- pearl_pathway_url (string, one of: "/ClinicalSupport", "/EmergencyHub", "/GlomerularDiseases" — pick relevant one)
- challenge_case (string, 3-4 line clinical vignette, end with "Most likely cause?")
- challenge_options (array of 3 strings, e.g. ["A. ATN", "B. Hypovolemia", "C. RPGN"])
- challenge_answer (number, 0-indexed correct option)
- challenge_explanation (string, 1-2 lines explaining the answer)
- challenge_link_url (string, relevant page path e.g. "/ClinicalSupport")
- drug_name (string, one drug name)
- drug_pearl (string, 2-3 lines: indications + mechanism + one key clinical pearl)
- rare_disease_name (string, one rare disease e.g. "Dent Disease")
- rare_disease_spotlight (string, 2-3 bullet points as newline-separated text with • prefix)
- guideline_condition (string, e.g. "Alport Syndrome")
- guideline_reminder (string, 2-3 lines, one key recommendation with guideline source)
- whats_new (array of 3 strings, short feature names recently added to CliniCals platform)
- subject_line (string, email subject e.g. "🩺 CliniCals Daily | Hyperkalemia Pearl • Clinical Challenge")`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          clinical_pearl: { type: 'string' },
          pearl_topic: { type: 'string' },
          pearl_pathway_url: { type: 'string' },
          challenge_case: { type: 'string' },
          challenge_options: { type: 'array', items: { type: 'string' } },
          challenge_answer: { type: 'number' },
          challenge_explanation: { type: 'string' },
          challenge_link_url: { type: 'string' },
          drug_name: { type: 'string' },
          drug_pearl: { type: 'string' },
          rare_disease_name: { type: 'string' },
          rare_disease_spotlight: { type: 'string' },
          guideline_condition: { type: 'string' },
          guideline_reminder: { type: 'string' },
          whats_new: { type: 'array', items: { type: 'string' } },
          subject_line: { type: 'string' },
        },
      },
    });

    const summaryData = {
      date: today,
      ...result,
      alerts_count: alerts.length,
      encounters_count: encounterCount,
      generated_at: new Date().toISOString(),
    };

    // Store/update in CustomSection
    const existing = await base44.asServiceRole.entities.CustomSection.filter({
      section_type: 'general',
      generation_topic: 'daily_summary',
      title: `Daily Summary ${today}`,
    });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.CustomSection.update(existing[0].id, {
        content: summaryData,
        status: 'published',
      });
    } else {
      await base44.asServiceRole.entities.CustomSection.create({
        title: `Daily Summary ${today}`,
        section_type: 'general',
        generation_topic: 'daily_summary',
        created_by_admin: true,
        status: 'published',
        content: summaryData,
      });
    }

    // Email all subscribed users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 200);
    const allPrefs = await base44.asServiceRole.entities.NotificationPreference.list('-created_date', 500);
    const prefsByEmail = {};
    for (const p of allPrefs) { if (p.user_email) prefsByEmail[p.user_email] = p; }

    let emailsSent = 0;
    for (const u of allUsers.slice(0, 50)) {
      if (!u.email) continue;
      const pref = prefsByEmail[u.email];
      // Skip if explicitly opted out
      if (pref && pref.daily_clinical_summary === false) continue;
      // By default send to all (opt-out model)

      const unsubUrl = `https://api.base44.com/api/apps/APP_ID/functions/dailyClinicalSummary?unsubscribe=${pref?.id || u.email}`;

      const emailBody = `Dear Dr. ${u.full_name || 'Colleague'},

${result.subject_line || `🩺 CliniCals Daily | ${result.pearl_topic || 'Clinical Briefing'} — ${today}`}

━━━━━━━━━━━━━━━━━━━━
💡 CLINICAL PEARL — ${result.pearl_topic || ''}
━━━━━━━━━━━━━━━━━━━━
${result.clinical_pearl || ''}

━━━━━━━━━━━━━━━━━━━━
🩺 30-SECOND CHALLENGE
━━━━━━━━━━━━━━━━━━━━
${result.challenge_case || ''}
${(result.challenge_options || []).join(' | ')}
Answer: ${(result.challenge_options || [])[result.challenge_answer] || ''} — ${result.challenge_explanation || ''}

━━━━━━━━━━━━━━━━━━━━
💊 DRUG PEARL — ${result.drug_name || ''}
━━━━━━━━━━━━━━━━━━━━
${result.drug_pearl || ''}

━━━━━━━━━━━━━━━━━━━━
🔬 RARE DISEASE SPOTLIGHT — ${result.rare_disease_name || ''}
━━━━━━━━━━━━━━━━━━━━
${result.rare_disease_spotlight || ''}

━━━━━━━━━━━━━━━━━━━━
📖 GUIDELINE REMINDER — ${result.guideline_condition || ''}
━━━━━━━━━━━━━━━━━━━━
${result.guideline_reminder || ''}

━━━━━━━━━━━━━━━━━━━━
✨ WHAT'S NEW
━━━━━━━━━━━━━━━━━━━━
${(result.whats_new || []).map(x => `✓ ${x}`).join('\n')}

Open full summary → https://app.base44.com/DailySummary

━━━━━━━━━━━━━━━━━━━━
CliniCals Hub by Swarnim — Pediatric Clinical Intelligence
For educational purposes only. Not a substitute for clinical judgment.

You are receiving this because Daily Clinical Summaries are enabled for your account.
Manage Preferences | Unsubscribe: ${unsubUrl}`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject: result.subject_line || `🩺 CliniCals Daily | ${today}`,
          body: emailBody,
        });
        emailsSent++;
      } catch (emailErr) {
        console.warn('Email failed for', u.email, emailErr.message);
      }
    }

    return Response.json({ success: true, date: today, summary: summaryData, emails_sent: emailsSent });
  } catch (error) {
    console.error('dailyClinicalSummary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});