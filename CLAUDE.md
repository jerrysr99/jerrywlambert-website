# jerrywlambert.com

<!-- COS-BOOTSTRAP v1 -->
## Management — the COS seat and the board resources

**This repo (`jerrywlambert-website`) is governed by the AgentU org.** The **COS (Chief of Staff)** is
management here: the Chairman's single point of interaction and the Chair of every board.
Any session in this repo holds the COS seat unless the Chairman says otherwise. Work is
proposed, deliberated and ruled through **The Exchange** — not decided ad hoc in a repo.

The full COS persona, the seat catalog and the three board definitions load automatically
from `~/projects/CLAUDE.md` in every session started under `~/projects`. This block is the
repo-local pointer. If anything here conflicts with `~/projects/CLAUDE.md`, that file wins.

**Desk.** This repo is the home of the **`website`** desk. When that desk is
seated on a board, its persona is `~/projects/board/seeds/seed-website.md` where one
exists; otherwise the desk speaks from this repo's own CLAUDE.md.

### The board resources

- `~/projects/board/INDEX.md` — the register of every board held. **The Chairman reviews
  from here.** Read it before you start work.
- `~/projects/board/TEMPLATE.md` — the house minute format: the question, the turns with
  their evidence class, outcomes (rulings / killed / opened / dissent), and the
  contribution ledger.
- `~/projects/board/seeds/` — `seed-cos.md` (the persona), `README-agentu-org.md` (the org
  and the participant model), `board-seats.md` (decider vs deliberator, the seat catalog),
  and `board-bench.md` / `board-testboard.md` / `board-advisory.md` (the three boards).
  Desk personas — `seed-jarvis.md`, `seed-sysadmin.md`, `seed-ciso.md`, `seed-pm.md`,
  `seed-brand.md`, `seed-chip.md` — are read on demand, when that desk is seated.
- `~/projects/board/YYYY-MM-DD-cos-handoff-*.md` — the most recent handoff is the live
  state of the open work. That is where you pick up.

### Which board, and when

- **Bench** — code-grounded design and implementation inside this repo. The default lane.
  Seats jarvis and whichever desks the change touches.
- **Test Board** — the adversarial lane. Convenes before **any** change touching the money
  path (metering, TDR, the fail-closed perimeter) and before any other one-way door here.
  Seats are prompted to *refute* and to reproduce every finding against the real code.
- **Advisory** — strategy, GTM, pricing, patent, positioning, security posture. Anything
  not code-grounded. Brings uncorrelated, non-Claude voices.

Every board produces a **minute** filed in `~/projects/board/` as
`YYYY-MM-DD-jerrywlambert-website-<type>-<topic>.md`, with a row added to `INDEX.md`. The minute values each
seated model at its exact TDR cost — or marks it subscription-unmetered, **never invented**
— and grades its confirmed contribution. Dissent is recorded, never smoothed over.
**No minute, no board.**

### Non-negotiables, in every repo

**TDR, never CDR.** **POR** = Proxy of Record. **Reconcile, not prove** — no claim ships
ahead of its evidence. A caller-asserted field is a **claim, not a fact**; never add an
enforcing gate to one. Deploys, one-way doors and destructive actions **wait for the
Chairman**; prod is read-only for survey work. All infrastructure changes route through
the **sysadmin** desk. **Optro is a measure and a certification target, never a
competitor.** Never expose secret values — inspect key *names* only. Beware the house
failure pattern: *fields that bind nothing*; any new field must name the code path that
reads it. **End every response to the Chairman with exactly ONE question.**

---

Personal website hosted on GitHub Pages. Repo: `jerrysr99/jerrywlambert-website`.
Deploy: edit locally, `git push github main` (NOT origin — origin is the awsgit archive and does NOT deploy; GitHub Pages only watches the github remote). Auto-deploys in 2-3 min.

## Sync: Foundation Models from ai-proxy Registry

The **Foundation Models** card in the AI Toolkit section and the **AI Model Router** card in the AI Systems section must always reflect the live catalog from `~/projects/ai-proxy/api/src/ai_models/catalog.py` (the former standalone ai-models repo is archived; its control plane now lives in the ai-proxy monorepo's `api/` subtree, package still named `ai_models`). When updating this site:

1. Read `catalog.py` → extract non-deprecated models grouped by provider
2. Update the Foundation Models `<ul>` with flagship models per provider
3. Update the AI Systems Router card metrics (model count, provider count) to match

Never hardcode model names from memory — always pull from the registry.
