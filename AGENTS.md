<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project architecture (NutriBudget prototype)

- Layering: `src/domain/models` (framework-agnostic types), `src/domain/rules` (pure business functions with Vitest tests), `src/services` (async mock services shaped like future REST endpoints), `src/mocks` (seed data), `src/state` (React hooks), `src/components/{ui,common,layout,brand,<module>}`. Why: logic must port to Angular + Spring Boot later.
- No backend: data and the simulated session live in browser storage via services; never call storage from components directly. Why: no managed backend is approved yet.
- Private areas `/app` and `/admin` are layout routes with `ssr: false` and a `beforeLoad` guard reading the simulated session; ADMIN area uses its own nav config. Why: the session exists only in the browser.
- Behaviour that depends on a pending business decision must render a `ProvisionalNote`; demo prices show `EstimatedPriceNote`. Why: pending decisions must not look final.
