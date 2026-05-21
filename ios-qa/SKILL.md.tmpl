---
name: ios-qa
version: 4.0.0
description: |
  Live-device iOS QA for SwiftUI apps. Connects to a real iPhone via USB
  port-forward, reads Swift source to understand every screen, then runs a
  vision-driven agent loop: screenshot → analyze → decide → act → verify → repeat.
  All interaction happens via HTTP to an embedded StateServer in the app.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - ios qa
  - ios-qa
  - test ios app
  - qa my phone
---

{{PREAMBLE}}

# iStack: Live-Device iOS QA (v4)

## Warm Start (Check This FIRST — Before Any Other Phase)

Before doing anything else, check if a session cache exists:

```bash
cat ~/.gstack/ios-qa-session.json 2>/dev/null
```

If the file exists and the session is less than 24 hours old:

1. **Skip Phases 1 and 2 entirely** (no source reading, no code-gen, no build)
2. Verify the device is still connected and the app is still running:
   ```bash
   CACHED_IP=$(cat ~/.gstack/ios-qa-session.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['tunnelIP'])")
   curl -s -6 --max-time 3 "http://[$CACHED_IP]:9999/health"
   ```
3. If `/health` returns `{"status":"ok"}`:
   - Print: `WARM START ✓ — Skipping code-gen and build. Using cached session.`
   - Print the cached function inventory from `vmFunctions`
   - Set `DEVICE="http://[$CACHED_IP]:9999"` and jump straight to **Phase 4**
4. If health check fails (app not running or tunnel IP changed):
   - Print: `WARM START: Cache stale — re-discovering device...`
   - Re-run device discovery (Phase 3 only), then jump to Phase 4 (code-gen already done)
   - Update `tunnelIP` in the cache file

**Session cache format** (`~/.gstack/ios-qa-session.json`):
```json
{
  "bundleId": "com.example.MyApp",
  "tunnelIP": "fdac:e671:bcd7::1",
  "deviceId": "E111536C-...",
  "appSourceDir": "/path/to/App/",
  "vmFunctions": {
    "WorkoutViewModel": ["addWorkout(_:)", "removeWorkout(at:)", "toggleUnit()"],
    "StatsViewModel": ["calculateStreak(from:)"]
  },
  "actionKeys": ["WorkoutVM_addWorkout", "WorkoutVM_removeWorkout", "ProfileVM_toggleUnit"],
  "generatedAt": "2026-05-17T00:00:00Z"
}
```

**Write the session cache** after a successful Phase 2 build (or after first successful
`/health` response). Always overwrite — the newest successful session wins.

```bash
python3 -c "
import json, datetime
cache = {
  'bundleId': 'BUNDLE_ID',
  'tunnelIP': 'TUNNEL_IP',
  'deviceId': 'DEVICE_ID',
  'appSourceDir': 'APP_SOURCE_DIR',
  'vmFunctions': VM_FUNCTIONS_DICT,
  'actionKeys': ACTION_KEYS_LIST,
  'generatedAt': datetime.datetime.utcnow().isoformat() + 'Z'
}
json.dump(cache, open('/Users/sinmat/.gstack/ios-qa-session.json', 'w'), indent=2)
print('Session cached.')
"
```

---

## Rapid Mode

If the user says "rapid", "fast", "quick test", "quick qa", or "speed run":

**RAPID MODE** is active. This mode is optimized purely for speed.

1. **Use Sonnet for ALL phases** — no Opus anywhere, even for test plan and report.
2. **Batch everything.** Combine all state reads into single bash calls. Never make
   a separate curl call for something you can read in the same script.
3. **No narration.** Skip the "Tapping the + button..." text. Just act.
4. **Minimal screenshots.** Take one screenshot per new screen only. Skip screenshots
   for state-only tests (use `/state` reads exclusively). Still capture bug evidence.
5. **No pauses.** Remove all `sleep` calls.
6. **Blitz the test plan.** Run tests in parallel where possible — inject state for
   multiple tests, then read all results in one batch.
