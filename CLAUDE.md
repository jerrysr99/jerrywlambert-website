# jerrywlambert.com

Personal website hosted on GitHub Pages. Repo: `jerrysr99/jerrywlambert-website`.
Deploy: edit locally, `git push origin main`, auto-deploys in 2-3 min.

## Sync: Foundation Models from ai-proxy Registry

The **Foundation Models** card in the AI Toolkit section and the **AI Model Router** card in the AI Systems section must always reflect the live catalog from `~/projects/ai-proxy/api/src/ai_models/catalog.py` (the former standalone ai-models repo is archived; its control plane now lives in the ai-proxy monorepo's `api/` subtree, package still named `ai_models`). When updating this site:

1. Read `catalog.py` → extract non-deprecated models grouped by provider
2. Update the Foundation Models `<ul>` with flagship models per provider
3. Update the AI Systems Router card metrics (model count, provider count) to match

Never hardcode model names from memory — always pull from the registry.
