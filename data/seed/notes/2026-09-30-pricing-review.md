---
id: note-2026-09-30-pricing-review
title: Pricing review — keep usage, add a cap
date: "2026-09-30"
author: sam
projects: [rill, atlas]
decisions:
  - id: dec-price-cap
    text: "Keep usage pricing but add a $2,000 monthly cap."
    reason: "Two customers were surprised by a bill above their forecast; a cap keeps the upside but removes the fear of an unbounded invoice."
    supersedes: dec-pricing
---

Two billing cycles into usage pricing, and the model is working. Expansion revenue is up, and the teams that share dashboards are no longer penalized. The problem is the tail: two customers crossed their forecast by more than double because a tracking snippet was left on a high-traffic page.

Both renewals are now at risk, not because of the amount but because the invoice was a surprise. Sam and Tom modeled three fixes: a hard cap, a soft alert with an overage rate, and a prepaid commit. The alert alone does not solve it, because the customer still has to act.

Decision: keep usage pricing and add a $2,000 monthly cap on the self-serve plan, with an alert at 80%. Enterprise contracts can remove the cap. Atlas needs to enforce the cap at billing time, not at the pricing page, so Marco will add it to the meter. The cap applies from the November invoice, and Sam will tell the two affected customers before it ships.
