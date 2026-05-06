# Audit: Critical Policy Knowledge (id: module-10, display number 11)

## Current state summary
The "12 critical facts" spaced-repetition module — explicit gating prerequisite for the final exam. Two sections (the 12-fact list, and a meta-justification of why those 12). Both `modules.json` AND `content/critical-facts.json` carry the same 12 facts with quiz fixtures. **Critical-facts is the most leveraged content in the curriculum** — every CSR who passes the cert sees this specific list as authoritative.

## ACCURATE — leave alone
- Fact 1 (Early return refund max = 80%) — correct per the most recent KB entry. Module is right to flag the 75% help-center inconsistency.
- Fact 2 (`$25 fee from owner's payout`) — confirmed by KB.
- Fact 3 (Platform fee / tax / Protection Package non-refundable once accepted) — correct.
- Fact 4 (Cancellation schedule 75/50/25/0) — correct.
- Fact 5 (Cancellations must be done by renter through their account) — correct as a default rule (with the same edge-case caveat from Module 3).
- Fact 6 (No-show = no refund) — correct.
- Fact 9 (CSR cannot override MVR) — correct.
- Fact 11 (Pickup address shared after acceptance) — correct.
- Fact 12 (Don't proactively share phone number; default to email/live chat) — matches `[Renter] [general] Q: How do I get help or contact customer service?` which says *"Phone number is available upon request through Live Chat or contact form."*

## ACCURACY ISSUES
**1. Fact 7: deposit refund timing is wrong.**
- **Lesson says:** "Deposit refund timing: **3-7 business days** after the rental is officially closed." Both `modules.json` AND `critical-facts.json` carry this.
- **KB says:** `[Renter] [damage-claims] Q: When will I get my security deposit back after returning a trailer?` — *"It may take **4-7 business days** to appear on the renter's statement."*
- **Recommended fix:** Change the fact to "Deposit refund timing: **4-7 business days** after the rental is officially closed (delayed if owner files a Deposit Deduction Claim — renter has 24 hours to dispute before funds process)." Also update m10-q3 quiz answer accordingly.
- **Severity:** Critical. This is in the spaced-repetition core, propagates to the final cert exam, gets drilled into every CSR. Wrong number gets memorized.

**2. Fact 8: tire damage flat exclusion (same root issue as TB / M1 / M6).**
- **Lesson says:** "Tire damage is not covered by NT Protect."
- **KB says:** `[Both] [damage-claims] Q: Who is responsible for tire damage during a rental?` — conditional based on cause: renter pays for impact/overload/speed; owner pays for old/defective/improper-maintenance tires.
- **Recommended fix:** Replace fact 8 with a conditional version: *"Tire damage liability is conditional. NT Protect doesn't auto-cover. Renter pays for impact/curb/overload/speed-related damage; owner is responsible if the tire was 3+ years old or showed defects (DOT date code on sidewall is the check)."*
- **Severity:** Critical. Same root cause as elsewhere — but in this module it propagates as a memorized fact.

**3. Fact 1 cites "Section 20 of TOS" — unverifiable from KB.**
- **Lesson says:** Module 7 + module-10-scenario-2 cite "Section 20 of the Terms of Service" as the authority for 80%.
- **KB says:** No KB entry I can find references "Section 20" as the source.
- **Recommended fix:** Either verify the citation against the actual ToS document and update the curriculum if Section 20 is wrong, OR drop the section reference and just attribute the rule to "current platform policy." Don't cite a specific section number unless it's confirmed to match production ToS.
- **Severity:** Moderate. Trainees who repeat "Section 20" to a customer pressing for documentation may be giving a wrong citation.

## CRITICAL GAPS — facts that should be on the list but aren't
The "12 facts" frame is sacred — adding to it is a real change. But several facts of equivalent stakes are absent. Recommended additions if the list is willing to grow (or replace lower-priority ones):

**1. NT Protect: $500 deductible / $25,000 cap.**
- **KB coverage:** `[Both] [damage-claims] Q: What is the $500 deductible and who pays it?` and `Q: How much does NT Protect insurance cover?`
- **Why critical:** The single most-asked NT Protect question. Every CSR should know these two numbers cold.
- **Suggested fact:** *"NT Protect: **$500 deductible**, coverage up to **$25,000**. Renter pays the deductible (typically via deposit). If deductible can't be collected from renter, owner becomes responsible."*

**2. Minimum renter age = 25.**
- **KB coverage:** `[Renter] [verification] Q: What is the minimum age to rent a trailer?` — *"the minimum age requirement to rent on the platform is 25 years old."*
- **Why critical:** Hard cutoff. Comes up regularly. Trainee should not have to look this up.
- **Suggested fact:** *"Minimum renter age is 25 (driven by Protection Package partner requirement). Under-25 callers cannot book."*

**3. Damage Deposit Deduction Claim must be filed at end-of-rental, not later.**
- **KB coverage:** `[Owner] [damage-claims] Q: How do I file a deposit deduction claim for trailer damage?` and several "I forgot to file..." entries.
- **Why critical:** Highest-frequency owner-side mistake. Trainee needs to know this for both proactive coaching and reactive damage control.
- **Suggested fact:** *"Deposit Deduction Claims must be filed **at end of rental** (in the End Rental flow). Once an owner ends without filing, the deposit cannot be claimed retroactively."*

**4. 24-hour renter dispute window after a DDC is filed.**
- **KB coverage:** `[Owner] [damage-claims] Q: How long does the renter have to respond to my damage claim?` — *"Renters have 24 hours to respond to or dispute damage claims. After 24 hours with no response, the claim is automatically approved."*
- **Why critical:** The single biggest urgency lever in dispute calls. Trainee must know "how much time do I have?" cold.
- **Suggested fact:** *"After a Deposit Deduction Claim is filed, the renter has **24 hours** to dispute. After 24 hours of silence, the claim auto-approves and funds transfer to the owner."*

**5. NT collects sales tax in WA, VA, IL only.**
- **KB coverage:** `[Both] [tax]` entry.
- **Why notable:** Avoids the "why no tax line on my booking?" call. Lower stakes than the others above; might not warrant a top-12 slot.

## CRITICAL GAPS — module structure
The module has only ONE practice scenario tied to the recall task (`module-10-scenario-1`: "Recite all 12 facts"). The other two scenarios are application of two specific facts. With 12 facts and only ~3 scenarios, the trainee gets very little applied practice per fact. Consider expanding to one scenario per fact-cluster (so 4-5 scenarios covering all 12 facts in real-world dialogues).

## SCENARIO OPPORTUNITIES
**1. Combined-fact scenarios that exercise multiple facts in one call.**
- **Why valuable:** Forces the trainee to weave multiple facts naturally — closer to a real call.
- **Suggested prompt:** *"A renter calls 22 hours before pickup wanting to cancel. After you explain the under-24-hour refund is 0%, they say their card was charged when they booked and they want at least the deposit and tax back. Walk through their full refund calculation step by step."*
- **Suggested rubric:**
  - States 0% refund on the rent at <24 hours
  - States platform fee, tax, Protection Package non-refundable regardless
  - States deposit refund flow (4-7 business days; only if no DDC filed; but cancellation case: deposit refunds since rental never started)
  - Doesn't mix up the facts

**2. Scenario specifically testing fact 12 (phone number policy).**
- **Suggested prompt:** *"A renter messages: 'How do I reach support?' How do you respond?"* (vs. the existing scenario that prompts on a renter who explicitly asks for the number — both belong in the module).
- **Suggested rubric:**
  - Defaults to email or live chat path
  - Doesn't proactively share the phone number
  - Mentions phone is available on request through Live Chat or contact form

## QUIZ QUESTION OPPORTUNITIES
**1. Fix m10-q3 to 4-7 days.** Same fix as Modules 5 and 9.

**2. Add NT Protect deductible quiz.**
- **Suggested question + correct answer:**
  > NT Protect's deductible per claim is:
  > a) $250 — b) **$500** (correct) — c) $1,000 — d) Varies by trailer

**3. Add minimum-age quiz.**
- **Suggested question + correct answer:**
  > Minimum age to rent a trailer on the platform?
  > a) 18 — b) 21 — c) **25** (correct) — d) 30

## Overall recommendation
**Substantial revision needed — high priority.** This module is the canon — its facts get memorized, drilled, and tested in the cert exam. Two flat-wrong facts (deposit days, tire conditional). Several missing must-know numbers ($500 deductible, $25k cap, 24h dispute window, age 25). The Section-20 citation needs verification. **The list of "12" should probably grow to 14-16, OR replace lower-priority items with the higher-stakes missing ones.** Estimate: 60 minutes of edits, plus a second pass to sync `critical-facts.json` to match. Should be fixed alongside Module 6.
