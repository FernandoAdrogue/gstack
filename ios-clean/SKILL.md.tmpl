---
name: ios-clean
version: 1.0.0
description: |
  Remove all DebugBridge files and references from an iOS app.
  Cleans up everything injected by /ios-qa: StateServer, DebugOverlay,
  accessors, manager, and all #if DEBUG wiring in ContentView/App files.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Glob
  - Grep
triggers:
  - ios clean
  - ios-clean
  - remove debug bridge
  - clean debug bridge
  - uninstall ios qa
---

{{PREAMBLE}}

# iOS Clean — Remove DebugBridge

Remove all DebugBridge/iStack files and references injected by `/ios-qa`.
This skill is non-destructive to app code — it only removes debug instrumentation.

## Step 1: Find the app source directory

```bash
find . -maxdepth 3 -name "*.xcodeproj" -not -path "*/DebugBridge/*"
```

Identify the app source directory (the folder next to the .xcodeproj).

## Step 2: Delete the DebugBridgeGenerated directory

```bash
rm -rf <AppSource>/DebugBridgeGenerated/
```

This removes:
- `StateServer.swift`
- `DebugOverlay.swift`
- `DebugBridgeManager.swift`
- All `*Accessor.swift` files
- `DebugBridgeJSON.swift` (if present)

## Step 3: Delete the DebugBridge package (if exists)

```bash
rm -rf DebugBridge/
```

## Step 4: Remove references from app code

Search for and remove all DebugBridge wiring in the app's source files:

```bash
grep -rn "DebugBridgeManager\|debugBridgeOverlay\|DebugOverlayWindow\|DebugBridgeNotifier" --include="*.swift" .
```

For each file found:

1. **ContentView.swift / App file** — Remove the `#if DEBUG` block that calls
   `DebugBridgeManager.shared.start(...)` and `.debugBridgeOverlay()`.
   Keep the rest of the file intact.

2. **Any other file** — Remove `import DebugBridge` lines and any `#if DEBUG`
   blocks that reference DebugBridge types.

### What to remove (examples):

```swift
// REMOVE this entire block:
#if DEBUG && canImport(UIKit)
.debugBridgeOverlay()
.onAppear {
    DebugBridgeManager.shared.start(
        workoutVM: workoutVM,
        statsVM: statsVM,
        profileVM: profileVM
    )
}
#endif

// REMOVE this line:
import DebugBridge
```

### What NOT to remove:
- Any app code that isn't DebugBridge-related
- Other `#if DEBUG` blocks that belong to the app
- Test files, previews, or other debug-only app code

## Step 5: Verify clean build

```bash
xcodebuild -project <project>.xcodeproj -scheme <scheme> -destination "generic/platform=iOS" -configuration Debug build 2>&1 | grep -E "error:|BUILD"
```

If there are build errors referencing removed types, fix them (likely a missed
reference in a file not caught in Step 4).

## Step 6: Report

```
iOS Clean complete.
Removed:
- <AppSource>/DebugBridgeGenerated/ (N files)
- DebugBridge/ package (if existed)
- References in: ContentView.swift, ...
Build: SUCCEEDED
```
