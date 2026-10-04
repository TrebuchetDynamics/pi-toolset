#!/usr/bin/env python3
"""Read-only, offline README image/SVG lint; not a GFM renderer or sanitizer."""

from __future__ import annotations

import math
import re
import sys
import xml.etree.ElementTree as ET
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


UNSAFE_SVG_TAGS = {"script", "foreignObject"}
ANIMATION_TAGS = {"animate", "animateMotion", "animateTransform", "set"}
IMAGE_START = re.compile(r"(?<![\\!])!\[((?:\\.|[^\]\\])*)\]")
DEFINITION = re.compile(r"^ {0,3}\[((?:\\.|[^\]\\])+)\]:[ \t]*(.*)$", re.M)
HTML_TAG = r"</?(?:img|source|picture|p|div|a|details|summary|table)(?=[\s/>])[^>]*>"


def visible_markdown(text: str) -> str:
    """Omit common non-rendered examples; deliberately not a full block parser."""
    # Preserve newlines so reference definitions still begin at line boundaries.
    def blank(match: re.Match) -> str:
        return re.sub(r"[^\n]", " ", match.group())

    # Consume the earliest complete token. Separate comment/code passes can
    # mistake a literal <!-- inside code for a comment hiding the rest of a page.
    tokens = re.compile(
        r"^ {0,3}(?P<ticks>`{3,})[^\n]*\n[\s\S]*?(?:^ {0,3}(?P=ticks)`*[ \t]*(?:\n|\Z)|\Z)"
        r"|^ {0,3}(?P<tildes>~{3,})[^\n]*\n[\s\S]*?(?:^ {0,3}(?P=tildes)~*[ \t]*(?:\n|\Z)|\Z)"
        r"|(?<!`)(?P<inline>`+)(?!`)[\s\S]*?(?<!`)(?P=inline)(?!`)"
        r"|<!--[\s\S]*?(?:-->|\Z)"
        r"|<(?P<raw>pre|code|script|style)\b[^>]*>[\s\S]*?</(?P=raw)\s*>"
        r"|(?P<html>" + HTML_TAG + ")",
        re.I | re.M,
    )
    text = tokens.sub(lambda match: match.group() if match.group("html") else blank(match), text)
    lines: list[str] = []
    html_block = False
    for line in text.splitlines(keepends=True):
        if not line.strip():
            html_block = False
        if re.match(r"^ {0,3}<(?:picture|p|div|table|img|source)(?=[\s/>])", line, re.I):
            html_block = True
        lines.append("\n" if not html_block and line.startswith(("    ", "\t")) else line)
    return "".join(lines)


def markdown_unescape(value: str) -> str:
    return unescape(re.sub(r"\\([!\"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])", r"\1", value))


def destination(text: str) -> tuple[str, int] | None:
    """Parse an angle-delimited or balanced/escaped bare link destination."""
    start = len(text) - len(text.lstrip())
    if text[start:start + 1] == "<":
        match = re.match(r"<((?:\\.|[^<>\n])*)>", text[start:])
        return (markdown_unescape(match.group(1)), start + match.end()) if match else None
    depth = 0
    i = start
    while i < len(text):
        char = text[i]
        if char == "\\" and i + 1 < len(text):
            i += 2
            continue
        if char.isspace() or (char == ")" and depth == 0):
            break
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        i += 1
    return None if depth else (markdown_unescape(text[start:i]), i)


def label_key(label: str) -> str:
    return " ".join(markdown_unescape(label).split()).casefold()


def markdown_images(text: str) -> list[tuple[str, str]]:
    definitions: dict[str, str] = {}
    for match in DEFINITION.finditer(text):
        parsed = destination(match.group(2))
        if parsed and parsed[0]:
            definitions.setdefault(label_key(match.group(1)), parsed[0])
    text = DEFINITION.sub("", text)
    # Attribute values are not Markdown, even when they contain image syntax.
    text = re.sub(HTML_TAG, "", text, flags=re.I)
    images: list[tuple[str, str]] = []
    for match in IMAGE_START.finditer(text):
        alt = markdown_unescape(match.group(1))
        tail = text[match.end():]
        if tail.startswith("("):
            parsed = destination(tail[1:])
            if parsed:
                src, end = parsed
                # Optional quoted/parenthesized title followed by the close.
                if re.match(r'^\s*(?:"[^"\n]*"|\x27[^\x27\n]*\x27|\([^\n]*?\))?\s*\)', tail[1 + end:]):
                    images.append((src, alt))
        else:
            ref = re.match(r"\[((?:\\.|[^\]\\])*)\]", tail)
            key = label_key((ref.group(1) or match.group(1)) if ref else match.group(1))
            if key in definitions:
                images.append((definitions[key], alt))
    return images


