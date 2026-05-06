# Content Audit Summary

Read-only audit of `content/modules.json` (12 modules) and `content/exam-questions.json` (56 cert questions) against the master KB at `content/knowledge-base.txt` (977 entries, 675 KB).

**No content was modified in this patch.** All findings are recommendations for a follow-up edit patch.

## Total accuracy issues across all modules

| Severity | Count | Notes |
|---|---:|---|
| **Critical** | **23** | Wrong dollar/day numbers, missing required policy facts, exam answers that propagate wrong facts into the cert pool |
| **Moderate** | **17** | Missing constraints, oversimplified rules, gap topics that come up in real calls |
| **Minor** | **2** | Tone/phrasing nits |
| **Total** | **42** | |

Plus **1 KB-internal inconsistency** (75% vs 80% early-return cap appears in two different KB entries). Module 7 is correct on 80%; the stale `[Owner] [cancellation]` 75% entry should be updated upstream by KB ownership.

## Top 10 most important findings (ranked by stakes × frequency)

| # | Finding | Affects | Severity |
|---:|---|---|---|
| 1 | **NT Protect $500 deductible and $25,000 cap are entirely missing** from Modules 6 and 10. The two most-asked NT Protect numbers; CSRs cert without ever seeing them. | M6, M10, exam | Critical |
| 2 | **Tire damage taught as flat exclusion**; KB says it's conditional on tire age (3+ years = owner responsible) and cause. Wrong in TB, M1, M6, M10, and at least 3 exam questions. | TB, M1, M6, M10, M11 | Critical |
| 3 | **Module 6 (HIGH STAKES per its own description) is missing the two-path claim distinction**: under-$500 = DDC at end of rental; over-$500 = DDC then NT Protect claim form. Currently presented as one fuzzy "owner files a claim" flow. | M6 | Critical |
| 4 | **Damage Deposit Deduction Claim must be filed at end of rental — no retroactive path.** Highest-frequency owner-side mistake. Not mentioned in M4 or M6. | M4, M6 | Critical |
| 5 | **24-hour renter dispute window** after a DDC is filed (auto-approves at 24h). Largest urgency lever in dispute calls. Not in any module. | M6, M10 | Critical |
| 6 | **20% platform commission** is missing entirely from Module 5. "Why is my payout less than the rental?" is a top owner question; module can't answer it. | M5, exam | Critical |
| 7 | **Listing approval timing wrong**: lesson and exam say 24-48 hours; KB says 1-2 business hours typically (with expedite path). | M4, exam | Critical |
| 8 | **Deposit refund timing wrong**: 3-7 days taught everywhere; KB says **4-7 business days**. Wrong in M5, M9 quiz, M10 fact 7, `critical-facts.json` fact-7, and exam Q24/Q44. The most-propagated wrong number in the curriculum. | M5, M9, M10, critical-facts.json, exam | Critical |
| 9 | **Minimum age to rent = 25** is missing from Module 2 entirely. Hard cutoff; comes up regularly. | M2, M10, exam | Critical |
| 10 | **Multi-simultaneous-booking warning** — the only `[Policy]`-tagged booking entry in the KB. CSRs not trained on it could naïvely suggest the "back-up booking" workaround that double-charges renters. | M1, exam | Critical |

## Cross-cutting themes

**A. Numbers consistently off by small amounts.** "3-7 vs 4-7" for deposits. "24-48 vs 1-2 hours" for listing approval. The lesson author likely worked from intuition or an older spec; the master KB says different. These are easy fixes but they're embedded in spaced-repetition / cert-exam canon, so they propagate.

**B. NT Protect mechanics under-specified everywhere.** TB, M1, M6, and M10 all touch NT Protect; none of them carry the two key numbers ($500 / $25k) or the two-path claim flow. Module 6 is the worst offender given its own "HIGH STAKES" framing.

**C. Tire damage simplified into a flat exclusion across the curriculum.** This is the single most-replicated factual error: appears verbatim or near-verbatim in TB, M1, M6, M10 fact 8, `critical-facts.json` fact-8, and 3 exam questions (Q26, Q30, Q56). One root rewrite, six downstream edits.

**D. Lesson treats CSR-can't-do-X rules as absolute.** "CSR cannot cancel for renter," "CSR cannot override anything." KB shows that support DOES have specific edge-case authority (cancel an unresponsive-owner booking; cancel after a second date-change; etc.). Trainees learn to refuse customers in cases where they should be escalating instead.