7. **Terse report.** Bug list only, no prose. One line per bug: `BUG: [what] [screen] [evidence]`

**Rapid mode target:** Complete a full QA pass in under 90 seconds after warm start.

Rapid mode is compatible with warm start — both can be active simultaneously.

---

You are an expert iOS QA tester. You connect to a real app running on a real
iPhone via USB, read its source code, then run a browser-agent-loop to
systematically find bugs: screenshot → identify elements → choose action →
execute → verify state → repeat.

## Architecture

```
Claude Code (this skill — YOU)
  └── curl -6 http://[TUNNEL_IPv6]:9999/*   (via CoreDevice USB tunnel)
        ├── GET  /screenshot         → base64 PNG of current screen
        ├── GET  /elements           → accessibility tree (labels, frames, traits)
        ├── POST /tap                → inject tap at {x, y} pixel coords
        ├── POST /swipe              → inject swipe {fromX, fromY, toX, toY}
        ├── POST /type               → type text into focused field
        ├── POST /dismiss            → close the topmost sheet/alert/modal
        ├── GET  /device             → device info (model, screen size)
        ├── GET  /state              → list all registered state keys
        ├── GET  /state/{key}        → read @Observable property
        ├── POST /state/{key}        → write @Observable property
        └── GET  /health             → health check
```

**No external tools needed** besides `curl` and `xcrun devicectl`.
Everything runs inside the app via an embedded HTTP StateServer.
Connection uses the CoreDevice USB tunnel (IPv6) — **NOT iproxy**.

## Performance Model

Use **Sonnet** (fast model) for:
- Code-gen subagent (Phase 1+2) — mechanical file generation, no deep reasoning needed
- QA execution loop (Phase 5) — reading accessibility trees, deciding taps, verifying state

When spawning subagents, use `model: "sonnet"`.

Use the **default model** (Opus) only for:
- Test plan generation (Phase 4)
- Final bug report synthesis (Phase 6)

## Demo Mode

If the user says "demo", "demo mode", "show me", or "I want to see it working",
run in **DEMO MODE**. This changes how you interact with the app:

**DEMO MODE OVERRIDES ALL OTHER RULES IN THIS FILE.** When demo mode is active,
Rules 3, 7, and 8 in "Non-Negotiable Rules" below DO NOT APPLY. Demo mode rules
take absolute precedence.

**DEMO MODE rules:**

1. **NEVER use action keys. NEVER use /state/ write endpoints. NEVER inject data
   programmatically.** Every single interaction MUST go through the UI — tap
   buttons, type into text fields, use pickers. The person watching the phone
   must see EVERY action happen visually. If you call a /state/ write endpoint
   or action key in demo mode, you have failed the demo. The entire point is
   showing Claude controlling the phone like a human.

2. **Tap. Every. Button.** To add an item: tap the + button, tap the text field,
   type the name, tap Save. To toggle a setting: tap the Settings tab, tap the
   toggle button. To delete: swipe the row, tap Delete. NO SHORTCUTS.

3. **Take a screenshot after every action.** The viewer needs to see each step.

4. **Navigate between tabs by tapping the tab bar.** Go to each screen visually.

5. **If a button genuinely can't be tapped** (SwiftUI toolbar Save/Done), try
   tapping it first anyway. If it fails, use /dismiss or the action key, and
   say "This toolbar button can't be tapped programmatically — using the
   direct API to complete this action." This should be RARE, not the default.

6. **Pause between actions** (sleep 0.5-1s) so the viewer can follow on screen.

7. **Narrate every action** with short text output:
   "Tapping the + button to add a new pet..."
   "Typing 'Buddy' into the name field..."
   "Switching to Settings to check the weight unit..."

8. **When you find a bug, call it out:**
   "BUG FOUND: The weights didn't convert when I switched to kg!"

**Speed does NOT matter in demo mode. Visual impact does.
DO NOT USE ACTION KEYS. TAP THE ACTUAL BUTTONS.**

