# Gridiron Life v0.5 — Part 7: Squad Placement, Depth Charts & Teammate Memory

**Full build** includes all features from Parts 1–6. This is an offline, fictional high-school football career simulation. It is not an exact UIL eligibility or roster-management ruleset.

## Part 7 — repaired team assignments

- **Coach-managed program-wide depth charts:** Players are evaluated for varsity, JV and freshman starting roles rather than being permanently promoted to an upper-squad bench just because they are old or highly rated. Sophomores and juniors who cannot start varsity can remain on JV as starters. Seniors remain varsity-only; school classification determines which squads exist.
- **Malik scenario:** If an older, higher-rated QB is the best varsity option, he can win the varsity start over your younger player; your character isn't given the starter job automatically. If a player would otherwise be a reserve on varsity and is eligible for JV, he can start JV while dressing for varsity backup duty.
- **Your choice:** On Career or Team, use **Squad placement → Coach decides / Request freshman / Request JV / Request varsity**. Your choice controls a *requested primary squad*, not a guaranteed starting job. The coach can decline an implausible upward promotion based on current readiness. You can also opt into higher-team backup dress duty.
- **Dual-squad duty:** Eligible athletes can be listed as dressed backups one level above their primary team. Their lower-squad starts and game statistics remain intact. The current simulation records the higher-team dress designation but does **not yet** simulate a second independent set of upper-team offensive snaps or positional stats in the same week.
- **Reviews:** The program sets depth charts at the start of the school year and evaluates them again at **Fall Week 6**. User requests can be revised outside a pending game; the current primary level and coach's explanation are visible. A request is not a promise of starts or playing time.
- **Named start counts:** The Team tab records starts by squad and names the players dressing as upper-squad backups. Counts begin in **Part 7**. Old NPC games cannot be truthfully reconstructed and will not be retroactively counted.
- **Playoffs:** Varsity-only postseason games no longer produce personal JV game statistics for players who aren't rostered on varsity. An eligible lower-squad backup can dress for varsity playoff games, but this build does not promise actual varsity offensive snaps.

## Part 7 — lasting teammate interactions

The **Team** tab now contains **Your position room**. Visit individual NPC teammates to review film (2 hours), compete respectfully (2 hours), or encourage them (1 hour). These actions consume actual discretionary hours and may change personal rapport, competitive relationship, coach trust, preparedness, or stress. One visit per NPC per week. Repeated relationships and position-competition story decisions are stored in **History → Position-room memories**, even if teammates graduate. Story events involving a named rival can affect their rapport and coach trust; they do not override a major OVR difference or award free attribute points.

## Compatibility and boundaries

- **Preserves existing v0.5 careers** under localStorage key `gridiron-life-v5`. Old Part 6 saves don't have historical NPC start counts; the new log starts when games are played on Part 7.
- Your previous v0.4 save remains separately stored. Always **export your v0.5 JSON** before uploading a new build.
- **Training formulas, no artificial OVR cap, academic rules, fatigue/wear, careers, playoffs, awards and offseason events remain intact.**
- Squad assignments are position-group depth charts, **not full 22-position program rosters**. Named NPC stats across entire opponent leagues, injury substitution depth-chart simulations, and simultaneous dual-squad offensive snaps are not yet modeled. Team strength and playoff qualification follow the existing fictionalized rules.

## Install on GitHub Pages

1. From your game, go to **History → Export Save JSON**. Save it somewhere safe.
2. If your website already runs **v0.5 Part 6**, extract **Part 7 Update Only ZIP** and upload its contents to the repository. Otherwise use **Part 7 Full ZIP**.
3. Upload file **contents** into the repository root, retaining `index.html`, `css/`, `js/`, and their subpaths. Overwrite matching files and commit.
4. Refresh `https://jiggidity-debug.github.io/Gridiron-life/` with Ctrl+Shift+R. The header should say **v0.5 Part 7**.
5. Verify **Career → Squad placement** and **Team → Position depth charts**, then continue your current career. No save reset is needed.

## Tests

All eight Node test suites (including targeted squad-placement, start tracking, NPC memory, and legacy migration cases) pass. Chromium browser tests pass for QB Malik competition, requesting varsity/JV, backup dress duty, game and saved-history display, and mobile-sized rendering. This has not been deployed or verified on the user's public GitHub site; the user must upload it.
