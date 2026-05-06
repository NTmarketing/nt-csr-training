# Audit: Extensions, Cancellations & Late Returns (id: module-7, display number 8)

## Current state summary
Four sections — cancellation refund schedule, the 80% early-return override (with help-center 75% reconciliation), extensions, and late-return template sequence. The cancellation schedule is correct; the early-return treatment is mostly correct with one important constraint missing; extensions and late returns are thin compared to KB depth.

## ACCURATE — leave alone
- Cancellation refund schedule (75/50/25/0 at 72/48/24/under-24 hours) — matches `[Renter] [cancellation] Q: What is the cancellation policy and refund amounts?` exactly.
- "Platform fee, tax, Protection Package non-refundable" — correct.
- "No-show = no refund" — correct.
- "Cancellations must be done by renter through their account" — correct (note: same partial-exception caveat as Module 3 applies — support CAN cancel in specific edge cases).
- The 80% early-return override correction vs. the help center's 75% — **correct per the most recent KB entry** (`[Both] [cancellation] Q: Can I get a refund for early return of the trailer?` — *"Maximum refundable amount for early returns is 80% of base rental amount for unused portion"*). Module is right to flag the help-center inconsistency.
- "$25 fee comes from owner's payout, not renter's refund" — confirmed: KB says *"$25 processing fee deducted from the owner's payout."*
- Late-return template sequence (Late Return Notice → Urgent Notice → Trailer Not Returned by Renter) — matches the production escalation flow.

## ACCURACY ISSUES
**1. KB itself is internally inconsistent on the early-return percentage — module is correct, but stale KB entry exists.**
- **Lesson says:** 80% per Section 20 of TOS.
- **KB says:** TWO entries disagree:
  - `[Both] [cancellation] Q: Can I get a refund for early return of the trailer?` — **80%** of base rental amount. ✓ matches module.
  - `[Owner] [cancellation] Q: Renter wants early return refund - can I provide this?` — *"Maximum 75% of rental amount can be refunded."* ✗
- **Recommended fix:** No change to module — module is right. **However**, flag the KB inconsistency back to KB ownership: the Owner-audience 75% entry is stale and contradicts the canonical Both-audience 80% entry. The AI tutor (which uses keyword retrieval over the master KB) could surface either one depending on the trainee's query. Worth fixing KB-side.
- **Severity:** N/A for module; **Critical for KB hygiene** (this is the only place I found two numbers actively contradicting).

**2. Early-return rule omits the "full days only" constraint.**
- **Lesson says:** "Maximum refundable amount on early return is 80% of the rent for the unused portion."
- **KB says:** `[Both] [cancellation] Q: Can I get a refund for early return of the trailer?` — *"Early return refunds are only processed for full rental days (24+ hours). No refunds for partial days or hours returned early."*
- **Recommended fix:** Add to section 7-2: *"Early returns refund only **full unused rental days (24+ hours)**. Returning 6 hours early on a 5-day rental is treated as on-time — no refund. Refunding 1 day on a 5-day rental requires the renter to actually return at least 24 hours before scheduled end."*
- **Severity:** Critical. The "I returned 4 hours early, where's my refund?" call is one of the most common variants of this scenario; module currently primes the trainee to compute a partial refund that doesn't exist.

**3. Refund processing window (10 days) is unspecified.**
- **Lesson says:** Nothing about when the refund actually appears.
- **KB says:** `[Renter] [cancellation] Q: What is the cancellation policy and refund amounts?` — *"Refunds processed within 10 days to the original payment method."*
- **Recommended fix:** Add to section 7-1: *"Refund timing: up to **10 business days** to the original payment method. If a customer is upset about not seeing their refund yet, first check how long ago the cancellation was."*
- **Severity:** Moderate. High-call-volume question; current module gives the trainee no answer.

