# Gridiron Life v0.602 — Character Creation Limits and Body Size

Built from v0.601 NPC Profiles and Academics.

- Shared attribute creation budget stays **300 points**.
- **70 applies to the baseline plus manually allocated points, before any external bonuses** for Athletic and Technical ratings. Middle-school history and family bonuses are applied afterward, allowing a final rating above 70 (up to 99).
- **Personal** (Behavior, Academics, Social Skills) has **zero baseline** and no automatic family bonus; creation points determine initial scores (0–99). This change does not remove the separate in-game Personality system.
- Weight-sensitive **Speed baseline and Strength minimum** use the RB weight scale agreed in design, across creation positions as a first-pass model. Both size-based starting values peak at 45. Middle-school history, sport and allocated points can improve ratings, with manual allocation limited by baseline + allocated points <= 70 (before bonuses).
- Weight edits update these baselines immediately on leaving the weight input. Over-limit allocations are refunded automatically after size/history/family changes.
- Existing careers are not rewritten; changes apply to new characters.

## v0.602 calculation order correction

Final rating = min(99, baseline + manually allocated points + middle-school history bonus + family bonus). Athletic and Technical allocation is limited by baseline + manually allocated points <= 70, with the existing shared 300-point budget. Personal ratings still have no baseline or external bonuses. Changing family or middle-school history no longer refunds manually allocated points (unless a size baseline change lowers pre-bonus allocation headroom).
