# TODOS

## NEXT PRIORITY

### P1: #1882 — portable skill-install prefix (non-`gstack` install dirs break silently)

**What:** Every generated SKILL.md hardcodes the literal `~/.claude/skills/gstack/...`
for its `bin/`/asset calls (the per-invocation telemetry/config preamble plus ~9
resolvers). `setup` wires the top-level skill symlinks for any directory name, so
installing at `~/.claude/skills/<other>` leaves every internal `bin` reference
pointing at a non-existent `~/.claude/skills/gstack/` path — failing **silently, at
skill-invocation time**. Make the emitted references portable: resolve the install
root at runtime (the preamble already defines `GSTACK_ROOT`/`GSTACK_BIN` in
`scripts/resolvers/preamble/generate-preamble-bash.ts` but the literals don't use
them) and emit `$GSTACK_BIN`-relative paths instead of the hardcoded prefix.

**Why:** Filed as #1882. Split out of the June 2026 fix wave (decision A) once
implementation showed it is a host-config/design change, not a fix-wave patch. The
urgent half — the guard/freeze/careful frontmatter hooks broken on CC 2.1.162 — was
already fixed in that wave (#1871) with a literal `$HOME`-anchored path, because
frontmatter hooks run before any runtime variable exists and cannot use `$GSTACK_BIN`.
So #1882 is now purely the body-preamble portability work.

**Effort:** S (small)
**Priority:** P3 (nice-to-have, revisit after adoption data)

## Convert remaining skills to .tmpl files

**What:** Convert ship/, review/, plan-ceo-review/, plan-eng-review/, retro/ SKILL.md files to .tmpl templates using the `{{UPDATE_CHECK}}` placeholder.

**Why:** These 5 skills still have the update check preamble copy-pasted. When the preamble changes (like the `|| true` fix in v0.3.5), all 5 need manual updates. The `{{UPDATE_CHECK}}` resolver already exists in `scripts/gen-skill-docs.ts` — these skills just need to be converted.

**Context:** The browse-using skills (SKILL.md, browse/, qa/, setup-browser-cookies/) were converted to .tmpl in v0.3.5. The remaining 5 skills only use `{{UPDATE_CHECK}}` (no `{{BROWSE_SETUP}}`), so the conversion is mechanical: replace the preamble with `{{UPDATE_CHECK}}`, add the path to `findTemplates()` in `scripts/gen-skill-docs.ts`, and commit both .tmpl + generated .md.

**Depends on:** v0.3.5 shipping first (the `{{UPDATE_CHECK}}` resolver).
**Effort:** S (small, ~20 min)
**Priority:** P2 (prevents drift on next preamble change)
