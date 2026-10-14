# Before

`CLAUDE.md`'s "Project conventions" section has one note (keep README's "Running" section updated on code changes). Nothing records that Bram's `resources/` coordination files should be committed with project changes, so they accumulate as modified/untracked files in the working tree.

# After

Add a second convention to the "Project conventions" section: commit everything under `resources/` with each project change, by adding `resources/` to the item's `files` (a directory entry stages everything under it at the commit gate).
