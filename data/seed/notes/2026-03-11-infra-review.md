---
id: note-2026-03-11-infra-review
title: Infrastructure review — Postgres and the ORM
date: "2026-03-11"
author: marco
projects: [rill, beacon]
decisions:
  - id: dec-rds
    text: "Run Postgres on RDS in eu-west-1."
    reason: "Managed backups and point-in-time recovery we can explain to a customer without writing a runbook."
  - id: dec-drizzle
    text: "Use Drizzle as the ORM."
    reason: "SQL-shaped queries, generated types, and migrations that stay readable in review."
---

Reviewed the baseline infrastructure before the first design partner lands. The event pipeline (Beacon) and the product share a Postgres cluster for now, with a separate schema per service.

We chose RDS in eu-west-1. The deciding factor was not performance, it was the recovery story. We can point at automated backups, point-in-time restore, and a maintenance window that does not involve anyone waking up. Marco priced the smallest multi-AZ instance and it fits the runway.

Drizzle won the ORM question. We looked at Prisma again, but the generated client and the migration engine add a layer between us and the SQL we actually write. Drizzle lets us keep queries in TypeScript without hiding the query plan, and the migration files are short enough to review in a pull request. Lena will own the schema conventions.
