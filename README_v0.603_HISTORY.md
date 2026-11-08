# v0.603 Complete Career History repair

The main History tab now reads High School, College, and NFL saves independently. Choose All or filter by career level. Season records, season statistics, individual games and play-by-play are displayed for each stage. JUCO and four-year college statistics remain in the College stage, but preserve their original saved year/program records. No save migration or player-stat changes are required.

The original History tab previously read only `game.games` for its season tables and play-by-play. College games are stored in `game.college.games`, and NFL games in `game.v6.nfl.games`. This patch fixes that omission.

## Installation
Deploy all files from this ZIP, including the new `js/83-complete-history.js`, and hard-refresh the browser or clear a stale GitHub Pages cache. Export a backup before upgrading. 
