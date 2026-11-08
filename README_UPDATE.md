# Gridiron Life v0.6 — HUD + Professional Career Playtest

**Release type:** Full playable website, November 2026. Extends the v0.591 combined baseline. This is a significant playable systems update, **not** the complete multi-mode simulation overhaul discussed in design.

## New in v0.6

### Six-button, compact HUD
- Fixed **Hub, Player, Develop, Team, Career, World** bottom navigation, persistent three-column player/team/OVR header, position-relevant four-rating quick strip.
- Hub uses a **2×2 layout**: Previous Game, Next Game, Story Opportunity, and three independent activity shortcuts. Actions adapt to the current career phase.
- Player page has **four attribute/rating pairs per row**, centered categories, a horizontal **four-button skill profile** and an accessible Personality preview **above** the bottom navigation.
- Detailed skill trees, learned scheme knowledge/physical fit, and seven personality tendencies replace the main content rather than opening another giant page. **Badges appear on mastered technique nodes**, not in a redundant badge menu.
- Team theme or personal color preference, saved with the career; mobile-first CSS keeps top/bottom controls fixed. Larger, detailed legacy reports are paginated by section and their individual report/list area can scroll when necessary.

### Player progression and learning
- Running back skill branches: Carrier, Receiving (Flat, Swing, Angle, Wheel, Screen, Option), Blocking/Protection and Scheme Compatibility. Other position families have their own technique branches.
- Techniques develop through selected training focus and football weeks; bronze/silver/gold badges denote learned mastery. Technique and scheme proficiency now have **modest effects in high-school and college play resolution**, as well as in the new NFL engine. They do not add a second overall-rating bonus.
- Distinguishes **persistent scheme proficiency** from **team-specific playbook knowledge** and **calculated scheme fit**.
- Seven personality tendencies and an audience-based reputation record. Event behavior choices affect personality. Separate **mental fatigue** from body fatigue; mental fatigue affects individual development and game readiness.
- Film Study choices (Goof Off, Sleep, Pay Attention, Take Notes) affect knowledge/fatigue; only one session per football week. Recovery choices (Sleep, Relaxation, Rehabilitation) affect condition, with a weekly limit and recovery-hours requirement. High-intensity training at high fatigue displays a risk warning.
- Existing HS and college development, academic eligibility, medical absences, camps, recruiting stars/rankings, scholarships, JUCO, transfer portal and NIL remain accessible in the game.

### Playable NFL **first pass**
- From college completion (or after three played college seasons in an offseason), declare for the professional draft.
- Draft-round projection, undrafted free-agent camp offers, **32 fictional professional teams**, differentiated club scheme/strength, contract offers and signing.
- Four camp evaluations, realistic possibility of an active-roster place, practice squad or release; free-agent tryouts after a cut.
- Seventeen-game professional season, position-appropriate statistics and saved results, depth competition and practice-squad promotion opportunities, optional three-round fictional postseason.
- Contract salary accrues by game week, contract years expire, free agency and subsequent seasons are playable. Pro seasons and game logs are stored separately from HS/college history.
- NFL Career screen shows contract, role, playbook preparation, depth risk, pressure, latest news, game plan and game/roster/history navigation. Game injuries cause medical restriction; training and techniques continue developing.

### Save migration
- Current save format **version 6**, local-browser key `gridiron-life-v6`. The first launch can copy a v0.591 `gridiron-life-v5` save to the new slot while preserving the old key as a rollback copy. Old v4 imports are still supported through the earlier migration routine.
- Exported files are `gridiron-life-v060-save.json`; imported versions 4, 5 and 6 are accepted. New-game screens retain the baseline 300-point 1-for-1 creation allocation.

## Explicit limitations

This release does **not** claim to fully implement everything considered for v0.6:

- Coach Mode and Owner Mode have not been built. Player Mode is the actual playable career mode.
- NFL league-wide opponent games, complete 53-man rosters, real NFL salary-cap/CBA details, trades, detailed preseason games and an exact play-by-play/possession simulation remain simplified. The professional league and clubs are fictional. Draft and injury formulas need extended balance testing.
- Full technique-tree dependencies and unlock events, all position-specific technical models, medical concealment / insurance / family financial aid, nuanced coach incident reputations, proactive stories and relationships, and a complete integrated calendar are not fully implemented.
- Existing detailed older report screens still support inner scrolling. The new primary HUD itself keeps its header and bottom navigation in place and avoids whole-page scroll.
- The underlying HS/college match engines and legacy attribute mappings have not been replaced wholesale. Several attributes still have legacy names internally.

## Running locally / publishing on GitHub Pages

1. **Backup and export your existing save first.** The old v0.591 localStorage key stays intact, but you should still keep an exported copy before deploying.
2. Extract this ZIP to a directory. Open `index.html` in a desktop/mobile browser or host its contents as a static website.
3. To update GitHub Pages, copy **all** files in the extracted folder into the published repository root with `index.html`, `css/`, and `js/` at the top level. Commit and refresh the page.
4. A v0.591 career should migrate into the v0.6 slot automatically on first load. New careers are recommended to evaluate the new mechanics.
5. Use **World → Settings → Export Save** before significant testing or resets.

## Verification

- `node --check` passes on all current JavaScript modules.
- `python tests/v060-integration.py` passes in a headless Chromium test runner: registration, save write, six-tab HUD, attribute layout, route-tree access, film actions, high-school game, college signing/game, professional declaration/camp/season, settings; zero uncaught browser errors observed.
- **Not exhaustively playtested:** repeated multi-year NFL contracts, unusual legacy saves, all 22 position simulations, device-specific browser behavior, multi-season recruitment and balancing.
