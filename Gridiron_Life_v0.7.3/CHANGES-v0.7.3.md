# Gridiron Life v0.7.3 — Targeted Stabilization

Built from v0.7.2 Structural Correction, without replacing the existing save schema (still version 6).

## Confirmed fixes

- Integrated the high-school NPC academics, NPC development, and physical growth week hooks directly into the authoritative `applyWeek` implementation. Removed the superseded `applyWeek` wrappers from files 75, 77, 78 and 79. The existing Part 9 weekly exposure wrapper remains; full UI/college override consolidation is not part of this patch.
- Integrated teammate year-end GPA snapshots into `startNextSchoolYear` and removed its wrapper.
- Fixed an NFL lifecycle accounting issue: an unsigned year is recorded only for a year actually elapsed, once. Camp cuts are recorded once and upcoming unsigned years are not pre-recorded.
- Made existing wear and injury history modify age-related physical decline and retirement decisions; no new damage system or new injury state. These changes require additional long-run balance testing.
- Reduced specialist technical growth as the relevant skill gets into elite ranges. Kept all 22 skill mappings and the existing OVR formulas intact. This is a small provisional balance correction, not a claim of statistical realism.
- Show games played next to each NFL career-history year; renamed the row `Pro year` so unsigned time is not represented as a season played.

## Verification

- `node --check` for all 31 JS modules.
- `node tests/v073-targeted-regression.cjs /path/to/save.json` (runs without browser dependencies): production scripts load in actual HTML order; save migration, 22-position skill coverage, annual unsigned accounting, wear-based age, high-school weekly advancement, and low/moderate/dedicated training comparisons across all 22 positions. Tested with exported Jordan Carter save #11.
- ZIP integrity check.

## Limitations

The earlier full 198-career audit was run by Claude on v0.7.2, **not** v0.7.3. This package has not been subjected to a full headless browser or 198-career run (Playwright is not installed in this runtime). Existing college and NFL match simulators are still separate. UI override stacks are still present and not described as consolidated. Keep a backup of saves and test in a browser before replacing the live release.
