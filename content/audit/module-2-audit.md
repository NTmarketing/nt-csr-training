# Audit: Account & Verification (id: module-2, display number 3)

## Current state summary
Four sections covering the two required verifications (Clear + MVR), how to handle Clear refusals, MVR rejection scripting, and "my account is inactive" triage. Solid practical playbook with clear scripts, but slim on a few high-volume-call topics.

## ACCURATE — leave alone
- "Clear is third-party, NT does not store ID images, name-drop airlines/stadiums" — matches `[Renter] [verification] Q: Can I use an alternative to CLEAR for ID verification?` (which name-drops Uber/Public/LinkedIn).
- "CSR cannot override an MVR rejection — escalate" — matches all MVR-rejection KB entries (no manual override path exists for staff).
- "If they still refuse Clear, booking can't proceed" — KB explicitly says "Do NOT offer manual verification, alternative methods, or exceptions. There are no workarounds." Matches.
- "No CDL required" — matches multiple `[Renter] [verification]` entries.
- "Triage account-inactive: email → listing fields → compliance hold" — matches `[Both] [profile] Q: My account is inactive/deactivated/suspended. How do I reactivate it?` ordering reasonably well.

## ACCURACY ISSUES
**1. Account-inactive triage misses several common causes that the KB lists first.**
- **Lesson says:** Three causes — unverified email, missing listing fields, compliance hold.
- **KB says:** `[Both] [profile] Q: My account is inactive/deactivated/suspended. How do I reactivate it?` — the **first** reason listed is *"Unresponded booking requests: Account deactivated for not responding to booking requests within 12 hours."* This is a real owner deactivation pattern. The lesson's triage skips it entirely. KB also lists *"Business name in profile"* (account has a business name not a personal one — auto-deactivated, email released so the user can re-register with a personal name). Lesson misses it.
- **Recommended fix:** Expand the triage list to 5 items: (1) unverified email; (2) **owner missed 12-hour booking response window**; (3) missing required listing fields; (4) **business name in profile (auto-deactivated)**; (5) compliance hold (escalate). The current 3-item triage will leave a CSR baffled when they hit the most common owner-side cause.
- **Severity:** Critical. The "12-hour booking response" deactivation is one of the most common owner support tickets per the volume of cancellation/booking entries.

**2. Class C / no-CDL phrasing makes a state-law claim NT doesn't make.**
- **Lesson says:** "A standard Class C license is sufficient for renting a standard trailer. No CDL required."
- **KB says:** No KB entry takes a position on CDL legality. The verification entries focus on Clear flow, not licensing law. The platform validates a license through MVR but doesn't certify it for any particular class.
- **Recommended fix:** "Most renters do not need a CDL for the trailers on this platform. CDL/license-class law is state-specific — direct the renter to their local DMV if they're unsure." This is the same fix recommended in the Trailer Basics audit.
- **Severity:** Moderate. Same liability concern flagged in TB.

**3. Section 2-3 implies MVR rejection is the only "you can't book" path; doesn't mention name discrepancy.**
- **Lesson says:** MVR rejections from license suspensions, multiple violations, expired license, license type doesn't qualify.
- **KB says:** `[Renter] [verification] Q: I have a name discrepancy between my account and ID` — Clear (not MVR) will fail when the account name and license name don't match. *"The user will need to create a new account or reservation using their correct full legal name."* This is a frequent block path that's separate from MVR.
- **Recommended fix:** Add a paragraph in section 2-2 (Clear refusals) titled "Name mismatch": "Clear will fail when the account name doesn't match the full legal name on the license. Renter must create a new account/booking with the correct legal name — there's no way to edit the existing one through that flow."
- **Severity:** Moderate. Comes up frequently and lesson currently has no playbook for it.

## CRITICAL GAPS — topic missing from lesson
**1. Minimum-age requirement (25).**
- **Topic:** Renters must be 25+ to book.
- **KB coverage:** `[Renter] [verification] Q: What is the minimum age to rent a trailer?` — *"the minimum age requirement to rent on the platform is 25 years old. This is due to the age requirement for insurance offered by MBA through the platform."* Also `[Renter] [cancellation] Q: I'm under 25 and was unable to rent - can I get a refund?`
- **Why it matters:** Hard cutoff. CSRs routinely field these calls. A trainee who certifies on this module without knowing 25 is the floor will mishandle them.
- **Suggested addition:** New bullet under section-2-1: *"Minimum renter age is 25 (driven by NT Protect / insurance partner age requirement). Under-25 callers can't book — direct them to a parent/spouse who's 25+."*

