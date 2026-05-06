# Audit: Deposits, Damage Claims & Disputes (id: module-6, display number 7)

## Current state summary
Three sections covering damage-claim filing, what NT Protect covers/excludes, and dispute call handling. Stakes are flagged as "HIGH" in the description, but the module is paradoxically the *thinnest* on the actual mechanics that matter. Multiple core facts (deductible amount, coverage cap, two-path claim distinction, response window) are missing.

## ACCURATE — leave alone
- "Owner files a damage claim" basics — generally correct.
- "Stay neutral on dispute calls; never agree the deduction is wrong" — matches `[Internal]` claim guidance well.
- "Demanding a final answer = escalate" — correct.
- "Direct renter to dispute through their account" — correct.
- The What-Not-To-Say script ("That sounds unfair," "I'll get this reversed for you") is solid.

## ACCURACY ISSUES
**1. The $500 deductible is missing entirely.**
- **Lesson says:** Nothing. The deductible amount is never mentioned in the module.
- **KB says:** `[Both] [damage-claims] Q: What is the $500 deductible and who pays it?` — *"The Protection Package (NT Protect) includes a $500 deductible for all eligible damage claims. … Renters pay for the Protection Package at booking (owners are not charged) … the renter is responsible for paying the $500 deductible. If the deductible cannot be collected from the renter, the trailer owner becomes responsible for the $500 deductible amount."* Reinforced in `[Both] [damage-claims] Q: What is NT Protect insurance and how does it work?` and several owner-facing entries.
- **Recommended fix:** New paragraph in section 6-2: *"NT Protect deductible: **$500**. For damages above $500, NT Protect covers up to $25,000. The renter pays the $500 deductible — typically via the deposit (which is why deposits exist as a buffer). If the deductible can't be collected from the renter, the **owner** becomes responsible for it."*
- **Severity:** Critical. The $500 deductible is the single most-asked NT Protect question. A trainee certified on this module without the number is dangerously incomplete.

**2. The $25,000 coverage cap is missing.**
- **Lesson says:** "Covers accidental damage during rentals."
- **KB says:** `[Both] [damage-claims] Q: How much does NT Protect insurance cover?` — *"NT Protect provides coverage up to $25,000 with a $500 deductible for verified rental periods. Comprehensive: $500 deductible. Collision: $500 deductible. Conversion: $1,000 deductible. Trailer owner liability: $300,000 combined single limit. Auto Medical Payments: $2,000 per person. Uninsured Motorists: $15,000 per person / $30,000 per accident bodily injury."*
- **Recommended fix:** Add the cap to section 6-2: *"Coverage cap: **up to $25,000** per eligible damage claim. (The fine print: Comprehensive and Collision both at $500 deductible; Conversion at $1,000 deductible; trailer owner liability has a $300,000 combined single limit. CSRs typically only need the $500 / $25,000 numbers.)"*
- **Severity:** Critical.

**3. Tire-damage is presented as a flat exclusion (same issue as TB / M1).**
- **Lesson says:** "Tire damage is NOT covered — high-volume call type." Quiz m6-q1 same.
- **KB says:** Tire damage is conditional. See TB audit for the full conditional rule (renter responsibility for impact/overload/speed; owner responsibility for old/defective).
- **Recommended fix:** Rewrite as conditional, fix the quiz answer.
- **Severity:** Critical.

**4. "If damage costs exceed the deposit, the owner can pursue additional recovery through NT" is dangerously vague.**
- **Lesson says:** Above quote, no further detail.
- **KB says:** Two distinct paths — (a) `[Owner] [damage-claims] Q: How do I charge a renter for damage under $500?` is the under-$500 direct-charge path, (b) `[Owner] [damage-claims] Q: How do I file an NT Protect claim for major damage over $500?` is the NT Protect claim path with explicit jotform URL: https://form.jotform.com/Neighbors_Trailer/nt-protect-claim-form. Plus the KB explicitly says *"First, file a Deposit Deduction Claim (DDC) when ending the rental to secure the $500 deductible"* — meaning the DDC and NT Protect claim are TWO sequential steps, not alternatives.
- **Recommended fix:** Replace section 6-1 single-claim framing with two-path explanation. Sub-bullets:
  - *"Damage under $500: file a Deposit Deduction Claim (DDC) at end of rental. Renter has 24 hours to dispute; otherwise auto-approves and deposit transfers to owner. If damage exceeds deposit, owner can request NT charge the renter directly (separate process)."*
  - *"Damage over $500: file the DDC FIRST (to secure the $500 deductible from the deposit), THEN file an NT Protect claim using the claim form at form.jotform.com/Neighbors_Trailer/nt-protect-claim-form. Required: photos of damages, photos of all 4 sides of trailer, photo of VIN sticker, written repair estimate."*
