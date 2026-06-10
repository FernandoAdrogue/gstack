import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { runSkillTest } from './helpers/session-runner';
import type { SkillTestResult } from './helpers/session-runner';
import { outcomeJudge, callJudge } from './helpers/llm-judge';
import { EvalCollector, judgePassed } from './helpers/eval-store';
import type { EvalTestEntry } from './helpers/eval-store';
import { startTestServer } from '../browse/test/test-server';
import { selectTests, detectBaseBranch, getChangedFiles, E2E_TOUCHFILES, GLOBAL_TOUCHFILES } from './helpers/touchfiles';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const ROOT = path.resolve(import.meta.dir, '..');

// Skip unless EVALS=1. Session runner strips CLAUDE* env vars to avoid nested session issues.
//
// BLAME PROTOCOL: When an eval fails, do NOT claim "pre-existing" or "not related
// to our changes" without proof. Run the same eval on main to verify. These tests
// have invisible couplings — preamble text, SKILL.md content, and timing all affect
// agent behavior. See CLAUDE.md "E2E eval failure blame protocol" for details.
const evalsEnabled = !!process.env.EVALS;
const describeE2E = evalsEnabled ? describe : describe.skip;

// --- Diff-based test selection ---
// When EVALS_ALL is not set, only run tests whose touchfiles were modified.
// Set EVALS_ALL=1 to force all tests. Set EVALS_BASE to override base branch.
let selectedTests: string[] | null = null; // null = run all

if (evalsEnabled && !process.env.EVALS_ALL) {
  const baseBranch = process.env.EVALS_BASE
    || detectBaseBranch(ROOT)
    || 'main';
  const changedFiles = getChangedFiles(baseBranch, ROOT);

  if (changedFiles.length > 0) {
    const selection = selectTests(changedFiles, E2E_TOUCHFILES, GLOBAL_TOUCHFILES);
    selectedTests = selection.selected;
    process.stderr.write(`\nE2E selection (${selection.reason}): ${selection.selected.length}/${Object.keys(E2E_TOUCHFILES).length} tests\n`);
    if (selection.skipped.length > 0) {
      process.stderr.write(`  Skipped: ${selection.skipped.join(', ')}\n`);
    }
    process.stderr.write('\n');
  }
  // If changedFiles is empty (e.g., on main branch), selectedTests stays null → run all
}

/** Wrap a describe block to skip entirely if none of its tests are selected. */
function describeIfSelected(name: string, testNames: string[], fn: () => void) {
  const anySelected = selectedTests === null || testNames.some(t => selectedTests!.includes(t));
  (anySelected ? describeE2E : describe.skip)(name, fn);
}

/** Skip an individual test if not selected (for multi-test describe blocks). */
function testIfSelected(testName: string, fn: () => Promise<void>, timeout: number) {
  const shouldRun = selectedTests === null || selectedTests.includes(testName);
  (shouldRun ? test : test.skip)(testName, fn, timeout);
}

// Eval result collector — accumulates test results, writes to ~/.gstack-dev/evals/ on finalize
const evalCollector = evalsEnabled ? new EvalCollector('e2e') : null;

// Unique run ID for this E2E session — used for heartbeat + per-run log directory
const runId = new Date().toISOString().replace(/[:.]/g, '').replace('T', '-').slice(0, 15);

/** DRY helper to record an E2E test result into the eval collector. */
function recordE2E(name: string, suite: string, result: SkillTestResult, extra?: Partial<EvalTestEntry>) {
  // Derive last tool call from transcript for machine-readable diagnostics
  const lastTool = result.toolCalls.length > 0
    ? `${result.toolCalls[result.toolCalls.length - 1].tool}(${JSON.stringify(result.toolCalls[result.toolCalls.length - 1].input).slice(0, 60)})`
    : undefined;

  evalCollector?.addTest({
    name, suite, tier: 'e2e',
    passed: result.exitReason === 'success' && result.browseErrors.length === 0,
    duration_ms: result.duration,
    cost_usd: result.costEstimate.estimatedCost,
    transcript: result.transcript,
    output: result.output?.slice(0, 2000),
    turns_used: result.costEstimate.turnsUsed,
    browse_errors: result.browseErrors,
    exit_reason: result.exitReason,
    timeout_at_turn: result.exitReason === 'timeout' ? result.costEstimate.turnsUsed : undefined,
    last_tool_call: lastTool,
    ...extra,
  });
}

let testServer: ReturnType<typeof startTestServer>;
let tmpDir: string;
const browseBin = path.resolve(ROOT, 'browse', 'dist', 'browse');

