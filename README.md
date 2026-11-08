# Gridiron Life v0.7.1 — Roster-Based Football & Annual Calendars

Deploy `index.html`, `js/`, and `css/` together. Save exports still use version 6 as the **save schema**, so prior exported careers remain loadable. Export a backup before testing.

## Reworked in source (not appended as a late override)

- **No high-school 24-carry cap or 9-target cap.** Both conditional limit statements are completely deleted from `js/61-football.js`, and the old cap-based regression assertions are removed.
- **Actual program roster.** Existing same-position teammates are retained; missing school positions are modeled as persistent NPCs. The Team screen shows the modeled full roster, derived archetype, overall rating, and current-season game stats. Each game now saves teammates' rushing, receiving, passing, line, and defensive results in `game.games[].rosterStats`. Previous games cannot retroactively generate missing NPC statistics.
- **Coach-distributed touches.** Coach star reliance, skill, scheme, archetype and player availability affect selection for each run and target. There is no numerical per-player hard cap.
- **New high-school rushing outcome formula.** Speed, acceleration, agility, elusiveness, power, endurance, vision, carrying, knowledge and matchup run defense contribute; carrying also impacts fumble probability. Other attributes matter through their positional roles.
- **Calendar cycles.** High school now totals 52 weeks (existing phases with a 13-week summer); college accounts for 12 regular-season weeks plus any postseason and the remainder of the 52-week year as playable offseason; NFL accounts for four camp weeks, games/playoffs, and the remainder as playable offseason. College periods distinguish winter development, spring practices, summer training and fall camp. NFL periods distinguish winter recovery, free agency/draft, organized activities and camp preparation. Expired contracts open free-agency offers during the NFL offseason (week 8), not only after it. The NFL rookie draft remains the existing college-to-pro entry process; continuing NFL seasons also include a draft news event.
- **Existing health, development, recruiting, history, and biography systems are preserved.**

## Important limitations

- The full on-field coaching allocation, persistent game-by-game teammate box scores, and the new running model are implemented for the **high-school match simulator**. College and NFL still use their prior simplified roster/match simulations; this is not yet a complete three-level engine rewrite.
- The newly modeled other-position players are generated when first required by an imported save and are kept thereafter. Existing games cannot be attributed to NPCs retrospectively.
- College and NFL calendar periods are playable offseason weeks with existing training and recovery actions; the league-wide offseason is simplified. The NFL draft news item is not a fully simulated draft class.
- Runtime smoke/regression tests are included, but a complete interactive browser playthrough across three levels has not been performed.

## Tests

Run from this folder:

`node tests/v07-stability-test.cjs /path/to/exported-save.json`

`node tests/v071-roster-calendar-test.cjs /path/to/exported-save.json`
