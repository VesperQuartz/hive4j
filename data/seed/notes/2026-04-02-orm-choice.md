---
id: note-2026-04-02-orm-choice
title: Drizzle versus Prisma, one month in
date: "2026-04-02"
author: lena
projects: [rill]
---

A month of building on Drizzle, and the decision from the infrastructure review is holding. The queries read like SQL because they are SQL with types, and the migration diff is small enough that Marco and I can review each other's schema changes without a call.

The one place Prisma would have been easier is relation loading. Drizzle's relational queries are good, but we still hand-write joins for the event rollups. That is acceptable because those queries are the product; hiding them behind an ORM would make the slow ones harder to find.

Bundle size also mattered. The console ships the schema types, not a query engine, and the client bundle stayed under the budget Aisha set for the first screen. No reason to reopen this before the design partner launch.
