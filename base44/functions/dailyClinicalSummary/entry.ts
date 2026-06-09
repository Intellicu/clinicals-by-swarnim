import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (no user) and manual (admin user) calls
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch {
      // Called from scheduled automation — no user context, use service role
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Fetch recent data in parallel
    const [recentAlerts, recentLabs, recentEncounters] = await Promise.allSettled([
      base44.asServiceRole.entities.MonitoringAlert.list('-created_date', 20),
      base44.asServiceRole.entities.LabResult.list('-created_date', 10),
      base44.asServiceRole.entities.ClinicalEncounter.list('-created_date', 5),
    ]);

    const alerts = recentAlerts.status === 'fulfilled' ? recentAlerts.value : [];
    const labs = recentLabs.status === 'fulfilled' ? recentLabs.value : [];
    const encounters = recentEncounters.status === 'fulfilled' ? recentEncounters.value : [];

    // Build context for AI
    const alertSummary = alerts.slice(0, 5).map(a => `- ${a.alert_type || 'Alert'}: ${a.message || a.title || 'Check patient'}`).join('\n') || 'No new alerts today.';
    const labSummary = labs.slice(0, 3).map(l => `- ${l.test_name || 'Lab'}: ${l.value || ''} ${l.unit || ''} (${l.status || ''})`).join('\n') || 'No recent lab flags.';
    const encounterCount = encounters.length;

    const prompt = `You are a senior pediatric nephrologist creating a daily clinical briefing for the team. Today is ${today}.

Recent system alerts (last 24h):
${alertSummary}

Recent lab highlights:
${labSummary}

Recent encounters: ${encounterCount} recorded today.

Generate a structured daily clinical summary with EXACTLY these sections (keep each concise, clinical, and practical):

1. **Daily Highlights** (2-3 bullet points about what's important today clinically)
2. **Clinical Vignette** (A realistic 5-10 sentence pediatric nephrology case — patient age, presentation, key labs, diagnosis, management — educational value, do NOT use real names)
3. **Learning Pearl** (One important teaching point from Pediatric Nephrology or General Pediatrics — evidence-based, cite guideline if possible)
4. **Guideline Update / Reminder** (One recent or important KDIGO/ISPN/IAP/AAP recommendation worth remembering)
5. **Operational Summary** (Brief: ${encounterCount} encounters today, ${alerts.length} alerts in system)

Respond in clean markdown. Be concise but clinically rich.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary_markdown: { type: 'string' },
          vignette_title: { type: 'string' },
          pearl_title: { type: 'string' },
          date: { type: 'string' },
        },
      },
    });

    const summaryData = {
      date: today,
      summary_markdown: result.summary_markdown || '',
      vignette_title: result.vignette_title || 'Clinical Vignette',
      pearl_title: result.pearl_title || 'Learning Pearl',
      alerts_count: alerts.length,
      encounters_count: encounterCount,
      generated_at: new Date().toISOString(),
    };

    // Store as a CustomSection with section_type "general" for retrieval
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

    // Send email to all users who haven't opted out
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 100);
    const adminUsers = allUsers.filter(u => u.role === 'admin' && u.email);

    // Fetch notification preferences to respect opt-outs
    const allPrefs = await base44.asServiceRole.entities.NotificationPreference.list('-created_date', 200);
    const prefsByEmail = {};
    for (const p of allPrefs) {
      if (p.user_email) prefsByEmail[p.user_email] = p;
    }

    let emailsSent = 0;
    for (const admin of adminUsers.slice(0, 10)) {
      const pref = prefsByEmail[admin.email];
      // If pref exists and daily_clinical_summary is explicitly false, skip
      if (pref && pref.daily_clinical_summary === false) continue;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `📋 CliniCals Daily Summary — ${today}`,
          body: `Dear Dr. ${admin.full_name || 'Colleague'},\n\nYour daily clinical summary is ready for ${today}.\n\n${summaryData.summary_markdown}\n\n---\nCliniCals Hub by Swarnim | Pediatric Clinical Intelligence\nThis is an automated daily summary. For informational purposes only.\nTo unsubscribe, go to Notification Center → Preferences and disable Daily Clinical Summary.`,
        });
        emailsSent++;
      } catch (emailErr) {
        console.warn('Email failed for', admin.email, emailErr.message);
      }
    }

    return Response.json({
      success: true,
      date: today,
      summary: summaryData,
      emails_sent: emailsSent,
    });
  } catch (error) {
    console.error('dailyClinicalSummary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});