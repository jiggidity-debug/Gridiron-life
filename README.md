# Gridiron Life — v0.5 Part 8: College Career Foundation

This package contains the full offline browser game. It extends Part 7.2, which already provides the high-school football career, teams, playoff competition, health, grades, offseason events and player biographies.

## New in Part 8 — a playable path beyond graduation

- **Recruiting tab while in high school:** A provisional 0–5-star recruiting profile based on current position skill, varsity production, competition level, exposure and earned awards; 90 fictional persistent rival prospects on a scouting leaderboard; interest and scholarship offers from 24 fictional college programs in four conferences. Early signings are disabled until graduation.
- **Senior graduation unlocks signing.** Select any offered school, or join an eligible school as a walk-on. No automatic starter assignment. Original high-school game and biography records remain untouched in the save.
- **College career:** College position-room ratings, realistic competition for a starting/rotational/backup role, 12-game regular college seasons, simulated opponent programs, conference records, national standings, a four-team two-round fictional postseason and bowl invitations for qualifying nonplayoff teams.
- **Academic progress and development:** College weekly training, study and recovery hours; persistent attributes and progress with no new OVR ceiling; college GPA, fatigue, contact and wear continue. This is **actual play scheduling, not an academic study-planner recommendation tool**.
- **Eligibility:** Four seasons of playing eligibility over at most five academic years; one simplified full-season redshirt. This is **not a full NCAA eligibility rules engine**.
- **Offseason transfers:** Compare school interest, scholarship coverage and program strength and switch schools once per offseason. Position rooms are recalculated after transferring.
- **NIL:** One optional local-appearance opportunity per year with money and stress consequences. No paid OVR boosts.
- **Gridiron Gazette:** Recruiting headlines, signing, games, postseason developments, NIL and transfer news grounded in simulated outcomes, not outside news feeds.
- **College player profile:** Separate college stats, school, OVR, GPA, scholarship and eligibility; preserved original high-school player history.

## Deferred (per project direction)

The *optional academic study planner* and *expansions to story and teammate relationship content* remain on the future **assistance / quality-of-life** roadmap. Existing core studying and basic relationship systems stay available in the high-school game; they are not prerequisites to college.

## Gameplay and realism limits

This is a **fictional playable college prototype**, not NCAA or UIL simulation. Colleges, conferences, scholarships, awards eligibility, transfer rules, rankings and bowls are fictional game abstractions. College gameplay currently focuses on the player's position room, team results, player statistics and weekly development; full multi-position rosters, NCAA-accurate conference schedules, portal windows, coach turnover, detailed campus life and more realistic college football match engines are later iterations. Recruiting rival stats are simulated evaluation scores, not fully played individual seasons. High-school snapshots do not falsely invent missing history.

## Upgrading

1. Export your save JSON in **History → Save and backup** as a precaution.
2. Extract the ZIP, then upload the **contents** to the root of the GitHub Pages repository, preserving `js/` and `css/`.
3. If your repo is already on Part 7.2, you can use the smaller **Part8_Update.zip**; otherwise use **Part8_Full.zip**.
4. Force-refresh the website after GitHub Pages deployment; the title and header should say **v0.5 Part 8**.
5. If a previously saved character has *already completed* senior year in Part 7.2, Part 8 automatically opens the recruiting/signing stage when that save loads. An in-progress senior finishes the school calendar normally. Use the same Chrome profile or import your JSON save to keep your current player.

This release still uses localStorage key `gridiron-life-v5`, supports an older Part 7.2 v0.5 save, and retains legacy v0.4 import logic. Keep independent backup copies.

## Tests

- All 11 Node test suites: creation, placement, roster/competition, health, economics, offseason, biography, awards, visibility and college progression.
- Dedicated college tests: actual signing, complete college seasons, regular-season stats/standings, postseason completion, transfer, reload and all four eligibility years; migration of a previously completed high-school career.
- Chromium desktop/mobile: recruiting, signing, college UI, first college game, and high-school history access.

The app requires **no API key, account login, external packages, or internet** once its static files are loaded.


## Part 8.1 — Multi-division college pathways
- 685 persistent fictional institutions: FBS (136), FCS (129), DII (160), DIII (100), NAIA (100), and JUCO (60). Original 24 FBS IDs preserved.
- Tier-aware recruiting and offers; DIII offers no athletic scholarships. All colleges support walk-on enrollment in this simplified fictional simulation.
- JUCO has a two-season limit; after two seasons, the user enters the four-year transfer-selection stage. Junior-college seasons count toward the simplified four playing seasons of total eligibility.
- College schedules, weekly simulated standings, and postseason are separated by tier. Only the player's tier is simulated in detail to keep saves small.
- The postseason and transfer rules are original simplified game mechanics, **not official NCAA, NAIA or NJCAA policy**.
- Early prototype still uses approximate college position rooms and lightweight NPC stats. The national world is not a full 685-roster football simulation.