**4. Section 7-2 says "Refund only processes if the owner authorizes it BEFORE ending the rental" — true but incomplete.**
- **Lesson says:** Above quote.
- **KB says:** `[Owner] [cancellation] Q: Renter wants early return refund - can I provide this?` — *"If processed after ending rental, $25 processing fee applies."* Implicitly, post-end refunds CAN happen but cost the owner the $25 fee. The lesson currently makes it sound binary.
- **Recommended fix:** Soften: *"Cleanest path: owner authorizes early-return refund **before** ending the rental — no processing fee. After ending, a manual partial refund is still possible but a $25 fee comes out of the owner's payout."*
- **Severity:** Moderate. Affects how a CSR coaches an owner who's already ended.

## CRITICAL GAPS — topic missing from lesson
**1. Extensions: Protection Package coverage hinges on processing the extension BEFORE the original end time.**
- **Topic:** If a renter holds the trailer past the original end time without an approved extension processed in the system, NT Protect may not cover the extended period.
- **KB coverage:** `[Both] [extension] Q: What happens to Protection Package coverage during extensions?` — *"If extension is not completed prior to original end time, NT Protect may not apply to the extended period. Extensions must be processed through the system to maintain proper coverage."*
- **Why it matters:** This is a coverage cliff trainees should know cold. Late-return owners often discover their renter caused damage during the unauthorized overtime — and find out only after that NT Protect doesn't apply.
- **Suggested addition:** Add to section 7-3 (Extensions): *"Coverage rule: Protection Package coverage continues across an extension only if the extension is **processed and paid before the original end time**. A renter who keeps the trailer past the booked end without a finalized extension is in late-return territory AND may have lost NT Protect coverage for that period. Push owners to process extensions early; push renters to confirm before the clock runs out."*

**2. Extensions: weekly/monthly discount does not apply to extensions automatically.**
- **Topic:** If a renter extends a daily rental into a weekly-rate-eligible duration, they don't automatically get the weekly rate.
- **KB coverage:** `[Both] [extension] Q: Why don't extensions automatically apply discounted rates like weekly or monthly rates?` — *"To receive weekly/monthly rates, the rental must be booked for the full period initially (7 days for weekly, 30 days for monthly). For renters wanting discounted rates on extensions: contact the trailer owner directly. Owner can process a partial refund at their discretion."*
- **Why it matters:** Common renter ask: "I extended to 7 days, do I get the weekly rate now?" Module currently doesn't equip the trainee.
- **Suggested addition:** Add to section 7-3: *"Weekly/monthly rates do **not** auto-apply to extensions. To get a weekly rate, the rental must be booked at 7+ days from the start. If a renter extends into weekly-rate territory and asks for a price break, the path is to ask the owner for a discretionary partial refund — owner controls that."*

**3. Late-return: the steps the OWNER takes BEFORE the templates fire.**
- **Topic:** Module currently jumps straight to the three-template escalation. KB has a multi-step pre-template playbook the owner is expected to follow first.
- **KB coverage:** `[Owner] [extension] Q: What should I do if my trailer is not returned on time?` — explicit Steps 1-3: (1) attempt contact through portal, phone, text + document; (2) provide written notice with specific date/time deadline; (3) terminate the rental if no response. KB recommends owners *"always process an extension request or ask the renter to process one prior to rental end if you think the trailer won't be returned on time."*
- **Why it matters:** Module currently positions the CSR's job as "explain the templates" but owners often call earlier — when they're ready to take Step 1 themselves. Trainee has no playbook for that earlier conversation.
- **Suggested addition:** Add to section 7-4 a "before the templates" subsection: *"When an owner first calls about a late return, before the templates fire, coach them through: (1) Message the renter through the platform first — log the attempt. (2) If no response in [reasonable time], send a second written message with a specific deadline. (3) After deadline, NT can begin the formal template sequence. Most cases resolve at step 1 or 2 without escalation."*