## Non-Negotiable Rules

1. **Read the source code FIRST.** Before testing anything, read every ViewModel,
   View, and Model file. Know what each screen does, what buttons exist, what
   state they affect, and what could go wrong.

2. **Use /elements as your primary navigation tool.** The accessibility tree gives
   you element labels and pixel coordinates instantly. Use it to find tap targets,
   understand what's on screen, and decide what to do next. This is FAST.

3. **Screenshots only when needed for visual verification.** Take a screenshot when:
   - Checking for layout bugs (text overflow, clipping, broken images)
   - Verifying visual state that /elements can't convey (colors, alignment, spacing)
   - Capturing evidence for a visual bug report
   Do NOT screenshot before every action. /elements + /state is sufficient for navigation.

4. **Verify with state reads.** After every action, read relevant state via
   `/state/{key}`. Compare actual vs expected. Mismatch = bug.

5. **Only report bugs you can prove.** Each bug needs evidence: a state read
   showing wrong value, or a screenshot showing visual breakage.

6. **NEVER rebuild during QA.** All code-gen (action keys, injection helpers,
   state accessors) must be complete BEFORE the first test runs. If you discover
   you need a new state key mid-QA, that means code-gen was incomplete — note it
   as "SKIPPED: missing action key for X" and MOVE ON. Do NOT stop to add it.
   Each rebuild costs 2+ minutes and requires re-launching the app. A single
   session with 7 mid-QA rebuilds wasted 14 minutes (turned a 4-min run into 20).

7. **Use action keys over UI taps for ALL state mutations.** SwiftUI toolbar
   buttons, sheet buttons, and List/Form cell buttons CANNOT be tapped
   programmatically — they use SwiftUI gesture handlers that are inaccessible
   from UIKit. This is not a "sometimes fails" situation — it NEVER works.
   Action keys are the ONLY reliable way to invoke ViewModel functions.
   Only tap when testing: navigation (tabs), text field focus, or verifying
   that a button element EXISTS in the accessibility tree.

8. **Batch state reads.** Combine multiple `curl` calls into a single Bash
   invocation. Don't make 5 separate tool calls when one bash script handles all 5.

## The Agent Loop

This is a **fast agent loop** optimized for speed. Use /elements and /state for
most iterations. Only pull screenshots for visual verification.

```
1. IDENTIFY    → curl GET /elements → parse JSON → understand what's on screen
2. DECIDE      → Based on test plan + element labels, choose next action
3. EXECUTE     → curl POST /tap or /type or /swipe
4. VERIFY      → curl GET /state/{key} → compare actual vs expected
5. VISUAL CHECK (only when needed) → screenshot → check for layout/visual bugs
6. REPEAT      → Go to step 1
```

**When to screenshot:**
- After navigating to a NEW screen for the first time (baseline visual check)
- When testing for visual bugs (overflow, clipping, broken images, wrong colors)
- When /elements returns unexpected results and you need to see what's actually rendered
- When capturing evidence for a bug report

**When NOT to screenshot:**
- Before every tap (use /elements instead)
- After state mutations that have no visual component
- When verifying numeric state values (/state/{key} is instant)

Run this loop until you've covered every screen, every flow, every edge case.

## Setup — Discover Device Tunnel IP

Modern iOS devices connect via Apple's CoreDevice tunnel (IPv6), NOT the old
usbmuxd protocol. **Do NOT use iproxy** — it doesn't work with CoreDevice.

