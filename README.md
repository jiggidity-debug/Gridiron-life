# Gridiron Life v0.5 — Part 7.1: Character creation improvements

This release includes all content from Parts 1–7, plus three character-creation adjustments:

- **Height in feet and inches:** Choose feet and inches separately (original supported range: 4 ft 10 in through 6 ft 8 in). The saved in-game measurement remains total inches, so gameplay math is unchanged.
- **School choice has visible statistics:** See simulated school classification, scheme, run/pass tendency, coach, defense, available squads, prestige, coaching quality, facilities, and program expectations before committing. Expand *Compare all schools* to view the roster of available schools side-by-side. The school generator remains fictional and randomized when a fresh creation page loads.
- **Strict live 100-point allocation budget:** Each attribute slider is clamped to the **remaining budget** during input. Lowering another slider frees points immediately. The Start button also validates the budget. As before, raising stats above starting baselines costs 1 per point and reducing stats below those baselines does not refund points.
- **Switching positions:** Current slider allocations, background, school, height, and weight are preserved when changing position at creation.

## GitHub Pages install

Export current saves only if you want to keep them. Upload the extracted Full ZIP contents into your repository root, preserving `index.html`, `js/`, and `css/`; overwrite existing files and commit. When upgrading from Part 7, use the smaller Update Only ZIP. Refresh the webpage and look for `Version 0.5 (Part 7.1)` on creation. An existing career can continue but will not revisit the creation screen without starting a new career. 

The original school/squad and progression mechanics from Part 7 are unchanged. Full prior-release notes remain in the Part 7 archive.
