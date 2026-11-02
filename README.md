# Gridiron Life v0.5 Part 8.5.1 — UI and recruiting balance

- Profile biography stays visible in Biography; help holds explanation only.
- Squad placement moved to Team, adjacent to position depth charts.
- Next opponent team strength appears on Home; duplicate opponent scouting panel removed from Team.
- Recruiting board expands to 1,600 persistent fictional prospects with realistic high-school talent ranges; 38 OVR freshmen are unranked and receive no offers.
- Scholarships require junior/senior eligibility, varsity evidence, academics, and tier-specific ability thresholds. D3 requires at least 55 OVR and provides no athletic scholarships; JUCO needs 55 OVR and 1.9 GPA for consideration.
- The national pool and gates are fictional gameplay balancing choices, not real NCAA recruiting requirements.
- Saved recruiting boards from older builds are refreshed; prior offers are recalculated.

## National recruiting leaderboard refinement
- The published recruiting ranking is **Top 250 only**; unranked players are not labeled #251 or #1601.
- Ranked fictional recruits are rated **58–76 OVR**, with **exactly two rare 77 OVR prospects** in the generated class.
- Another 1,350 prospects exist outside the ranked list, keeping the recruiting world bigger than the visible Top 250.
- Your player appears on the Top 250 only if their scouting evaluation actually qualifies.
- Ratings are global game-world attributes; college competition remains stronger even for nationally ranked high-school players.


## Part 8.5.1 UI reconciliation
- Home remains the dedicated next-opponent ratings screen. Career no longer duplicates the detailed opposing strength breakdown or separate health/playoff summaries.
- Squad choices live on Team alongside the position depth chart. Coach reasoning is hidden behind a small `?` disclosure.
- Player Profile biography is always visible in its Biography subtab; number-free trait prose has corrected grammar.
- Regression tests now target the 1,600-prospect pool and revised screen ownership.
