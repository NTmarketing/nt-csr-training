# Audit: Platform Foundations (id: module-1, display number 2)

## Current state summary
Three sections covering "what NT is" (peer-to-peer marketplace), the 9-step booking lifecycle, and core terminology (NT Protect, Toll Program, My Reservations, MVR, Clear, Pending booking). It's the conceptual scaffold for everything else — short and clean.

## ACCURATE — leave alone
- "NT does not own the trailers" — matches the production positioning exactly.
- "Pickup address shared after owner accepts" — matches `[Renter] [booking] Q: How do I get the pickup address and owner contact information?`.
- "Booking is not instant — requires owner acceptance" — matches `[Renter] [booking] Q: How long does booking confirmation take?`.
- "NT Protect is a damage protection product, not insurance" — correct per current production language.
- 9-step lifecycle ordering — matches the renter-side booking flow described across `[Renter] [booking]` entries.

## ACCURACY ISSUES
**1. NT Protect description is too generic; misses the actual coverage limits.**
- **Lesson says:** "built-in damage protection covering accidental damage during rentals. Not insurance — it's a damage protection product, not an insurance policy. Tire damage and intentional damage are excluded."
- **KB says:** `[Renter] [general] Q: Why Rent from Neighbors Trailer?` — *"NT Protect is backed by licensed and insured partners and provides up to $25,000 in coverage for eligible damage, theft, and vandalism, with a $500 deductible."* `[Both] [damage-claims] Q: What is the $500 deductible and who pays it?` confirms the deductible figure is part of the standard CSR vocabulary.
- **Recommended fix:** add the two key numbers — **$500 deductible**, **up to $25,000 coverage** — to the Core Terminology bullet. Also mention it covers theft and vandalism, not just accidental damage. These are facts CSRs need on tongue and the lesson currently leaves them out.
- **Severity:** Critical. A trainee who only studies this module will not know the deductible or the cap — and those are the two most common things a customer asks.

**2. Tire-damage blanket exclusion (same issue as Trailer Basics).**
- **Lesson says:** "Tire damage and intentional damage are excluded."
- **KB says:** Tire damage is conditional, not excluded. See Trailer Basics audit for the conditional rule.
- **Recommended fix:** "Tire damage liability depends on cause (renter pays for impact/overload; owner pays for old/defective tires). Intentional damage is excluded."
- **Severity:** Critical (same root cause as TB).

**3. Step 5 of the lifecycle conflates "phone shared" with reality.**
- **Lesson says:** "Pickup address and owner phone shared automatically once accepted"
- **KB says:** `[Owner] [general] Q: How Can I share my address or phone number with the renter?` — owners can share their phone *manually* through messaging; it's not an automatic share by default. Pickup address yes, phone no.
- **Recommended fix:** "Pickup address shared automatically; owner contact info available through platform messaging." Don't promise automatic phone exposure.
- **Severity:** Moderate. Renters who expect a phone number to appear on the booking page and don't see one will call support.

**4. Step 9 (deposit refund timing) is unspecified.**
- **Lesson says:** "Reviews left, deposit refunded, owner payout issued" — no timing.
- **KB says:** Deposit refund 4-7 business days after owner ends the rental (`[Renter] [damage-claims] Q: When will I get my security deposit back…`); owner payout within 1-2 business days via Stripe (`[Owner] [booking] Q: When and how do I receive payment for completed rentals?`).
- **Recommended fix:** Add timing — "Deposit refund: 4-7 business days. Owner payout: 1-2 business days." (Module 5 covers payouts in depth, but this is the lifecycle scaffold module — quick numbers belong here.)
- **Severity:** Moderate. Both timings are top-asked questions; they belong in the scaffold.

## CRITICAL GAPS — topic missing from lesson
**1. Multiple-simultaneous-booking-requests policy.**
- **Topic:** Renters cannot place multiple booking requests at once for different trailers.
- **KB coverage:** `[Policy] [booking] IMPORTANT: Multiple Simultaneous Booking Requests` is a flagged Policy entry — explicitly Important. KB tells staff: "Do NOT advise users to place multiple booking requests at the same time." If multiple owners accept, the renter is charged multiple times.
- **Why it matters:** This is the *one* explicitly-tagged Policy entry in the booking category. The lesson's terminology section defines "Pending booking" but never warns the trainee against the multi-request workaround. New CSRs given a "what if owner doesn't respond?" call could naïvely suggest multi-booking.
- **Suggested addition:** add to section-1-3 (Core Terminology) under "Pending booking" or as a dedicated callout: *"Renters should only have one booking request pending at a time. Never advise placing multiple simultaneous requests for different trailers — if multiple owners accept, the renter gets charged multiple times. Correct workaround: message owners through the platform first; cancel a pending request before submitting a new one."*

