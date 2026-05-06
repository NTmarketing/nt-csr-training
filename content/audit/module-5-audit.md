# Audit: Payments, Fees & Payouts (id: module-5, display number 6)

## Current state summary
Three sections covering renter-side fees, owner-side payouts, and the Toll Program. Solid playbook structure but several specific dollar/day numbers are off, and the most-asked owner question (the platform commission) is entirely absent.

## ACCURATE — leave alone
- "Card charged when booking is accepted, not at request" — matches `[Renter] [account] Q: When will my credit card be charged?`.
- "Platform fee, tax, Protection Package = non-refundable once accepted" — matches multiple cancellation entries.
- "Bank info is the #1 cause of payout failures" — matches `[Owner] [payments] Q: Owner payout failed due to incorrect bank information`.
- "Toll Program is opt-in for owners; auto-tracks tolls and bills the renter directly" — matches `[Owner] [account] Q: How Does the Toll Program Work?`.

## ACCURACY ISSUES
**1. Deposit refund timing (3-7) is WRONG.**
- **Lesson says:** "Deposits are released **3-7 business days** after the rental officially closes." Quiz m5-q4 expects "3-7 business days."
- **KB says:** `[Renter] [damage-claims] Q: When will I get my security deposit back after returning a trailer?` — *"It may take 4-7 business days to appear on the renter's statement. If the owner files a deposit deduction claim, the renter has 24 hours to respond before funds are processed."*
- **Recommended fix:** Replace 3-7 with **4-7 business days** in section 5-1, the key point bullet, and m5-q4's expected keywords. Also add the 24-hour-claim-window detail: *"If the owner files a deposit deduction claim, the renter has 24 hours to respond before funds are processed — that delays the refund."*
- **Severity:** Critical. Off-by-one days isn't huge in absolute terms, but the lesson is being used as the canonical source and is currently wrong vs. the production KB.

**2. The 20% platform commission is missing entirely.**
- **Lesson says:** "Platform fee (NT's service fee — non-refundable)" — never quantifies on either the renter or owner side.
- **KB says:** `[Owner] [payments] Q: Why is my payout less than the rental amount?` — *"the 20% platform commission structure. For example: Rental Amount of $150 minus 20% Platform Service Fee ($30) equals $120 owner payout."* Also clarifies: renter-side fees (Deposit Processing Fee, Booking Fee, Protection Package) are NOT deducted from owner payouts.
- **Recommended fix:** New paragraph in section 5-2: *"Owner payout = Rental amount – 20% platform commission. Example: $150 rental → $120 owner payout (NT keeps $30). Renter-side fees (Deposit Processing Fee, Booking Fee, Protection Package) are NOT deducted from the owner's side — they're paid by the renter on top of the rental amount."*
- **Severity:** Critical. "Why is my payout less than the rental?" is one of the highest-volume owner questions; the lesson can't answer it.

**3. Owner payout timing is unspecified, and KB is internally inconsistent.**
- **Lesson says:** Section 5-2 walks through the flow with "ACH timing" but doesn't say how long.
- **KB says:** Two different answers. `[Owner] [payments] Q: How long does it take to receive payment after a rental ends?` — *"3-5 business days after a rental is completed."* But `[Owner] [booking] Q: When and how do I receive payment for completed rentals?` — *"Payments typically arrive within 1-2 business days via Stripe processing."*
- **Recommended fix:** Pick one to teach (recommend the conservative 3-5 figure), and flag the inconsistency back to KB ownership. Module wording: *"Payouts typically arrive **3-5 business days** after the owner ends the rental, processed via Stripe ACH. May be delayed by bank holidays or if there are deductions to process."*
- **Severity:** Moderate. Two-source KB conflict isn't the lesson's fault, but the lesson should pick the more conservative number to avoid setting an unmeetable expectation.

**4. Tax description omits the actual scope.**
- **Lesson says:** "Tax (non-refundable)" with no further detail.
- **KB says:** `[Both] [tax] Q: In which states does Neighbors Trailer collect sales tax?` — *"Washington, Virginia, Illinois."* And `[Both] [payments] Q: Are there sales taxes charged and who handles them?` reinforces it's state-specific.
- **Recommended fix:** Add: *"NT collects sales tax in Washington, Virginia, and Illinois only (subject to change). Renters in other states won't see a tax line. Owner doesn't owe income tax through NT — that's their own filing (1099 for owners earning above the threshold)."*
- **Severity:** Moderate. Not a blocker, but renters in other states sometimes ask why their bill doesn't have tax, and CSRs need an answer.