**4. "Renter doesn't show up" path — ownership of the cancellation matters.**
- **Topic:** When a renter no-shows, the OWNER should not cancel — the renter should be the one who fails-to-cancel (so the no-show treatment applies).
- **KB coverage:** `[Owner] [damage-claims] Q: Why am I getting non-compliance notices...` and `[Internal] [cancellation] Q: How to handle no-shows and unresponsive owners?`
- **Why it matters:** Already flagged in Module 4 audit. Worth surfacing here too because cancellation/no-show is part of this module's domain.
- **Suggested addition:** New paragraph in section 7-1 or 7-4: *"No-show edge case: if the renter doesn't show, the **owner should not** cancel the booking — the no-show treatment (renter cancellation without notice = no refund) only applies if the renter fails to cancel. Owners who cancel a no-show pay the owner cancellation fee instead. The right move: Start the rental at the booked time, then End it as a no-show (or escalate)."*

## SCENARIO OPPORTUNITIES
**1. Renter returned 6 hours early.**
- **Why it would make a good scenario:** Tests the full-days-only constraint that's currently missing.
- **Suggested prompt:** *"A renter calls: 'I returned the trailer 6 hours early, the owner ended the rental, but I haven't seen any refund. When does that come through?' Walk it."*
- **Suggested rubric:**
  - States early-return refunds only apply to full unused rental days (24h+)
  - Six hours early = treated as on-time, no refund
  - Doesn't suggest the renter dispute or escalate
  - Empathetic without apologizing

**2. Renter wants weekly rate after extending.**
- **Suggested prompt:** *"A renter calls: 'I had the trailer for 4 days originally, I just extended for 3 more days. That's 7 days total — can I get the weekly rate now?'"*
- **Suggested rubric:**
  - States weekly rate doesn't auto-apply to extensions
  - Suggests the renter ask the owner for a discretionary discount/partial refund
  - Doesn't promise the owner will say yes

**3. Owner whose trailer is 12 hours late but no template has fired yet.**
- **Suggested prompt:** *"An owner calls 12 hours after their trailer was due. They haven't gotten any official late-return template yet but they're worried. What do you tell them?"*
- **Suggested rubric:**
  - Coaches Step 1: message through platform, document attempt
  - Confirms NT support will trigger templates if no response within reasonable time
  - Mentions NT Protect coverage gap if there's no approved extension
  - Calm, doesn't escalate prematurely

## QUIZ QUESTION OPPORTUNITIES
**1. Full-day-only early-return.**
- **Suggested question + correct answer:**
  > A renter returns 8 hours early on a 3-day rental. How much refund are they due?
  > a) 8/72 of 80% of rent
  > b) **None — early-return refunds only apply to full unused rental days (24+ hours)** (correct)
  > c) 25% of one day
  > d) Up to 80% of rent

**2. Refund processing time.**
- **Suggested question + correct answer:**
  > A renter cancelled 4 days ago and asks why their refund hasn't appeared. What's the typical processing window?
  > a) 1-2 business days
  > b) 3-7 business days
  > c) **Up to 10 business days** (correct)
  > d) Immediate

**3. Extension coverage cliff.**
- **Suggested question + correct answer:**
  > A renter keeps the trailer 2 days past the booked end time without an approved extension. Damage occurs during those 2 days. Is NT Protect coverage in effect?
  > a) Yes, NT Protect always covers active rentals
  > b) **NT Protect may not apply — coverage requires an extension processed and paid BEFORE the original end time** (correct)
  > c) Coverage applies but with a higher deductible
  > d) Coverage applies for the first 24 hours only

## Overall recommendation
**Light-to-moderate updates.** Cancellation schedule + 80% override are correct (despite the KB's internal inconsistency). Three missing rules with real call-volume impact: full-days-only early returns, 10-day refund processing, NT Protect extension cliff. Plus the late-return playbook is currently template-centric — needs the pre-template coaching steps. ~45 minutes of edits. Module 7 is the second-most policy-dense module after Module 6 and warrants a sweep.
