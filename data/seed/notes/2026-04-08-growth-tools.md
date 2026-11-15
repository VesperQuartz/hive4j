---
id: note-2026-04-08-growth-tools
title: Growth stack — one analytics hub
date: "2026-04-08"
author: tom
projects: [rill]
decisions:
  - id: dec-segment
    text: "Use Segment as the analytics hub."
    reason: "One event pipeline feeds the warehouse, the CRM, and the product analytics tool, so a new destination is a switch instead of a release."
---

Tom and Sam mapped the funnel we need for the design partner cohort: sign-up, first project, first event, first shared dashboard, and weekly return. The event names need to be stable before we instrument anything, because renaming an event after the warehouse has it is a migration.

We picked Segment as the hub. The appeal is the fan-out: one call from the app, and destinations for the warehouse, the CRM, and the email tool. It also gives us a replay window when a destination is misconfigured, which happened twice in the first week.

The cost is real. At the forecast volume the bill lands around $1,850 a month once we leave the free tier. Tom will revisit it after the first paid cohort, when we know which destinations actually get used. For now the priority is clean event names and one source of truth.
