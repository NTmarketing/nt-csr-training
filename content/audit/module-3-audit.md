# Audit: Booking Lifecycle — Renter Side (id: module-3, display number 4)

## Current state summary
Three sections covering request→acceptance flow with owner response expectations, date changes & trailer switches, and pickup-address calls. Tight and well-structured. The biggest issues are missing rules and overly-flat representations of policies that actually have important constraints.

## ACCURATE — leave alone
- "Booking confirmation is not instant — requires owner acceptance" — correct.
- "Same-owner switch via My Reservations" — matches `[Owner] [cancellation] Q: How can a renter switch to a different trailer I have listed?`.
- "Different-owner change requires cancel + rebook" — matches.
- "Pickup address auto-appears on booking page after acceptance" — matches.

## ACCURACY ISSUES
**1. "NT does not have a hard SLA on owner response" understates the real proactive process.**
- **Lesson says:** "NT does not have a hard SLA on owner response. This trips up renters who expect instant confirmation."
- **KB says:** `[Renter] [booking] Q: How long should I wait for a booking response? What if it's urgent?` — *"If no response within 2 hours, the support team reaches out and continues trying to contact them until they respond."* Also `[Renter] [booking] Q: I have a pending booking and the owner hasn't responded. What should I do?` — *"Inform them that support will notify the trailer owner regarding their request. If the trailer owner does not respond within 1-2 hours, they may need to seek alternatives."* And there IS an owner-side enforcement: `[Both] [profile]` — accounts get deactivated for missing the **12-hour booking response** window.
- **Recommended fix:** rewrite to: *"Owners are expected to respond within 12 hours (a missed response can deactivate their account). NT support reaches out to non-responding owners after ~2 hours. So when a renter's request has been pending more than 2 hours, support is already nudging the owner — the renter doesn't need to wait helplessly."* The current framing makes the trainee sound passive/vague; the reality is more reassuring and accurate.
- **Severity:** Critical. Trainee currently learns to tell renters "no SLA, just wait" when in fact NT has an active escalation process and a 12-hour deactivation rule for owners.

**2. "CSR cannot cancel for the renter" — too absolute.**
- **Lesson says:** "Renters cannot cancel via phone, email, or chat. Only through their account. … This applies even when they're asking the CSR to cancel for them."
- **KB says:** `[Internal] [cancellation] Q: How to handle no-shows and unresponsive owners?` — *"If still no response after multiple attempts, reject the booking due to lack of owner response. Process full refund to renter."* Also `[Renter] [booking] Q: I need to change my booking dates but already submitted one date change request. Can I submit another?` — *"support can cancel their current booking and refund the entire booking except the booking fees."*
- **Recommended fix:** keep the default ("renter cancels through their account") but add the exception: *"Support CAN cancel a booking on the renter's behalf in specific cases — owner unresponsive, owner can't fulfill, second date-change requests. These should be escalated rather than handled directly by a fresh CSR, but don't tell the renter flatly 'we can't cancel for you' — that's only true for the standard self-serve case."*
- **Severity:** Moderate. Will produce CSR-renter friction when a true exception case arises.

**3. Date-change rule omits the "only one date-change request per booking" hard cap.**
- **Lesson says:** "Date changes: Renters can request a date change through their booking. The owner must accept the new dates. If the owner declines, the renter has to cancel under the cancellation policy."
- **KB says:** `[Renter] [booking] Q: I need to change my booking dates but already submitted one date change request. Can I submit another?` — *"only one date change request can be submitted per booking. If they do not wish to continue with the current dates, they would need to re-book."*
- **Recommended fix:** add the cap: *"Only one date-change request is allowed per booking. If the second date doesn't work either, the renter has to cancel and rebook (support can waive the cancellation booking fees in this case)."*
- **Severity:** Moderate. Real customers hit this regularly.