def srcset_sources(value: str) -> list[str]:
    """Extract URL tokens, preserving commas inside data URLs."""
    sources: list[str] = []
    rest = value
    while rest.strip(" ,\t\n\r"):
        rest = rest.lstrip(" ,\t\n\r")
        match = re.match(r"\S+", rest)
        if not match:
            break
        token = match.group()
        rest = rest[match.end():]
        if token.endswith(","):
            sources.append(token.rstrip(","))
        elif not token.lower().startswith("data:") and "," in token:
            # Common descriptor-free lists with no space after the comma.
            sources.extend(part for part in token.split(",") if part)
        else:
            sources.append(token)
            _, separator, rest = rest.partition(",")
            if not separator:
                break
    return sources


class ImageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.sources: list[str] = []
        self.issues: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        candidates = srcset_sources(values.get("srcset") or "") if tag in {"img", "source"} else []
        if tag == "img":
            if not (values.get("alt") or "").strip():
                self.issues.append("HTML image missing useful alt text")
            if values.get("src") or not candidates:
                self.sources.append(values.get("src") or "")
        self.sources.extend(candidates)


def local_target(src: str, base: Path) -> Path | None:
    if not src.strip():
        raise ValueError("missing image source")
    parsed = urlsplit(src)
    if parsed.scheme.lower() in {"http", "https", "data"}:
        return None
    if parsed.scheme:
        raise ValueError(f"unsupported image URL scheme: {parsed.scheme}")
    if parsed.netloc or src.startswith("#"):
        return None
    clean = unquote(parsed.path)
    if clean.startswith("/"):
        root = next((p for p in (base, *base.parents) if (p / ".git").exists()), None)
        if root is None:
            raise ValueError("cannot resolve repository-root image without a .git marker")
        return (root / clean.lstrip("/")).resolve()
    return (base / clean).resolve()


def audit_svg(path: Path) -> list[str]:
    issues: list[str] = []
    try:
        root = ET.parse(path).getroot()
    except (ET.ParseError, OSError, ValueError, LookupError) as exc:
        return [f"invalid SVG XML or unreadable file: {exc}"]
    if root.tag not in {"svg", "{http://www.w3.org/2000/svg}svg"}:
        issues.append("root element is not <svg>")
    try:
        box = [float(n) for n in re.split(r"[\s,]+", root.attrib.get("viewBox", "").strip())]
        if len(box) != 4 or not all(math.isfinite(n) for n in box) or box[2] <= 0 or box[3] <= 0:
            raise ValueError
    except ValueError:
        issues.append("missing or invalid viewBox (expected x y positive-width positive-height)")

    title_found = False
    for node in root.iter():
        tag = node.tag.rsplit("}", 1)[-1]
        if tag == "title" and "".join(node.itertext()).strip():
            title_found = True
        if tag in UNSAFE_SVG_TAGS:
            issues.append(f"contains unsupported <{tag}>")
        if tag in ANIMATION_TAGS:
            issues.append(f"contains animation <{tag}>; use a static visual")
        for key, value in node.attrib.items():
            attr = key.rsplit("}", 1)[-1]
            if attr.lower().startswith("on"):
                issues.append(f"contains event handler {attr}")
            if attr == "href" and tag != "a" and value.strip() and not value.strip().startswith("#"):
                issues.append(f"contains external resource in <{tag}>")
        css = " ".join(node.attrib.values()) + ("".join(node.itertext()) if tag == "style" else "")
        if re.search(r"@import\b|@font-face\b", css, re.I):
            issues.append("contains external stylesheet or embedded font CSS")
        for url in re.findall(r"url\(\s*([^)]*)\)", css, re.I):
            if not url.strip(" \t\r\n\"'").startswith("#"):
                issues.append("contains external resource in CSS url()")
    if not title_found:
        issues.append("missing non-empty <title>")
    return list(dict.fromkeys(issues))


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: audit_readme.py /path/to/README.md", file=sys.stderr)
        return 2
    try:
        readme = Path(sys.argv[1]).expanduser().resolve()
        text = visible_markdown(readme.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, ValueError) as exc:
        print(f"ERROR: cannot read README: {exc}", file=sys.stderr)
        return 2

    html = ImageParser()
    html.feed(text)
    sources = list(html.sources)
    warnings = list(html.issues)
    for src, alt in markdown_images(text):
        sources.append(src)
        if not alt.strip():
            warnings.append(f"Markdown image missing useful alt text: {src}")

    checked = 0
    skipped = 0
    for src in dict.fromkeys(sources):
        try:
            target = local_target(src, readme.parent)
            if target is None:
                skipped += 1
                continue
            checked += 1
            if not target.is_file():
                warnings.append(f"missing image: {src}")
            elif target.suffix.lower() == ".svg":
                warnings.extend(f"{src}: {issue}" for issue in audit_svg(target))
        except (ValueError, OSError, RuntimeError) as exc:
            warnings.append(f"{src!r}: {exc}")

    print(f"README: {readme}")
    print(f"Local images checked: {checked}")
    print(f"Non-local sources skipped (not fetched): {skipped}")
    print("Scope: common image syntax and SVG basics only; not rendering, contrast, links, or a security guarantee.")
    if warnings:
        print("Issues:")
        for warning in dict.fromkeys(warnings):
            print(f"- {warning}")
        return 1
    print("OK: image references and SVG basics passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
