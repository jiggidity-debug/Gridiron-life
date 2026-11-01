# Gridiron Life — v0.5 Part 2 (Roster + Life + Economy + Academics)

This is a **complete, modular GitHub Pages build**. It includes the v0.5 Part 1 roster/calendar update and the new Part 2 changes.

## What is implemented

**Part 1:** senior graduation, incoming freshmen, separate same-position freshman/JV/varsity depth charts and squad records, Year 2 transition before summer, named opponents, season records, v0.4 save migration to a new v0.5 slot.

**Part 2:**
- Cumulative GPA is posted only at fall and spring semester ends, not weekly; summer does not change ordinary grades.
- Four course grades and academic preparedness respond to study, stress, and attendance.
- Tutoring persists, uses **two of your allocated study hours**, and helps the lowest-graded subject. It doesn't directly increase GPA.
- Academic warning events require an actual course below 70% and cannot recur every three weeks. Family and teammate stories have cooldowns.
- Relationships are separated for family, teacher, teammate, and coach; practice effort can change coach trust; stress responds to overload and work.
- Paid work, one-time gigs, and paid activities use actual discretionary hours. A gig's three hours are reserved until the next weekly tick.
- Spend earned money on protective equipment, supplies, transportation, social time, family support, and an introductory offseason skill clinic. All purchases are recorded in the transaction journal. No money purchase grants a direct OVR boost.
- A long-term purchased benefit is saved; repeat purchases are blocked where needed. Purchased gear modestly reduces an existing injury chance.

## Upgrade from v0.4 or earlier v0.5

1. Open the current game, go to **History > Save and backup > Export Save JSON**, and download a backup.
2. **Extract the ZIP**. Upload its **contents**, not the ZIP file, to the root of your GitHub repository, preserving `js/`, `css/`, and `index.html`.
3. Make the commit. Reload the GitHub Pages URL (hard-refresh if necessary).
4. Existing `gridiron-life-v5` browser saves load automatically. If none exists, the original `gridiron-life-v4` save is imported **without replacing the v0.4 browser save**.
5. You can also use **History > Import saved JSON** for an exported v0.4/v0.5 file.

**Key limitation:** This is still a prototype. Playoffs, full opponent player rosters, long-term career wear, awards, tournaments, and full 7-on-7 are **not implemented** in Part 2. The skill clinic is a lightweight spending activity, not the complete camp system. Player OVR balancing is also pending review (including an observed 80 OVR at senior-year start).

## Automated checks

Run `node tests/smoke-test.js` and `node tests/life-academics-economy-test.js` in the extracted project directory. Both should pass. UI rendering in an actual browser should still be tested after deployment.

## File structure

- `index.html`: file-loading order
- `css/styles.css`: styling
- `js/10-roster.js`: cohorts and depth charts
- `js/20-storage.js`: autosave and v0.4 import
- `js/30-creation.js`: character setup
- `js/40-schedule.js`: weekly time budgets
- `js/52-academics.js`: course grades, tutoring, semester GPA
- `js/60-calendar.js`: yearly phases, weekly simulation
- `js/62-events.js`: conditional, remembered story events
- `js/63-jobs.js`: recurring jobs and gigs
- `js/64-economy.js`: purchases and ledger
- `js/70-ui.js`: displays and life actions
