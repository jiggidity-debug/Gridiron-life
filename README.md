# Gridiron Life v0.5 — Part 8.6

This release builds on v0.5 Part 8.5.1.

## Changes

- Football registration now selects **classification (1A–6A) first**, followed by a list of schools in that classification. The game now offers 36 fictional regular high schools, six per classification.
- Added four **selective national prep schools** in the football world. They are not available to brand-new freshmen at registration. Apply via Team → High school transfers after developing a career: grade 10+, 62+ player OVR and 2.70+ GPA. This is a fictional simplified admission rule, not an exact real-world prep admission standard.
- Added **Team → High school transfers** for offseason moves to other schools. Choose the target classification and school, or apply to a prep program when eligible. The fall-season transfer window is closed; eligibility restrictions are simplified and do not model UIL rules.
- On transfer, the new school has a new position roster and placement evaluation. Player attributes, academic records, recorded games, and milestones remain attached to the player. Transfer history is saved.
- No changes to training progression, recruiting-star thresholds, or college simulation formulas.

## Installation

Upload the contents of the update ZIP into the root of the existing GitHub Pages repository, preserving `js/`. If unsure what version is installed, use the Full ZIP. Browser-local save backups are recommended prior to installing.

## Validation

All previous automated tests plus a new high-school transfer test passed under Node.js. All JavaScript syntax checked; ZIP integrity verified. This release was not subjected to a full Chromium visual playthrough.


## Part 8.7 — Position expansion and scheme usage
- 22 selectable positions (offense, defense, specialists) with position-family training.
- Running backs/FBs now gain both carries and passing-game targets depending on the school offense; running volume remains materially lower at Air Raid programs.
- Defensive box score (tackles, TFL, sacks, pass breakups and interceptions), line performance (snaps and blocks), and K/P/LS statistics. These are lightweight simulated estimates; they are **not** a full 22-player snap-by-snap engine.
- Player profiles and honors calculate position-appropriate output.

## Additional Part 8.7 corrections
- ESPN-inspired season and game-log tables for passing, rushing, receiving, defense, blocking and kicking; values from saved records only.
- Position-change request available in Team; no automatic starting job.
- Scholarship offers limited to a small subset of eligible programs, and recruiting news now distinguishes monitoring from formal offers.
- RB/FB receiving yardage and touchdown totals shown in profile; biography describes receiving-back usage, coach confidence, and scouting exposure naturally.


## Part 8.8
- 1A/2A ironman and evaluated upper-classification two-way defensive assignments in Team.
- QB designed runs and scrambles in the high-school game simulation.
- Rushing/defensive stat lines and game-workload changes reflect participation.
- College match engine remains a separate simulation; no college two-way claim.
