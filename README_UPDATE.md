# Gridiron Life v0.591 — Patch Release

Version convention: 5 = major release, 9 = minor release, 1 = bug-fix revision. The next bug-fix revision is v0.592. This package contains the Track 1 fixes including the character-creation scroll correction. Save format remains version 5; no save reset is required solely for the label change.

# Gridiron Life — Part 9 Track 1 Patch (November 7, 2026)

This folder is the **full website**, based on the Part 9 full package. Upload all its files to the GitHub Pages deployment branch to use the update; the companion update ZIP contains only changed files.

## Implemented / adjusted
- Registration: 300 points at 1-for-1; 70-point manual cap on each Athletic and Technical attribute, 99 total maximum after separately applied family bonuses.
- Player OVR: distinct position-specific weighted Athletic and Technical profiles for all 22 positions. Low Strength hurts interior line fit more than cornerback; quarterback relies heavily on passing/decision technical skill. Existing NPCs retain prior rating calculations.
- Roster: position-room cohort scale by 1A–6A. 1A creates fewer players; existing varsity/JV/freshman squad assignment logic is preserved.
- Recruiting board: Top 250 normal range 68–72; Top 5 usually 73–74; at most one above 74, with a 77 generational prospect at a rare year interval.
- Navigation: New Career and Export buttons on the header (reset requires confirmation). Archetype shown next to player name rather than repeatedly in Team.
- HUD: main bottom navigation retained; generic explanatory paragraphs moved to ? disclosure wherever safe; Exposure text is collapsed; Physical Benchmarks moved to Recruiting and requires a recorded test.
- Development: player-facing Endurance training references changed to Stamina while preserving the historical internal fatigue stat mapping.
- Home: Sim Season advances until the phase boundary or a mandatory decision, which interrupts simulation. Confirmation appears first.
- Academics: GPA remains posted only at semester checkpoints; Academic trend arrows show recent course-grade movement.
- Position Room: reviewed current code. Rapport, trust, stress and preparedness are impacted by interactions, but a separate event-generator system based on relationships is not yet implemented (NOT claimed fixed).

## Playtesting and known limitations
- Static JavaScript syntax checks and dedicated weighted-OVR calculation tests passed.
- Browser automated testing was unavailable in this sandbox, so manually test the new career flow, game advancement, mobile UI, event handling and save import/export before replacing your primary hosted version.
- Some old internal training attributes still use historical names for backward compatibility; this is not a separate user-facing Endurance stat.
- The complete football simulation rewrite, play-by-play presentation and Weekly Wrap-Up remain explicitly paused.

## Installing
1. Back up the current GitHub repository / Pages deployment and export an existing save if needed.
2. Extract the **Full** ZIP and copy its contents to the root of the GitHub Pages branch (where `index.html` lives).
3. Commit / publish the files and reload with a refreshed tab. Test on a **new career** for updated creation and roster rules.
4. Saved characters from previous Part 9 builds may not have attributes or rosters rebalanced automatically.
