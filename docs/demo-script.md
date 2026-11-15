# Demo script — 2 minutes

Record at 1440×900 or larger. Close other tabs. Use a clean store.

## Before recording

```bash
# stop the dev server if it is running
bun run hive:seed
bun dev
```

Open the URL Vite prints, then `/hive`. The page should show 18 notes, 18 decisions, 6 superseded, 0 answers.

Optional: start on the landing page at `/`, read the headline, and click **Open the demo**. It adds about five seconds and shows the positioning before the product.

## Shot list

| Time | On screen                                                                                                                                   | Say                                                                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00 | The empty Hive page                                                                                                                         | "A team keeps its decisions in notes. Six months later, nobody remembers why. A vector store can find the notes that mention Auth0. It cannot tell you why the team left." |
| 0:10 | Click **Why did we move off Auth0?**                                                                                                        | "Hive searches the notes, follows two hops, and answers from the graph."                                                                                                   |
| 0:15 | The answer appears                                                                                                                          | "Okta replaced Auth0 for SAML SSO. Sam made the call. The note that recorded it is right here."                                                                            |
| 0:28 | Point at the receipt, then click the superseded **Use Auth0 for authentication** row                                                        | "The old decision is still in the graph, marked superseded. Nothing was deleted."                                                                                          |
| 0:38 | Click **Why did we switch the database to Neon?**                                                                                           | "Same shape: the current decision is two hops from the note that started it."                                                                                              |
| 0:50 | Click **What did we decide about pricing?**                                                                                                 | "The first pricing decision was superseded by a cap. Hive follows the chain to the current answer."                                                                        |
| 1:02 | Click **Correct this decision**                                                                                                             | "Now the part a vector store cannot do."                                                                                                                                   |
| 1:08 | Change the cap from $2,000 to $2,500, add a reason, click **Save correction**                                                               | "The old decision gets a `validTo` date. The new one gets a `SUPERSEDES` edge. The person, project, and note come with it."                                                |
| 1:20 | The new answer appears                                                                                                                      | "The answer changed, and the old one is still readable."                                                                                                                   |
| 1:30 | Open **Review** in the sidebar                                                                                                              | "Every answer that asserted the old decision is now flagged. This is a reverse traversal from the answer to the decision, not a search."                                   |
| 1:45 | Terminal: `bun run hive:inspect` or `relate -d ./data/seed/hive.rl --read-only --mode table "MATCH (d:Decision) RETURN d.status, count(*)"` | "The store is one file. You can open it with the Relate CLI and see the same graph."                                                                                       |
| 1:55 | Back to the page                                                                                                                            | "Hive: the graph is the context, and the receipt is the proof."                                                                                                            |

## If you have extra time

Show the write side (about 20 seconds):

1. Open **Notes** and choose **New note**.
2. Title: `Northwind pricing call`. Body: `Northwind will sign if the invoice has a predictable ceiling.`
3. Tick **This note records a decision** and fill in:
   - Decision: `Add a $2,500 monthly cap to the design partner plan.`
   - Why: `Northwind needs a predictable ceiling before the next renewal.`
4. Save, then go to **Ask** and ask `What did we agree with Northwind on pricing?`.
5. The new note and decision are in the answer immediately. No reindex step.

## If you have less than two minutes

Cut the Neon question (0:38–0:50). Keep Auth0, the correction, the stale answers, and the CLI.

## After recording

```bash
# stop the dev server, then reset the store for the next run
bun run hive:seed
```

The correction text used in the video:

- **New decision:** `Keep usage pricing with a $2,500 monthly cap.`
- **Why:** `Two renewals were at risk after surprise invoices; a higher cap keeps the upside and removes the worst surprise.`
