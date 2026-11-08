# Gridiron Life v0.603 — Career Systems Repair

Based on v0.602 Refactored Creator. Contains a late-loading `js/80-v0603-repair.js` so the core v0.602 source stays available for comparison.

## Changes
- A stage-aware week key (`HS`, `COLLEGE`, `NFL`) resets temporary hours when calendar weeks change. Old NFL saves with stuck hours self-repair on first load.
- Spending cooldown for Weekend Outing and household support now uses the active career week.
- NFL Development screen presents training, personal time and recovery; legacy high-school study/work allocations are cleared once for NFL saves.
- NFL stress breakdown no longer includes school-course failures or high-school job stress.
- Targeted NFL training adds measured progress per allocated focus hour, adjusted for fatigue and intensity, with recovery hours helping fatigue.
- Purchase success/failure messages now include money spent, hour use and changes in morale/stress. A visible action-status toast is available across pages.
- NFL Life store hides school-only items, while preserving past transactions and owned purchases.
- v0.603 version label and cache query updated.

## Save compatibility
The original v0.602 JSON can be loaded in the new build. The first load resets any stale activity hours for the current pro/college week. A separately repaired `Jordan_King_v0.603_Repaired_Save.json` is provided as a convenience. Keep backups of your originals.

## Testing
Script syntax check and mock-runtime tests passed for stuck-hour reset, week rollover, cooldown enforcement, spending and NFL academic stress. Not a full browser playthrough; keep an eye on long-season balance and report anything unexpected.
