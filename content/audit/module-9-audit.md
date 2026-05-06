# Audit: De-escalation & When to Escalate (id: module-9, display number 10)

## Current state summary
Two sections: (1) the empathy-without-agreement frame, and (2) the explicit escalate / don't-escalate decision criteria. Tight module; mostly soft-skill craft with two policy-anchored rules (the "don't agree the platform is bad" line and the escalation triggers).

## ACCURATE — leave alone
- Empathy-without-agreement script ("I hear you — that wasn't the experience we want…") — solid CSR craft, consistent with the de-escalation frame in `[Internal]` claim-handling entries.
- Escalation triggers list (legal threats, payout admin failures, final-answer damage disputes, suspensions, no-visibility booking IDs, multi-topic situations) — matches the cross-cutting Internal guidance in the KB.
- Don't-escalate list (standard KB how-to, cancellation refunds, listing approval timing, Toll Program, deposit timing) — correct in spirit; trainees shouldn't escalate routine answers.
- "I want a manager" ≠ auto-escalate — important and correct. KB doesn't contradict.

## ACCURACY ISSUES
**1. m9-q3 quiz answer: "deposit refund timing is 3-7 business days" — wrong number.**
- **Quiz says:** "No — that's a KB answer (3-7 business days)" as the correct answer's explanation.
- **KB says:** `[Renter] [damage-claims] Q: When will I get my security deposit back after returning a trailer?` — **4-7 business days**, not 3-7.
- **Recommended fix:** update the quiz explanation to "4-7 business days." (Same root finding as Module 5 — deposit refund days propagated as 3-7 throughout the curriculum but the KB says 4-7.)
- **Severity:** Critical (in the consistency sense — three modules have the wrong number).

## CRITICAL GAPS — topic missing from lesson
**1. Specific guidance for abusive-language situations.**
- **Topic:** Module covers de-escalation but doesn't address the harder edge case of a customer using profanity or threats specifically.
- **KB coverage:** `[Internal] [damage-claims] Q: How do I handle a renter who uses abusive language about damage charges?` — *"Remain professional and focus on the factual dispute resolution process. Document the abusive communication but proceed with normal claim review procedures. If renter threatens or becomes increasingly abusive, escalate to management for potential account suspension while still processing the legitimate damage claim based on evidence."*
- **Why it matters:** Real call type. The current module has a scenario for "shouting" and "aggressive language" but the rubric is general; no playbook step about documentation or "claim still gets processed on its merits."
- **Suggested addition:** Add to section 9-2 (When to Escalate) a sub-section "Abuse vs. anger": *"There's a line between 'frustrated and venting' and 'profane or threatening.' For ordinary venting, stay calm and work the problem. For sustained profanity/threats: (1) document the language used (verbatim if possible) in the ticket, (2) continue processing the underlying issue on its merits — abusive language doesn't void a legitimate claim, (3) escalate to management for potential account suspension. The customer's behavior and the underlying claim are evaluated separately."*

**2. The "I want a refund / I'm doing a chargeback" threat path.**
- **Topic:** A specific high-frequency escalation trigger — customer threatens to chargeback through their card issuer.
- **KB coverage:** `[Owner] [cancellation] Q: What happens when a renter disputes a charge/does a chargeback?` and `[Owner] [damage-claims] Q: A renter is threatening to dispute charges with their credit card company - what should I do?`
- **Why it matters:** Common escalation trigger that's distinct from "legal action."
- **Suggested addition:** Add to escalation list in section 9-2: *"Chargeback threats — when a renter says they'll dispute the charge with their card company, escalate. Don't try to talk them out of it; the resolution flow runs through NT support working with Stripe and the owner separately."*

**3. The "you've already given the answer 3 times" exit.**
- **Topic:** When a customer keeps re-asking the same question hoping for a different answer.
- **KB coverage:** Not directly, but the consistent thread across `[Internal]` entries is that staff don't make exceptions to standard policies. The implicit move is "don't keep relitigating; close the loop."
- **Why it matters:** Trainees stuck in a loop with a customer demanding a policy override don't have a sanctioned way to end the call.
- **Suggested addition:** A brief paragraph in section 9-1: *"When you've given the answer twice and the customer is asking again hoping for a different one, you don't have to keep re-explaining. State once more clearly: 'I understand this isn't the answer you wanted. The policy is X, and I don't have a way to change that. If you'd like, I can have the team review your specific case for any exception path — that's the next step.' Then either accept the escalation or end the call. Repeating the same explanation a fourth time helps no one."*

## SCENARIO OPPORTUNITIES
**1. Renter using profanity but with a real claim.**
- **Why it would make a good scenario:** Tests the abuse-vs-anger distinction and the "claim still gets processed" rule.
- **Suggested prompt:** *"A renter calls, frustrated about a $250 deposit deduction. They drop several f-bombs but their underlying argument (the damage was pre-existing) is coherent. Walk through it."*
- **Suggested rubric:**
  - Stays professional, doesn't match the language
  - Documents the language for the record
  - Continues processing the claim on its merits (doesn't deflect because of the swearing)
  - Escalates only if the abuse intensifies or threats appear

**2. Customer threatens chargeback.**
- **Suggested prompt:** *"A renter messages: 'I'm going to dispute this charge with my credit card company if I don't get a full refund today.' How do you respond?"*
- **Suggested rubric:**
  - Doesn't try to talk them out of the chargeback
  - Acknowledges the dispute is their right
  - Escalates the situation
  - Explains the dispute will be handled through NT and Stripe separately

## QUIZ QUESTION OPPORTUNITIES
**1. Abuse-vs-anger separation.**
- **Suggested question + correct answer:**
  > A renter is yelling and using profanity about a deposit deduction. What's the right next step?
  > a) Hang up — abusive callers forfeit support
  > b) Refund them to defuse
  > c) **Document the language, continue processing the underlying claim on its merits, escalate to management if the abuse intensifies** (correct)
  > d) Escalate immediately, regardless of the underlying issue

**2. Chargeback threat as an escalation trigger.**
- **Suggested question + correct answer:**
  > A renter says they'll dispute the charge with their bank if not refunded. Should you handle or escalate?
  > a) Handle — refund them
  > b) **Escalate — chargeback threats run through a separate NT/Stripe/owner workflow** (correct)
  > c) Tell them their card company will side with NT
  > d) Ignore the threat

## Overall recommendation
**Light updates.** Soft-skill module that's structurally sound. Small fix for the deposit-day number in m9-q3, plus three additions (abuse vs. anger, chargeback escalation, the "loop exit" technique). ~25 minutes of edits. Otherwise the module is one of the cleaner ones.
