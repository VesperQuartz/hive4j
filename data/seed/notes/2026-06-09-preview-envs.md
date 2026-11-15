---
id: note-2026-06-09-preview-envs
title: Preview environments need a database branch
date: "2026-06-09"
author: marco
projects: [rill, beacon]
decisions:
  - id: dec-neon
    text: "Move Postgres to Neon for branching preview environments."
    reason: "A snapshot restore on RDS took 25 minutes; a Neon branch is ready in seconds, so every pull request can have a real database."
    supersedes: dec-rds
---

The preview deployments from Vercel are only half useful. The app boots, but it points at the staging database, so two pull requests that change the schema step on each other. Lena's migration review last week tested against data that another branch had already rewritten.

We looked at three options: a shared staging database with a reset script, a schema-per-branch on RDS, or Neon. The shared database is what we have, and it failed. Schema-per-branch works but the RDS snapshot restore we tested took 25 minutes, which is longer than the review cycle. Neon creates a copy-on-write branch in seconds, and the branch is a real Postgres endpoint.

Decision: move the primary database to Neon and create a branch per pull request. Keep RDS for the warehouse export until we confirm the Neon connection pool handles the batch job. Marco will migrate the schema with Drizzle, run both databases in parallel for a week, and then retire RDS. The cost is close enough that the review speed decides it.