**2. Third-party driver coverage caveat.**
- **Topic:** Whoever drives the trailer must be the named renter. Otherwise NT Protect may not apply.
- **KB coverage:** `[Both] [verification] Q: Can a third-party driver pick up a trailer?` — explicit policy: *"For Protection Package coverage to apply, the individual picking up and operating the trailer must be the renter named on the booking."*
- **Why it matters:** Owners ask this regularly ("my renter is sending his brother — is that OK?"). Renters ask this regularly ("can my husband pick it up?"). The lesson's Account & Verification module is the natural home for this rule.
- **Suggested addition:** Add a 4th section or a callout: *"The named renter (the person whose Clear/MVR check passed) must be the one who picks up and operates the trailer. If someone else drives, NT Protect may not apply. There's no shortcut — they need to either re-do the booking under the actual driver's name or have that person complete Clear themselves under the same booking."*

**3. Clear troubleshooting playbook (technical issues).**
- **Topic:** What to do when Clear is freezing/not loading/showing camera errors.
- **KB coverage:** `[Both] [verification] Q: Clear verification is freezing or not working` — 4-step playbook (sign out/in, switch web↔app, install renter app, restart phone). Multiple sibling entries about camera issues, SMS code issues, antivirus blocking Clear.
- **Why it matters:** This is the #1 inbound technical-support call type for Clear. The lesson currently treats Clear as a binary "they refuse / they pass" thing and doesn't equip the trainee for "I'm trying but it's not working."
- **Suggested addition:** Add bullets in section 2-2 under "Technical issues with the Clear flow": *"Standard troubleshooting (in order): sign out and back in → switch between web and app → install the green Renter app → restart phone. If antivirus is blocking Clear, ask them to whitelist clearme.com. If selfie/camera fails repeatedly, escalate for manual verification review — that path exists but is rare."*

## SCENARIOS

**Real situation pattern from KB:** Renter is 23, calls saying their friend booked but failed, asks if they can rent.
- **Why it would make a good scenario:** Tests the under-25 cutoff and the redirect.
- **Suggested prompt:** *"A renter calls: 'I tried to book but got an error saying I don't qualify. I'm 23 and I have a clean driving record — what's going on?' Walk them through it."*
- **Suggested rubric:**
  - States the 25 age minimum directly (no waffling)
  - Explains it's tied to insurance partner requirement, not arbitrary
  - Suggests a workaround (book under a 25+ household member's name) without compromising the rule

**Real situation pattern from KB:** Owner asks about the renter sending someone else.
- **Suggested prompt:** *"An owner texts in: 'My renter messaged me that his brother will pick up the trailer instead of him because he has to work. Is that OK?' How do you respond?"*
- **Suggested rubric:**
  - Says the named renter must be the one who picks up and operates
  - Mentions Protection Package coverage may not apply otherwise
  - Suggests the brother re-do Clear under the same booking, or rebook under the brother's name

## QUIZ QUESTION OPPORTUNITIES
**1. Minimum age.**
- **Suggested question + correct answer:**
  > What is the minimum age to rent a trailer on Neighbors Trailer?
  > a) 18 — b) 21 — c) **25** (correct) — d) 30

**2. Third-party driver.**
- **Suggested question + correct answer:**
  > A renter asks if their friend can pick up the trailer for them. The friend hasn't done Clear verification. What's the correct guidance?
  > a) Sure, the renter can hand off the keys
  > b) **The named renter must pick up and operate; if someone else drives, NT Protect may not apply** (correct)
  > c) Only if the friend has a CDL
  > d) The owner can decide

**3. Account-inactive (multi-cause).**
- **Suggested question + correct answer (multi-select or trick):**
  > Which of these is NOT a typical cause of an "account inactive" status on the owner side?
  > a) Unverified email
  > b) Missed 12-hour booking response window
  > c) Business name in profile (instead of personal name)
  > d) **Renter left a 1-star review** (correct — reviews don't affect account status)

## Overall recommendation
**Moderate updates.** The Clear/MVR scripting is good, the triage frame is good, but the module has three critical content gaps (minimum age, third-party driver, account-inactive cause expansion). All three are high-frequency CSR topics. Should also fix the Class C/CDL phrasing per the cross-cutting fix from TB. ~45 minutes of edits in a follow-up patch.
