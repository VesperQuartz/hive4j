---
id: note-2026-08-19-analytics-bill
title: The Segment bill and what we actually use
date: "2026-08-19"
author: tom
projects: [rill, beacon]
decisions:
  - id: dec-posthog
    text: "Replace Segment with PostHog."
    reason: "The Segment bill reached $1,850 a month while only two of seven destinations were used; PostHog covers analytics, replay, and flags for about $450."
    supersedes: dec-segment
---

The Segment invoice for August came in at $1,850. Tom pulled the destination usage and found that only the warehouse and the email tool are actually read every week. The CRM sync has been failing since June and nobody noticed, which is its own signal.

We compared staying, moving to PostHog, and replacing the pipeline with a small queue. A custom queue would take two weeks and we would own the replay story. PostHog covers product analytics, session replay, and feature flags for about $450 a month at our volume, and it can keep the warehouse destination.

Decision: replace Segment with PostHog, one project per environment, and keep the event names unchanged so the warehouse history stays comparable. Tom will run both for two weeks and compare the counts before turning Segment off. The replay is the part Sam cares about: it turns a support ticket into a session link.
