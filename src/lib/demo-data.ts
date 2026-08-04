// Pure data functions — no next/cache imports, so they can run from
// both server actions and the CLI seed script (scripts/seed.ts).
import { prisma } from "./db";

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function clearData() {
  await prisma.$transaction([
    prisma.transition.deleteMany(),
    prisma.relationship.deleteMany(),
    prisma.activeProject.deleteMany(),
    prisma.projectCandidate.deleteMany(),
    prisma.experiment.deleteMany(),
    prisma.exploration.deleteMany(),
    prisma.intent.deleteMany(),
    prisma.signal.deleteMany(),
  ]);
}

export async function seedDemoData() {
  await clearData();

  // ─────────────────────────────────────────────────────────────
  // STORY 1 — Full chain: Signal → Intent → Experiment → Candidate → Active Project
  // (the voice-capture example from the spec)
  // ─────────────────────────────────────────────────────────────

  const sigVoice = await prisma.signal.create({
    data: {
      title: "Capture friction makes me lose useful thoughts",
      body: "Several times a week I have a thought worth keeping — article ideas, debugging insights, things to tell someone — but by the time I sit down to type them, they are gone. The friction of opening an app and typing is enough to lose them.",
      context: "Noticed again while walking; lost a project-architecture idea.",
      state: "CLOSED",
    },
  });

  const intentVoice = await prisma.intent.create({
    data: {
      title: "One-tap voice capture",
      approach: "a one-tap phone shortcut that records voice notes into my notes inbox",
      expectedChange: "to retain more of my useful ideas",
      assumption: "typing friction is the main reason I fail to capture ideas",
      signalId: sigVoice.id,
      state: "CLOSED",
    },
  });

  await prisma.intent.create({
    data: {
      title: "Five-minute evening review",
      approach: "a 5-minute end-of-day review where I write down anything I still remember",
      expectedChange: "to preserve the day's useful ideas without new tooling",
      assumption: "most worthwhile ideas survive until the evening",
      signalId: sigVoice.id,
      state: "DORMANT",
    },
  });

  const expVoice = await prisma.experiment.create({
    data: {
      title: "14-day manual one-tap capture trial",
      decisionGoal:
        "Over fourteen days, determine whether to invest four weekends building a voice-capture MVP by testing whether I use a manual one-tap workflow on at least ten days and later retrieve at least three captured items that prove useful.",
      nextCommitment: "Invest four weekends building a voice-capture MVP",
      criticalAssumption: "Typing friction — not idea quality or review habits — is the main capture failure point.",
      testMethod: "Use the phone's 'Record to Notes' shortcut as the only capture method for 14 days. Log daily usage and weekly retrieval value.",
      observableEvidence: "Workflow used on at least 10 of 14 days, and at least 3 captured items prove useful when later retrieved.",
      budget: "14 days, $0, ~2 minutes/day",
      decisionDate: daysFromNow(-10),
      finalDecision: "CONTINUE",
      finalReasoning: "Used on 12 of 14 days; five captured items proved useful on later retrieval. Friction was the bottleneck — the assumption held.",
      intentId: intentVoice.id,
      state: "CLOSED",
    },
  });

  const candVoice = await prisma.projectCandidate.create({
    data: {
      title: "Voice-first capture app MVP",
      proposedOutcome: "A working app that records, transcribes, and files voice notes with one tap — used daily by me.",
      evidenceOfValue: "14-day manual trial: used 12/14 days, 5 valuable retrievals. Friction hypothesis confirmed with real usage data.",
      primaryAlignment: "Personal growth goal — build a reliable idea-retention system",
      acceptanceCriteria: "1) One-tap capture from the lock screen. 2) Automatic transcription. 3) Notes land in my existing notes inbox. 4) Used daily for two consecutive weeks.",
      constraints: "Solo build, weekend time only, transcription must be free or near-free.",
      roughEstimate: "4 weekends (~8 focused days)",
      worthy: "YES",
      ready: "YES",
      now: "YES",
      worthyReason: "Solves a daily, recurring loss of potentially valuable ideas — evidence-backed, not speculative.",
      readyReason: "Scope, acceptance criteria, and the first milestone are all clear from the manual trial.",
      nowReason: "Major project slot is free; delaying re-opens the idea-loss leak; no stronger competitor for the slot.",
      experimentId: expVoice.id,
      state: "CLOSED",
    },
  });

  const projVoice = await prisma.activeProject.create({
    data: {
      title: "Ship voice-capture MVP",
      desiredOutcome: "A working voice-capture app that I use daily, meeting all acceptance criteria.",
      acceptanceCriteria: "One-tap capture, auto-transcription, notes land in inbox, used daily for 2 weeks.",
      primaryAlignment: "Personal growth goal — reliable idea-retention system",
      deadline: daysFromNow(60),
      realisticLeadTime: "4 weekends",
      currentMilestone: "M1: One-tap recording works end-to-end",
      nextConcreteAction: "Scaffold the shortcut → webhook → notes-inbox pipeline",
      majorDependency: "Offline transcription quality",
      projectSlot: "MAJOR",
      projectCandidateId: candVoice.id,
      state: "ACTIVE",
    },
  });

  // Transition history for story 1
  await prisma.transition.createMany({
    data: [
      {
        fromEntityId: sigVoice.id, toEntityId: intentVoice.id,
        fromType: "SIGNAL", toType: "INTENT",
        fromState: "INBOX", toState: "INBOX",
        reason: "Weekly review: signal was clear enough to propose approaches directly — no exploration needed.",
      },
      {
        fromEntityId: intentVoice.id, toEntityId: expVoice.id,
        fromType: "INTENT", toType: "EXPERIMENT",
        fromState: "ACTIVE", toState: "INBOX",
        reason: "Assumption was already testable, so skipped exploration. One experiment, one decision, one critical uncertainty.",
      },
      {
        fromEntityId: expVoice.id, toEntityId: candVoice.id,
        fromType: "EXPERIMENT", toType: "PROJECT_CANDIDATE",
        fromState: "ACTIVE", toState: "CLOSED",
        reason: "Decision: CONTINUE — evidence supported the next commitment.",
        evidence: "Manual workflow used on 12 of 14 days; produced 5 useful later retrievals.",
      },
      {
        fromEntityId: candVoice.id, toEntityId: projVoice.id,
        fromType: "PROJECT_CANDIDATE", toType: "ACTIVE_PROJECT",
        fromState: "INBOX", toState: "ACTIVE",
        reason: "Worthy = Yes, Ready = Yes, Now = Yes, and the major project slot was available.",
      },
    ],
  });

  // ─────────────────────────────────────────────────────────────
  // STORY 2 — Career: active exploration + experiment awaiting decision
  // ─────────────────────────────────────────────────────────────

  const sigCareer = await prisma.signal.create({
    data: {
      title: "I want to be competitive for a backend platform-engineering role by December",
      body: "Current role is drifting away from distributed-systems work. Platform-engineering postings keep catching my attention, and several requirements match things I enjoy.",
      context: "Sparked by a recruiter message and a colleague's recent move.",
      state: "ACTIVE",
    },
  });

  const intentPlatform = await prisma.intent.create({
    data: {
      title: "Event-delivery platform with public case study",
      approach: "publishing a production-grade event-delivery platform with deployment, observability, and docs",
      expectedChange: "a portfolio strong enough to support a role change by December",
      assumption: "platform teams hire for demonstrated distributed-systems competence, not just years of experience",
      signalId: sigCareer.id,
      state: "ACTIVE",
    },
  });

  await prisma.exploration.create({
    data: {
      title: "What do platform roles actually require?",
      unclearWhat: "Whether my assumed capability gaps match what real job postings demand.",
      scope: "Analyze 15 current platform-engineering job posts and compare against my current portfolio.",
      budget: "3 hours over 2 weeks",
      endDate: daysFromNow(12),
      stoppingCondition: "Stop when I can state the five most common capability requirements and my gap against each.",
      expectedOutput: "A ranked capability list with gaps, and a decision: adjust the platform project, proceed as-is, or drop it.",
      signalId: sigCareer.id,
      state: "ACTIVE",
    },
  });

  await prisma.experiment.create({
    data: {
      title: "Engineer feedback before committing the full build",
      decisionGoal: "Within three weeks, decide whether to start the full platform build by testing whether three experienced backend engineers independently confirm the project demonstrates the right capabilities.",
      nextCommitment: "Commit ~10 weeks of evenings/weekends to the full platform build",
      criticalAssumption: "Experienced engineers will see this project as strong evidence of platform-engineering capability.",
      testMethod: "Send a one-page project brief to five backend engineers; interview any three who reply for 20 minutes each.",
      observableEvidence: "At least 3 engineers independently describe the plan as credible platform-engineering evidence, without major missing pieces.",
      budget: "3 weeks, $0, ~4 hours total",
      decisionDate: daysFromNow(5),
      intentId: intentPlatform.id,
      state: "ACTIVE",
    },
  });

  // ─────────────────────────────────────────────────────────────
  // STORY 3 — Cheap rejection (closure is a successful outcome)
  // ─────────────────────────────────────────────────────────────

  const sigDrawer = await prisma.signal.create({
    data: {
      title: "Kitchen drawer jams every time it opens",
      body: "The cutlery drawer sticks and derails roughly half the time. Small, but a daily annoyance.",
      state: "CLOSED",
    },
  });

  const intentDrawer = await prisma.intent.create({
    data: {
      title: "Build a custom drawer organizer",
      approach: "building a fitted wooden organizer on the 3D-printer/woodwork weekend",
      expectedChange: "a drawer that never jams",
      assumption: "the jamming is caused by a poorly organized interior",
      signalId: sigDrawer.id,
      state: "CLOSED",
    },
  });

  await prisma.transition.createMany({
    data: [
      {
        fromEntityId: sigDrawer.id, toEntityId: intentDrawer.id,
        fromType: "SIGNAL", toType: "INTENT",
        fromState: "INBOX", toState: "INBOX",
        reason: "Weekly review: proposed a build approach.",
      },
      {
        fromEntityId: intentDrawer.id, toEntityId: intentDrawer.id,
        fromType: "INTENT", toType: "INTENT",
        fromState: "INBOX", toState: "CLOSED",
        reason: "Rejected: a $15 adjustable organizer solved it completely. Custom development would not create enough additional value. Cheap rejection is a successful outcome.",
      },
    ],
  });

  // ─────────────────────────────────────────────────────────────
  // STORY 4 — Waiting experiment (blocked by external timing)
  // ─────────────────────────────────────────────────────────────

  const sigSpend = await prisma.signal.create({
    data: {
      title: "Unmonitored subscriptions keep causing month-end surprises",
      body: "Three months in a row, subscription renewals landed that I had forgotten about. The amounts are small but the pattern means finances are on autopilot.",
      state: "ACTIVE",
    },
  });

  const intentFinance = await prisma.intent.create({
    data: {
      title: "Monthly 30-minute finance review",
      approach: "a fixed 30-minute review on the last Sunday of each month",
      expectedChange: "zero surprise renewals and a clear picture of recurring spend",
      assumption: "the surprises come from lack of review, not overspending",
      signalId: sigSpend.id,
      state: "ACTIVE",
    },
  });

  await prisma.experiment.create({
    data: {
      title: "Trial a friend's zero-based budgeting sheet",
      decisionGoal: "After one full billing cycle, decide whether to adopt the sheet permanently by testing whether it catches every renewal before it posts.",
      nextCommitment: "Adopt the sheet as the permanent monthly-review system",
      criticalAssumption: "A spreadsheet is enough — no dedicated budgeting app needed.",
      testMethod: "Copy the sheet, enter all recurring charges, and run it for one full billing cycle.",
      observableEvidence: "Every renewal anticipated before posting; zero surprises at month end.",
      budget: "1 billing cycle, $0, ~30 min/month",
      decisionDate: daysFromNow(35),
      intentId: intentFinance.id,
      state: "WAITING",
    },
  });

  // ─────────────────────────────────────────────────────────────
  // STORY 5 — Unprocessed inbox signal (for the weekly review demo)
  // ─────────────────────────────────────────────────────────────

  await prisma.signal.create({
    data: {
      title: "I keep re-reading the same articles without retaining anything",
      body: "Found myself opening an article for the third time and still couldn't summarize it. Either my reading process or my note-taking is broken. Not sure which yet — needs a weekly-review look before proposing any approach.",
      state: "INBOX",
    },
  });

  // ─────────────────────────────────────────────────────────────
  // STORY 6 — Direct-entry candidates (no experiment needed)
  // ─────────────────────────────────────────────────────────────

  await prisma.projectCandidate.create({
    data: {
      title: "File annual self-assessment taxes",
      proposedOutcome: "Taxes filed accurately and on time.",
      evidenceOfValue: "Legal obligation — penalties if missed. Known obligations enter directly as candidates without an experiment.",
      primaryAlignment: "Finances area — meet unavoidable obligations",
      acceptanceCriteria: "Submission confirmed by the tax authority before the deadline.",
      constraints: "Needs last year's documents; accountant availability in January.",
      roughEstimate: "1 weekend",
      state: "INBOX",
    },
  });

  await prisma.projectCandidate.create({
    data: {
      title: "Rebuild personal site",
      proposedOutcome: "A fast personal site with writing, projects, and a now page.",
      evidenceOfValue: "Supports career visibility, but timing competes with the platform portfolio work.",
      primaryAlignment: "Career area — public presence",
      acceptanceCriteria: "Site live, three pieces of writing published, Lighthouse score above 95.",
      constraints: "Competes for the same weekend time as active projects.",
      roughEstimate: "3 weekends",
      worthy: "YES",
      ready: "NO",
      now: "NO",
      worthyReason: "Real career value, but secondary to demonstrating platform competence.",
      readyReason: "Scope and content plan are not defined yet.",
      nowReason: "Worthy, but lower priority than the active portfolio work. Revisit after the voice MVP ships.",
      state: "DORMANT",
    },
  });

  await prisma.activeProject.create({
    data: {
      title: "Establish a sustainable weekly review ritual",
      desiredOutcome: "A reliable 45-minute Friday review that processes inbox signals, checks WIP limits, and updates states — the engine that keeps this whole system honest.",
      acceptanceCriteria: "Held every week for 6 consecutive weeks with a written template that takes under 45 minutes.",
      primaryAlignment: "Personal growth area — establish an important recurring system",
      deadline: daysFromNow(30),
      realisticLeadTime: "2 weekends to design, then 6 weekly repetitions",
      currentMilestone: "Draft the review template",
      nextConcreteAction: "Block Friday 16:00 recurring and write the checklist",
      projectSlot: "MINOR",
      state: "ACTIVE",
    },
  });
}

export async function getDataCounts() {
  const [signals, intents, explorations, experiments, candidates, projects] =
    await Promise.all([
      prisma.signal.count(),
      prisma.intent.count(),
      prisma.exploration.count(),
      prisma.experiment.count(),
      prisma.projectCandidate.count(),
      prisma.activeProject.count(),
    ]);
  return { signals, intents, explorations, experiments, candidates, projects };
}