/**
 * Copy a directory tree recursively (files only, follows structure).
 */
function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Set up browse shims (binary symlink, find-browse, remote-slug) in a tmpDir.
 */
function setupBrowseShims(dir: string) {
  // Symlink browse binary
  const binDir = path.join(dir, 'browse', 'dist');
  fs.mkdirSync(binDir, { recursive: true });
  if (fs.existsSync(browseBin)) {
    fs.symlinkSync(browseBin, path.join(binDir, 'browse'));
  }

  // find-browse shim
  const findBrowseDir = path.join(dir, 'browse', 'bin');
  fs.mkdirSync(findBrowseDir, { recursive: true });
  fs.writeFileSync(
    path.join(findBrowseDir, 'find-browse'),
    `#!/bin/bash\necho "${browseBin}"\n`,
    { mode: 0o755 },
  );

  // remote-slug shim (returns test-project)
  fs.writeFileSync(
    path.join(findBrowseDir, 'remote-slug'),
    `#!/bin/bash\necho "test-project"\n`,
    { mode: 0o755 },
  );
}

/**
 * Print cost summary after an E2E test.
 */
function logCost(label: string, result: { costEstimate: { turnsUsed: number; estimatedTokens: number; estimatedCost: number }; duration: number }) {
  const { turnsUsed, estimatedTokens, estimatedCost } = result.costEstimate;
  const durationSec = Math.round(result.duration / 1000);
  console.log(`${label}: $${estimatedCost.toFixed(2)} (${turnsUsed} turns, ${(estimatedTokens / 1000).toFixed(1)}k tokens, ${durationSec}s)`);
}

/**
 * Dump diagnostic info on planted-bug outcome failure (decision 1C).
 */
function dumpOutcomeDiagnostic(dir: string, label: string, report: string, judgeResult: any) {
  try {
    const transcriptDir = path.join(dir, '.gstack', 'test-transcripts');
    fs.mkdirSync(transcriptDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      path.join(transcriptDir, `${label}-outcome-${timestamp}.json`),
      JSON.stringify({ label, report, judgeResult }, null, 2),
    );
  } catch { /* non-fatal */ }
}

// Fail fast if Anthropic API is unreachable — don't burn through 13 tests getting ConnectionRefused
if (evalsEnabled) {
  const check = spawnSync('sh', ['-c', 'echo "ping" | claude -p --max-turns 1 --output-format stream-json --verbose --dangerously-skip-permissions'], {
    stdio: 'pipe', timeout: 30_000,
  });
  const output = check.stdout?.toString() || '';
  if (output.includes('ConnectionRefused') || output.includes('Unable to connect')) {
    throw new Error('Anthropic API unreachable — aborting E2E suite. Fix connectivity and retry.');
  }
}

