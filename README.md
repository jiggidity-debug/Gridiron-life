# Gridiron Life v0.6 — playable HUD and NFL career update

See **README_UPDATE.md** for current features, installation, limitations, and test status. The notes below describe the v0.5/Part 9 baseline still included in this build.

---

# Gridiron Life v0.5 — Part 9: Life, Creation & HUD (playtest build)

## Included in this update

- New freshman registration: 200 shared attribute-creation points across Athletic, Technical, and Personal ratings. Creation points purchase three attribute points apiece in this playtest implementation, so players can create a viable freshman build. Attribute-point pricing remains subject to balancing.
- 75 generated male and 75 generated female parent templates; randomly combined family, varied occupations, heights, fictional IQ ratings, family circumstances, and modest starting bonuses. Five *complete* rerolls; earlier families cannot be recovered. Some guardians and unavailable/unknown parents are represented.
- Six-button bottom HUD: Home, Player, Team, Development, Life, Recruiting.
- Compact Home with opponent/recent-game panels and weekly allocation. Adjust replaces the cards with sliders, and one Done button returns home.
- Personal systems: behavior score, behavior-sensitive three-response event choices (0–2, 1–3, 2–4, 3–5), school counseling, mentorship, volunteering, and private support.
- New spending options: personal trainer, gym membership, workout equipment, community events, discretionary entertainment.
- Social media and an exposure progression (Unknown → Local → Regional → National; Worldwide has an extraordinary-achievement gate).
- Athletic benchmarks for 40-yard, 10-yard, 3-cone, estimated absolute bench strength and vertical jump. Technical attributes include Press Coverage and shared Catching.
- Existing high-school and college simulation files are included; some new technical skills and positional schemes are **displayed but not yet wired into every play-resolution mechanic**.

## Current limitations / planned work

- **Playtest update, not the final full simulation overhaul.** The underlying match engine largely uses the previous attributes, although new attribute groups are saved and some skills map onto the legacy model. Draft logic, technical interactions, position-specific coach usage, college offseason, and fully integrated spending/time effects still need balancing and further work.
- Opponent season averages are **not yet tracked reliably**. The opponent button shows recorded scouting estimates and says so, rather than inventing season averages.
- 75+75 parents are procedurally derived from templates. They are varied profiles, not 150 hand-authored biographies.
- This update is designed primarily for starting a **new character**. Existing saves should be backed up first; new creation values are not retroactively assigned to existing characters.
- World-wide exposure may remain unavailable in ordinary playthroughs pending deeper awards/draft integrations.

## Installing on GitHub Pages

Extract the **full ZIP** and upload its contents (not the ZIP itself) into the root of your GitHub Pages repository, keeping `index.html`, `css/`, and `js/` paths intact. The **update-only ZIP** contains just files changed by Part 9 relative to Part 8.9.3. Back up any existing local browser save before installing.
