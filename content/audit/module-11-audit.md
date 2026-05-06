# Audit: Final Certification Exam (id: module-11, display number 12)

## Current state summary
The cert exam is sampled from `content/exam-questions.json` — currently 56 questions across the 11 learning modules. Pass = 84% (21 of 25 sampled). The exam itself isn't a lesson; this audit checks whether the exam pool's correct answers match the production KB. **A wrong answer in the exam pool = a CSR who passes cert with a wrong fact memorized.**

## Question distribution
- module-1: 6, module-2: 5, module-3: 5, module-4: 5, module-5: 5, module-6: 5, module-7: 8, module-8: 4, module-9: 5, module-10: 5, module-trailer-basics: 3 = **56 total**

## ACCURATE — leave alone
Most exam questions test facts that were verified accurate in the per-module audits. Specifically: business model (Q1), booking lifecycle ordering (Q2), MVR override boundary (Q6), Class C licensing (Q7 — see Trailer Basics caveat), Clear refusal handling (Q8), Clear provider name (Q10), pickup-address timing (Q11), same-owner trailer switch via My Reservations (Q12), CSR-can't-cancel-for-renter default (Q13, Q51), date change owner-must-accept (Q15), photo-rule (Q17), tow-capacity boundary (Q18), platform fee non-refundability (Q21), card-charge timing (Q22), payout-failure root cause (Q23), Toll Program description (Q25), dispute redirect script (Q28), 60-hour cancellation = 50% (Q31), 80% early-return cap (Q32, Q47, Q53), $25 fee from owner's payout (Q33, Q37), same-day cancel = 0% (Q35, Q50), de-escalation craft (Q42-Q46), trailer types Q54.

## ACCURACY ISSUES IN THE EXAM POOL
**1. Q24 (deposit refund timing) — wrong number.**
- **Pool says:** "What is the typical deposit refund timing after a rental closes?" — explanation: *"3-7 business days after the rental officially closes."*
- **KB says:** **4-7 business days**.
- **Recommended fix:** Update explanation to "4-7 business days." Same fix applies to Q44 in module-9 (deposit refund 3-7 quoted as the "standard KB answer" — also wrong).
- **Severity:** Critical. Two questions (out of 56) propagate the wrong number into the cert exam. Every CSR who passes memorizes 3-7.

**2. Q26 (NT Protect tire blowout coverage) — wrong (flat exclusion).**
- **Pool says:** "Does NT Protect cover tire blowouts? Correct answer: No."
- **KB says:** Tire damage is conditional, not flat-exclusion. See Trailer Basics audit for the full rule.
- **Recommended fix:** Either rewrite Q26 to test the conditional ("Under what condition is the OWNER responsible for tire damage?" with answer "Tire 3+ years old or showing defects"), or replace Q26 entirely with a different damage-claim question.
- **Severity:** Critical.

**3. Q30 (NOT-covered list) — also overstates tire exclusion.**
- **Pool says:** "Which is NOT covered by NT Protect? Correct: Tire blowouts and road debris damage."
- **KB says:** Tire damage is conditional. The other distractors (accidental fender, hail, scratches during loading) are arguably covered, so the question's premise that tire damage is the universal "NOT covered" answer needs revision.
- **Recommended fix:** Replace with a clearer un-covered example: "Which is NOT covered by NT Protect?" with the correct answer being **intentional damage** (or theft due to renter negligence) — both are unambiguously excluded per `[Both] [damage-claims] Q: What does NT Protect insurance cover?`.
- **Severity:** Critical.

**4. Q56 (Trailer Basics — tire blowout) — wrong (flat exclusion).**
- **Pool says:** "A renter blew a tire from a piece of road debris during the rental. Is this damage covered by NT Protect? Correct: No — tire damage from blowouts or road debris is excluded from NT Protect."
- **KB says:** Conditional — depends on tire age/condition.
- **Recommended fix:** Same rewrite pattern as Q26.
- **Severity:** Critical.

