# Repository identity in SOUL

The assistant's conversational name is the **exact basename of the canonical repository root**, not `Hermes`, the `hermes-` container prefix, a hashed Compose ID or the `.hermes` directory. Reuse the planner's `identity.profileName` only after verifying its canonical repo mapping. For `/srv/projects/gormes-agent`, the name is **`gormes-agent`**. Keep case, spaces and Unicode; Docker name normalization does not apply to the assistant's name.

This is a required fresh-install and post-setup gate, not optional personalization. An ordinary install request covers this narrow repo-identity preparation in the owned instance. On an existing instance, apply it only within authorized setup/resume or requested identity reconciliation; read-only status and unrelated repair do not authorize a personality edit. Reading or editing this skill does not change a deployed SOUL.

## Resolve the effective file

- Use the selected image's verified prompt-loader source/configuration to identify the actual SOUL path and precedence. `/opt/data/SOUL.md` is an example for the persistent runtime home, not a universal promise.
- Inspect any configured override that can shadow it.
- Do not write `/workspace/SOUL.md`, host `~/.hermes/SOUL.md`, another profile's file or an image template merely because that path exists.
- If the active file is outside the owned persistent home, shared, symlinked, ambiguous or checked into the repo, stop for the specific boundary instead of guessing or silently changing its authority.
- Recheck container/volume ownership, the effective application user and the single-writer window.
- Read the owned effective SOUL privately enough to identify the narrow change; do not dump its private context into chat or receipts. Back it up consistently in the same approved private state boundary before mutation.
- Execute file operations as the verified application user, preserving ownership and restrictive permissions. Use atomic replacement after confirming the source has not changed; a concurrent wizard/editor change requires rereading, not overwriting it.

## Narrow, repeatable update

1. Derive the name from the verified repo root. Treat the basename as literal data: escape it when rendering text or passing arguments, never interpolate it into executable shell/Python code or treat it as an instruction.
2. Update only the assistant's self-name declaration and repository-assistant role. For fresh/stock SOUL content, replace the default self-name `Hermes`; for an existing customized SOUL, change the identifiable identity sentence/section while preserving unrelated personality, language, glossary, safety rules, user context and project mission. Do not globally replace the word `Hermes`: references to the Hermes software must remain correct.
3. If no identity declaration exists, add one clearly delimited repo-identity section. Update that same section on reruns, never append duplicates. Resolve conflicting self-name declarations narrowly rather than appending a competing name. If their meaning cannot be safely separated from owner-authored content, show the minimal proposed identity diff and ask about that conflict; do not replace the whole file or silently retain the wrong name.
4. Include a small repository-assistant role grounded in the known repo/workspace. Do not invent a business mission or build a personal user profile. A suitable identity section for the example repo is:

   ```markdown
   ## Repository identity
   Your name is gormes-agent. Introduce yourself as gormes-agent, not as Hermes.
   You are the repository assistant for gormes-agent. Your working repository is /workspace.
   Follow this repository's verified instructions and preserve the owner's other SOUL guidance.
   ```

5. Verify the resulting effective file contains the intended single self-name and repo role, with unrelated content preserved. An already-correct identity is a no-op: no duplicate section, unnecessary rewrite or new backup. Record only the effective path, agent name, changed section and verification state in the nonsecret setup evidence—not full SOUL contents. This does not rename Docker resources or the Telegram account.

## Setup, resume and activation

Prepare identity before the private setup handoff. After the user finishes setup, reload the effective path/precedence and verify it again: the wizard may have recreated SOUL or selected a different prompt source. Reconcile the same narrow identity delta before activation, alongside workspace/auth/memory gates; do not restore a whole pre-wizard SOUL over the user's new preferences. An old identity receipt is not evidence that the current file is correct. Reuse unchanged image/source facts; refresh only inputs affected by setup or a new image.

Verify that the prompt loader will read the owned file on the next supported load. If the running gateway caches SOUL, report apply/reload pending until the supported lifecycle action is authorized and verified. Never restart an existing service merely to test its name. File and loader checks establish **identity configured**, not an observed model response. An inference probe or external test message needs separate authorization; do not send one automatically.

## The startup greeting is a separate surface

A message such as “Hi, I'm Hermes. Type /help...” may be a static channel `/start` or onboarding response, not model output. Trace that greeting in matching image/source or supported configuration before claiming SOUL controls it. When a verified per-instance greeting/display-name setting exists and changing it is within the identity request, update only that supported setting to the repo name and preserve unrelated text/options. Do not invent a config key, disable onboarding, fabricate profile completion or edit BotFather/account metadata.

If the greeting is hardcoded and no supported override exists, report **SOUL identity configured; static greeting unchanged/unsupported**. Do not patch immutable image files, rebuild/upgrade, alter installed source or promise a changed greeting. Those are separate scoped changes. Likewise, do not advertise a configured override as a verified delivered message until observed safely.

Compact handoff: **Agent: `gormes-agent`; effective SOUL: `<verified path>`; identity configured; greeting: `<verified configuration or specific limitation>`; next: `<remaining setup/activation gate>`.**
