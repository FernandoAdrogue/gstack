---
name: ios-sync
version: 2.0.0
description: |
  Full iOS debug bridge resync. Pulls the latest templates from the canonical
  gstack source, then regenerates ALL DebugBridgeGenerated/ files in the app —
  including fresh action keys for every ViewModel function. Use this whenever
  you add new buttons, new ViewModels, or update the templates. Rebuilds and
  redeploys to device automatically.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - ios sync
  - ios-sync
  - update ios templates
  - fetch ios templates
  - sync ios skills
  - regenerate hooks
  - regen debug bridge
  - new buttons added
---

{{PREAMBLE}}

# iOS Sync — Resync Templates + Regenerate App Hooks

Two-phase sync: (1) pull the latest gstack templates to `~/.claude/skills/ios-qa/templates/`,
then (2) wipe and regenerate `DebugBridgeGenerated/` in the app from scratch — picking
up any new ViewModels, new functions, and new buttons added since the last run.

**Run this whenever you:**
- Add a new button, screen, or ViewModel function to the app
- Pull new template updates from gstack
- Want a clean regeneration of all action keys

---

## Phase 1: Sync Templates

### Step 1: Find the canonical source

Check for a local gstack fork first (faster, no network):

```bash
for DIR in \
  ~/gstack-fork \
  ~/emdash/gstack \
  ~/code/gstack \
  ~/.claude/skills/gstack-source; do
  if [ -d "$DIR/ios-qa/templates" ]; then
    echo "FOUND_LOCAL: $DIR"
    break
  fi
done
```

If no local fork found, clone from GitHub:

```bash
SYNC_TMP="/tmp/ios-sync-source"
if [ -d "$SYNC_TMP/.git" ]; then
  git -C "$SYNC_TMP" pull --ff-only 2>&1 | tail -2
else
  git clone --depth=1 https://github.com/time-attack/gstack.git "$SYNC_TMP" 2>&1 | tail -3
fi
SOURCE="$SYNC_TMP/ios-qa"
```

### Step 2: Install templates + skill files

```bash
mkdir -p ~/.claude/skills/ios-qa/templates/
cp "$SOURCE/templates/"*.template ~/.claude/skills/ios-qa/templates/

SOURCE_ROOT=$(dirname "$SOURCE")
for SKILL in ios-qa ios-fix ios-design-review ios-clean ios-sync; do
  SRC_SKILL="$SOURCE_ROOT/$SKILL"
  DST_SKILL=~/.claude/skills/$SKILL
  if [ -f "$SRC_SKILL/SKILL.md.tmpl" ]; then
    mkdir -p "$DST_SKILL"
    cp "$SRC_SKILL/SKILL.md.tmpl" "$DST_SKILL/SKILL.md"
    echo "Updated skill: $SKILL"
  fi
done

echo "Templates installed."
```

---

## Phase 2: Regenerate App Hooks

### Step 3: Find the app

```bash
find . -maxdepth 3 -name "*.xcodeproj" -not -path "*/DebugBridge/*" 2>/dev/null
```

Identify the app source directory (the folder next to the `.xcodeproj`).

### Step 4: Re-read all ViewModels

```bash
grep -rn "@Observable" --include="*.swift" .
```

Read every `@Observable` class in full. For each one, build a complete inventory:

```
ViewModel Inventory:
  PetViewModel
    vars:   pets, selectedPetId, totalPets, recommendation
    funcs:  addPet(_:), removePet(at:), recommendNextPet()

  CareViewModel
    vars:   tasks
    funcs:  addTask(_:), deleteTasks(for:), completeTask(id:)
```

**Compare against the existing `DebugBridgeGenerated/` accessor files:**

```bash
grep -rn "registerWrite\|registerRead" <AppSource>/DebugBridgeGenerated/ 2>/dev/null
```

Report what's new (functions added since last generation), what's stale (functions
removed), and what's unchanged. This is the diff that tells you what hooks changed.

### Step 5: Wipe and regenerate DebugBridgeGenerated/