**5. Q16 (listing approval timing) — wrong number.**
- **Pool says:** "What's the typical listing approval timeframe? Correct: 24-48 hours."
- **KB says:** *"1-2 business hours during normal business hours, but may take 1-2 business days depending on the queue volume."*
- **Recommended fix:** Update Q16 correct answer to "1-2 business hours typically, up to 1-2 business days when backed up." Or replace the question entirely — it's hard to multiple-choice "1-2 hours typically, up to 1-2 days" without giving away the answer through length.
- **Severity:** Critical.

**6. Q44 (escalation criteria explanation cites "3-7 business days") — same as Q24.**
- See above.

## CRITICAL GAPS — facts the exam doesn't test
**1. NT Protect numbers ($500 deductible, $25,000 cap).**
- **Why it matters:** These are the two most-asked NT Protect numbers and the exam doesn't test either.
- **Suggested addition:** At least one question on the deductible amount, ideally one on the cap as well. Example:
  > Q: NT Protect's deductible per claim is — a) $250 b) **$500** c) $1,000 d) Varies
  > Q: Maximum coverage per NT Protect claim — a) $5k b) $10k c) **$25k** d) unlimited

**2. Minimum renter age (25).**
- **Suggested addition:**
  > Q: Minimum age to rent on the platform — a) 18 b) 21 c) **25** d) 30

**3. Damage Deposit Deduction Claim mechanics.**
- The exam tests "owner submits 4 things" (Q27) but doesn't test the more critical **must-be-filed-at-end-of-rental** rule.
- **Suggested addition:**
  > Q: An owner ended the rental on Tuesday. On Friday they notice damage. Can they retroactively file a Deposit Deduction Claim? — a) Yes, within 7 days b) Yes with photos c) **No — DDC must be filed at end of rental, not later** d) Only with renter's consent

**4. 24-hour renter dispute window after DDC.**
- **Suggested addition:**
  > Q: After an owner files a DDC, how long does the renter have to dispute? — a) 12h b) **24h** c) 48h d) 7 days

**5. 20% platform commission.**
- **Suggested addition:**
  > Q: An owner's $150 rental shows a payout of $120. Why? — **20% platform commission**

**6. NT collects sales tax in only 3 states (WA, VA, IL).**
- **Suggested addition:** A "renter from Florida calls about no tax line" scenario question.

## SAMPLING / COVERAGE OBSERVATIONS
- **Module 7 oversampled.** 8 questions vs 4-6 for other modules. Module 7 IS policy-dense, so 8 might be deserved — but worth conscious calibration.
- **Module 8 (Phone Skills) only 4 questions.** Soft-skills are hard to multi-choice; reasonable.
- **Trailer Basics only 3 questions.** Module is mostly background context, not policy-critical, so 3 is appropriate.
- **No exam coverage of the multi-booking-request policy** (the only `[Policy]` entry in the booking category).
- **No exam coverage of third-party-driver rule** (Protection Package coverage cliff).
- **No exam coverage of the 25-age rule.**

## SCORING THRESHOLD
Pass = 84% (21 of 25 sampled). With the current pool of 56 and 6 questions confirmed wrong (Q16, Q24, Q26, Q30, Q44, Q56) plus weak coverage of high-stakes topics, a CSR could:
- Get 4 of the wrong-answer questions correct by knowing the wrong fact (and lose points if they happen to know the right one)
- Pass without ever encountering the deductible, the age cutoff, or the multi-booking warning.

That's a real cert-exam integrity issue.

## Overall recommendation
**Substantial revision needed.** Six exam questions have wrong correct answers (deposit days, listing approval, tire damage in three different question variants). Several high-stakes facts have zero exam coverage ($500 deductible, age 25, 20% commission, multi-booking, third-party driver). The exam pool needs:
1. Six questions corrected
2. ~8-10 new questions covering the missing critical facts
3. Possibly retire 2-3 weaker questions to make room

Estimate: 60 minutes of edits to the exam pool alone, dependent on the per-module corrections landing first (so the exam answers align with corrected lessons).
