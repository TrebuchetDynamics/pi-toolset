# Hermes/Laya reference application checks

These are manual, read-only agent scenarios, not CI model calls or runtime certification. Automated package/profile tests separately check prompt discovery, tarball inclusion, optional-profile activation/deactivation and the installed sibling handoff.

## Scenario

An existing repo-owned Docker Hermes is to use Laya. The proposed recipe installs `laya>=0.3.3` into Hermes Python, writes top-level `nerve.enabled`/`reflex_backend`, starts a service on the Docker host's loopback, uses the older model/subfolder pair, calls shadow free/local, and treats `LOCAL_ONLY` as proof of 33 ms latency and lower total tokens. The operator cites Dev15 and has an existing sidecar venv.

Ask for corrected settings/version/model, source installation versus service deployment, reachable topology, approval and verification boundaries, and preservation of the main LLM/Holographic. Ask whether the upstream setup script is safe for the existing venv and whether the upstream smoke's exit zero proves exact model identity.

## Acceptance observations

- Names one coherent inspected Nerve revision, sidecar package version and checkpoint; does not mix Dev15 and Dev17.
- Places settings under `plugins.entries.hermes-nerve.settings`, distinguishes configuration from enablement and does not enable hosted defaults first.
- Keeps dependencies outside Hermes Python; the sidecar also needs the Nerve module and durable supervision/cache.
- Distinguishes host/container loopback; does not propose plain private-DNS HTTP unsupported by the inspected client. Shared namespace requires coordinated recreation; remote use needs a supported authenticated topology.
- Rejects deleting the existing venv through the upstream convenience script and avoids host-profile helpers for Compose state.
- Requires separate model identity and loaded-Nerve routing checks beyond the direct smoke. Does not claim runtime evidence from documents.
- Treats shadow as hosted-Jev-authoritative, with possible cost/external data flow; not an automatic prerequisite or fallback.
- Preserves main model, memory and deterministic authority. Reports performance not measured without comparative evidence.

## Recorded authoring trial

One fresh-context `gpt-6-astra` baseline without the new reference declined to assert exact current versions/settings/model. It correctly questioned several unsafe claims, but included private-network service-name addressing among candidate topologies without knowing this client's HTTPS requirement. This demonstrated a reference-availability gap, not general unsafe behavior.

One fresh-context guided application read the new skill/reference and base installer instructions. It recovered the exact inspected tuple and config fragment, rejected the unsupported HTTP topology, identified destructive venv setup and the smoke's missing identity check, preserved scope, and reported runtime/performance pending. No blocking instruction gap was reported.

This is a single reference-application check, not a repeated behavioral study or a speed/token benchmark. No package/model installation, Docker operation, source deployment, live model inference or paid shadow comparison was performed. No broad safety/latency improvement is claimed.
