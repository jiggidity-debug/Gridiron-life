# Gridiron Life v0.602 — Creator refactor (CREATOR-REFAC-2)

This pass focuses on character creation, not a wholesale rewrite of the football simulation.

## What changed
- Retired the older creation UI/start functions, retaining compatibility shims for other screens.
- One authoritative `creatorFinalRating` function now serves the displayed rating and preview/save calculation.
- The same baseline function serves all starting-attribute calculations.
- Distinctive `CREATOR-REFAC-2` stamp in the registration header and versioned asset links in `index.html`.
- Targeted regression tests confirm size baselines, the 300-point budget, 70 pre-bonus cap, personal zero baseline, and the bonus calculation order.

## Intended rules
- Starting weight baselines are reduced by half; 155 lb RB: Speed 23, 300 lb RB: Speed 3.
- Creation budget: 300. Athletic/Technical points can raise baseline+allocation to 70; parents/history then add bonuses, capped at 99.
- Personal ratings start at zero without auto bonuses.

## Boundaries
The game still has historical rendering and progression overrides across later modules. They have not been comprehensively refactored in this pass; removing them without a full browser regression risks breaking unrelated features. Existing saves are not modified by this build. Most older unit tests target the obsolete creator and need separate modernization.

## Publish
Replace the repository's `index.html`, `js/` and `css/` together. Verify `CREATOR-REFAC-2` appears on the registration screen, then compare 155 lb and 300 lb RB Speed baselines. Back up saves before deploying.