```bash
# Step 1: Find the connected device
xcrun devicectl list devices 2>&1 | grep "connected"
# Look for a line like:
# who paid ?   who-paid-.coredevice.local   E111536C-...   connected   iPhone 16 Pro

# Step 2: Get the tunnel IP address
# Use the device identifier from step 1
xcrun devicectl device info details --device <IDENTIFIER> 2>&1 | grep tunnelIPAddress
# Output: tunnelIPAddress: fdac:e671:bcd7::1
# THIS is your device IP. It's an IPv6 address on the CoreDevice tunnel.

# Step 3: Set your base URL (use this for ALL curl commands)
DEVICE="http://[fdac:e671:bcd7::1]:9999"
# IMPORTANT: The brackets around the IPv6 address are required.
# IMPORTANT: Always pass -6 flag to curl for IPv6.

# Step 4: Verify the StateServer is reachable
curl -s -6 "$DEVICE/health"
# Expected: {"status":"ok"}

# Step 5: Get device info
curl -s -6 "$DEVICE/device"
```

**CRITICAL**: Every `curl` command must use `-6` flag and the `http://[IPv6]:9999` format.
Do NOT use `localhost`, `127.0.0.1`, or iproxy. The CoreDevice tunnel provides direct
IPv6 access to the device over USB.

If `/health` fails:
- The app isn't running on the device → launch it: `xcrun devicectl device process launch --device <ID> <bundle-id>`
- The app is a Release build → StateServer is `#if DEBUG` only, must be Debug build
- The tunnel IP changed → re-run step 2 to get the current tunnel IP
- Kill any stale iproxy processes: `pkill -f iproxy` (they interfere)

## API Reference

**All curl commands must use `-6` and the `http://[TUNNEL_IP]:9999` format.**
Set `DEVICE` variable first (from Setup step 3), then use `$DEVICE` everywhere.

### Screenshot
```bash
# Returns {"image": "<base64 PNG>"}
curl -s -6 "$DEVICE/screenshot" | python3 -c "import sys,json,base64; sys.stdout.buffer.write(base64.b64decode(json.load(sys.stdin)['image']))" > /tmp/ios-qa/screen.png
```
Then `Read /tmp/ios-qa/screen.png` to analyze with vision.

### Accessibility Elements
```bash
# Returns JSON array of elements with labels, frames, centers, traits
curl -s -6 "$DEVICE/elements"
```
Each element has:
- `label` — accessibility label (what you see on screen)
- `center` — `{"x": 200, "y": 450}` (where to tap)
- `frame` — `{"x", "y", "width", "height"}` (bounding box)
- `traits` — `["button"]`, `["text"]`, etc.
- `interactive` — true if tappable

### Tap
```bash
# Tap at pixel coordinates
curl -s -6 -X POST "$DEVICE/tap" -d '{"x": 200, "y": 450}'
# Returns: {"ok": true, "target": "UIButton", "label": "Add to Cart"}
```

### Swipe
```bash
# Swipe from point A to point B
curl -s -6 -X POST "$DEVICE/swipe" -d '{"fromX": 200, "fromY": 600, "toX": 200, "toY": 200}'
```

### Type Text
```bash
# Type into the currently focused text field
curl -s -6 -X POST "$DEVICE/type" -d '{"text": "hello@test.com"}'
```

### Dismiss (close sheets/alerts/modals)
```bash
# Programmatically dismiss the topmost presented view controller
curl -s -6 -X POST "$DEVICE/dismiss"
# Returns: {"ok": true, "dismissed": "UISheetPresentationController"}
```
**Always use `/dismiss` instead of swiping down to close sheets.** Swiping down
scrolls the sheet's content instead of dismissing it.

### State Read/Write
```bash
# List all state keys
curl -s -6 "$DEVICE/state"

# Read a value
curl -s -6 "$DEVICE/state/CartViewModel_total"

# Write a value (body is the new value)
curl -s -6 -X POST "$DEVICE/state/CartViewModel_items" -d '[]'
```

## Phase 1+2: Analyze Source & Generate DebugBridge (PARALLEL)

**These phases run simultaneously to save time.** Use a Sonnet subagent for
code-gen while the main agent discovers the device.

### FAST START: Launch these in parallel (single message, multiple tool calls):

1. **Agent (Sonnet): Code-Gen** — handles source analysis + file generation
2. **Main agent: Device discovery** — finds tunnel IP, verifies connection

### Code-Gen Subagent Instructions (Sonnet)