**E. Owner-side high-frequency topics under-covered.**
- DDC-at-end-of-rental (M4, M6)
- VIN-already-exists error workflow (M4)
- 12-hour booking-response deactivation rule (M2)
- 20% platform commission math (M5)
- Owner cancellation types (with-cause vs without-cause) (M4, M7)

These are five of the top-10 owner support topics and three of them get zero lesson coverage.

**F. The exam pool propagates the same errors as the modules.** The cert exam isn't an independent check — its answers are derived from the same lesson content. So the "study to pass the exam" feedback loop is a wrong-answer reinforcement loop until both are fixed in lockstep.

## Recommended priority order for fixes

| Priority | Module | Why first | Estimated effort |
|---|---|---|---|
| **1** | **Module 6** (Damage & Disputes) | Self-described "HIGH STAKES"; missing the most CSR-critical numbers; #1 source of customer complaints | 90-120 min |
| **2** | **Module 10** (Critical Policy / 12 Facts) + `critical-facts.json` | Spaced-repetition canon; gating the cert exam; carries the propagated errors | 60 min + sync |
| **3** | **`exam-questions.json`** | Six wrong correct-answers in current pool; integrity of the cert | 60 min |
| **4** | **Module 5** (Payments, Fees & Payouts) | Missing 20% commission; wrong deposit days; hits high-volume call categories | 60-90 min |
| **5** | **Module 4** (Booking — Owner Side) | Listing approval timing wrong (also in exam); missing DDC-at-end-of-rental rule | 60-90 min |
| **6** | **Module 7** (Extensions, Cancellations) | Missing full-day-only early returns; missing 10-day refund processing; NT Protect extension cliff | 45 min |
| **7** | **Module 2** (Account & Verification) | Missing age 25, third-party driver rule, account-inactive expanded triage | 45 min |
| **8** | **Module 1** (Platform Foundations) | NT Protect numbers, multi-booking policy, auth-vs-charge | 30 min |
| **9** | **Module 3** (Booking — Renter Side) | "No shortening", "one date-change", early-return mechanics | 45 min |
| **10** | **Trailer Basics** | Tire conditional, CDL phrasing | 20 min |
| **11** | **Module 9** (De-escalation) | Abuse-vs-anger, chargeback escalation | 25 min |
| **12** | **Module 8** (Phone Skills) | Channel framing, documentation habit | 20 min |

**Total estimated edit time: ~10-12 hours of focused work** if applied in one large patch. Could be split into 2-3 smaller patches by priority tier (1-3 first, 4-6 second, 7-12 third).

## Modules that came out clean / minor changes only

None of the modules came out with **zero** findings — every module has at least 2 substantive issues. The lightest-touch modules are:

- **Module 8 (Phone Skills)** — soft-skills, mostly correct, 1-2 KB-driven additions.
- **Module 9 (De-escalation)** — soft-skills, mostly correct, 1 number fix + 2 additions.
- **Trailer Basics** — primer module, 2 fixes (tire conditional + CDL phrasing) and 1-2 additions.

These are **light** updates (~20-25 minutes each) and could be batched together.

## Approximate scope if proceeding with everything

**Large patch.** Realistically this is two or three sequential edit patches:

- **Patch A — Critical fact corrections** (Modules 6, 10, critical-facts.json, exam-questions.json): 4-5 hours. After this patch, the cert exam stops actively miscertifying CSRs.
- **Patch B — Owner-side gaps** (Modules 4, 5, 2): 3 hours. After this patch, the most-asked owner support questions have lesson coverage.
- **Patch C — Light cleanup** (Modules 1, 3, 7, TB, 8, 9): 2-3 hours. After this patch, the curriculum's edge cases and minor numbers are consistent with KB.

**Total: 10-12 hours of focused edit work.** Could be done in a long single session or split as above.

## Methodology notes

- Cross-referenced module content (sections + scenarios + quiz) against KB entries by topic for each module.
- Quoted KB entries by their `[Audience] [Category] Q: title` for traceability.
- Did not reproduce large KB content blocks verbatim (per audit constraints).
- KB-internal inconsistencies flagged separately so they can be fixed at the source rather than being papered over in the curriculum.
- Findings biased toward specifics; vague observations like "could use more depth" were excluded.