describeIfSelected('Skill E2E tests', [
  'browse-basic', 'browse-snapshot', 'skillmd-setup-discovery',
  'skillmd-no-local-binary', 'skillmd-outside-git', 'contributor-mode', 'session-awareness',
], () => {
  beforeAll(() => {
    testServer = startTestServer();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-e2e-'));
    setupBrowseShims(tmpDir);
  });

  afterAll(() => {
    testServer?.server?.stop();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  });

  testIfSelected('browse-basic', async () => {
    const result = await runSkillTest({
      prompt: `You have a browse binary at ${browseBin}. Assign it to B variable and run these commands in sequence:
1. $B goto ${testServer.url}
2. $B snapshot -i
3. $B text
4. $B screenshot /tmp/skill-e2e-test.png
Report the results of each command.`,
      workingDirectory: tmpDir,
      maxTurns: 10,
      timeout: 60_000,
      testName: 'browse-basic',
      runId,
    });

    logCost('browse basic', result);
    recordE2E('browse basic commands', 'Skill E2E tests', result);
    expect(result.browseErrors).toHaveLength(0);
    expect(result.exitReason).toBe('success');
  }, 90_000);

  testIfSelected('browse-snapshot', async () => {
    const result = await runSkillTest({
      prompt: `You have a browse binary at ${browseBin}. Assign it to B variable and run:
1. $B goto ${testServer.url}
2. $B snapshot -i
3. $B snapshot -c
4. $B snapshot -D
5. $B snapshot -i -a -o /tmp/skill-e2e-annotated.png
Report what each command returned.`,
      workingDirectory: tmpDir,
      maxTurns: 10,
      timeout: 60_000,
      testName: 'browse-snapshot',
      runId,
    });

    logCost('browse snapshot', result);
    recordE2E('browse snapshot flags', 'Skill E2E tests', result);
    // browseErrors can include false positives from hallucinated paths (e.g. "baltimore" vs "bangalore")
    if (result.browseErrors.length > 0) {
      console.warn('Browse errors (non-fatal):', result.browseErrors);
    }
    expect(result.exitReason).toBe('success');
  }, 90_000);

  testIfSelected('skillmd-setup-discovery', async () => {
    const skillMd = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    const setupStart = skillMd.indexOf('## SETUP');
    const setupEnd = skillMd.indexOf('## IMPORTANT');
    const setupBlock = skillMd.slice(setupStart, setupEnd);

    // Guard: verify we extracted a valid setup block
    expect(setupBlock).toContain('browse/dist/browse');

    const result = await runSkillTest({
      prompt: `Follow these instructions to find the browse binary and run a basic command.

${setupBlock}

After finding the binary, run: $B goto ${testServer.url}
Then run: $B text
Report whether it worked.`,
      workingDirectory: tmpDir,
      maxTurns: 10,
      timeout: 60_000,
      testName: 'skillmd-setup-discovery',
      runId,
    });

    recordE2E('SKILL.md setup block discovery', 'Skill E2E tests', result);
    expect(result.browseErrors).toHaveLength(0);
    expect(result.exitReason).toBe('success');
  }, 90_000);

  test('agent discovers browse binary via SKILL.md setup block', async () => {
    const ROOT = path.resolve(import.meta.dir, '..');
    const skillMd = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    const setupStart = skillMd.indexOf('## SETUP');
    const setupEnd = skillMd.indexOf('## IMPORTANT');
    const setupBlock = skillMd.slice(setupStart, setupEnd);

    // Guard: verify we extracted a valid setup block
    expect(setupBlock).toContain('browse/dist/browse');

    const result = await runSkillTest({
      prompt: `Follow these instructions to find the browse binary and run a basic command.

${setupBlock}

After finding the binary, run: $B goto ${testServer.url}
Then run: $B text
Report whether it worked.`,
      workingDirectory: tmpDir,
      maxTurns: 10,
      timeout: 60_000,
    });

    expect(result.browseErrors).toHaveLength(0);
    expect(result.exitReason).toBe('success');
  }, 90_000);

  test('SKILL.md setup block shows NEEDS_SETUP when binary missing', async () => {
    // Create a tmpdir with no browse binary
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-e2e-empty-'));

    const ROOT = path.resolve(import.meta.dir, '..');
    const skillMd = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    const setupStart = skillMd.indexOf('## SETUP');
    const setupEnd = skillMd.indexOf('## IMPORTANT');
    const setupBlock = skillMd.slice(setupStart, setupEnd);

    const result = await runSkillTest({
      prompt: `Follow these instructions exactly. Run the bash code block below and report what it outputs.

${setupBlock}

Report the exact output. Do NOT try to fix or install anything — just report what you see.`,
      workingDirectory: emptyDir,
      maxTurns: 5,
      timeout: 30_000,
    });

    // Agent should see NEEDS_SETUP (not crash or guess wrong paths)
    const allText = result.messages
      .map((m: any) => JSON.stringify(m))
      .join('\n');
    expect(allText).toContain('NEEDS_SETUP');

    // Clean up
    try { fs.rmSync(emptyDir, { recursive: true, force: true }); } catch {}
  }, 60_000);

  test('SKILL.md setup block works outside git repo', async () => {
    // Create a tmpdir outside any git repo
    const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-e2e-nogit-'));

    const ROOT = path.resolve(import.meta.dir, '..');
    const skillMd = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    const setupStart = skillMd.indexOf('## SETUP');
    const setupEnd = skillMd.indexOf('## IMPORTANT');
    const setupBlock = skillMd.slice(setupStart, setupEnd);

    const result = await runSkillTest({
      prompt: `Follow these instructions exactly. Run the bash code block below and report what it outputs.

${setupBlock}

Report the exact output — either "READY: <path>" or "NEEDS_SETUP".`,
      workingDirectory: nonGitDir,
      maxTurns: 5,
      timeout: 30_000,
    });

    // Should either find global binary (READY) or show NEEDS_SETUP — not crash
    const allText = result.messages
      .map((m: any) => JSON.stringify(m))
      .join('\n');
    expect(allText).toMatch(/READY|NEEDS_SETUP/);

    // Clean up
    try { fs.rmSync(nonGitDir, { recursive: true, force: true }); } catch {}
  }, 60_000);

  test.todo('/qa quick completes without browse errors');
  test.todo('/ship completes without browse errors');
  test.todo('/review completes without browse errors');
});
