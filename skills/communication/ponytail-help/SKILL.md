---
name: ponytail-help
description: >
  Show the ponytail command and mode reference card. Use for ponytail help,
  available commands, or /ponytail-help. One-shot display, not a persistent mode.
---

Follow [the shared package contract](../../shared/COMMON-CONTRACT.md); use this skill's output format within the user's requested scope.


# Ponytail Help

Display this reference card when invoked. One-shot, do NOT change mode,
write flag files, or persist anything.

## Levels

| Level | Trigger | What change |
|-------|---------|-------------|
| **Lite** | `/ponytail lite` | Build what's asked, name the lazier alternative in one line. |
| **Full** | `/ponytail` | The ladder enforced: YAGNI → stdlib → native → one line → minimum. Default. |
| **Ultra** | `/ponytail ultra` | YAGNI extremist. Deletion before addition. Challenges requirements before building. |

Level sticks until changed or session end.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **ponytail** | `/ponytail` | Lazy mode itself. Simplest solution that works. |
| **ponytail-review** | `/ponytail-review` | Over-engineering review: `L42: yagni: factory, one product. Inline.` |
| **ponytail-audit** | `/ponytail-audit` | Whole-repo over-engineering audit: ranked list of what to delete. |
| **ponytail-debt** | `/ponytail-debt` | Harvest `ponytail:` shortcut comments into a tracked ledger. |
| **ponytail-gain** | `/ponytail-gain` | Evidence-backed savings report; says when savings are unmeasured. |
| **ponytail-help** | `/ponytail-help` | This card. |

In Pi, use the slash commands above or `/skill:ponytail-help` when skill commands
are enabled. Other hosts use their exposed skill catalog; do not assume Pi's
extension commands exist there.

## Deactivate

Say "stop ponytail" or "normal mode". Resume anytime with `/ponytail`.
`/ponytail off` also works.

## Configure Default Mode

Default mode = `full`, auto-active every session. Change it:

**Environment variable** (highest priority):
```bash
export PONYTAIL_DEFAULT_MODE=ultra
```

**Config file** (`~/.config/ponytail/config.json`, Windows: `%APPDATA%\ponytail\config.json`):
```json
{ "defaultMode": "lite" }
```

Set `"off"` to disable auto-activation on session start, activate manually
with `/ponytail` when wanted.

Resolution: env var > config file > `full`.

## Update

These skills and the Pi extension are maintained as part of pi-toolset. Update
through the same package or global-skill installation method already used for
this bundle, then reload Pi or restart the relevant host. Do not install a
separate upstream plugin to update bundled files. This help invocation installs
nothing and does not alter provider or hook configuration.

## More

Full docs + examples: https://github.com/DietrichGebert/ponytail