- **Severity:** Critical. This is the entire point of Module 6 and it's currently presented in one fuzzy sentence.

**5. Section 6-1 lists "four things" but misses the actual structured DDC workflow.**
- **Lesson says:** Description, photos, repair estimate or invoice, completed claim form.
- **KB says:** The DDC isn't a separate "form" the owner fills out — it's an OPTION INSIDE the End Rental flow. `[Owner] [damage-claims] Q: How do I file a deposit deduction claim for trailer damage?` says: *"When ending the rental, select the 'Deposit Deduction Claim' box at the bottom. Upload images clearly showing the damage that occurred during the rental. If damages exceed the deposit amount, include estimated repair costs in the claim notes. Complete the end rental process."*
- **Recommended fix:** Replace "four things" framing with the actual flow: *"DDC is filed inside the End Rental flow — there's a checkbox option. The owner: (1) checks the Deposit Deduction Claim box when ending, (2) uploads photos showing damage that happened during the rental, (3) writes a description specific to that rental, (4) includes a repair estimate or repair cost note. Then completes End Rental. Critical: the DDC must be filed at end-of-rental — once you end without filing, the deposit can't be claimed retroactively."*
- **Severity:** Critical. The lesson's framing implies the owner submits a paper-style claim after the rental; in reality it's an inline option at end-of-rental, which CSRs need to coach owners on real-time.

## CRITICAL GAPS — topic missing from lesson
**1. The 24-hour renter response window.**
- **Topic:** When an owner files a DDC, the renter has 24 hours to respond/dispute. After 24 hours, the claim auto-approves and funds transfer to the owner.
- **KB coverage:** `[Owner] [damage-claims] Q: How long does the renter have to respond to my damage claim?` — explicit. Also `[Renter] [damage-claims] Q: How do I dispute a deposit deduction claim?`
- **Why it matters:** A renter who doesn't act within 24 hours loses by default. CSR has to know this cold to set urgency in dispute calls.
- **Suggested addition:** New section 6-4 (or expand 6-3): *"Renter response window: **24 hours** from when the DDC is filed. If the renter doesn't dispute within 24 hours, the claim auto-approves and the deposit transfers to the owner. When a renter calls upset about a claim, FIRST establish how long ago the claim was filed — if it's been more than 24 hours, they need to know the timer ran out (and the path is escalation, not self-serve dispute)."*

**2. Insurance interaction — owners with their own insurance can't use NT Protect.**
- **Topic:** Trailer owners with existing MBA insurance (or other commercial insurance) cannot use NT Protect — double-coverage rule.
- **KB coverage:** `[Policy] [damage-claims] Q: When should I hold a renter's deposit vs. process through NT Protect?` — *"trailer owners with existing MBA insurance cannot use Neighbors Trailer coverage due to double coverage restrictions - their claims should go through MBA instead."*
- **Why it matters:** Owners who have their own insurance don't realize they're not eligible for NT Protect; CSRs need to redirect them.
- **Suggested addition:** Add to section 6-2: *"Eligibility: NT Protect doesn't double-cover. Owners with their own commercial insurance (e.g., MBA) cannot also use NT Protect — they must claim through their carrier. Verify eligibility before walking an owner into the NT Protect claim flow."*

**3. The DDC-must-be-filed-at-end-of-rental rule.**
- **Topic:** Once an owner clicks End Rental without checking the DDC box, they cannot retroactively claim the deposit.
- **KB coverage:** Multiple entries — `[Owner] [damage-claims] Q: I forgot to file a deposit claim when ending the rental - can I still file one?` and `Q: What if I forgot to file a deposit deduction claim when ending the rental?` and `Q: What if I accidentally closed the wrong rental booking?` — all reinforce that DDC at end-of-rental is the single lever.
- **Why it matters:** This is a hard, irreversible mistake owners make. The lesson never warns about it.
- **Suggested addition:** Already covered in Module 4 recommendation; mirror in Module 6 as a callout: *"If you ever talk to an owner who already ended the rental and only later noticed damage: there is no retroactive DDC path. The owner can attempt to charge the renter directly (under-$500 path) but the deposit auto-released the moment they ended without filing."*