```bash
rm -rf <AppSource>/DebugBridgeGenerated/
mkdir -p <AppSource>/DebugBridgeGenerated/
```

Then regenerate every file from the latest templates:

**StateServer.swift** — copy `~/.claude/skills/ios-qa/templates/StateServer.swift.template`
verbatim. Only change: add `#if DEBUG && canImport(UIKit)` guard + `import UIKit`.

**DebugOverlay.swift** — copy `~/.claude/skills/ios-qa/templates/DebugOverlay.swift.template`
verbatim. Add `#if DEBUG && canImport(UIKit)` guard + `import UIKit`.

**DebugBridgeManager.swift** — copy `~/.claude/skills/ios-qa/templates/DebugBridgeManager.swift.template`
and wire in every ViewModel that was found. Call `.start(vmA: ..., vmB: ...)`.

**One `<ClassName>Accessor.swift` per @Observable class** — using
`~/.claude/skills/ios-qa/templates/StateAccessor.swift.template` as the pattern.

For EVERY `var` in the class: generate a read key.
For EVERY mutable `var`: generate a write key.
For EVERY `func`: generate an action key.

**No exceptions. Every single function gets an action key.**

Print the complete function inventory when done:

```
FUNCTION INVENTORY (regenerated):
  PetViewModel.addPet(_:)          → PetVM_addPet          ✓
  PetViewModel.removePet(at:)      → PetVM_removePet        ✓
  PetViewModel.recommendNextPet()  → PetVM_recommendNextPet ✓  ← NEW
  CareViewModel.addTask(_:)        → CareVM_addTask         ✓
  CareViewModel.deleteTasks(for:)  → CareVM_deleteTasks     ✓
  CareViewModel.completeTask(id:)  → CareVM_completeTask    ✓

  Total functions: 6 | Action keys: 6 | Missing: 0
```

### Step 6: Build

```bash
xcodebuild -project <project>.xcodeproj \
  -scheme <scheme> \
  -destination "generic/platform=iOS" \
  -configuration Debug \
  build 2>&1 | grep -E "error:|warning:|BUILD"
```

Fix any errors. Do NOT move on until `BUILD SUCCEEDED`.

### Step 7: Deploy and verify

```bash
# Find device
xcrun devicectl list devices 2>&1 | grep connected

# Deploy
xcrun devicectl device install app --device <DEVICE_ID> <APP_PATH>

# Launch
xcrun devicectl device process launch --device <DEVICE_ID> <BUNDLE_ID>

# Get tunnel IP and verify
TUNNEL_IP=$(xcrun devicectl device info details --device <DEVICE_ID> 2>&1 | grep tunnelIPAddress | awk '{print $2}')
curl -s -6 "http://[$TUNNEL_IP]:9999/health"
curl -s -6 "http://[$TUNNEL_IP]:9999/state"
```

`/state` should list ALL action keys including any newly added ones.

### Step 8: Update session cache

Write the refreshed session to `~/.gstack/ios-qa-session.json` so the next
`/ios-qa` warm-start picks up the new function inventory:

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
print('Session cache updated.')
"
```

---

## Report

```
iOS Sync complete.

Phase 1 — Templates:
  ✓ StateServer.swift.template    (changed / same)
  ✓ DebugOverlay.swift.template   (changed / same)
  ✓ DebugBridgeManager.swift.template
  ✓ StateAccessor.swift.template
  ✓ DebugBridgeJSON.swift.template
  ✓ Package.swift.template

Phase 2 — App Regeneration:
  New since last sync:
    + PetVM_recommendNextPet  (func recommendNextPet() added)
    + CareVM_completeTask     (func completeTask(id:) added)
  Removed:
    - PetVM_oldFunction       (func removed from ViewModel)
  Unchanged: 4 action keys

  Build: SUCCEEDED
  Deploy: SUCCEEDED
  Health: {"status":"ok"}
  Action keys registered: 6

Next /ios-qa run will use warm start with the updated function inventory.
```
