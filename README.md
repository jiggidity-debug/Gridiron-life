# Gridiron Life v0.5 — Part 8.9 (first playable build)

## What changed
- **College HUD continuity:** college now offers Home, Team, Development, Life, Player Profile, College Football, and History/Save. College Development shows original player attributes, weekly commitments, skill focus and condition. College Life exposes academics, eligibility, money and NIL. College Profile presents current college identity and career stats instead of appending the obsolete high-school player profile.
- **On-field scoring:** high-school offense now tracks field position, downs, and drives. Touchdowns are awarded on end-zone plays, and QB/RB/receiver TD statistics are credited from those plays rather than independent dice rolls. College produces game scoring and box-score contributions in the same possession simulation rather than rolling the final score before generating player statistics.
- **Recruiting corrections:** new and migrated prospect boards generate 1,600 unique full names, represent all 22 playable positions, and preserve the intended Top 250 OVR bands; persisted board version increased to 3.
- **College development:** training focus now scales against the actual college training allocation, rather than high-school allocation.

## Important limitations
- This is a **first playable 8.9 build**, not the end of the full 8.9 roadmap. Dedicated defensive attributes, separate Coachability/Behavior rating behavior, richer receiver/pressure breakdowns and complete football-drive tuning are not completed.
- The college Team screen retains the original consolidated college-football section for compatibility, so a few panels overlap the dedicated Development and Life tabs.
- The simulation remains an abstraction rather than a complete referee-level play-by-play model. It should be tested across full seasons before judging statistical balance.
- Existing saves should load using the same `gridiron-life-v5` local storage key. **Export your save from the old build before updating.** Recruitment board version 2 will regenerate automatically on first use.

## Installation
Upload the **contents** of the full ZIP to your GitHub Pages repository's root (including index.html, css/, js/, tests/). Overwrite matching files. The update-only ZIP includes just changed files for a Part 8.8 installation.

## Automated verification
From the expanded game folder, run: `for t in tests/*.js; do node "$t"; done`
