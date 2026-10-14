# Save the Humans!

Zombies have attacked the zoo!  The visitors are panicking, and it is up to the
zoo animals to save.

"Save the Humans!" is a lightweight browser-based single-player game.  The goal
is to save as many people as possible before they are turned into zombies.  The
map is a zoo with paths winding around obstacles.  The player controls two
animals (one using their left hand on WASD keys, the other using their right on
IJKL keys).  Each animal has different abilities.  For example, the tiger is
scary, so people will run away from it when it approaches.  However, if it gets
too close, they might be so scared that they run straight into a zombie.  The
bunny is so cute that people will chase after it.  If they catch it, though,
they will stop to pet it, which means the zombies might catch up with them.

## Running

The game is a static site with no build step. It loads KAPLAY from a CDN and
uses ES modules, so it must be served over HTTP rather than opened directly
from the filesystem.

From the project root, run:

    python3 -m http.server 8000

then open <http://localhost:8000> in a browser. Reload the page to generate a
new map.

## Implementation

-   Choose a lightweight open source JavaScript game engine.
-   Create classes to represent four kinds of actors: zombies, humans, the
    tiger, and the bunny. (Other kinds of animals will be added later.)
-   Create a random map generator. The map is an orthogonal grid. Each cell is
    either an obstacle or a path. All paths are connected, and are connected to
    a single Exit cell on the border of the grid. For now, obstacles are just
    obstacles: actors cannot move into obstacle cells, only into path cells.
-   The player controls two animals as described earlier.
-   Animals, zombies, and humans are placed randomly on the map at the start.
-   The game ends when all humans have exited or been infected.
-   A human is infected when a zombie catches it. Infection takes some time. We
    will experiment with how long infection takes as part of playtesting.
-   Different actors move at different speeds, but all actors of the same kind
    move at the same speed. We will experiment with different speeds as part of
    playtesting.
-   We will add sound effects and graphic icons later. For now, use simple
    markers such as circled charactors to show each actor, e.g., an 'H' in a
    circle for a human or a 'Z' in a circle for a zombie.
-   For now, create a single HTML page that loads all of the JavaScript files.
    We will worry about bundling and packaging for distribution later.
