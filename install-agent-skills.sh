#!/usr/bin/env sh
set -eu

# Install the Superpowers-led profile for Codex and Claude Code.
#
# Usage:
#   sh install-agent-skills.sh
#   sh install-agent-skills.sh --codex-only
#   sh install-agent-skills.sh --claude-only
#
# Destination overrides:
#   CODEX_SKILLS_DIR=/path/to/skills
#   CLAUDE_SKILLS_DIR=/path/to/skills
#
# Existing same-name skills are backed up outside the active skill roots unless
# AGENT_SKILLS_BACKUP=0 or --no-backup is used. Set AGENT_SKILLS_DRY_RUN=1 or
# pass --dry-run to print the installation plan without writing files.

script_dir="$(CDPATH= cd "$(dirname "$0")" && pwd)"
src_root="${script_dir}/skills"

: "${HOME:?HOME is required}"

CODEX_SKILLS_DIR="${CODEX_SKILLS_DIR:-${HOME}/.agents/skills}"
CLAUDE_SKILLS_DIR="${CLAUDE_SKILLS_DIR:-${HOME}/.claude/skills}"
AGENT_SKILLS_BACKUP="${AGENT_SKILLS_BACKUP:-${CLAUDE_SKILLS_BACKUP:-1}}"
AGENT_SKILLS_DRY_RUN="${AGENT_SKILLS_DRY_RUN:-${CLAUDE_SKILLS_DRY_RUN:-0}}"

install_codex=1
install_claude=1
profile=default

usage() {
  cat <<'EOF'
Usage: sh install-agent-skills.sh [options]

Install 15 pinned upstream Superpowers skills, eight local specialists,
and the explicit-use lgtm compatibility command.
Known optional/retired global copies are archived outside discovery roots.
Unrelated user skills are preserved.

Options:
  --codex-only   Install only to CODEX_SKILLS_DIR (default: ~/.agents/skills)
  --claude-only  Install only to CLAUDE_SKILLS_DIR (default: ~/.claude/skills)
  --profile=NAME Add one optional profile (design, research, refactor, automation,
                 authoring, delivery, planning, writing); default is core only
  --dry-run      Print planned changes without writing files
  --no-backup    Replace same-name skills without backing them up
  -h, --help     Show this help
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --codex-only)
      install_codex=1
      install_claude=0
      ;;
    --claude-only)
      install_codex=0
      install_claude=1
      ;;
    --profile=*)
      profile=${1#--profile=}
      ;;
    --dry-run)
      AGENT_SKILLS_DRY_RUN=1
      ;;
    --no-backup)
      AGENT_SKILLS_BACKUP=0
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'install-agent-skills: unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

case "$AGENT_SKILLS_BACKUP" in
  0|1) ;;
  *)
    printf 'install-agent-skills: AGENT_SKILLS_BACKUP must be 0 or 1\n' >&2
    exit 2
    ;;
esac

case "$AGENT_SKILLS_DRY_RUN" in
  0|1) ;;
  *)
    printf 'install-agent-skills: AGENT_SKILLS_DRY_RUN must be 0 or 1\n' >&2
    exit 2
    ;;
esac

if [ ! -d "$src_root" ]; then
  printf 'install-agent-skills: source not found: %s\n' "$src_root" >&2
  exit 1
fi

# Resolve the reviewed profile before changing any destination.
selected_files=$(node --input-type=module - "$script_dir" "$profile" <<'NODE'
import fs from 'node:fs';
import path from 'node:path';
const [root, profile] = process.argv.slice(2);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
const config = JSON.parse(fs.readFileSync(path.join(root, 'skills/shared/profiles.json')));
if (profile !== 'default' && !config.optional[profile]) throw new Error(`Unknown skill profile: ${profile}`);
const selected = new Set(pkg.pi.skills.map(p => path.basename(p)));
for (const name of config.optional[profile] || []) selected.add(name);
for (const rel of fs.readdirSync(path.join(root, 'skills'), {recursive:true})) {
  if (path.basename(rel) === 'SKILL.md' && selected.has(path.basename(path.dirname(rel)))) {
    console.log(path.join(root, 'skills', rel));
    selected.delete(path.basename(path.dirname(rel)));
  }
}
if (selected.size) throw new Error(`Missing skills: ${[...selected]}`);
NODE
)
upstream_names=$(node -e 'console.log(require(process.argv[1]).superpowers.skills.join("\n"))' "$src_root/shared/profiles.json")
if [ "$AGENT_SKILLS_DRY_RUN" = 1 ]; then
  upstream_root=$(node "$script_dir/scripts/superpowers-source.mjs" --path)
