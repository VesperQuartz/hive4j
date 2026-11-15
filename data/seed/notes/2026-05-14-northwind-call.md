---
id: note-2026-05-14-northwind-call
title: Northwind call — SSO is a dealbreaker
date: "2026-05-14"
author: sam
projects: [rill]
decisions:
  - id: dec-okta
    text: "Move from Auth0 to Okta for enterprise SSO."
    reason: "Three enterprise deals require SAML SSO and SCIM provisioning; Auth0 would cost about $2,100 a month at the forecast seat count."
    supersedes: dec-auth0
---

Call with Northwind, one of the three enterprise prospects. Their security review came back with two requirements: SAML SSO against their identity provider, and SCIM provisioning so IT can deactivate an account in one place. The deal does not move without both.

The blocker is commercial as much as technical. Auth0 supports SAML, but the enterprise tier prices per monthly active user, and at the forecast it lands near $2,100 a month before we have the revenue. Okta's starter plan includes SAML and SCIM, and the per-user price is predictable at our size. Priya ran the numbers twice.

Decision: move to Okta for identity, keeping the same session model in the app. The migration is a parallel run rather than a big bang. Sam will tell Northwind we can support their IdP in the next release, and Priya will scope the cutover for the first week of June.
