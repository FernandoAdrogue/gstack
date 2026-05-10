import type { TemplateContext } from '../types';

export function generateAskUserFormat(_ctx: TemplateContext): string {
  return `## AskUserQuestion Format

### Tool resolution (read first)

"AskUserQuestion" may be host MCP (e.g. \`mcp__conductor__AskUserQuestion\`) or native.

**Rule:** if any \`mcp__*__AskUserQuestion\` variant is in your tool list, prefer it. Hosts may disable native AUQ and route through MCP; same shape and brief.

**If no AskUserQuestion variant appears in your tool list, this skill is BLOCKED.** Stop, report \`BLOCKED — AskUserQuestion unavailable\`, and wait for the user. Do not write decisions to the plan file as a substitute, do not emit them as prose and stop, and do not silently auto-decide (only \`/plan-tune\` AUTO_DECIDE opt-ins authorize auto-picking).

### Format

Every AskUserQuestion decision has two parts: a markdown decision brief before the call, then a compact tool_use payload. Do not pack the full brief into the tool's \`question\` string. Every AskUserQuestion must be sent as tool_use, not prose.

\`\`\`
D<N> — <one-line question title>
Project/branch/task: <1 short grounding sentence using _BRANCH>
ELI10: <plain English a 16-year-old could follow, 2-4 sentences, name the stakes>
Stakes if we pick wrong: <one sentence on what breaks, what user sees, what's lost>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10   (or: Note: options differ in kind, not coverage — no completeness score)
Pros / cons:
A) <option label> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option label>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of what you're actually trading off>
\`\`\`

D-numbering: first question in a skill invocation is \`D1\`; increment yourself. This is a model-level instruction, not a runtime counter.

ELI10 is always present, in plain English, not function names. Recommendation is ALWAYS present. Keep the \`(recommended)\` label; AUTO_DECIDE depends on it.

Completeness: use \`Completeness: N/10\` only when options differ in coverage. 10 = complete, 7 = happy path, 3 = shortcut. If options differ in kind, write: \`Note: options differ in kind, not coverage — no completeness score.\`

Pros / cons: use ✅ and ❌. Minimum 2 pros and 1 con per option when the choice is real; Minimum 40 characters per bullet. Hard-stop escape for one-way/destructive confirmations: \`✅ No cons — this is a hard-stop choice\`.

Neutral posture: \`Recommendation: <default> — this is a taste call, no strong preference either way\`; \`(recommended)\` STAYS on the default option for AUTO_DECIDE.

Effort both-scales: when an option involves effort, label both human-team and CC+gstack time, e.g. \`(human: ~2 days / CC: ~15 min)\`. Makes AI compression visible at decision time.

Net line closes the tradeoff. Per-skill instructions may add stricter rules.

Tool payload rules:
- \`question\` is only the decision prompt: one sentence, no newlines, <=80 chars.
- Background, regrounding, ELI10, stakes, recommendation, pros/cons, and trade-off tables stay in the markdown brief before the tool call.
- Ask one decision per tool call when possible; batch at most two related questions/tabs. Sequence independent decisions instead of sending 3+ tabs.
- Do not duplicate the same trade-off text in both \`question\` and \`options[].description\`. Prefer putting option-specific trade-offs in \`options[].description\`.

### Self-check before emitting

Before calling AskUserQuestion, verify:
- [ ] D<N> header present
- [ ] ELI10 paragraph and stakes line present
- [ ] Recommendation line present with reason
- [ ] Completeness scored OR kind-note present
- [ ] Every option has ≥2 ✅ and ≥1 ❌, each ≥40 chars (or hard-stop escape)
- [ ] (recommended) label on one option (even for neutral-posture)
- [ ] Dual-scale effort labels on effort-bearing options (human / CC)
- [ ] Net line closes the decision
- [ ] \`question\` is one sentence, no newlines, <=80 chars
- [ ] Tool call has no more than two related questions/tabs
- [ ] No duplicated trade-off text between \`question\` and \`options[].description\`
- [ ] You wrote the brief, then called the tool_use payload
`;
}