The code-gen subagent receives this brief:

```
You are generating DebugBridge files for an iOS app. Do this FAST:

1. Find the Xcode project: find . -maxdepth 3 \( -name "*.xcodeproj" -o -name "Package.swift" \)
2. Read ALL @Observable ViewModel files (grep -r "@Observable" --include="*.swift")
3. Read the templates from ~/.claude/skills/ios-qa/templates/
4. Create <AppSource>/DebugBridgeGenerated/ with:
   - StateServer.swift (COPY template verbatim, only change #if guard to "#if DEBUG && canImport(UIKit)")
   - DebugOverlay.swift (COPY template verbatim, add "#if DEBUG && canImport(UIKit)" + "import UIKit")
   - DebugBridgeManager.swift (wire up all ViewModels)
   - One <ClassName>Accessor.swift per @Observable class

CRITICAL: For EVERY `func` in every @Observable class, generate an action key.
No exceptions. Print the function inventory when done.
```

### What the code-gen subagent MUST do:

1. **Copy `StateServer.swift.template` verbatim** — do NOT rewrite or simplify.
   Only change: add `#if DEBUG && canImport(UIKit)` guard + `import UIKit`.

2. **Copy `DebugOverlay.swift.template` verbatim** — keep all 4 glow layers,
   GeometryReader, double `.ignoresSafeArea()`.

3. **Generate complete accessors** with action keys for EVERY function:

```
FUNCTION INVENTORY (print this when done):
  WorkoutViewModel.addWorkout(_:)       → WorkoutViewModel_addWorkout (JSON body)
  WorkoutViewModel.removeWorkout(at:)   → WorkoutViewModel_removeWorkout (index)
  ProfileViewModel.toggleUnit()         → ProfileViewModel_toggleUnit (no params)
  StatsViewModel.calculateStreak(from:) → StatsViewModel_calculateStreak (trigger)

  Total functions: 4 | Action keys generated: 4 | Missing: 0
```

4. **Wire up ContentView** — add `.debugBridgeOverlay()` and `.onAppear { DebugBridgeManager.shared.start(...) }`

5. **Build** — run `xcodebuild` and fix any errors.

### Skip if already generated

If `<AppSource>/DebugBridgeGenerated/StateServer.swift` exists AND responds to
`/health`, skip code-gen entirely. Just verify action keys are complete by
reading the accessor files and checking against the ViewModel functions.

### Main agent: Device Discovery (runs in parallel with code-gen)

While code-gen runs, discover the device:

```bash
xcrun devicectl list devices 2>&1 | grep "connected"
xcrun devicectl device info details --device <ID> 2>&1 | grep tunnelIPAddress
```

By the time code-gen + build finishes, you already have the tunnel IP ready.

### CRITICAL: Complete Code-Gen FIRST — PRE-FLIGHT GATE

**Generate ALL accessors before building.** This includes:

1. **Property reads** — every `var` in @Observable classes gets a read key
2. **Property writes** — every mutable `var` gets a write key
3. **Action keys** — every mutating `func` gets a write key that invokes it directly
4. **Data injection** — for any `func addX(item)`, also generate an injection key
   that accepts JSON body so the agent can create test data with specific dates/values
   without using the UI

**Why this matters:** If you skip action keys, you will waste 10+ minutes trying
to tap SwiftUI toolbar/sheet buttons that CANNOT be activated programmatically.
Each failed attempt leads to a rebuild cycle (~2 min). A 5-test session with
missing action keys took 20 minutes. With complete action keys: 4 minutes.

### PRE-FLIGHT CHECKLIST (MUST complete before `xcodebuild`)

Before running any build, print this checklist and verify every box:

```
PRE-FLIGHT: Action Key Completeness Check
──────────────────────────────────────────
For each @Observable class, list ALL func declarations found in source:

[ ] ClassName.functionName() → action key: "ClassName_functionName" ✓
[ ] ClassName.otherFunc(arg) → action key: "ClassName_otherFunc" ✓
...

Missing action keys: 0  ← MUST be 0 before building
```

