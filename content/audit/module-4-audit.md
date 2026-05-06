# Audit: Booking Lifecycle — Owner Side (id: module-4, display number 5)

## Current state summary
Three sections: listing approval, start/end rental compliance, and owner self-serve tools. Tight and well-shaped, but the listing approval timing is wrong, and the start/end compliance section under-states real consequences.

## ACCURATE — leave alone
- "No phone numbers, addresses, logos, or company names in photos" — matches multiple `[Owner] [listing]` entries.
- "Owner manually starts and ends each rental" — correct.
- "Owners should not quote tow capacity" — correct (KB doesn't contradict).
- "Owners can self-serve calendar block-out, rates, messaging, trailer switch via My Reservations" — correct.

## ACCURACY ISSUES
**1. Listing approval timing is WRONG.**
- **Lesson says:** "approval — typically 24-48 hours."
- **KB says:** `[Owner] [listing] Q: How long does listing approval take and can it be expedited?` — *"listing approval typically takes 1-2 business hours during normal business hours, but may take 1-2 business days depending on the queue volume."* And the lesson misses entirely that **expedited approval is a thing** — *"If an owner requests expedited approval, staff can manually approve listings that are complete and meet requirements."*
- **Recommended fix:** "Approval typically takes **1-2 business hours during business hours, up to 1-2 business days** if the queue is backed up. If an owner has a real urgency (e.g., upcoming booking opportunity), the team can expedite — escalate the request rather than telling them to wait."
- **Severity:** Critical. The lesson currently sets the wrong expectation by 10x for the typical case AND tells the trainee there's no expedite path. Both wrong.
- Also: the same wrong "24-48 hour" number appears in `m4-q2` quiz (currently a "correct" answer that's actually wrong).

**2. Start/End compliance — penalties listed but not specifically enough.**
- **Lesson says:** "Failure to start or end on time triggers escalation templates and possible payout deductions."
- **KB says:** `[Owner] [damage-claims] Q: Why am I getting non-compliance notices for not starting/ending rentals?` — explicit: *"Forfeiture of payout"* AND *"$25 daily fee for every day the booking remains open per Terms of Use."*
- **Recommended fix:** Quote the specific consequence: "Non-compliance penalties: payout forfeiture, plus a **$25 daily fee** for every day the booking remains open. Per the Terms of Use." This makes the trainee able to answer an owner's "what happens to me if I don't end?" question with a real number instead of waving at "deductions."
- **Severity:** Critical. The dollar number is what scares an owner into action; without it, the lesson is flaccid.

**3. "Listing photos" minimum is missing.**
- **Lesson says:** Bad photos / dimensions / contact info are common rejection reasons. Doesn't state the minimum.
- **KB says:** `[Owner] [listing] Q: Why does my listing need at least 4 photos?` — *"a minimum of 4 high-quality photos of the trailer from multiple angles."* Also the listing-approval entry confirms 4 photos as a checklist requirement.
- **Recommended fix:** Add to common rejection list: "Fewer than **4 photos** (minimum from multiple angles). Plus a 17-character VIN, full address in Location field, and a complete profile."
- **Severity:** Moderate. The 4-photo minimum is an exact requirement that comes up often.

**4. Section 4-2 misses what to do when renter no-show'd vs. owner ending early.**
- **Lesson says:** Walk owner through ending it now if they forgot.
- **KB says:** `[Owner] [damage-claims] Q: Why am I getting non-compliance notices...` — *"Special circumstances: If the renter didn't show up, they need to cancel (not the owner) to avoid cancellation fees. If the trailer was abandoned or in an accident, advise them to contact support before ending the rental."*
- **Recommended fix:** Add to section 4-2: "Two special cases: (1) renter no-show — the **renter** must cancel, not the owner (otherwise the owner gets hit with cancellation fees instead of the renter losing the no-show refund). (2) Trailer abandoned or accident — escalate before ending, otherwise documentation gets messy."
- **Severity:** Moderate. "Owner ends a no-show as if it was completed" is a real costly mistake the lesson doesn't prevent.

## CRITICAL GAPS — topic missing from lesson
**1. Ending a rental with damage = filing a deposit deduction claim in the SAME flow.**
- **Topic:** When ending the rental, owner can attach a deposit deduction claim right there (with photo evidence). They don't have to wait or end-then-claim.
- **KB coverage:** `[Owner] [damage-claims] Q: How do I end a rental from my account?` — explicit step-by-step: *"upload minimum four new photos taken at return ... if no damage/loss/unpaid fees, tap End Rental to complete; if there is damage/loss/unpaid fees, select Deposit Deduction Claim option, enter required information, then tap End Rental."* Also `[Owner] [damage-claims] Q: How long do I have to file a damage claim?` — there's a 24-hour post-rental claim window owners often miss.
- **Why it matters:** Owners frequently end the rental, *then* try to file the claim and get told they're outside the window. The lesson never connects start/end to damage-claim mechanics.
- **Suggested addition:** New paragraph in section 4-2: *"When ending a rental, the owner can ALSO file a deposit deduction claim in the same flow — selecting that option triggers the photo + description + repair-cost workflow before they hit End Rental. If there's any chance of damage, file then, not later. There's a hard window for filing after ending, and 'I forgot' is not a recoverable position."*

**2. VIN-already-exists error.**
- **Topic:** When an owner gets a VIN-conflict error during listing creation.
- **KB coverage:** `[Owner] [listing] Q: I'm getting a "VIN already exists" error when listing my trailer` — explicit playbook (save as draft, photo of VIN plate, email service@ with Trailer ID).
- **Why it matters:** Listing-blocking error with a non-obvious resolution. CSR who sees this and improvises will get it wrong.
- **Suggested addition:** New bullet in section 4-1 under common holds: *"VIN-already-exists error: tells the owner to save the trailer as a draft, photograph the VIN plate, and email support with the photo + Trailer ID. Don't try to fix it directly — it's a manual conflict resolution."*

**3. Owner-side cancellation types.**
- **Topic:** Different types of owner cancellations and the fee implications.
- **KB coverage:** `[Owner] [cancellation] Q: What are the different types of owner cancellations and fees?` and `Q: What constitutes an owner cancellation "for cause" vs "without cause"?` — meaningful distinction with different fee outcomes.
- **Why it matters:** Owner cancels are a real category that this module doesn't address (it's covered some in module 7 but not from the owner playbook side).
- **Suggested addition:** Brief mention in section 4-3 self-serve tools — *"Owners can also cancel a booking through their account, but the fee structure differs: cancellation 'with cause' (trailer broken, ID issue, fraudulent renter) is generally fee-waived; 'without cause' (changed mind, double-booked) carries a fee. When uncertain, escalate so the team can categorize."* Module 7 has the full schedule; this is the awareness pointer for owner-side conversations.

## SCENARIO OPPORTUNITIES
**1. Owner forgot to file claim when ending; now sees damage two days later.**
- **Suggested prompt:** *"An owner messages: 'I ended a rental on Tuesday and just noticed today that there's a big scratch on the side of the trailer. I didn't file anything when I ended it because I didn't see the damage until I cleaned it. Can I still file a claim?'"*
- **Suggested rubric:**
  - States there's a hard window for filing after ending; checks how long it's been (24h+ is generally too late)
  - Doesn't promise an outcome but offers to escalate for review
  - Coaches the owner to inspect-and-file at end-of-rental going forward

**2. Owner asks to expedite listing approval.**
- **Suggested prompt:** *"An owner calls: 'I have a renter ready to book on Friday but my listing has been pending for 6 hours. Can you push it through?'"*
- **Suggested rubric:**
  - Doesn't tell them to just wait
  - Confirms the listing meets all requirements (4 photos, 17-char VIN, full address, no contact info in photos, completed profile)
  - Escalates the expedite request

## QUIZ QUESTION OPPORTUNITIES
**1. Correct listing approval timing.**
- **Why this should be tested:** Currently `m4-q2` answer is **wrong**. A trainee certified on the existing quiz tells owners "24-48 hours" when the truth is 1-2 business hours typically.
- **Suggested question + correct answer:**
  > How long does listing approval typically take?
  > a) Same day always
  > b) **1-2 business hours during business hours; up to 1-2 business days when the queue is backed up; expedited approval available on request** (correct)
  > c) 24-48 hours
  > d) 5-7 business days

**2. Non-compliance dollar fee.**
- **Suggested question + correct answer:**
  > An owner doesn't end a rental on time. What financial penalties apply?
  > a) A warning, then a $50 fine
  > b) **Payout forfeiture, plus $25 per day the booking remains open** (correct)
  > c) Account suspension after 24 hours
  > d) No fee, just a customer-service follow-up

**3. Photos minimum.**
- **Suggested question + correct answer:**
  > Minimum number of photos required for a trailer listing?
  > a) 1 — b) 2 — c) **4** (correct) — d) 8

## Overall recommendation
**Substantial revision needed.** The listing-approval timing fact is wrong (and is propagated into a quiz question). The start/end consequences need the actual dollar fee. Two high-volume topics are entirely missing (filing damage at rental end, VIN-conflict error). This is the module that, if not fixed, will produce the most CSR-customer friction during real calls. Estimate: 60-90 minutes of edits in a follow-up patch.