else
  upstream_root=$(node "$script_dir/scripts/superpowers-source.mjs")
fi

timestamp="$(date +%Y%m%d%H%M%S).$$"
state_root="${XDG_STATE_HOME:-${HOME}/.local/state}"
AGENT_SKILLS_BACKUP_DIR="${AGENT_SKILLS_BACKUP_DIR:-${state_root}/pi-toolset/skill-backups/${timestamp}}"

node --input-type=module - "$AGENT_SKILLS_BACKUP_DIR" "$CODEX_SKILLS_DIR" "$CLAUDE_SKILLS_DIR" <<'NODE'
import fs from 'node:fs';
import path from 'node:path';
function canonical(p) {
  p = path.resolve(p);
  return fs.existsSync(p) ? fs.realpathSync(p) : path.join(canonical(path.dirname(p)), path.basename(p));
}
const [backup, ...roots] = process.argv.slice(2).map(canonical);
if (roots.some(root => backup === root || backup.startsWith(root + path.sep))) {
  throw new Error('Skill backups must be outside active discovery roots');
}
NODE

skill_name() {
  awk '
    /^---$/ { fence += 1; next }
    fence == 1 && /^name:[[:space:]]*/ {
      sub(/^name:[[:space:]]*/, "")
      gsub(/^["'"'"']|["'"'"']$/, "")
      print
      exit
    }
  ' "$1"
}

install_dir() {
  src="$1"
  dest="$2"
  backup_root="$3"

  if [ "$AGENT_SKILLS_DRY_RUN" = "1" ]; then
    printf 'would install: %s -> %s\n' "$src" "$dest"
    return
  fi

  mkdir -p "$(dirname "$dest")"

  tmp_dest=$(mktemp -d "${dest}.tmp.XXXXXX")
  cleanup_install_dir() {
    rm -rf "$tmp_dest"
  }
  trap cleanup_install_dir EXIT
  trap 'cleanup_install_dir; exit 1' HUP INT TERM
  cp -R "$src"/. "$tmp_dest"/

  find "$tmp_dest" -type d \( -name .pi -o -name .understand-anything -o -name node_modules -o -name .git \) -prune -exec rm -rf {} + 2>/dev/null || true
  find "$tmp_dest" -type f -name '*.md' -exec sh -c '
    for file do
      tmp="${file}.tmp.$$"
      sed \
        -e "s#\.\./\.\./\.\./shared/#../../shared/#g" \
        -e "s#\.\./\.\./shared/#../shared/#g" \
        -e "s#\.\./\.\./\.\./\([^/][^/]*\)/\([^/][^/]*\)/#../../\2/#g" \
        -e "s#\.\./\.\./\([^/][^/]*\)/\([^/][^/]*\)/#../\2/#g" \
        "$file" > "$tmp"
      mv "$tmp" "$file"
    done
  ' sh {} +

  if [ -d "$dest" ] && diff -qr "$tmp_dest" "$dest" >/dev/null 2>&1; then
    rm -rf "$tmp_dest"
    trap - EXIT HUP INT TERM
    printf 'unchanged: %s\n' "$dest"
    return
  fi

  if [ "$AGENT_SKILLS_BACKUP" = "1" ] && [ -e "$dest" ]; then
    backup="${backup_root}/$(basename "$dest")"
    mkdir -p "$backup_root"
    if [ -e "$backup" ]; then
      printf 'install-agent-skills: backup already exists: %s\n' "$backup" >&2
      exit 1
    fi
    cp -R "$dest" "$backup"
    printf 'backup: %s -> %s\n' "$dest" "$backup"
  fi

  rm -rf "$dest"
  mv "$tmp_dest" "$dest"
  trap - EXIT HUP INT TERM
  printf 'installed: %s\n' "$dest"
}

