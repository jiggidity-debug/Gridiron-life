# Gridiron Life v0.7.3 — Roster-Based Football & Annual Calendars (structural correction)

Deploy `index.html`, `js/`, and `css/` together. Save exports still use version 6 as the **save schema**, so prior exported careers remain loadable. Export a backup before testing.

## Reworked in source (not appended as a late override)

- **No high-school 24-carry cap or 9-target cap.** Both conditional limit statements are completely deleted from `js/61-football.js`, and the old cap-based regression assertions are removed.
- **Actual program roster.** Existing same-position teammates are retained; missing school positions are modeled as persistent NPCs. The Team screen shows the modeled full roster, derived archetype, overall rating, and current-season game stats. Each game now saves teammates' rushing, receiving, passing, line, and defensive results in `game.games[].rosterStats`. Previous games cannot retroactively generate missing NPC statistics.
- **Coach-distributed touches.** Coach star reliance, skill, scheme, archetype and player availability affect selection for each run and target. There is no numerical per-player hard cap.
- **New high-school rushing outcome formula.** Speed, acceleration, agility, elusiveness, power, endurance, vision, carrying, knowledge and matchup run defense contribute; carrying also impacts fumble probability. Other attributes matter through their positional roles.
- **Calendar cycles.** High school now totals 52 weeks (existing phases with a 13-week summer); college accounts for 12 regular-season weeks plus any postseason and the remainder of the 52-week year as playable offseason; NFL accounts for four camp weeks, games/playoffs, and the remainder as playable offseason. College periods distinguish winter development, spring practices, summer training and fall camp. NFL periods distinguish winter recovery, free agency/draft, organized activities and camp preparation. Expired contracts open free-agency offers during the NFL offseason (week 8), not only after it. The NFL rookie draft remains the existing college-to-pro entry process; continuing NFL seasons also include a draft news event.
- **Existing health, development, recruiting, history, and biography systems are preserved.**

## v0.7.2 structural correction (training, development, NFL lifecycle)

- **One skill model.** Training, practice, camps and purchases now raise the same skills that position OVR reads: `game.athleticAttributes` (physical), `game.technicalAttributes` (technique) and, kept separate, scheme knowledge in `game.v6`. Each of the 22 positions has its own training groups (`POSITION_TRAINING` in `js/50-training.js`); the old 15-key attribute list is now only a derived view for the match simulators and NPC ratings (`syncLegacyAttrs`).
- **One development routine** (`developWeek`) is used by high school, college and the NFL (camp, season, offseason). Level only changes team-practice hours, coaching quality and age growth. `applyAging` applies yearly decline once per NFL offseason, shifted by position family.
- **One NFL lifecycle** in `js/75-v060-systems.js`: rookie-scale contracts by draft round, market-value contracts and re-signing with the current club, calendar-driven free agency (a cut or an expired deal with no interest means an unsigned season while the calendar keeps running; offers come from the player's rating when free agency opens), age-and-rating retirement. The override wrappers in `80-career-integration.js` and the `v6ProRating` override were deleted, not extended. Draft grade (`v6DraftGrade`) and pro rating (`v6ProRating`) are separate functions.
- **Draft** now uses seven rounds across the grade range; K/P/LS are drafted no earlier than rounds 5/5/6.
- **Save compatibility:** `game.version` stays 6. On load `migrateSkillModel()` moves old training progress to the modern skill keys and keeps saved focus ids valid.
- Match simulators for NFL games and the legacy 15-key ratings of NPC players were not changed.

New test: `node tests/career-regression.cjs [/path/to/exported-save.json]` (needs Playwright). Many older tests in `tests/` were already failing before this change (they target v0.5 text/schema and use outdated browser mocks); `v071-roster-calendar-test.cjs` and `career-regression.cjs` are the maintained ones.

## Important limitations

- The full on-field coaching allocation, persistent game-by-game teammate box scores, and the new running model are implemented for the **high-school match simulator**. College and NFL still use their prior simplified roster/match simulations; this is not yet a complete three-level engine rewrite.
- The newly modeled other-position players are generated when first required by an imported save and are kept thereafter. Existing games cannot be attributed to NPCs retrospectively.
- College and NFL calendar periods are playable offseason weeks with existing training and recovery actions; the league-wide offseason is simplified. The NFL draft news item is not a fully simulated draft class.
- Runtime smoke/regression tests are included, but a complete interactive browser playthrough across three levels has not been performed.

## Tests

Run from this folder:

`node tests/v07-stability-test.cjs /path/to/exported-save.json`

`node tests/v071-roster-calendar-test.cjs /path/to/exported-save.json`

`node tests/career-regression.cjs /path/to/exported-save.json`

## v0.7.3 updates
See `CHANGES-v0.7.3.md` for the targeted stabilization fixes and the exact test limitations.
