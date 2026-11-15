---
id: note-2026-05-20-auth-migration
title: Auth migration plan — parallel run, then cutover
date: "2026-05-20"
author: priya
projects: [rill]
---

Migration plan for the move from Auth0 to Okta. The goal is no forced password reset and no support spike during the design partner launch.

Week one: create the Okta tenant, configure the same email and Google connections, and mirror the Auth0 rules. Week two: run both providers behind a flag. New sign-ups go to Okta, existing sessions stay on Auth0, and the user record keeps a provider column. Week three: invite the design partners to link their account, watch the error rate for a day, then flip the default.

The risky part is not the login, it is the session handoff. We use a signed cookie with the user id, not the provider id, so a user who links both providers keeps the same workspace. Marco will add the provider column to the user table before the flag goes live.

Northwind's IdP is the first real SAML test. If their metadata does not validate in the Okta test tenant by June 5, we push the cutover and tell Sam before the Friday update.
