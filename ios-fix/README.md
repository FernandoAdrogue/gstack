# /ios-fix — Autonomous iOS Bug Fixer

Closes the loop: **AI found the bug → AI fixed the bug → AI verified the fix.**

## What it does

Given a bug report (from `/ios-qa` or described by the user), this skill:

1. Reads the Swift source to understand the root cause
2. Writes a minimal, surgical fix
3. Rebuilds and redeploys to the real device via USB
4. Verifies the fix on-device via StateServer
5. Outputs a structured report with before/after evidence

## Usage

```
/ios-fix
```

Works best after `/ios-qa` has identified bugs. The full autonomous loop:

```
/ios-qa          → finds 4 bugs
/ios-fix         → fixes all 4, one at a time, verified on device
/ios-qa          → re-runs, confirms 0 bugs remain
```

## Requirements

- Same as `/ios-qa`: real iPhone via USB, app with DebugBridge, Debug build
- Xcode installed (for `xcodebuild`)
- The app's source code in the current working directory

## What makes this different

Other tools find bugs. This one **fixes them too** — and proves the fix works
on the real device. No simulator. No mocks. Real code, real device, real fix.