**2. Card hold vs. card charge.**
- **Topic:** When the renter is *authorized* vs. *charged* — a frequent customer confusion.
- **KB coverage:** `[Renter] [account] Q: When will my credit card be charged?` — authorization at request time, full charge upon owner acceptance.
- **Why it matters:** Customers see a hold on their statement and call confused. CSRs need to distinguish "hold" from "charge" cold.
- **Suggested addition:** under the lifecycle, augment step 2 ("Renter requests a booking"): *"Card is authorized (pending hold) at request time, but not charged until the owner accepts. The hold drops off automatically if the booking is cancelled or rejected."*

**3. NT does not take phone reservations.**
- **Topic:** Booking is online/in-app only — phone reservations are not supported.
- **KB coverage:** Multiple `[Renter] [general]` entries reinforce this; confirmation of self-serve booking model.
- **Why it matters:** A trainee handling an inbound call from someone trying to book by phone needs to redirect them to the website without making them feel dismissed.
- **Suggested addition:** brief note in section-1-1 or terminology: *"Bookings are self-serve through the website or apps. NT does not take reservations by phone — direct callers to neighborstrailer.com or the apps."*

## SCENARIO OPPORTUNITIES
**1. Multi-booking renter.**
- **Real situation pattern from KB:** Renter calls saying their owner is slow; CSR has to resist the temptation to suggest "just book another one too."
- **Why it would make a good scenario:** Tests the trainee's grasp of an explicitly-tagged Policy entry.
- **Suggested prompt:** *"A renter calls saying 'I submitted a booking request 4 hours ago and the owner hasn't responded. I really need a trailer for tomorrow. Should I just book a different one too while I wait?' How do you respond?"*
- **Suggested rubric:**
  - Says NO to multiple simultaneous requests; explains the multi-charge risk
  - Suggests messaging the current owner through the platform first
  - Tells them they can cancel the pending request and try a different trailer instead (no penalty)

**2. "I see a charge but I haven't picked up the trailer."**
- **Real situation pattern from KB:** Renter sees the auth hold on their statement, panics, calls.
- **Why it would make a good scenario:** Tests the auth-vs-charge distinction.
- **Suggested prompt:** *"A renter calls: 'I see a charge for $312 on my card but I haven't picked up the trailer yet — and the owner hasn't even accepted my booking. What's going on?' Walk through it."*
- **Suggested rubric:**
  - Distinguishes authorization (pending) from completed charge
  - Confirms charge completes upon owner acceptance, not at request time
  - Tells renter the auth drops off automatically if the booking isn't accepted

## QUIZ QUESTION OPPORTUNITIES
**1. Multi-booking policy.**
- **Topic:** Same as Scenario 1 above.
- **Why this should be tested:** It's the only Policy-tagged entry in the booking category and currently goes untested.
- **Suggested question + correct answer:**
  > A renter says their owner is slow to respond and asks if they should just place a backup booking request for a different trailer. What's the correct guidance?
  > a) Yes, that's a fair workaround (incorrect — they could be charged twice)
  > b) Only if the trailers are in different cities
  > c) **No — only one pending booking at a time. Suggest messaging the owner first or cancelling the pending request before booking elsewhere.** (correct)
  > d) Wait 24 hours, then retry

**2. Authorization vs. charge.**
- **Topic:** Card hold vs. completed charge timing.
- **Suggested question + correct answer:**
  > When is a renter's card actually charged for a booking?
  > a) When the booking request is submitted
  > b) **When the owner accepts the booking** (correct)
  > c) When the rental is started
  > d) When the rental ends

## Overall recommendation
**Light-to-moderate updates.** The structural framing (peer-to-peer, lifecycle, terminology) is correct. Three concrete fact additions are needed: NT Protect coverage limits (deductible + cap), tire-damage conditional, deposit/payout timings. One missing policy that should not be missing: the multi-booking warning. None of the existing scenarios or quiz items are wrong — they're just incomplete coverage of the core platform vocabulary. ~30 minutes of edits in a follow-up patch.
