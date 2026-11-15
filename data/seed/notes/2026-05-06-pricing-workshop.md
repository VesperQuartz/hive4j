---
id: note-2026-05-06-pricing-workshop
title: Pricing workshop — usage-based tiers
date: "2026-05-06"
author: sam
projects: [rill, atlas]
decisions:
  - id: dec-pricing
    text: "Price Rill on monthly tracked users with usage tiers."
    reason: "Design partners asked to start small and grow into the product; a seat price punished the teams that share dashboards."
---

Pricing workshop with Sam, Priya, and Tom. We compared seats, flat tiers, and usage. Seats were the simplest to explain, but the design partners keep one shared login per team and rotate who looks at the dashboard, so a seat price punishes the behavior we want.

We chose tracked users with usage tiers. The first tier includes 10,000 tracked users and the price steps at 25,000 and 100,000. Tom modeled the revenue against the design partner cohort and the numbers hold at the forecast, as long as the event volume is billed separately from retention.

Atlas needs a meter that can price tracked users and event volume in the same invoice. Marco will keep the meter independent of the pricing page so a plan change does not require a deploy. We will review the tiers after two billing cycles and look for customers who hit the top of a tier without getting more value.