## CRITICAL GAPS — topic missing from lesson
**1. Partial refunds — owner-initiated, with timing constraints.**
- **Topic:** Owner can issue a partial refund to a renter, but only **before** ending the rental in the system. After ending, the path is more limited.
- **KB coverage:** `[Owner] [deposit-refund] Q: How can I issue a partial refund to a renter?` — *"The refund must be processed before the rental is ended in the system. Refunds are issued directly from the owner's account through the booking page."* Plus several `[Owner] [cancellation]` entries on partial refunds and timing.
- **Why it matters:** The early-return refund flow (covered in Module 7) presumes the owner can partial-refund — but if the rental's already ended in the system, the path changes. Module 5 is the natural place to introduce the "before-end-of-rental constraint."
- **Suggested addition:** New subsection in 5-2 or 5-1: *"Partial refunds (owner → renter) must be issued before the owner ends the rental in the system. Once ended, the path becomes a manual support ticket. So if a renter is asking for a partial refund (early return, owner promised goodwill), the owner has to act on it BEFORE clicking End Rental."*

**2. Failed-payout recovery playbook.**
- **Topic:** When a payout fails, what the owner needs to do (the actual menu of fixes).
- **KB coverage:** `[Owner] [damage-claims] Q: How do I fix a failed payout?` — full playbook: 1) Owner app > More > My Bank Account > correct routing/account number. Common issues = account number wrong length for the bank. *"Users will not receive funds sitting in their connected Stripe account until this is resolved."*
- **Why it matters:** Lesson currently says "walk them through updating bank info" but doesn't give the trainee the actual nav steps or the common error pattern.
- **Suggested addition:** in section 5-2 expand the bank-info paragraph: *"Walking an owner through bank correction: Owner app → 'More' → 'My Bank Account' → enter correct routing + account numbers. The system will flag specific issues like 'account number is 9 digits, that bank uses 10' — read the error to them. Funds sit in their connected Stripe account waiting; they don't get released until the bank info is correct."*

**3. Toll Program enrollment + edge cases.**
- **Topic:** How an owner enrolls; what happens if a rental is started/ended outside the system; circumvention deductions.
- **KB coverage:** `[Owner] [account] Q: How do I enroll in the Toll Program?` and the program rule that toll tracking only activates when the rental is properly started in the system. Also `[Owner] [payments] Q: Owner asking about platform commission or fees` and circumvention entries.
- **Why it matters:** Lesson says "owners opt in through their account settings" but doesn't say the enrollment workflow involves NT staff. Also the "if you don't start the rental in the system, the toll won't track" rule isn't surfaced — and that's exactly the failure mode the program has.
- **Suggested addition:** in section 5-3: *"Enrollment is via Settings → Toll Program (or by emailing support). Critical edge case: tolls only track when the rental is properly Started AND Ended in the system. Skipping the Start button means no toll tracking and the owner gets billed personally for tolls during the rental period."*

## SCENARIO OPPORTUNITIES
**1. Owner asks why payout is $30 less than rental.**
- **Why it would make a good scenario:** Tests the 20% commission knowledge — currently completely absent.
- **Suggested prompt:** *"An owner messages: 'My trailer rented for $150 last week, but my payout was only $120. Is there a mistake?'"*
- **Suggested rubric:**
  - Explains the 20% platform commission — math: $150 × 0.80 = $120
  - Mentions renter-side fees (Booking Fee, Protection Package, Deposit) are paid by the renter, not deducted from owner side
  - Doesn't apologize for the commission

**2. Renter in a no-tax state asks about tax line.**
- **Suggested prompt:** *"A renter in Florida calls: 'My friend in Washington said his booking had a tax line and mine doesn't. Is something wrong with my bill?'"*
- **Suggested rubric:**
  - States NT collects sales tax in WA/VA/IL only
  - Doesn't make this seem like a bug
  - Doesn't give legal advice on the renter's own state tax obligations

## QUIZ QUESTION OPPORTUNITIES
**1. Fix m5-q4 to 4-7 days.** Currently expecting "3-7" — wrong.

**2. Platform commission percentage.**
- **Suggested question + correct answer:**
  > What percentage does NT take from the rental amount as the platform commission?
  > a) 10% — b) 15% — c) **20%** (correct) — d) 25%

**3. Sales tax states.**
- **Suggested question + correct answer:**
  > In which states does NT currently collect sales tax on rentals?
  > a) All 50 states
  > b) **Washington, Virginia, and Illinois only** (correct)
  > c) The renter's state of residence
  > d) The trailer's location state

## Overall recommendation
**Substantial revision needed.** Two factual errors propagate into quiz answers (deposit refund days, missing commission). One huge gap (the 20% commission). Plus partial-refund timing constraint is missing entirely. Once these land, the module becomes one of the strongest in the curriculum because the underlying structure is good. Estimate: 60-90 minutes of edits.