**4. Pre-existing damage / renter pre-trip protection.**
- **Topic:** Renter takes photos at pickup to defend against pre-existing damage being claimed against them.
- **KB coverage:** `[Renter] [damage-claims] Q: There was pre-existing damage that wasn't documented - how do I protect myself?`
- **Why it matters:** This is the #1 advice CSRs should give renters proactively. Module currently focuses on filing/dispute, not prevention.
- **Suggested addition:** Brief tip in section 6-3: *"Proactive coaching for renters: take time-stamped photos at pickup of every angle of the trailer (and any pre-existing scrapes/dents). Same at return. This is the single best protection against bad-faith deposit deductions."*

## SCENARIO OPPORTUNITIES
**1. Owner discovered damage 3 days after ending rental.**
- **Why it would make a good scenario:** Tests the "no retroactive DDC" hard rule.
- **Suggested prompt:** *"An owner messages: 'I ended the rental on Tuesday and just found a big crack in the side panel today (Friday). I assumed I could file a deposit deduction this week. How do I do that?'"*
- **Suggested rubric:**
  - States the deposit released when the rental was ended; no retroactive DDC path
  - Explains the under-$500 direct-charge path as the alternative (with required documentation)
  - Doesn't promise a specific outcome
  - Coaches inspect-before-ending going forward

**2. Renter calls 36 hours after a DDC was filed.**
- **Suggested prompt:** *"A renter calls: 'I got an email yesterday that the owner is claiming $300 for damage I didn't cause. I was traveling and didn't see it until now. How do I dispute?'"*
- **Suggested rubric:**
  - Asks when the DDC was filed (establishes urgency)
  - Confirms the 24-hour window may have passed; if so, the claim has auto-approved
  - If past window, escalates rather than promising self-serve recovery
  - If within window, walks them to the dispute path

**3. Owner with own insurance asks how to file NT Protect.**
- **Suggested prompt:** *"An owner messages: 'I have MBA insurance on my trailer. There's $3,000 in damage from a renter. How do I file an NT Protect claim?'"*
- **Suggested rubric:**
  - States NT Protect cannot double-cover; owner must claim through MBA
  - Doesn't apologize for the policy
  - Offers to help with deposit-deduction (under-$500 portion via DDC) if relevant

## QUIZ QUESTION OPPORTUNITIES
**1. NT Protect deductible amount.** This is the single most important number in the module.
- **Suggested question + correct answer:**
  > NT Protect's deductible for eligible damage claims is:
  > a) $250 — b) **$500** (correct) — c) $1,000 — d) No deductible

**2. NT Protect coverage cap.**
- **Suggested question + correct answer:**
  > NT Protect provides damage coverage up to:
  > a) $5,000 — b) $10,000 — c) **$25,000** (correct) — d) Unlimited

**3. Two-path claim distinction.**
- **Suggested question + correct answer:**
  > An owner has $1,200 in damage from a renter. What's the correct sequence?
  > a) File one NT Protect claim for the full amount
  > b) **File a Deposit Deduction Claim FIRST (to secure the $500 deductible from the deposit), then file an NT Protect claim for the amount above $500** (correct)
  > c) Charge the renter's card directly through Stripe
  > d) Sue the renter in small-claims court

**4. DDC filing window (auto-approval at 24h).**
- **Suggested question + correct answer:**
  > How long does the renter have to dispute a Deposit Deduction Claim before it auto-approves?
  > a) 12 hours — b) **24 hours** (correct) — c) 48 hours — d) 7 days

**5. Fix m6-q1 to reflect tire conditional.** Currently flat "No" — wrong.

## Overall recommendation
**Substantial revision needed — highest priority of the curriculum.** This is the module described as "HIGH STAKES" and yet the actual stakes-bearing facts ($500 deductible, $25k cap, two-path claim flow, DDC-only-at-end-of-rental, 24-hour dispute window, MBA double-coverage rule) are entirely absent. A trainee can pass the current module quiz without knowing any of those numbers. Estimate: 90-120 minutes of edits in a follow-up patch. Should likely be the first module fixed.
