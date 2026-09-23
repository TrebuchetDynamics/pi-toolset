<p align="center">
  <img src="https://raw.githubusercontent.com/TrebuchetDynamics/pi-toolset/main/assets/readme/hero.svg" width="100%" alt="pi-toolset keeps coding objectives visible, routes work to specialist skills, and requires evidence before delivery">
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#choose-a-workflow">Choose a workflow</a> ·
  <a href="#what-ships">What ships</a> ·
  <a href="#development">Development</a>
</p>

`pi-toolset` is a curated [Pi](https://pi.dev) package for disciplined agent work. Superpowers leads engineering work; eight local specialist skills add UI, research guidance, audits, documentation, handoffs, shipping, and Pi expertise. Optional resources remain packaged but are excluded from default discovery.

## Quick start

Package-only installation requires Pi; the all-in-one setup below installs it. The bundled OmniRoute installer requires a version supported by OmniRoute: Node.js `22.22.2`, `24`, `25`, or `26`. When that Node version is missing or too old on Linux, the universal installer downloads it into `~/.local/share/pi-node/current` (the location Pi's own installer uses) and puts it on `PATH`; other platforms need Node installed manually.

### All-in-one setup

On a new Ubuntu PC, install globally without keeping a checkout:

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl
curl -fsSL https://raw.githubusercontent.com/TrebuchetDynamics/pi-toolset/main/install.sh -o /tmp/pi-toolset-install.sh
sh /tmp/pi-toolset-install.sh && rm -f /tmp/pi-toolset-install.sh
```

The downloaded script fetches and unpacks the complete repository before executing it, installs missing Ubuntu prerequisites, and installs Pi resources in the default global user scope.

Alternatively, run the universal installer from a checkout:

```bash
git clone https://github.com/TrebuchetDynamics/pi-toolset.git
cd pi-toolset
sh install.sh --dry-run
sh install.sh
```

The default installs Pi, this package, tmux with `tx`, the MCP adapter, and the Superpowers-led skill profile for Pi, Codex and Claude. The existing OmniRoute component still installs its daemon and configures Pi's provider unless skipped with `PI_TOOLSET_SKIP=omniroute`; skill-only migration does not change providers. Understand-Anything and RTK are opt-in through the terminal checklist or `PI_TOOLSET_ENABLE=understand,rtk` (`RTK_VERSION` pins RTK when enabled).

Superpowers **6.4.1**, revision `5bf4e78011075bcfc0dc295f0724994cd123ee71`, is fetched from [obra/superpowers](https://github.com/obra/superpowers) into `~/.local/share/pi-toolset/superpowers/<revision>`. No upstream installer or npm lifecycle script runs. Its native Pi package supplies the bootstrap; its 15 skills are symlinked into global skill directories from that same unmodified checkout. Pi deduplicates the real file paths. The eight local specialists are `frontend-design`, `redesign-existing-projects`, `modern-web-guidance`, `technical-auditor`, `wiki-docs`, `handoff`, `git-commit-push`, and `pi-extensions-helper`. They are copied with their shared references. `/skill:lgtm` remains available as a manual-only compatibility command, so existing sessions and explicit approvals do not reference a deleted file. It does not lead or automatically select a workflow. The MCP adapter also provides a manual-only help skill; it is not part of automatic skill selection.

The skill installer archives known optional/retired global copies outside discovery roots and preserves unrelated user skills. For previously installed commands, it leaves a small manual-only compatibility file at the old path so open sessions do not fail with ENOENT. Optional commands point to their preserved instructions; retired workflows point back to the Superpowers-led baseline. Fresh installs do not get these legacy command files. Modified replacements are backed up by default. Backups live under `~/.local/state/pi-toolset/skill-backups/`; do not move them underneath a skill root. Inspect host-native plugins separately: an old Superpowers or Ponytail plugin can still inject a competing workflow. When a native Superpowers Claude plugin is enabled, the skill installer archives duplicate loose Superpowers skills and leaves the plugin in charge. It does not rewrite plugin settings.

Use `PI_TOOLSET_SKIP=pi,package,tmux,understand,rtk,skills,omniroute,catalog` to skip components by id. `PI_TOOLSET_SKIP_OMNIROUTE=1` is also supported. Downloaded installers finish downloading before execution. Package-only installation loads only the eight specialists and two package extensions; install Superpowers separately as shown below.

### Selected catalog extensions

`install.sh` installs only the MCP adapter by default. The remaining entries are optional, individually installed catalog tools. They are separate Pi packages, not bundled source or runtime dependencies of `pi-toolset`. Package-only installation does not install them.

| Package                                                                                                                 | Pinned version | Why it fits this toolset                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter)                                                          | `2.33.0`       | Connects MCP tools such as Context7 and codebase-memory through on-demand discovery. Run `/mcp setup` to import host-specific configuration. |
| [@juicesharp/rpiv-ask-user-question](https://github.com/juicesharp/rpiv-mono/tree/main/packages/rpiv-ask-user-question) | `2.10.0`       | Adds structured choices for decisions that need your input; available in interactive and supported RPC hosts.                                |
| [@juicesharp/rpiv-todo](https://github.com/juicesharp/rpiv-mono/tree/main/packages/rpiv-todo)                           | `2.10.0`       | Keeps a visible task list across reloads and compaction; `/todos` shows the list alongside the existing `/goal` workflow.                    |
| [@narumitw/pi-btw](https://github.com/narumiruna/pi-extensions/tree/main/packages/pi-btw)                               | `0.58.1`       | Adds `/btw <question>` for a temporary side conversation, keeping the main task focused until you choose to bring an answer back.            |
| [@narumitw/pi-usage](https://github.com/narumiruna/pi-extensions/tree/main/packages/pi-usage)                           | `0.60.8`       | Adds `/usage` for supported-provider quotas and balances, useful when switching accounts or models.                                          |

Deselect **MCP adapter** in the checklist or use `PI_TOOLSET_SKIP=catalog` to omit it. To install only this selection with Pi already available:

```sh
PI_TOOLSET_SKIP=pi,package,tmux,understand,rtk,skills,omniroute sh install.sh
```

Restart Pi after installation. Re-running the installer reapplies these exact package versions; update the pins deliberately when adopting a new release. These pins select the top-level packages; upstream ranged transitive dependencies can still change. The installer does not create MCP server configuration. The adapter discovers standard MCP files automatically and connects to enabled discovered servers on first startup to build its metadata cache; host-specific imports use `/mcp setup`. Questions and todos need no API keys or additional services.

`/btw` requires interactive TUI mode and uses the current model by default; invoking it makes model requests using that provider's allowance. Side threads are kept in memory and discarded on reload or session replacement. `/usage` requires Pi 0.81.0 or newer and supported provider credentials; it is not an aggregate OmniRoute usage dashboard. It also adds `/fast` for supported Codex models, off by default. For supported official Codex requests it owns the service tier: `default` when Fast is off and `priority` when on, so avoid combining it with another service-tier controller. Custom/proxy origins are left unchanged. The installer does not enable Fast mode or redeem account resets.

`pi-canvas@0.1.1` was considered for visual previews but excluded: its published server exposes artifact contents through a wildcard-CORS event stream, and HTML previews lack iframe sandboxing. Revisit after upstream fixes those boundaries.

The default extension capabilities are the native Superpowers bootstrap, `pi-subagents`, Search Hub, and the MCP adapter. Goal and poshify are optional; Ponytail is retired from the default workflow. Additional memory services, context proxies, and workflow engines are left out to keep the default setup focused.

To install only the Pi package when Pi already exists:

```bash
pi install git:github.com/obra/superpowers@5bf4e78011075bcfc0dc295f0724994cd123ee71
pi install git:github.com/TrebuchetDynamics/pi-toolset
```

Reload an open Pi session and use the normal task prompt. Check `/skill:using-superpowers` and `/skill:systematic-debugging` after installation. Goal and Ponytail commands are not part of the default setup.

Install for only the current project/team repository with `-l`:

```bash
pi install -l git:github.com/TrebuchetDynamics/pi-toolset
```

## The operating loop

<p align="center">
  <img src="https://raw.githubusercontent.com/TrebuchetDynamics/pi-toolset/main/assets/readme/workflow.svg" width="100%" alt="Set an objective, understand the codebase, route to one specialist, execute a bounded change, then verify and ship">
</p>

Superpowers owns planning, debugging, TDD, execution, review, and completion. The user and project rules remain higher priority. Local specialists supply domain knowledge inside that workflow; `git-commit-push` performs shipping only when explicitly requested. No second general-purpose router or always-on Ponytail mode leads the session.

## Choose a workflow

Default engineering entry points are Superpowers `brainstorming`, `systematic-debugging`, and `test-driven-development`. The additional commands below require their optional skill profile and/or extension.

| You want to…                             | Start here                                  | Success signal                                  |
| ---------------------------------------- | ------------------------------------------- | ----------------------------------------------- |
| Keep a long task on course               | `/goal <objective>`                         | Objective completed with evidence               |
| Find useful repository work              | `autonomous-codebase-improver` (opt-in)     | Continuous reviewed slices within approved scope |
| Diagnose a concrete failure              | `systematic-debugging`                     | Repro fails before and passes after             |
| Build behavior test-first                | `test-driven-development`                  | Red → green → refactor                          |
| Understand architecture                  | `/understand`                               | Knowledge graph + agent-readable map            |
| Plan a graph-backed refactor             | `/understand-refactor <focus>`              | Bounded plan grounded in live files             |
| Split one noisy folder                   | `/folder-refactor <folder>`                 | Every remaining root file classified            |
| Audit repository health                  | `technical-auditor`                         | Evidence-backed findings and priorities         |
| Improve a webpage with curated resources | `ui-vault`                                  | Scored diagnosis + 3–5 traced proposals         |
| Build or redesign UI                     | `ui-design`                                 | Correct specialist + visual/validation evidence |
| Research with provenance                 | `research-forge` or `/search-hub <request>` | Source-backed findings                          |
| Ship local work                          | `git-commit-push`                           | Validated commit and push receipts              |
| Simplify implementation                  | Shared YAGNI guidance                       | Smallest complete change with verification      |
| Create a shareable diagram               | `diagram-design`                           | Accessible, standalone HTML/SVG                 |
| Inspect a skill before adoption          | `pi-ecosystem-scout`                        | Pinned source, reviewed files, explicit decision |

Skills load on demand. Invoke them naturally or use `/skill:<name>` when skill commands are enabled:

```text
/skill:systematic-debugging debug the failing parser test
/skill:ui-vault improve src/routes/pricing.tsx
/skill:git-commit-push ship the validated changes
```

## What ships

| Surface                     | Included | Purpose                                                                                              |
| --------------------------- | -------: | ---------------------------------------------------------------------------------------------------- |
| Agent skills                |   **8 automatic + 1 manual / 65 stored** | Local specialists plus optional and retired reference sources                       |
| Pi extensions               |   **2 default / 15 stored** | Search Hub and subagents; other extensions are opt-in                            |
| Theme                       |    **1** | `trebuchet-neon`, a complete dark Pi token map                                                       |
| Package bins                |    **2** | `tx` and `autofolderrefactor`                                                                        |
| Direct runtime dependencies |    **3** | Bundled `@narumitw/pi-goal`, `pi-posher`, and `pi-subagents`; Pi core packages remain optional peers |

### Optional extension surfaces

Only Search Hub and subagents load from this package by default. To try another extension for one session, use `pi -e /absolute/path/to/pi-toolset/extensions/<name>/index.js`. Command bridges also need their corresponding optional skills. Retired Ponytail sources are retained for reference, not recommended for activation.

### Extension reference

| Surface                   | What it adds                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `/goal`                   | Autonomous session goals with budgets, safety limits, strict completion/blocker tools, and optional ordered queues |
| `/goal-technical-auditor` | Autonomous audit → validated slices → re-audit controller                                                          |
| `/bug-harvest`            | Session-local continuous bug hunt with anti-repetition and clean-context handoffs                                  |
| `/verify-isolated`        | Explicit fresh-session, read-only verification against a named contract                                            |
| `/understand`             | Understand-Anything graph, map, compare, explain, onboard, domain, and refactor flows                              |
| `/folder-refactor`        | Deterministic folder scan, state, and completion audit tools                                                       |
| `/rtk`                    | Optional command rewriting and output compaction through an installed RTK binary                                   |
| `/ponytail`               | Session-level YAGNI and shortest-safe-diff modes                                                                   |
| `/search-hub`             | Keyless web search and public-page reading through `web_search` and `web_read`                                     |
| `/typesafe`               | Typed System One decisions (choice/score/noul) with probabilities and confidence through the `typesafe` tool       |
| `/onklaud`                | Advisory Onklaud council while Pi retains mutation ownership                                                       |
| `/s3upload`               | Upload to private Azure storage with an expiring is.gd link and TinyURL fallback                                   |
| `/poshify`                | Run configured formatters, linters, fixes, and audits after edits or on demand                                     |
| `subagent` / `/subagents` | Delegate focused work to foreground or background child Pi sessions                                                |
| Mobile low-redraw         | Hides the repainting work timer inside SSH + tmux sessions                                                         |

Search Hub needs no binary or API key: `web_search` queries every available source in parallel—keyless DuckDuckGo plus Brave and SearXNG when configured—then merges and deduplicates results; `web_read` uses Jina Reader. Enable additional sources with `BRAVE_API_KEY` or `SEARCH_HUB_SEARXNG_URL`; `JINA_API_KEY` raises reader limits. Results are capped at 20KB or 500 lines, with full page output saved to a temporary file when truncated.

TypeSafe needs a `TYPESAFE_API_KEY`: the `typesafe` tool posts a state and a map of choice/score/noul questions to `https://api.typesafe.ai/v1/systemone` and returns typed answers with probabilities and confidence. It validates questions locally, retries documented `429`/`529` responses with backoff, and reuses Search Hub's 20KB/500-line output bound.

<details>
<summary><strong>Goal controls</strong></summary>

```text
/goal <objective>
/goal --tokens 50k <objective>
/goal status
/goal edit [--tokens 100k] <objective>
/goal pause
/goal resume
/goal clear

# With experimental ordered goals enabled:
/goal add <objective>
/goal prioritize <objective>
/goal drop-last
/goal skip
```

`/goal-technical-auditor [--tokens 700k] [--dry-run] [--focus bug-hunt-refactor] [folder|prompt]` runs technical-auditor in Full mode, records findings in `docs/audits/`, validates one slice at a time, and re-audits before delivery. Use `status`, `resume`, or `abort` to control it.

</details>

<details>
<summary><strong>Bug harvest controls</strong></summary>

```text
/bug-harvest [scope]
/bug-harvest status
/bug-harvest pause
/bug-harvest resume
/bug-harvest handoff
/bug-harvest stop
```

The controller queues another evidence-backed bug pass whenever the agent settles, rotates recovery instructions when work repeats, and pauses after five stuck turns. At 80% context use it hands the run to a clean session. It has no fixed iteration limit while active; reloads, restarts, and failed turns pause it to prevent silent spend.

`/verify-isolated <contract>` starts a separate read-only Pi process with no extensions, skills, prompts, context files, or mutation tools. It can use multiple provider requests, so it runs only on an explicit command.

</details>

<details>
<summary><strong>Understand commands</strong></summary>

```text
/understand
/understand src/frontend --language zh
/understand dashboard
/understand chat How does auth work?
/understand diff
/understand agent
/understand compare ../project-a ../project-b
/understand refactor "auth flow"
/understand explain src/auth/login.ts
/understand onboard
/understand domain
/understand knowledge ~/path/to/wiki
/understand update
```

Direct aliases include `/understand-dashboard`, `/understand-chat`, `/understand-diff`, `/understand-explain`, `/understand-onboard`, `/understand-domain`, `/understand-knowledge`, `/understand-figma`, `/understand-agent`, `/understand-compare`, and `/understand-refactor`.

Generated `.ua/` data (or legacy `.understand-anything/`) and `codebase-map-understand.md` are orientation aids, not package resources or automatic source-of-truth replacements.

</details>

<details>
<summary><strong>Complete skill inventory</strong></summary>

**Communication (7)**

`ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review`, `writing-shape`

**Delivery (4)**

`autoreview`, `git-commit-push`, `greploop`, `s3upload`

**Engineering (15)**

`autonomous-codebase-improver`, `bug-harvest`, `candidates-folder-refactor`, `diagnose`, `improve-codebase-architecture`, `prompt-cache-auditor`, `prototype`, `share-code`, `skill-folder-refactor`, `tdd`, `technical-auditor`, `unused-code`, `wayfinder`, `wayfinder-next`, `wiki-docs`

**Frontend and design (23)**

`beautify-github-readme`, `brandkit`, `chrome-extensions`, `design-taste-frontend`, `design-taste-frontend-v1`, `diagram-design`, `frontend-design`, `full-output-enforcement`, `gpt-taste`, `hallmark`, `high-end-visual-design`, `imagegen-frontend-mobile`, `imagegen-frontend-web`, `image-to-code`, `industrial-brutalist-ui`, `minimalist-ui`, `modern-web-guidance`, `redesign-existing-projects`, `stitch-design-taste`, `stitch-react-components`, `ui-design`, `ui-ux-pro-max`, `ui-vault`

**Pi authoring and orchestration (4)**

`pi-ecosystem-scout`, `pi-extensions-helper`, `pi-subagents`, `write-a-skill`

**Planning (11)**

`goal`, `grill-me`, `grill-with-docs`, `handoff`, `lgtm`, `nack`, `skill-router`, `to-issues`, `to-prd`, `triage`, `zoom-out`

**Research (1)**

`research-forge`

</details>

## Skill curation

The source tree retains 65 local skill resources, but only eight automatically selectable specialists and the manual `lgtm` command are in the default manifest: The optional `diagram-design` skill replaces the retired standalone `caveman` style skill. Concise, action-first writing belongs in the shared contract; asking for brevity does not enable a persistent grammar-compression mode. `ponytail-gain` now reports only supported measurements, and `ponytail-help` describes this bundle's integration.

The [diagram skill](skills/frontend/diagram-design/SKILL.md) is a text-only adaptation of [Diagram Design](https://github.com/cathrynlavery/diagram-design), pinned in [third-party notices](THIRD_PARTY_NOTICES.md). It adds no executable helpers or dependencies. Scouting and authoring use a [candidate inspection checklist](skills/pi/pi-ecosystem-scout/references/candidate-inspection.md): review the exact revision and reachable files, check overlap and host compatibility, preserve licensing, and never bypass a dangerous scanner verdict. Stars are discovery signals, not evidence of quality or safety.

Existing engineering, research, and optional Understand workflows remain available. No additional workflow plugin, graph service, broad catalog, or scientific toolchain is needed without a specific task. The opt-in [`autonomous-codebase-improver`](skills/engineering/autonomous-codebase-improver/SKILL.md) treats bare/broad requests as continuous, multi-area campaigns: the parent selects concrete approved work, uses one pi-subagents worker and fresh read-only review per slice, accepts the evidence, then continues. Explicit one-slice, collection/subsystem, audit-only, pause/stop, and budget boundaries still apply; missing required delegation blocks implementation. New designs remain approval-gated, and ownership/recoverable slice baselines protect dirty work. Its [evaluation receipt](skills/engineering/autonomous-codebase-improver/references/evaluation-receipt.md) records decision probes, independent review, and parent-guided two-slice, one-slice, timeout/paused-continuation, rollback/refusal, and regression-repair fixtures. Full behavioral acceptance remains provisional: approval/credential branch continuation, unavailable-role/budget, and other lifecycle/type/race variants remain decision-only or unrun; these samples do not prove autonomous reliability. No measured skill-on/skill-off improvement or global activation is claimed.

Package updates remove Caveman from package discovery. The global-skill installer archives known retired copies, including Caveman, outside active discovery roots. Unrelated user-managed skills are preserved.

## Optional integrations

Installing only the Pi package does not install these external tools. The explicit all-in-one `install.sh` command installs OmniRoute and the focused global skill profile by default; RTK is opt-in; use the commands below for individual setup.

### OmniRoute for Pi

The all-in-one installer runs this by default. For individual setup:

```bash
sh install-omniroute-pi.sh
```

The installer installs or refreshes OmniRoute globally with strict Node engine checks and npm's legacy peer resolver (avoiding upstream React/Marked peer-warning noise), restarts the local daemon so provider/model rotation fixes take effect, binds it to `127.0.0.1`, enables crash recovery and autostart, and selects the keyless `auto/best-free` pool so 401, 429, and 504 failures can fall through to another free model. It preserves existing Pi providers/settings, reuses a working endpoint key or creates one for a local install, writes permission-restricted backups, sets that route as Pi's default, and defaults Pi's retry delay to five seconds so OmniRoute's transient model lockout can clear (an existing retry policy is left unchanged). It also persists capacity for eight structurally heavy Pi chats across restarts; lower `OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT` on memory-constrained hosts. Use `--model ID` to select a different advertised model or route.

For an existing server:

```bash
sh install-omniroute-pi.sh --config-only --base-url https://host.example/v1
```

Remote servers must already expose the requested route. The installer probes both the supplied path and its `/v1` variant, then stores the first working models endpoint.

### RTK

When selected, the all-in-one installer installs or updates [rtk-ai/rtk](https://github.com/rtk-ai/rtk) through its checksum-verifying official installer. Package-only users can install RTK separately, then use `/rtk status`. The extension fails open when RTK is absent or unsupported.

```text
/rtk status
/rtk stats
/rtk clear-stats
```

Set `RTK_DISABLED=1` to bypass rewriting and compaction.

### Onklaud

Use `/onklaud explain` before installation. Pi remains responsible for file changes, tests, commits, and pushes; Onklaud is advisory.

```text
/onklaud status
/onklaud --dry-run fix the failing tests
/onklaud install --yes
```

### Global Codex and Claude skill copies

The all-in-one installer runs this by default. For individual setup:

```bash
sh install-agent-skills.sh
```

This installs 15 upstream Superpowers symlinks plus eight flattened local specialist directories to `~/.agents/skills` and `~/.claude/skills`. It archives known inactive bundle skills and backs up replaced copies under `~/.local/state/pi-toolset/skill-backups/`. `--profile=design` adds a specialist profile; rerunning without it returns managed skills to the core set. Available profiles are defined in [profiles.json](skills/shared/profiles.json): design, research, refactor, automation, authoring, delivery, planning, and writing. Retired wrappers are excluded from all profiles.

Options: `--codex-only`, `--claude-only`, `--dry-run`, and `--no-backup`. `CODEX_SKILLS_DIR` and `CLAUDE_SKILLS_DIR` support project-local destinations. `SUPERPOWERS_DIR` can select an existing clean checkout at the pinned revision; it is never reset or overwritten. No skill-only install changes Pi providers or other hosts' plugin settings.

## Theme and shell helpers

### `trebuchet-neon`

Select the bundled theme in `/settings` or set:

```json
{ "theme": "trebuchet-neon" }
```

Its dark navy, green, cyan, magenta, and amber palette is also the source for this README's visual system.

### `tx`

Install the phone-friendly tmux profile from a checkout:

```bash
npm run tmux:install
```

Then use `tx init`, `tx add <alias> [dir]`, and `tx doctor`. See [`tmux/README.md`](tmux/README.md).

### `autofolderrefactor`

This niche autonomous refactoring loop remains opt-in:

```bash
sh install-autofolderrefactor.sh
autofolderrefactor ignore [folder]
autofolderrefactor N [folder]
```

The loop ranks bounded folder candidates, preserves dirty work, runs guarded refactor workflows, validates slices, and cools down landed candidates.

## Safety model

- Package extensions and skills run with your local permissions; review source before installation.
- `pi-posher` is bundled, but its formatter/linter/audit executables remain external and user-configurable; review its seeded global config before relying on automatic post-edit checks.
- `pi-subagents` can spawn child Pi processes with configured tools; mutation-capable agents have the same local permissions as the parent process.
- Delivery workflows do not deploy, release, force-push, rebase, or rewrite history without explicit authorization.
- Graphs, councils, catalogs, and reviewer output are evidence inputs—not authority.
- Advisors and reviewers use the [clean-context delegation contract](skills/shared/CLEAN-CONTEXT-DELEGATION.md) when the host supports isolated workers.
- Third-party source, local changes, and license copies are recorded in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
- Generated `.pi/`, `.ua/`, and `.understand-anything/` state is excluded from the package tarball.

## Package shape

```text
extensions/  Pi commands, tools, hooks, and bridges
skills/      Discoverable Agent Skills and bundled references
themes/      Pi TUI themes
tmux/        tx launcher and low-bandwidth tmux profile
licenses/    Preserved third-party license copies
tests/       Manifest, extension, asset, helper, and workflow checks
```

Pi discovers resources through `pi.extensions`, `pi.skills`, and `pi.themes` in `package.json`:

```json
{
  "pi": {
    "extensions": ["./extensions/search-hub", "./extensions/pi-subagents"],
    "skills": ["./skills/delivery/git-commit-push", "./skills/engineering/technical-auditor", "./skills/engineering/wiki-docs", "./skills/frontend/frontend-design", "./skills/frontend/modern-web-guidance", "./skills/frontend/redesign-existing-projects", "./skills/pi/pi-extensions-helper", "./skills/planning/handoff", "./skills/planning/lgtm"],
    "themes": ["./themes"]
  }
}
```

Pi core imports remain optional peer dependencies. `@narumitw/pi-goal`, `pi-posher`, and `pi-subagents` are pinned and bundled runtime dependencies. Review `~/.pi/agent/extensions/pi-posher/poshifiers.json` because its user-owned defaults can run external formatting, linting, and audit commands after edits; configure autonomous goals, subagent tools, and models with the same care.

The root `.npmrc` intentionally disables npm's automatic peer installation for git-package checkouts. Pi already provides those host packages; installing duplicate copies adds unnecessary dependencies and can introduce unrelated audit findings.

## Update or remove

```bash
pi update git:github.com/TrebuchetDynamics/pi-toolset
pi remove git:github.com/TrebuchetDynamics/pi-toolset
```

Run `/reload` after either command in an open session.

## Development

Read [`AGENTS.md`](AGENTS.md), then validate changes with:

```bash
npm test
npm run test:behavioral
git diff --check
npm pack --dry-run
```

Audit the nested Stitch tool separately when it changes:

```bash
npm --prefix skills/frontend/stitch-react-components audit --omit=dev --audit-level=moderate
```

## License and provenance

Package-local code and documentation are MIT-licensed. Bundled third-party resources retain their own terms; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`licenses/`](licenses/).