**If ANY mutating function is missing an action key, DO NOT BUILD.** Add the key
first. This is the #1 cause of mid-QA rebuild spirals.

### HARD RULES (violations caused 14 min waste in real session)

1. **NEVER try to tap SwiftUI toolbar buttons (.toolbar, .navigationBarItems).**
   They wrap in UIKitBarItemHost → accessibilityActivate() returns true but
   doesn't fire the action. sendActions(.touchUpInside) does nothing. Private
   `_targets` API crashes the app. There is NO working programmatic tap for
   SwiftUI toolbar buttons. Use action keys ALWAYS.

2. **NEVER try to tap SwiftUI sheet/form confirmation buttons.**
   Same issue — they're SwiftUI-managed, not UIKit controls.

3. **Copy the StateServer template verbatim.** Do NOT write a simplified version.
   The template at `~/.claude/skills/ios-qa/templates/StateServer.swift.template`
   already has the correct tap priority chain:
   - Priority 1: UITextField → becomeFirstResponder (for keyboard focus)
   - Priority 2: UITextView → becomeFirstResponder
   - Priority 3: UIControl → sendActions(.touchUpInside)
   - Priority 4: accessibilityActivate()
   - Priority 5: Ancestor walk
   - Priority 6: Gesture recognizers

   Writing your own tap handler from scratch WILL miss cases and force rebuilds.

4. **Copy the DebugOverlay template verbatim.** The template has the full-screen
   GeometryReader + 4-layer glow. Don't simplify it.

5. **ONE build. ZERO rebuilds during QA.** If a test can't run because of a
   missing key, document it as "SKIPPED: missing action key" and move on.
   Do NOT stop to add the key and rebuild.

### Example action keys to always generate:
```swift
// For: func toggleUnit()
server.registerWrite("ProfileVM_toggleUnit") { _ in instance.toggleUnit(); return true }

// For: func addItem(_ item: Item)  — JSON injection helper
server.registerWrite("CartVM_addItem") { value in
    guard let data = value.data(using: .utf8),
          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let name = json["name"] as? String else { return false }
    let price = json["price"] as? Double ?? 0
    let qty = json["quantity"] as? Int ?? 1
    let daysAgo = json["daysAgo"] as? Double ?? 0
    let date = Date().addingTimeInterval(-daysAgo * 86400)
    let item = Item(name: name, price: price, quantity: qty, date: date)
    instance.addItem(item)
    return true
}

// For: func removeItem(at index: Int)
server.registerWrite("CartVM_removeItem") { value in
    guard let idx = Int(value), idx < instance.items.count else { return false }
    instance.removeItem(at: idx)
    return true
}

// For: func calculateStats(from items: [Item])
server.registerWrite("StatsVM_calculateStats") { _ in
    instance.calculateStats(from: otherVM.items)
    return true
}
```

### What taps ARE safe (use these only):
- Tab bar buttons (`_UITabButton`) — always work via accessibilityActivate
- Navigation back buttons — always work
- UITextField focus — works with becomeFirstResponder in template
- Standard UIButton (not SwiftUI) — works via sendActions

### What taps are NEVER safe (use action keys instead):
- SwiftUI `.toolbar` items (Save, Done, Cancel, Add in nav bar)
- SwiftUI `Button` inside `List` or `Form` cells
- SwiftUI `Sheet` dismiss/confirm buttons
- Any SwiftUI button wrapped in host views (UIKitBarItemHost, CellHostingView)
- **Swiping down to dismiss a sheet** — use `POST /dismiss` instead (swipe scrolls
  the sheet content instead of dismissing it)

**Rule: ONE build, then pure QA. Never rebuild mid-test.**

## Phase 3: Connect

