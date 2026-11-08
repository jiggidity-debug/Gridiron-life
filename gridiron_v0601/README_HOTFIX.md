# GridIron Life v0.61 — Story Dialog Hotfix

Fixes the Hub's Story Opportunity > Open details button, which previously called `showDialog` defined inside a private older module and threw a ReferenceError. The Hub now owns a dialog renderer; story choices apply, and Close dismisses the dialog. Also fixes the two other Hub detail cards (Previous Game and Next Game) that depended on the same private function or scouting helper.

This package retains v0.61 history and physical-growth updates. Existing saves remain in the v6 save slot.

Known design concern: the high-school standings STR column reflects program-relative team strength (derived from prestige/coaching) rather than an absolute player OVR scale. An across-level HS/college/NFL rating normalization is not part of this hotfix.
