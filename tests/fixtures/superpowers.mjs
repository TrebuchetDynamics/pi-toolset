import fs from "node:fs";
import path from "node:path";

// Offline upstream checkout fixture: unexpected git operations fail, never fetch.
export function superpowersFixture(directory, root) {
  const config = JSON.parse(fs.readFileSync(path.join(root, "skills/shared/profiles.json")));
  const source = path.join(directory, "upstream");
  const bin = path.join(directory, "fixture-bin");
  fs.mkdirSync(bin, { recursive: true });
  for (const name of config.superpowers.skills) {
    const skill = path.join(source, "skills", name);
    fs.mkdirSync(skill, { recursive: true });
    fs.writeFileSync(path.join(skill, "SKILL.md"), `---\nname: ${name}\ndescription: Fixture ${name}\n---\n`);
  }
  fs.mkdirSync(path.join(source, ".pi/extensions"), { recursive: true });
  fs.writeFileSync(path.join(source, ".pi/extensions/superpowers.ts"), "export default () => {};\n");
  fs.writeFileSync(path.join(bin, "git"), `#!/bin/sh
case "$3 $4" in
  'rev-parse HEAD') printf '%s\\n' '${config.superpowers.revision}' ;;
  'status --porcelain') exit 0 ;;
  *) echo 'Unexpected git invocation in offline test' >&2; exit 90 ;;
esac
`, { mode: 0o755 });
  return { SUPERPOWERS_DIR: source, PATH: `${bin}:${process.env.PATH}` };
}