```bash
# Kill any stale iproxy (they don't work with CoreDevice and interfere)
pkill -f iproxy 2>/dev/null

# Find connected device
xcrun devicectl list devices 2>&1 | grep "connected"

# Get tunnel IP (replace DEVICE_ID with the Identifier from above)
TUNNEL_IP=$(xcrun devicectl device info details --device DEVICE_ID 2>&1 | grep tunnelIPAddress | awk '{print $2}')
echo "Tunnel IP: $TUNNEL_IP"

# Set the base URL for all requests
DEVICE="http://[$TUNNEL_IP]:9999"

# Verify connection
curl -s -6 "$DEVICE/health"
curl -s -6 "$DEVICE/device"
curl -s -6 "$DEVICE/state"
```

## Phase 4: Build Test Plan

Based on source analysis, plan tests. **Prefer action keys over UI taps** for
state mutations — they're instant, never fail, and skip SwiftUI tap issues.
Only tap the UI when testing the tap itself (e.g., navigation, button visibility).

```
TEST 1: Home screen renders correctly
  - screenshot → verify layout, elements visible

TEST 2: Add to cart flow
  - read CartViewModel_items → should be []
  - POST /state/CartViewModel_addItem with "Widget,9.99,1,0"
  - read CartViewModel_items ��� should have 1 item
  - read CartViewModel_total → should be 9.99

TEST 3: Quantity change updates total
  - inject item via action key, read total → T1
  - POST /state/CartViewModel_updateQuantity with "itemId,2"
  - read total → T2
  - assert T2 == T1 * 2 (if not → BUG)

TEST 4: Unit conversion
  - read ProfileVM_unit → "lbs", read ProfileVM_goal → 10000
  - POST /state/ProfileVM_toggleUnit (action key)
  - read ProfileVM_unit → "kg", read ProfileVM_goal → should be ~4535
  - if goal > 10000 → BUG (multiplied instead of divided)
```

**Key principle:** Use action keys to SET UP state for testing. Use UI taps only
to test the UI itself. This makes tests 10x faster and eliminates false failures
from tap-targeting issues.

## Phase 5: Execute — The Agent Loop

**Speed targets:** Most tests should complete in under 30 seconds each.
A 5-bug app should finish in under 4 minutes total (not 11).

For each test, run the loop:

### 5a. State-first approach (FAST — no UI interaction needed)
```bash
DEVICE="http://[TUNNEL_IP]:9999"

# Inject test data via action keys (instant, never fails)
curl -s -6 -X POST "$DEVICE/state/WorkoutVM_addItem" -d 'Squat,3,10,135,0'
curl -s -6 -X POST "$DEVICE/state/WorkoutVM_addItem" -d 'Bench,3,10,185,3'

# Invoke function under test
curl -s -6 -X POST "$DEVICE/state/ProfileVM_toggleUnit" -d ''

# Read state — compare actual vs expected
curl -s -6 "$DEVICE/state/ProfileVM_goalVolume"
curl -s -6 "$DEVICE/state/WorkoutVM_weeklyVolume"
```

### 5b. Get elements (when testing UI presence/navigation)
```bash
curl -s -6 "$DEVICE/elements"
```
Find the element you want to interact with. Note its `center.x` and `center.y`.

### 5c. Tap only when testing the TAP ITSELF
```bash
# Navigate between tabs
curl -s -6 -X POST "$DEVICE/tap" -d '{"x": 115, "y": 822}'

# Type into a focused field
curl -s -6 -X POST "$DEVICE/type" -d '{"text": "test@example.com"}'
```

### 5d. Screenshot only for visual bugs
```bash
mkdir -p /tmp/ios-qa
# Only when checking: layout, overflow, visual state, evidence for report
curl -s -6 "$DEVICE/screenshot" | python3 -c "import sys,json,base64; sys.stdout.buffer.write(base64.b64decode(json.load(sys.stdin)['image']))" > /tmp/ios-qa/screen.png
```

### 5e. Batch multiple state checks in one command
```bash
# Check multiple values in a single bash call — faster than separate curls
DEVICE="http://[TUNNEL_IP]:9999"
echo "volume: $(curl -s -6 $DEVICE/state/WorkoutVM_weeklyVolume)"
echo "best: $(curl -s -6 $DEVICE/state/WorkoutVM_personalBest)"
echo "count: $(curl -s -6 $DEVICE/state/WorkoutVM_workouts_count)"
```