install_target() {
  label="$1"
  dest_root="$2"
  backup_root="${AGENT_SKILLS_BACKUP_DIR}/${label}"

  install_dir "${src_root}/shared" "${dest_root}/shared" "$backup_root"

  # Retire known bundle copies, including edited copies, by moving them intact.
  # This is reversible even when --no-backup is used for ordinary replacements.
  managed_names=$(find "$src_root" -name SKILL.md -type f | while IFS= read -r file; do skill_name "$file"; done)
  for name in $managed_names caveman; do
    if printf '%s\n' "$selected_files" | awk -F/ -v name="$name" '$(NF-1) == name {found=1} END {exit !found}'; then
      continue
    fi
    dest="$dest_root/$name"
    if [ -f "$dest/SKILL.md" ] && grep -q '^<!-- pi-toolset-compatibility -->$' "$dest/SKILL.md"; then continue; fi
    if [ -e "$dest" ] || [ -L "$dest" ]; then
      if [ "$AGENT_SKILLS_DRY_RUN" = 1 ]; then
        printf 'would archive: %s\n' "$dest"
      else
        mkdir -p "$backup_root"
        [ ! -e "$backup_root/$name" ] && [ ! -L "$backup_root/$name" ] || { printf 'backup already exists: %s\n' "$backup_root/$name" >&2; exit 1; }
        mv "$dest" "$backup_root/$name"
        if [ -f "$backup_root/$name/SKILL.md" ]; then
          node "$script_dir/scripts/skill-compatibility.mjs" "$dest" "$backup_root/$name/SKILL.md"
        fi
        printf 'archived: %s -> %s\n' "$dest" "$backup_root/$name"
      fi
    fi
  done

  printf '%s\n' "$selected_files" | while IFS= read -r skill_file; do
    name="$(skill_name "$skill_file")"
    install_dir "$(dirname "$skill_file")" "${dest_root}/${name}" "$backup_root"
  done

  # Native Claude plugins own their skill namespace and bootstrap. Do not shadow them.
  native_claude=0
  if [ "$label" = Claude ] && [ -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" ]; then
    native_claude=$(node -e 'const s=require(process.argv[1]);console.log(Object.entries(s.enabledPlugins||{}).some(([k,v])=>k.startsWith("superpowers@")&&v===true)?1:0)' "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json")
  fi
  for name in $upstream_names; do
    src="$upstream_root/skills/$name"
    dest="$dest_root/$name"
    if [ "$native_claude" = 1 ]; then
      if [ -e "$dest" ] || [ -L "$dest" ]; then
        if [ "$AGENT_SKILLS_DRY_RUN" = 1 ]; then
          printf 'would archive plugin duplicate: %s\n' "$dest"
        else
          mkdir -p "$backup_root"
          [ ! -e "$backup_root/$name" ] && [ ! -L "$backup_root/$name" ] || { printf 'backup already exists: %s\n' "$backup_root/$name" >&2; exit 1; }
          mv "$dest" "$backup_root/$name"
        fi
      fi
      continue
    fi
    if [ -L "$dest" ] && [ "$(readlink "$dest")" = "$src" ]; then continue; fi
    if [ "$AGENT_SKILLS_DRY_RUN" = 1 ]; then
      printf 'would link upstream: %s -> %s\n' "$dest" "$src"
      continue
    fi
    if [ -e "$dest" ] || [ -L "$dest" ]; then
      mkdir -p "$backup_root"
      [ ! -e "$backup_root/$name" ] && [ ! -L "$backup_root/$name" ] || { printf 'backup already exists: %s\n' "$backup_root/$name" >&2; exit 1; }
      mv "$dest" "$backup_root/$name"
    fi
    ln -s "$src" "$dest"
    printf 'linked upstream: %s\n' "$dest"
  done

  printf '\n%s skills dir: %s\n' "$label" "$dest_root"
}

if [ "$install_codex" = "1" ]; then
  install_target Codex "$CODEX_SKILLS_DIR"
fi

if [ "$install_claude" = "1" ]; then
  install_target Claude "$CLAUDE_SKILLS_DIR"
fi

if [ "$AGENT_SKILLS_DRY_RUN" = "0" ]; then
  if [ "$install_codex" = "1" ] && [ "$install_claude" = "1" ]; then
    printf 'Reload open Pi sessions and restart open Codex and Claude Code sessions to refresh skill discovery.\n'
  elif [ "$install_codex" = "1" ]; then
    printf 'Reload open Pi sessions and restart open Codex sessions to refresh skill discovery.\n'
  else
    printf 'Restart open Claude Code sessions to refresh skill discovery.\n'
  fi
fi
