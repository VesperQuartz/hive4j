---
id: note-2026-07-01-api-refactor
title: API refactor — oRPC inside, REST outside
date: "2026-07-01"
author: lena
projects: [rill]
decisions:
  - id: dec-orpc
    text: "Use oRPC for internal APIs and keep REST for the public API."
    reason: "The console and the server drifted on three endpoints last month; oRPC gives end-to-end types without giving up the OpenAPI surface partners use."
    supersedes: dec-rest
---

The REST spec is still the right contract for partners, but it is a poor fit for the console. Every internal endpoint needs a hand-written client type, and last month three of them drifted from the server without a test failing. We felt it in the dashboard filters.

We compared tRPC, oRPC, and staying with REST plus generated clients. tRPC is mature, but its contract is not OpenAPI, so we would maintain two schemas. oRPC keeps one router definition and emits both a typed client and an OpenAPI document. That means the public API can stay REST while the console calls the same procedures directly.

Decision: move internal APIs to oRPC, keep `/v1` REST for partners, and generate the OpenAPI document from the router. The migration is incremental: new console screens use oRPC, old endpoints keep working until the screen is touched. Marco will own the router, and the public spec must not change shape during the migration.
