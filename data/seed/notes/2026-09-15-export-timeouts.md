---
id: note-2026-09-15-export-timeouts
title: Export jobs are timing out on Vercel
date: "2026-09-15"
author: marco
projects: [rill, atlas]
decisions:
  - id: dec-fly
    text: "Move app hosting from Vercel to Fly.io."
    reason: "Two export jobs crossed the 300 second function limit and failed; Fly runs the worker and the app in the same region without a duration ceiling."
    supersedes: dec-vercel
---

Two export jobs failed last week at 300 seconds, which is the Vercel function limit. The first was a 90-day event export for a design partner, the second was the invoice reconciliation for Atlas. Both retried, both failed again, and the customer saw a generic error.

The fix is not a bigger timeout. The export is a long-running job and it belongs in a worker. We considered keeping the app on Vercel and moving only the worker to Fly, but that leaves two deploy pipelines, two sets of secrets, and a network hop between them. Fly can run the app and the worker in the same region, with a persistent process and no duration ceiling.

Decision: move app hosting to Fly.io, keep Vercel for the marketing site, and run the export worker as a separate process in the same Fly app. Marco will do the migration behind a DNS switch, with both hosts live for a week. The egress bill is the number to watch; the current Vercel egress is already $220 a month.
