# Before

`README.md` has a title, an intro, and an "## Implementation" list, but no instructions for running the program in its current state.

# After

Add a "## Running" section after the intro. It will explain that the game is a static site with no build step, that it loads KAPLAY from a CDN and uses ES modules (so it must be served over HTTP rather than opened directly from the filesystem), and how to run it:

    python3 -m http.server 8000

then open <http://localhost:8000> in a browser. Reload the page to generate a new map.
