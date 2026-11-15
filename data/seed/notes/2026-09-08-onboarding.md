---
id: note-2026-09-08-onboarding
title: Onboarding — replace the tour with a sample project
date: "2026-09-08"
author: aisha
projects: [rill]
decisions:
  - id: dec-sample-project
    text: "Replace the onboarding tour with a seeded sample project."
    reason: "Only 31% of new accounts finished the tour; accounts that opened the sample project reached a first dashboard twice as fast."
---

Onboarding review with Sam and Aisha. The current product tour has six steps and a completion rate of 31%. The drop is not evenly spread: most people leave at step three, which asks them to connect a data source before they have seen anything useful.

We tested a sample project with twelve new accounts. The project arrives seeded with a week of events, two dashboards, and one shared report. Accounts that opened it created their first real dashboard in 4 minutes, against 11 minutes for the tour group. It also gives support a concrete thing to point at.

Decision: replace the tour with the sample project and keep two short tips on the empty state. The project is deletable in one click, and it is clearly marked as sample data. Aisha will design the empty state, Lena will wire the seed, and Sam will measure activation for the next cohort before we remove the tour code entirely.