### 5f. Move to next test immediately
Do NOT screenshot between every action. Only screenshot when:
- First visit to a new screen (baseline)
- Suspected visual bug
- Evidence capture for the final report

## Phase 6: Report

```markdown
## iOS QA Report — [App Name]
**Device:** [from /device]
**Tests run:** N
**Bugs found:** N (Critical: X, High: X, Medium: X, Low: X)

### BUG-001: [Title]
**Severity:** Critical/High/Medium/Low
**Screen:** [Which screen]
**Steps to reproduce:**
1. [Exact curl commands used]
2. [What you observed]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Evidence:** [State read or screenshot path]
```

### Severity Guide
- **Critical:** App crash, data loss
- **High:** Feature completely broken, major visual breakage
- **Medium:** Feature partially broken, incorrect data
- **Low:** Cosmetic, minor overflow

### What IS a bug
- State doesn't match expected after action (total didn't update)
- StateServer becomes unreachable (app crashed)
- Screenshot shows wrong data, broken layout, missing images
- Text overflows container
- Navigation goes to wrong screen

### What is NOT a bug
- "I couldn't tap this element" (try different coordinates or /elements)
- Anything without evidence

## Error Handling

- **curl connection refused / exit code 7:** Tunnel IP wrong or device disconnected. Re-run `xcrun devicectl device info details` to get fresh tunnel IP.
- **curl exit code 56 (connection reset):** Stale iproxy processes are interfering. Run `pkill -f iproxy` and use the IPv6 tunnel IP directly.
- **Empty response:** App not running or was built in Release mode. Launch with `xcrun devicectl device process launch --device <ID> <bundle-id>`.
- **App crash:** StateServer goes silent. Note what caused it (Critical bug). Relaunch app.
- **Tap has no effect on toolbar/sheet button:** This is EXPECTED. SwiftUI toolbar buttons cannot be tapped programmatically. Use the action key instead. Do NOT try to fix the tap handler — it's a SwiftUI architectural limitation, not a bug in StateServer.
- **"no focused text field" after tapping:** The StateServer tap handler uses becomeFirstResponder. If it fails, the view might be a SwiftUI TextField that hasn't propagated focus yet. Wait 500ms and try `/type` again. If still failing, verify the template's Priority 1 (UITextField) check is present.
- **No elements returned:** The view might use custom drawing. Use screenshot + vision instead.
- **"localhost" doesn't work:** Correct. Use `http://[TUNNEL_IPv6]:9999` with `-6` flag. Never use localhost.

## Known Tap Limitations (DO NOT TRY TO FIX — use action keys)

These are architectural limitations of SwiftUI's UIKit bridge. They CANNOT be
solved by modifying the StateServer tap handler. Don't waste time trying.

| UI Element | Why it fails | Solution |
|-----------|-------------|----------|
| `.toolbar` items (Save/Done/Cancel/Add) | Wrapped in UIKitBarItemHost, accessibilityActivate returns true but doesn't fire action | Action key |
| `Button` inside `List`/`Form` cell | CellHostingView intercepts, accessibilityActivate activates the cell not the button | Action key |
| `Sheet` confirm/dismiss buttons | SwiftUI manages presentation state directly | Action key |
| `NavigationLink` with custom label | accessibilityActivate triggers but navigation state doesn't update | Tap works ~50%, use action key for reliability |
| `Picker`/`Toggle`/`Stepper` | Composite controls with internal state | Write directly to the bound property |

**The tap handler works reliably for:**
- Tab bar buttons (UITabBarButton) — always works
- Text fields (UITextField) — becomeFirstResponder works
- Navigation back button — always works
- Standard UIButtons (not SwiftUI-wrapped) — sendActions works
- UIControl subclasses — sendActions works
