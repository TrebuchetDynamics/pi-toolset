import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("../skills/frontend/beautify-github-readme/scripts/audit_readme.py", import.meta.url));
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320"><title>Project flow</title><desc>Input to output</desc></svg>';

function audit(markdown, files = {}, readmePath = "README.md") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "readme-audit-"));
  try {
    // A real repository-root marker, including support for nested READMEs.
    fs.mkdirSync(path.join(dir, ".git"));
    for (const [name, content] of Object.entries({ ...files, [readmePath]: markdown })) {
      const target = path.join(dir, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    }
    const before = fs.readFileSync(path.join(dir, readmePath));
    const result = spawnSync("python3", [script, path.join(dir, readmePath)], {
      cwd: os.tmpdir(), encoding: "utf8",
    });
    assert.ifError(result.error);
    assert.deepEqual(fs.readFileSync(path.join(dir, readmePath)), before, "audit must remain read-only");
    assert.doesNotMatch(result.stderr, /Traceback/);
    return result;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function expectStatus(result, status) {
  assert.equal(result.status, status, result.stdout + result.stderr);
}

test("finds full, collapsed, shortcut and case/whitespace-normalized image references", () => {
  const result = audit('![Flow][Diagram ID]\n![Collapsed][]\n![Shortcut]\n\n[diagram   id]: missing-full.svg "Title"\n[Collapsed]: missing-collapsed.svg\n[Shortcut]: missing-shortcut.svg\n');
  expectStatus(result, 1);
  for (const name of ["full", "collapsed", "shortcut"]) assert.match(result.stdout, new RegExp(`missing image: missing-${name}\\.svg`));
  assert.match(result.stdout, /Local images checked: 3/);
});

test("does not treat unused definitions or unresolved reference syntax as rendered images", () => {
  const result = audit('[unused]: missing.png\n![ordinary text]\n![not an image][undefined]\n');
  expectStatus(result, 0);
  assert.match(result.stdout, /Local images checked: 0/);
});

test("ignores code examples and comments, but checks the live image after them", () => {
  const result = audit([
    '````md', '```', '![Example](missing-fenced.png)', '```', '````',
    '~~~html', '<img src="missing-tilde.svg">', '~~~',
    '    ![Example](missing-indented.png)',
    '`![Example](missing-inline.png)`',
    '``<img src="missing-inline-html.png"> ` ``',
    '<!-- ![Example](missing-comment.png) -->',
    '<pre><code>&lt;img src="missing-code.png"&gt;</code></pre>',
    '\\![Escaped](missing-escaped.png)',
    '![Real](hero.svg)',
  ].join('\n'), { "hero.svg": svg });
  expectStatus(result, 0);
  assert.match(result.stdout, /Local images checked: 1/);
});

test("literal comment delimiters in code do not hide live images", () => {
  for (const code of ['The delimiter is `<!--`.', '```html\n<!--\n```']) {
    const result = audit(`${code}\n\n![Flow](missing.svg)`);
    expectStatus(result, 1);
    assert.match(result.stdout, /missing image: missing.svg/);
  }
});

test("fences inside actual comments do not hide following live images", () => {
  const result = audit('<!--\n```\n![Hidden](comment.svg)\n-->\n\n![Flow](missing.svg)');
  expectStatus(result, 1);
  assert.match(result.stdout, /missing image: missing.svg/);
  assert.doesNotMatch(result.stdout, /comment.svg/);
});

test("checks every picture/srcset candidate and multiline unquoted HTML attributes", () => {
  const result = audit('<picture>\n<source media="(prefers-color-scheme: dark)" srcset="dark.svg 1x, dark@2x.svg 2x">\n<img\n src=hero.svg alt="Project flow" srcset="wide.svg 800w">\n</picture>', { "hero.svg": svg });
  expectStatus(result, 1);
  assert.match(result.stdout, /Local images checked: 4/);
  for (const name of ["dark.svg", "dark@2x.svg", "wide.svg"]) assert.ok(result.stdout.includes(`missing image: ${name}`));
});

test("keeps indented picture children and multiline img attributes", () => {
  const result = audit('<picture>\n    <source srcset="missing-dark.svg">\n    <img\n        src="hero.svg"\n        alt="Project flow">\n</picture>\n', { "hero.svg": svg });
  expectStatus(result, 1);
  assert.match(result.stdout, /missing image: missing-dark.svg/);
  assert.match(result.stdout, /Local images checked: 2/);
});

test("does not parse Markdown or backticks inside HTML attributes", () => {
  const result = audit('<img src="hero.svg" alt="![example](missing.svg) `syntax`">', { "hero.svg": svg });
  expectStatus(result, 0);
  assert.match(result.stdout, /Local images checked: 1/);
});

test("accepts usable srcset without src but reports an empty srcset", () => {
  const result = audit('<img alt="Flow" srcset="hero.svg 1x">', { "hero.svg": svg });
  expectStatus(result, 0);
  assert.match(result.stdout, /Local images checked: 1/);
  expectStatus(audit('<img alt="Flow" srcset=" , ">'), 1);
});

test("resolves valid reference images without auditing unused definitions", () => {
  const result = audit('![Flow][diagram]\n\n[diagram]: <hero one.svg> "A flow"\n[unused]: missing.svg\n', { "hero one.svg": svg });
  expectStatus(result, 0);
  assert.match(result.stdout, /Local images checked: 1/);
});

test("resolves encoded, angle-bracket, escaped-parenthesis and root-relative destinations", () => {
  const result = audit([
    '![One](../assets/hero%20one.svg?raw=1#proof)',
    '![Two](<../assets/hero two.svg> "Caption")',
    '![Three](../assets/hero(three).svg)',
    '![Four](../assets/hero\\(four\\).svg)',
    '![Root](/assets/root.svg)',
    '<img src="../assets/a&amp;b.svg" alt="Flow">',
  ].join('\n'), {
    "assets/hero one.svg": svg, "assets/hero two.svg": svg,
    "assets/hero(three).svg": svg, "assets/hero(four).svg": svg,
    "assets/root.svg": svg, "assets/a&b.svg": svg,
  }, "docs/README.md");
  expectStatus(result, 0);
  assert.match(result.stdout, /Local images checked: 6/);
});

test("does not mistake remote or data URLs for filesystem paths or srcset candidates", () => {
  const result = audit('![Badge](HTTPS://example.invalid/badge.svg)\n![Remote](//example.invalid/hero.png)\n<img src="data:image/png;base64,AAAA" alt="Inline" srcset="data:image/png;base64,AAAA 1x, https://example.invalid/b.png 2x">');
  expectStatus(result, 0);
  assert.match(result.stdout, /Local images checked: 0/);
  assert.match(result.stdout, /not fetched/i);
});

test("reports missing alternative text for Markdown and HTML, without borrowing data-alt", () => {
  const result = audit('![](hero.svg)\n<img src="hero.svg" data-alt="Not alternative text">\n', { "hero.svg": svg });
  expectStatus(result, 1);
  assert.match(result.stdout, /Markdown image missing useful alt text/);
  assert.match(result.stdout, /HTML image missing useful alt text/);
});

test("reports empty sources and unsupported URL schemes rather than auditing cwd", () => {
  for (const markdown of ['![Flow]()', '<img alt="Flow">', '<img src="" alt="Flow">']) {
    const result = audit(markdown);
    expectStatus(result, 1);
    assert.match(result.stdout, /missing image source/i);
  }
  for (const url of ['file:///tmp/private.svg', 'file://localhost/tmp/private.svg', 'ftp://example.invalid/image.svg']) {
    const result = audit(`![Flow](${url})`);
    expectStatus(result, 1);
    assert.match(result.stdout, /unsupported image URL scheme/i);
  }
});

test("reports malformed XML and non-SVG roots", () => {
  for (const content of ['<svg', '<html viewBox="0 0 1200 320"><title>Not SVG</title></html>']) {
    const result = audit('![Flow](hero.svg)', { "hero.svg": content });
    expectStatus(result, 1);
    assert.match(result.stdout, /invalid SVG|root.*svg/i);
  }
});

test("reports unsupported SVG encodings and continues auditing later images", () => {
  const result = audit('![Bad](bad.svg)\n![Missing](missing.svg)', {
    "bad.svg": '<?xml version="1.0" encoding="not-an-encoding"?>' + svg,
  });
  expectStatus(result, 1);
  assert.match(result.stdout, /invalid SVG/);
  assert.match(result.stdout, /missing image: missing.svg/);
});

test("checks numeric positive viewBox and meaningful title", () => {
  for (const box of ["", "0 0 0 320", "0 0 -1 320", "0 0 nan 320", "0 0 1200", "0 0 wide 320"]) {
    const result = audit('![Flow](hero.svg)', { "hero.svg": `<svg viewBox="${box}"><title>Flow</title></svg>` });
    expectStatus(result, 1);
    assert.match(result.stdout, /viewBox/);
  }
  const result = audit('![Flow](hero.svg)', { "hero.svg": '<svg viewBox="0 0 1200 320"><title> </title></svg>' });
  expectStatus(result, 1);
  assert.match(result.stdout, /title/);
});

for (const [label, fragment, issue] of [
  ["script", '<script>alert(1)</script>', /unsupported <script>/],
  ["foreignObject", '<foreignObject/>', /unsupported <foreignObject>/],
  ["event handler", '<rect onload="run()"/>', /event handler/i],
  ["external image", '<image href="https://example.invalid/proof.png"/>', /external resource/i],
  ["relative external use", '<use href="icons.svg#mark"/>', /external resource/i],
  ["external xlink", '<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="//example.invalid/p.png"/>', /external resource/i],
  ["remote CSS font", '<style>@import url("https://example.invalid/font.css");</style>', /stylesheet|CSS|font/i],
  ["animation", '<animate attributeName="opacity" dur="1s"/>', /animation/i],
]) {
  test(`flags unsupported SVG ${label}`, () => {
    const result = audit('![Flow](hero.svg)', { "hero.svg": svg.replace('</svg>', `${fragment}</svg>`) });
    expectStatus(result, 1);
    assert.match(result.stdout, issue);
  });
}

test("allows internal SVG reuse, gradients, and ordinary outbound links", () => {
  const result = audit('![Flow](hero.svg)', { "hero.svg": svg.replace('</svg>', '<defs><g id="mark"/><linearGradient id="ink"/></defs><use href="#mark"/><rect fill="url(#ink)"/><a href="https://example.invalid"><text>Docs</text></a></svg>') });
  expectStatus(result, 0);
});

test("reports invalid README encoding as a usage/input error without a traceback", () => {
  const result = audit(Buffer.from([0xff, 0xfe, 0x80]));
  expectStatus(result, 2);
  assert.match(result.stdout + result.stderr, /cannot read README/i);
});

test("usage and nonexistent input return exit 2", () => {
  for (const args of [[], [path.join(os.tmpdir(), "nonexistent-readme-audit-input", "README.md")]]) {
    const result = spawnSync("python3", [script, ...args], { encoding: "utf8" });
    assert.ifError(result.error);
    expectStatus(result, 2);
    assert.doesNotMatch(result.stderr, /Traceback/);
  }
});