## CRITICAL GAPS — topic missing from lesson
**1. "Days cannot be removed from a booking, only added."**
- **Topic:** A renter who wants to shorten a booking can't shrink the dates — they can only extend.
- **KB coverage:** `[Renter] [cancellation] Q: I can't remove days from my booking - what can I do?` — *"Explain that bookings can only be extended; days cannot be removed once a reservation is made."* The fallback paths are owner partial refund (Module 5) or cancel-and-rebook.
- **Why it matters:** This is a non-obvious platform constraint — most rental sites let you shorten. The lesson never says "you can't shorten" so a CSR will naïvely promise something the platform can't deliver.
- **Suggested addition:** in section 3-2: *"Bookings can be extended but **not shortened**. If a renter wants fewer days, they have two options: (1) keep the booking and ask the owner for a partial refund after returning early, or (2) cancel and rebook for the correct dates (support may be able to waive booking fees for option 2)."*

**2. Early-return refund mechanics from the renter's POV.**
- **Topic:** What happens when the renter returns early — they're not auto-refunded; the owner has to initiate.
- **KB coverage:** `[Renter] [booking] Q: I returned a trailer early. How do I get a refund for unused days?` — *"The owner needs to initiate a partial refund. Support will ask the owner how much they want to refund, then process it. Refunds take 4-7 business days and appear separately from deposit refunds."*
- **Why it matters:** Renters often think "I returned 2 days early, I'll get 2 days back automatically." That's not how it works. CSR needs to set the expectation that the OWNER controls the partial refund.
- **Suggested addition:** Either in section 3-2 or as a new section "Returning early": *"Early returns don't auto-refund. The owner has to initiate a partial refund — support facilitates but doesn't dictate the amount. Set expectations: refunds take 4-7 business days and appear separate from the deposit refund."*

**3. "Can I inspect the trailer before booking?" — small but frequent.**
- **Topic:** No in-person pre-booking inspection allowed.
- **KB coverage:** `[Renter] [general] Q: Can I see or inspect a trailer before booking?` — *"For privacy and safety reasons, Neighbors Trailer does not allow in-person meetings with trailer owners before a booking is confirmed."*
- **Why it matters:** Common-enough renter ask; if a CSR doesn't know the rule, they might naively suggest meeting the owner.
- **Suggested addition:** brief mention in section 3-1 or 3-3: *"Renters cannot inspect a trailer in person before booking. If they want more detail, they message the owner through the platform to ask for photos or specs."*

## SCENARIO OPPORTUNITIES
**1. Renter wants to shorten a 5-day booking to 3 days.**
- **Why it would make a good scenario:** Tests the "can't shorten" rule and the owner-initiated partial refund workaround.
- **Suggested prompt:** *"A renter calls: 'I booked 5 days but I just realized I only need it for 3. Can you remove the last 2 days from my booking?' Walk through it."*
- **Suggested rubric:**
  - States days can't be removed — only added
  - Mentions the two options: keep + ask owner for partial refund on early return, or cancel and rebook
  - Doesn't promise an outcome on the partial refund

**2. Date-change-already-used renter.**
- **Suggested prompt:** *"A renter messages: 'I changed my dates last week and now I need to change them again — the owner accepted my last change but my plans shifted again. How do I do another date change?'"*
- **Suggested rubric:**
  - States only one date-change request per booking
  - Offers cancel-and-rebook path; mentions support can waive booking fees in this case
  - Stays empathetic, doesn't lecture

## QUIZ QUESTION OPPORTUNITIES
**1. Days-cannot-be-removed.**
- **Suggested question + correct answer:**
  > A renter wants to shorten their booking from 5 days to 3 days before pickup. What's correct?
  > a) Edit the booking through their account to remove the last 2 days
  > b) Submit a date-change request to shorten
  > c) **Bookings can't be shortened — only extended. The renter must either keep the booking and ask the owner for a partial refund on early return, OR cancel and rebook.** (correct)
  > d) Support shortens it on their behalf

**2. Date-change cap.**
- **Suggested question + correct answer:**
  > How many date-change requests can a renter submit per booking?
  > a) Unlimited — b) **One** (correct) — c) Two — d) Up to three before requiring escalation

## Overall recommendation
**Moderate updates.** Sections are well-organized but missing key constraint rules: the "one date change", "no shortening", "early-return is owner-initiated", and the "support DOES cancel in some cases" exception. These are not rare edge cases — they're high-volume renter calls. ~45 minutes of edits.
